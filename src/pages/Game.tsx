"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Timer as TimerIcon, LogOut, Play, BrainCircuit, Sparkles, Trophy, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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

  const selectedOptionRef = useRef<number | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    selectedOptionRef.current = state.selectedOption;
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (isHost || state.roomStatus !== 'playing' || state.isGameOver || isSpectator) return;

    const handleExit = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          is_eliminated: true,
          current_room_id: null 
        }).eq('id', user.id);
      }
    };

    window.addEventListener('beforeunload', handleExit);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleExit();
        showError("VOCÊ SAIU DA TELA E FOI ELIMINADO POR TENTATIVA DE TRAPAÇA!");
        setIsSpectator(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHost, state.roomStatus, state.isGameOver, isSpectator]);

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

  const getCurrentQuestion = (index: number): Question => {
    if (index === 999) return PROFESSOR_TRICK;
    return QUESTIONS[index];
  };

  const handleTimeUp = async () => {
    if (stateRef.current.showResult) return;
    
    const currentQ = getCurrentQuestion(stateRef.current.currentQuestionIndex);
    const selectedOption = selectedOptionRef.current;
    const isCorrect = selectedOption === currentQ.correctAnswer;
    const noAnswer = selectedOption === null;
    
    setState(prev => ({ ...prev, showResult: true }));

    if (!isHost && !isSpectator) {
      let shouldEliminate = false;
      let pointsChange = 0;

      const basePoints = currentQ.difficulty === 'fácil' ? 10 : currentQ.difficulty === 'médio' ? 20 : 40;
      const multiplier = currentQ.isBonus ? 2 : 1;
      const totalPoints = basePoints * multiplier;

      if (isCorrect) {
        pointsChange = totalPoints;
      } else {
        pointsChange = -totalPoints;
        
        if (stateRef.current.currentQuestionIndex < 5) shouldEliminate = true;
        if (currentQ.isMaldade) shouldEliminate = true;
        if (stateRef.current.currentQuestionIndex === 999) shouldEliminate = true;
        if (currentQ.difficulty === 'difícil') shouldEliminate = true;
        if (noAnswer) shouldEliminate = true;

        if (shouldEliminate) {
          setIsSpectator(true);
        }
      }

      const newScore = Math.max(0, stateRef.current.score + pointsChange);
      setState(prev => ({ ...prev, score: newScore }));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          current_score: newScore,
          is_eliminated: shouldEliminate 
        }).eq('id', user.id);
      }
    }

    if (isHost) {
      setTimeout(async () => {
        let nextIndex = stateRef.current.currentQuestionIndex + 1;
        
        if (stateRef.current.currentQuestionIndex === 7) {
          nextIndex = 999;
        } else if (stateRef.current.currentQuestionIndex === 999) {
          nextIndex = 8;
        }

        if (nextIndex >= QUESTIONS.length && stateRef.current.currentQuestionIndex !== 999) {
          await supabase.from('rooms').update({ status: 'finished' }).eq('code', roomCode);
          setState(prev => ({ ...prev, isGameOver: true }));
        } else {
          await supabase.from('rooms').update({ 
            current_question_index: nextIndex,
            question_started_at: new Date().toISOString()
          }).eq('code', roomCode);
        }
      }, 8000); // Aumentado para 8s para dar tempo de ler a justificativa
    }
  };

  useEffect(() => {
    if (state.roomStatus !== 'playing' || state.isGameOver || !state.questionStartedAt || state.showResult) return;

    const calculateTime = () => {
      const startedAt = new Date(state.questionStartedAt!).getTime();
      const now = Date.now();
      const elapsed = (now - startedAt) / 1000;
      const remaining = Math.max(0, 30 - elapsed);
      
      setState(prev => ({ ...prev, timeLeft: Math.floor(remaining) }));

      if (remaining <= 0) {
        handleTimeUp();
      }
    };

    const timer = setInterval(calculateTime, 500);
    calculateTime();

    return () => clearInterval(timer);
  }, [state.questionStartedAt, state.roomStatus, state.showResult]);

  const startGame = async () => {
    if (!isHost) return;
    await supabase.from('rooms').update({ 
      status: 'playing',
      current_question_index: 0,
      question_started_at: new Date().toISOString()
    }).eq('code', roomCode);
  };

  const useAid = (type: 'fiftyFifty' | 'hint' | 'probabilities') => {
    const currentQ = getCurrentQuestion(state.currentQuestionIndex);
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

  if (isHost) {
    return (
      <TVView 
        question={getCurrentQuestion(state.currentQuestionIndex)}
        timeLeft={state.timeLeft}
        roomCode={roomCode || ''}
        players={roomPlayers}
        showResult={state.showResult}
        currentQuestionIndex={state.currentQuestionIndex === 999 ? 9 : state.currentQuestionIndex >= 8 ? state.currentQuestionIndex + 2 : state.currentQuestionIndex + 1}
        totalQuestions={QUESTIONS.length + 1}
        roomStatus={state.roomStatus}
      />
    );
  }

  const currentQ = getCurrentQuestion(state.currentQuestionIndex);
  const isEliminatory = state.currentQuestionIndex < 5 || currentQ.difficulty === 'difícil' || currentQ.isMaldade || state.currentQuestionIndex === 999;
  const isCorrect = state.selectedOption === currentQ.correctAnswer;

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
            </div>
          ) : state.isGameOver || state.roomStatus === 'finished' ? (
            <div className="text-center glass-dark p-16 rounded-[4rem] border-8 border-blue-600">
              <Trophy className="text-yellow-500 mx-auto mb-8" size={100} />
              <h2 className="text-6xl font-black text-white italic uppercase mb-4">Fim de Jogo!</h2>
              <p className="text-4xl font-black text-yellow-400 mb-12">Pontuação Final: {state.score}</p>
              <Button onClick={() => navigate('/home')} className="bg-blue-600 h-16 px-12 text-xl font-black rounded-2xl">VOLTAR</Button>
            </div>
          ) : (
            <div className="w-full space-y-6 relative">
              <ScoreBoard score={state.score} current={state.currentQuestionIndex === 999 ? 9 : state.currentQuestionIndex >= 8 ? state.currentQuestionIndex + 2 : state.currentQuestionIndex + 1} total={QUESTIONS.length + 1} playerName={playerName} />
              
              {isEliminatory && !state.showResult && (
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

              {/* Overlay de Justificativa Centralizado */}
              {state.showResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                  <div className={cn(
                    "w-full max-w-2xl p-10 rounded-[3.5rem] border-4 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-center animate-in zoom-in duration-500",
                    isCorrect ? "bg-emerald-950/90 border-emerald-500" : "bg-red-950/90 border-red-500"
                  )}>
                    <div className="flex flex-col items-center gap-6">
                      {isCorrect ? (
                        <CheckCircle2 className="text-emerald-500" size={80} />
                      ) : (
                        <XCircle className="text-red-500" size={80} />
                      )}
                      
                      <h2 className={cn(
                        "text-5xl font-black italic uppercase tracking-tighter",
                        isCorrect ? "text-emerald-400" : "text-red-400"
                      )}>
                        {isCorrect ? "Você Acertou!" : "Você Errou!"}
                      </h2>

                      <div className="w-full h-px bg-white/10 my-2"></div>

                      <div className="space-y-4">
                        <p className="text-blue-400 font-black uppercase text-xs tracking-[0.3em]">Explicação do grupo</p>
                        <p className="text-white text-2xl md:text-3xl italic leading-relaxed font-medium">
                          "{currentQ.explanation}"
                        </p>
                      </div>

                      {isSpectator && !isCorrect && (
                        <div className="mt-6 bg-red-600/20 p-4 rounded-2xl border border-red-500/50">
                          <p className="text-red-400 font-black uppercase text-xs">Você foi eliminado da competição!</p>
                        </div>
                      )}
                    </div>
                  </div>
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