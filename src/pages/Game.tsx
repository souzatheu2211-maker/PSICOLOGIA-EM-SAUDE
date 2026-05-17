"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QUESTIONS, PROFESSOR_TRICK } from '@/data/questions';
import { GameState, Player, Question } from '@/types/game';
import QuestionCard from '@/components/Game/QuestionCard';
import ScoreBoard from '@/components/Game/ScoreBoard';
import Aids from '@/components/Game/Aids';
import RankingSidebar from '@/components/Game/RankingSidebar';
import TVView from '@/components/Game/TVView';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Timer as TimerIcon, LogOut, Play, BrainCircuit, Sparkles, Trophy, AlertTriangle } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');
  const isHost = searchParams.get('host') === 'true';
  const isMobile = useIsMobile();
  
  const [playerName, setPlayerName] = useState('');
  const [hostId, setHostId] = useState<string | undefined>(undefined);
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
    hiddenOptions: [],
    questionStartedAt: null
  });

  // Sincronização Realtime
  useEffect(() => {
    if (!roomCode) return;

    const fetchRoomData = async () => {
      const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
      if (room) {
        setState(prev => ({ 
          ...prev, 
          roomStatus: room.status,
          currentQuestionIndex: room.current_question_index,
          questionStartedAt: room.question_started_at
        }));
        setHostId(room.host_id);
      }

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
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'rooms', 
        filter: `code=eq.${roomCode}` 
      }, (payload: any) => {
        const newRoom = payload.new;
        setState(prev => ({ 
          ...prev, 
          roomStatus: newRoom.status,
          currentQuestionIndex: newRoom.current_question_index,
          questionStartedAt: newRoom.question_started_at,
          showResult: false,
          selectedOption: null,
          hiddenOptions: []
        }));
        setProbabilities([]);
        setUsedAidThisTurn(false);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles', 
        filter: `current_room_id=eq.${roomCode}` 
      }, () => {
        fetchRoomData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode]);

  // Timer Sincronizado por Timestamp
  useEffect(() => {
    if (state.roomStatus !== 'playing' || state.isGameOver || !state.questionStartedAt || state.showResult) return;

    const calculateTime = () => {
      const startedAt = new Date(state.questionStartedAt!).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - startedAt) / 1000);
      const remaining = Math.max(0, 30 - diff);
      
      setState(prev => ({ ...prev, timeLeft: remaining }));

      if (remaining === 0) {
        handleTimeUp();
      }
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();

    return () => clearInterval(timer);
  }, [state.questionStartedAt, state.roomStatus, state.showResult]);

  const getCurrentQuestion = (): Question => {
    if (state.currentQuestionIndex === 999) return PROFESSOR_TRICK;
    return QUESTIONS[state.currentQuestionIndex];
  };

  const handleTimeUp = async () => {
    if (state.showResult) return;
    
    const currentQ = getCurrentQuestion();
    const isCorrect = state.selectedOption === currentQ.correctAnswer;
    const noAnswer = state.selectedOption === null;
    
    setState(prev => ({ ...prev, showResult: true }));

    if (!isHost && !isSpectator) {
      let shouldEliminate = false;
      let pointsChange = 0;

      // Lógica de Pontuação e Penalidade
      const basePoints = currentQ.difficulty === 'fácil' ? 10 : currentQ.difficulty === 'médio' ? 20 : 40;
      const multiplier = currentQ.isBonus ? 2 : 1;
      const totalPoints = basePoints * multiplier;

      if (isCorrect) {
        pointsChange = totalPoints;
        showSuccess(`CORRETO! +${pointsChange} pts`);
      } else {
        pointsChange = -totalPoints;
        
        // Regras de Eliminação
        if (state.currentQuestionIndex < 3) shouldEliminate = true;
        if (currentQ.isMaldade) {
          shouldEliminate = true;
          pointsChange = -20; // Penalidade fixa da maldade
        }
        if (state.currentQuestionIndex === 999) {
          shouldEliminate = true;
          pointsChange = -20; // Penalidade fixa do professor
        }
        if (currentQ.difficulty === 'difícil') shouldEliminate = true;
        if (noAnswer) shouldEliminate = true;

        if (shouldEliminate) {
          setIsSpectator(true);
          showError(noAnswer ? "TEMPO ESGOTADO! VOCÊ FOI ELIMINADO." : "RESPOSTA ERRADA! VOCÊ FOI ELIMINADO.");
        } else {
          showError(`ERROU! ${pointsChange} pts`);
        }
      }

      const newScore = Math.max(0, state.score + pointsChange);
      setState(prev => ({ ...prev, score: newScore }));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          current_score: newScore,
          is_eliminated: shouldEliminate 
        }).eq('id', user.id);
      }
    }

    // Host gerencia a transição de perguntas
    if (isHost) {
      setTimeout(async () => {
        let nextIndex = state.currentQuestionIndex + 1;
        
        if (state.currentQuestionIndex === 8) {
          nextIndex = 999;
        } else if (state.currentQuestionIndex === 999) {
          nextIndex = 9;
        }

        if (nextIndex >= QUESTIONS.length && state.currentQuestionIndex !== 999) {
          await supabase.from('rooms').update({ status: 'finished' }).eq('code', roomCode);
          setState(prev => ({ ...prev, isGameOver: true }));
        } else {
          await supabase.from('rooms').update({ 
            current_question_index: nextIndex,
            question_started_at: new Date().toISOString()
          }).eq('code', roomCode);
        }
      }, 6000);
    }
  };

  const startGame = async () => {
    if (!isHost) return;
    
    const { error } = await supabase
      .from('rooms')
      .update({ 
        status: 'playing',
        current_question_index: 0,
        question_started_at: new Date().toISOString()
      })
      .eq('code', roomCode);

    if (error) showError("Erro ao iniciar partida.");
  };

  const useAid = (type: 'fiftyFifty' | 'hint' | 'probabilities') => {
    const currentQ = getCurrentQuestion();
    if (state.aidsUsed[type] || usedAidThisTurn || isSpectator || isHost || currentQ.isMaldade || state.currentQuestionIndex === 999) return;
    
    if (type === 'fiftyFifty') {
      const wrongIndices = currentQ.options.map((_, i) => i).filter(i => i !== currentQ.correctAnswer);
      const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
      setState(prev => ({ ...prev, hiddenOptions: toHide }));
    } else if (type === 'hint') {
      showSuccess(`DICA: ${currentQ.hint}`);
    } else if (type === 'probabilities') {
      const probs = [0, 0, 0, 0];
      probs[currentQ.correctAnswer] = 75;
      currentQ.options.forEach((_, i) => { if (i !== currentQ.correctAnswer) probs[i] = 8; });
      setProbabilities(probs);
    }

    setState(prev => ({ ...prev, aidsUsed: { ...prev.aidsUsed, [type]: true } }));
    setUsedAidThisTurn(true);
  };

  if (isHost && state.roomStatus === 'playing' && !state.isGameOver) {
    return (
      <TVView 
        question={getCurrentQuestion()}
        timeLeft={state.timeLeft}
        roomCode={roomCode || ''}
        players={roomPlayers}
        showResult={state.showResult}
        currentQuestionIndex={state.currentQuestionIndex === 999 ? 9 : state.currentQuestionIndex}
        totalQuestions={QUESTIONS.length}
      />
    );
  }

  const currentQ = getCurrentQuestion();
  const isEliminatory = state.currentQuestionIndex < 3 || currentQ.difficulty === 'difícil' || currentQ.isMaldade || state.currentQuestionIndex === 999;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col p-6 relative overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 glass-dark p-6 rounded-[2.5rem] border-2 border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl"><BrainCircuit size={24} className="text-white" /></div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sala: {roomCode}</p>
              <p className="text-white font-black text-xl italic">{playerName}</p>
            </div>
          </div>
          
          {state.roomStatus === 'playing' && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Tempo</p>
                <div className={cn("flex items-center gap-2 font-black text-3xl italic", state.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white")}>
                  <TimerIcon size={24} /> {state.timeLeft}s
                </div>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => navigate('/home')} className="border-red-900/50 text-red-500 h-12 rounded-2xl font-black">
            <LogOut size={16} className="mr-2" /> SAIR
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto w-full">
          {state.roomStatus === 'waiting' ? (
            <div className="w-full glass-dark p-12 rounded-[4rem] border-4 border-blue-500/30 text-center">
              <h2 className="text-5xl font-black text-white italic uppercase mb-8">Aguardando Início</h2>
              <div className="bg-white/5 py-6 px-12 rounded-3xl border border-white/10 inline-block mb-12">
                <p className="text-blue-300 font-black text-xs uppercase mb-2">Código da Sala</p>
                <p className="text-white font-black text-6xl tracking-widest">{roomCode}</p>
              </div>
              {isHost && (
                <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-500 h-20 text-2xl font-black rounded-[2rem]">
                  <Play className="mr-4" size={32} /> INICIAR PARTIDA
                </Button>
              )}
            </div>
          ) : state.isGameOver ? (
            <div className="text-center glass-dark p-16 rounded-[4rem] border-8 border-blue-600">
              <Trophy className="text-yellow-500 mx-auto mb-8" size={100} />
              <h2 className="text-6xl font-black text-white italic uppercase mb-4">Fim de Jogo!</h2>
              <p className="text-4xl font-black text-yellow-400 mb-12">Pontuação Final: {state.score}</p>
              <Button onClick={() => navigate('/home')} className="bg-blue-600 h-16 px-12 text-xl font-black rounded-2xl">VOLTAR</Button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <ScoreBoard score={state.score} current={state.currentQuestionIndex === 999 ? 10 : state.currentQuestionIndex + 1} total={QUESTIONS.length} playerName={playerName} />
              
              {/* Alerta de Pergunta Eliminatória */}
              {isEliminatory && (
                <div className="bg-red-600/20 border-2 border-red-600 p-4 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                  <AlertTriangle className="text-red-500" />
                  <span className="text-red-500 font-black uppercase italic tracking-widest">⚠️ PERGUNTA ELIMINATÓRIA - Se errar, você sai do jogo!</span>
                </div>
              )}

              <QuestionCard 
                question={currentQ} 
                onAnswer={(idx) => !state.showResult && !isSpectator && setState(prev => ({ ...prev, selectedOption: idx }))} 
                selectedOption={state.selectedOption}
                showResult={state.showResult}
                probabilities={probabilities}
                isMaldade={currentQ.isMaldade || state.currentQuestionIndex === 999}
                hiddenOptions={state.hiddenOptions}
              />

              {state.showResult && (
                <div className="glass-dark p-8 rounded-[3rem] border-4 border-blue-500/30 animate-in slide-in-from-bottom duration-500">
                  <p className="text-blue-400 font-black uppercase text-xs mb-2 tracking-widest">Justificativa do Professor</p>
                  <p className="text-white text-xl italic leading-relaxed">"{currentQ.explanation}"</p>
                </div>
              )}

              {!isSpectator && !state.showResult && (
                <Aids used={state.aidsUsed} onUse={useAid} disabled={currentQ.isMaldade || state.currentQuestionIndex === 999} usedThisTurn={usedAidThisTurn} />
              )}
            </div>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="w-96 h-full border-l border-white/10">
          <RankingSidebar players={roomPlayers} hostId={hostId} />
        </div>
      )}
    </div>
  );
};

export default Game;