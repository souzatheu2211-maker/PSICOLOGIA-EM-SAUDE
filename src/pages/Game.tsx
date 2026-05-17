"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QUESTIONS } from '@/data/questions';
import { GameState, Player } from '@/types/game';
import QuestionCard from '@/components/Game/QuestionCard';
import ScoreBoard from '@/components/Game/ScoreBoard';
import Aids from '@/components/Game/Aids';
import RankingSidebar from '@/components/Game/RankingSidebar';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Home, Trophy, RotateCcw, Users, Eye, Maximize, Minimize, Timer as TimerIcon, Play, Info } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    roomStatus: 'waiting'
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

    // Próxima pergunta automática após 5 segundos (tempo para ler a justificativa)
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
          showResult: false 
        }));
        setProbabilities([]);
        setUsedAidThisTurn(false);
      }
    }, 5000);
  };

  const startGame = async () => {
    if (!isHost) return;
    await supabase.from('rooms').update({ status: 'playing' }).eq('code', roomCode);
    showSuccess("A partida começou! Boa sorte a todos.");
  };

  const useAid = (type: 'fiftyFifty' | 'hint' | 'probabilities') => {
    if (state.aidsUsed[type] || usedAidThisTurn || isSpectator) return;
    const currentQ = QUESTIONS[state.currentQuestionIndex];
    if (type === 'hint') toast.info(`DICA: ${currentQ.hint}`, { duration: 6000 });
    else if (type === 'probabilities') {
      const probs = [0, 0, 0, 0];
      probs[currentQ.correctAnswer] = 70;
      currentQ.options.forEach((_, i) => { if (i !== currentQ.correctAnswer) probs[i] = 10; });
      setProbabilities(probs);
    }
    setState(prev => ({ ...prev, aidsUsed: { ...prev.aidsUsed, [type]: true } }));
    setUsedAidThisTurn(true);
  };

  if (state.roomStatus === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-md w-full glass-dark p-10 rounded-[3rem] border-blue-500/30 animate-in zoom-in duration-500">
          <div className="bg-blue-600/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="text-blue-400 animate-pulse" size={40} />
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase mb-2">Sala de Espera</h2>
          <p className="text-blue-300 font-bold text-xs mb-8">Código: <span className="text-white text-lg">{roomCode}</span></p>
          
          <div className="space-y-4">
            <p className="text-slate-400 text-xs">Aguardando o professor iniciar a partida...</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {roomPlayers.map(p => (
                <div key={p.id} className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">{p.name}</div>
              ))}
            </div>
            {isHost && (
              <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-500 h-14 font-black rounded-2xl shadow-lg shadow-green-900/20">
                <Play className="mr-2" size={20} /> INICIAR PARTIDA
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.isGameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-2xl w-full glass-dark border-4 border-blue-600 p-12 rounded-[4rem] shadow-2xl animate-in zoom-in duration-700">
          <Trophy className="text-yellow-500 mx-auto mb-6 animate-bounce" size={100} />
          <h2 className="text-5xl font-black text-white italic uppercase mb-4">{state.isWinner ? "Mestre da Mente!" : "Fim de Jogo"}</h2>
          <div className="bg-blue-900/30 p-8 rounded-[2.5rem] mb-8 border border-blue-500/30">
            <p className="text-blue-300 font-bold uppercase text-[10px] mb-1">Pontuação Final</p>
            <p className="text-6xl font-black text-yellow-400">{state.score} PTS</p>
          </div>
          <Button onClick={() => navigate('/home')} className="bg-blue-600 hover:bg-blue-500 h-16 px-10 font-black rounded-2xl">VOLTAR AO INÍCIO</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col p-6 relative">
        <div className="flex justify-between items-center mb-6 glass-dark p-4 rounded-3xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><Users size={20} /></div>
            <div>
              <p className="text-[8px] font-black text-blue-400 uppercase">Sala</p>
              <p className="text-white font-black text-sm">{roomCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[8px] font-black text-yellow-500 uppercase">Tempo</p>
              <div className={cn("flex items-center gap-2 font-black text-2xl italic", state.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white")}>
                <TimerIcon size={18} /> {state.timeLeft}s
              </div>
            </div>
          </div>
        </div>

        {isSpectator && (
          <div className="bg-red-600/20 border border-red-600/50 p-3 rounded-2xl mb-6 flex items-center justify-center gap-2 animate-pulse">
            <Eye className="text-red-500" size={18} />
            <span className="text-red-500 font-black uppercase text-[10px]">Modo Espectador: Você foi eliminado!</span>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full">
          <ScoreBoard score={state.score} current={state.currentQuestionIndex + 1} total={QUESTIONS.length} playerName={playerName} />
          <div className="w-full mb-4"><Progress value={(state.timeLeft / 30) * 100} className="h-1.5 bg-slate-800" /></div>
          
          <QuestionCard 
            question={QUESTIONS[state.currentQuestionIndex]} 
            onAnswer={(idx) => !state.showResult && !isSpectator && setState(prev => ({ ...prev, selectedOption: idx }))} 
            selectedOption={state.selectedOption}
            showResult={state.showResult}
            probabilities={probabilities}
            isMaldade={QUESTIONS[state.currentQuestionIndex].isMaldade}
          />

          {state.showResult && (
            <div className="mt-6 w-full glass-dark p-6 rounded-[2rem] border-blue-500/30 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-2 mb-2 text-blue-400">
                <Info size={16} />
                <span className="font-black uppercase text-[10px]">Justificativa Pedagógica</span>
              </div>
              <p className="text-white text-xs leading-relaxed italic">"{QUESTIONS[state.currentQuestionIndex].explanation}"</p>
            </div>
          )}

          {!isSpectator && !state.showResult && (
            <Aids used={state.aidsUsed} onUse={useAid} disabled={QUESTIONS[state.currentQuestionIndex].isMaldade} usedThisTurn={usedAidThisTurn} />
          )}
        </div>
      </div>
      <RankingSidebar players={roomPlayers} />
    </div>
  );
};

export default Game;