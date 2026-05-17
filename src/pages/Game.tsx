"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QUESTIONS } from '@/data/questions';
import { GameState, Player } from '@/types/game';
import QuestionCard from '@/components/Game/QuestionCard';
import ScoreBoard from '@/components/Game/ScoreBoard';
import Aids from '@/components/Game/Aids';
import RankingSidebar from '@/components/Game/RankingSidebar';
import TVView from '@/components/Game/TVView';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Users, Play, Sparkles, Timer as TimerIcon, Info, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');
  const isHost = searchParams.get('host') === 'true';
  
  const [playerName, setPlayerName] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [probabilities, setProbabilities] = useState<number[]>([]);
  const [usedAidThisTurn, setUsedAidThisTurn] = useState(false);

  const [state, setState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    aidsUsed: { fiftyFifty: false, hint: false, probabilities: false },
    isGameOver: false,
    isWinner: false,
    timeLeft: 30,
    selectedOption: null,
    showResult: false,
    roomStatus: 'waiting',
    hiddenOptions: []
  });

  // Real-time: Monitora status da sala e jogadores
  useEffect(() => {
    if (!roomCode) return;

    const fetchRoomData = async () => {
      const { data: room } = await supabase.from('rooms').select('status').eq('code', roomCode).single();
      if (room) setState(prev => ({ ...prev, roomStatus: room.status }));

      const { data: players } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, current_score, is_eliminated')
        .eq('current_room_id', roomCode);
      
      if (players) {
        setRoomPlayers(players.map(p => ({
          id: p.id,
          name: p.name,
          avatar_url: p.avatar_url,
          score: p.current_score,
          is_eliminated: p.is_eliminated
        })));
      }
    };

    fetchRoomData();

    const channel = supabase
      .channel(`room-${roomCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` }, (payload: any) => {
        setState(prev => ({ ...prev, roomStatus: payload.new.status }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `current_room_id=eq.${roomCode}` }, () => {
        fetchRoomData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode]);

  useEffect(() => {
    const name = localStorage.getItem('currentPlayer');
    if (!name) { navigate('/lobby'); return; }
    setPlayerName(name);
  }, [navigate]);

  // Timer Logic
  useEffect(() => {
    if (state.roomStatus !== 'playing' || state.isGameOver || state.showResult) return;

    if (state.timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.timeLeft, state.isGameOver, state.showResult, state.roomStatus]);

  const handleTimeUp = async () => {
    const currentQ = QUESTIONS[state.currentQuestionIndex];
    const isCorrect = state.selectedOption === currentQ.correctAnswer;
    const noAnswer = state.selectedOption === null;
    
    setState(prev => ({ ...prev, showResult: true }));

    if (!isHost) {
      if (noAnswer) {
        setIsSpectator(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('profiles').update({ is_eliminated: true }).eq('id', user.id);
        showError("Tempo esgotado! Você não respondeu e foi ELIMINADO.");
      } else if (isCorrect) {
        let points = currentQ.difficulty === 'fácil' ? 10 : currentQ.difficulty === 'médio' ? 20 : 40;
        if (currentQ.isBonus) points *= 2;
        const newScore = state.score + points;
        setState(prev => ({ ...prev, score: newScore }));
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('profiles').update({ current_score: newScore }).eq('id', user.id);
        showSuccess(`Correto! +${points} pts`);
      } else {
        setIsSpectator(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('profiles').update({ is_eliminated: true }).eq('id', user.id);
        showError("Resposta errada! Você foi ELIMINADO.");
      }
    }

    // Próxima pergunta automática após 5 segundos
    setTimeout(() => {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= QUESTIONS.length) {
        setState(prev => ({ ...prev, isGameOver: true, isWinner: isCorrect && !noAnswer }));
      } else {
        setState(prev => ({ 
          ...prev, 
          currentQuestionIndex: nextIndex, 
          timeLeft: 30, 
          selectedOption: null, 
          showResult: false,
          hiddenOptions: []
        }));
        setProbabilities([]);
        setUsedAidThisTurn(false);
      }
    }, 5000);
  };

  const startGame = async () => {
    if (!isHost) return;
    const { error } = await supabase.from('rooms').update({ status: 'playing' }).eq('code', roomCode);
    if (error) {
      showError("Erro ao iniciar partida.");
      return;
    }
    await supabase.from('profiles')
      .update({ current_score: 0, is_eliminated: false })
      .eq('current_room_id', roomCode);

    showSuccess("A partida começou!");
  };

  const useAid = (type: 'fiftyFifty' | 'hint' | 'probabilities') => {
    if (state.aidsUsed[type] || usedAidThisTurn || isSpectator || isHost) return;
    const currentQ = QUESTIONS[state.currentQuestionIndex];
    
    if (type === 'fiftyFifty') {
      const wrongIndices = currentQ.options.map((_, i) => i).filter(i => i !== currentQ.correctAnswer);
      const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
      setState(prev => ({ ...prev, hiddenOptions: toHide }));
      showSuccess("50/50 Ativado!");
    } else if (type === 'hint') {
      toast.info(`DICA: ${currentQ.hint}`, { duration: 8000 });
    } else if (type === 'probabilities') {
      const probs = [0, 0, 0, 0];
      probs[currentQ.correctAnswer] = 75;
      currentQ.options.forEach((_, i) => { if (i !== currentQ.correctAnswer) probs[i] = 8; });
      setProbabilities(probs);
      showSuccess("Probabilidades calculadas!");
    }

    setState(prev => ({ ...prev, aidsUsed: { ...prev.aidsUsed, [type]: true } }));
    setUsedAidThisTurn(true);
  };

  // Se for Host e estiver jogando, renderiza a Tela de TV
  if (isHost && state.roomStatus === 'playing' && !state.isGameOver) {
    return (
      <TVView 
        question={QUESTIONS[state.currentQuestionIndex]}
        timeLeft={state.timeLeft}
        roomCode={roomCode || ''}
        players={roomPlayers}
        showResult={state.showResult}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={QUESTIONS.length}
      />
    );
  }

  // Tela de Fim de Jogo
  if (state.isGameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center relative overflow-hidden">
        <div className="max-w-3xl w-full glass-dark border-8 border-blue-600 p-16 rounded-[5rem] shadow-[0_0_150px_rgba(37,99,235,0.3)] animate-in zoom-in duration-1000 relative z-10">
          <Trophy className="text-yellow-500 animate-bounce mx-auto mb-10" size={120} />
          <h2 className="text-6xl font-black text-white italic uppercase mb-6 tracking-tighter">
            {state.isWinner ? "VITÓRIA!" : "FIM DE JOGO"}
          </h2>
          <div className="bg-blue-900/30 p-10 rounded-[3rem] mb-10 border-2 border-blue-500/20">
            <p className="text-blue-300 font-black uppercase tracking-widest text-xs mb-2">Pontuação</p>
            <p className="text-8xl font-black text-yellow-400">{state.score}</p>
          </div>
          <Button onClick={() => navigate('/home')} className="bg-blue-600 hover:bg-blue-500 h-16 px-12 text-xl font-black rounded-2xl">
            VOLTAR AO INÍCIO
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col p-6 relative">
        {/* Header da Arena */}
        <div className="flex justify-between items-center mb-6 glass-dark p-4 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg"><Users size={20} className="text-white" /></div>
            <div>
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Sala</p>
              <p className="text-white font-black text-sm">{roomCode}</p>
            </div>
          </div>
          {state.roomStatus === 'playing' && (
            <div className="text-center">
              <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Tempo</p>
              <div className={cn("flex items-center gap-2 font-black text-2xl italic", state.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white")}>
                <TimerIcon size={18} /> {state.timeLeft}s
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full">
          {state.roomStatus === 'waiting' ? (
            <div className="w-full glass-dark p-12 rounded-[4rem] border-4 border-blue-500/30 text-center animate-in zoom-in duration-500">
              <div className="bg-blue-600/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="text-blue-400 animate-pulse" size={40} />
              </div>
              <h2 className="text-4xl font-black text-white italic uppercase mb-2">Aguardando Início</h2>
              <p className="text-blue-300 font-bold text-xs uppercase tracking-[0.3em] mb-8">Código: {roomCode}</p>
              
              {isHost ? (
                <Button 
                  onClick={startGame} 
                  className="w-full bg-green-600 hover:bg-green-500 h-20 text-2xl font-black rounded-3xl shadow-2xl shadow-green-900/40 transition-all active:scale-95"
                >
                  <Play className="mr-3" size={32} /> INICIAR PARTIDA
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="text-yellow-500 animate-pulse" size={32} />
                  <p className="text-white font-black uppercase tracking-widest text-sm">O professor iniciará em breve...</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <ScoreBoard score={state.score} current={state.currentQuestionIndex + 1} total={QUESTIONS.length} playerName={playerName} />
              <div className="w-full mb-4">
                <Progress value={(state.timeLeft / 30) * 100} className={cn("h-2 bg-slate-800", state.timeLeft <= 5 ? "bg-red-900" : "bg-blue-900")} />
              </div>
              
              <QuestionCard 
                question={QUESTIONS[state.currentQuestionIndex]} 
                onAnswer={(idx) => !state.showResult && !isSpectator && setState(prev => ({ ...prev, selectedOption: idx }))} 
                selectedOption={state.selectedOption}
                showResult={state.showResult}
                probabilities={probabilities}
                isMaldade={QUESTIONS[state.currentQuestionIndex].isMaldade}
                hiddenOptions={state.hiddenOptions}
              />

              {state.showResult && (
                <div className="mt-6 w-full glass-dark p-6 rounded-[2rem] border-2 border-blue-500/30 animate-in slide-in-from-bottom duration-500">
                  <p className="text-white text-sm leading-relaxed italic font-medium">"{QUESTIONS[state.currentQuestionIndex].explanation}"</p>
                </div>
              )}

              {!isSpectator && !state.showResult && (
                <Aids used={state.aidsUsed} onUse={useAid} disabled={QUESTIONS[state.currentQuestionIndex].isMaldade} usedThisTurn={usedAidThisTurn} />
              )}
            </>
          )}
        </div>
      </div>
      <RankingSidebar players={roomPlayers} />
    </div>
  );
};

export default Game;