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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Timer as TimerIcon, LogOut, Play, BrainCircuit, Sparkles, Trophy, AlertTriangle, Crown, Medal, Home } from 'lucide-react';

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
      if (document.visibilityState === 'hidden' && stateRef.current.roomStatus === 'playing' && !stateRef.current.showResult) {
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
          questionStartedAt: room.question_started_at,
          isGameOver: room.status === 'finished'
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
          isGameOver: newRoom.status === 'finished',
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
        showSuccess(`CORRETO! +${pointsChange} pts`);
      } else {
        pointsChange = -totalPoints;
        
        if (stateRef.current.currentQuestionIndex < 5) shouldEliminate = true;
        if (currentQ.isMaldade) shouldEliminate = true;
        if (stateRef.current.currentQuestionIndex === 999) shouldEliminate = true;
        if (currentQ.difficulty === 'difícil') shouldEliminate = true;
        if (noAnswer) shouldEliminate = true;

        if (shouldEliminate) {
          setIsSpectator(true);
          showError(noAnswer ? "TEMPO ESGOTADO! VOCÊ FOI ELIMINADO." : "RESPOSTA ERRADA! VOCÊ FOI ELIMINADO.");
        } else {
          showError(`ERROU! ${pointsChange} pts`);
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
        } else {
          await supabase.from('rooms').update({ 
            current_question_index: nextIndex,
            question_started_at: new Date().toISOString()
          }).eq('code', roomCode);
        }
      }, 6000);
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

  const sortedWinners = [...roomPlayers].sort((a, b) => b.score - a.score).slice(0, 3);

  if (isHost && state.roomStatus === 'playing' && !state.isGameOver) {
    return (
      <TVView 
        question={getCurrentQuestion(state.currentQuestionIndex)}
        timeLeft={state.timeLeft}
        roomCode={roomCode || ''}
        players={roomPlayers}
        showResult={state.showResult}
        currentQuestionIndex={state.currentQuestionIndex === 999 ? 8 : state.currentQuestionIndex >= 8 ? state.currentQuestionIndex + 1 : state.currentQuestionIndex}
        totalQuestions={QUESTIONS.length + 1}
      />
    );
  }

  const currentQ = getCurrentQuestion(state.currentQuestionIndex);
  const isEliminatory = state.currentQuestionIndex < 5 || currentQ.difficulty === 'difícil' || currentQ.isMaldade || state.currentQuestionIndex === 999;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 overflow-hidden">
      <div className="flex-1 flex flex-col p-6 relative overflow-y-auto custom-scrollbar">
        {/* Header (Oculto no Game Over) */}
        {!state.isGameOver && (
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
        )}

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
            <div className="w-full max-w-4xl animate-in zoom-in duration-700">
              <div className="text-center mb-12">
                <Trophy className="text-yellow-500 mx-auto mb-4 animate-bounce" size={80} />
                <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Pódio Final</h2>
                <p className="text-blue-400 font-bold uppercase tracking-widest">Os mestres da Psicologia em Saúde</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16">
                {/* Segundo Lugar */}
                {sortedWinners[1] && (
                  <div className="order-2 md:order-1 flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-1000 delay-200">
                    <div className="relative">
                      <Avatar className="w-32 h-32 border-4 border-slate-400 shadow-2xl">
                        <AvatarImage src={sortedWinners[1].avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-slate-800 text-2xl font-black">{sortedWinners[1].name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-slate-400 p-2 rounded-full border-4 border-slate-900">
                        <Medal className="text-slate-900" size={20} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 font-black text-xl truncate max-w-[150px]">{sortedWinners[1].name}</p>
                      <p className="text-white font-black text-2xl">{sortedWinners[1].score} <span className="text-xs opacity-50">PTS</span></p>
                    </div>
                    <div className="w-full h-32 bg-slate-400/20 rounded-t-3xl border-t-4 border-slate-400 flex items-center justify-center">
                      <span className="text-4xl font-black text-slate-400">2º</span>
                    </div>
                  </div>
                )}

                {/* Primeiro Lugar */}
                {sortedWinners[0] && (
                  <div className="order-1 md:order-2 flex flex-col items-center gap-6 animate-in slide-in-from-bottom duration-1000">
                    <div className="relative">
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-pulse">
                        <Crown className="text-yellow-500" size={60} />
                      </div>
                      <Avatar className="w-48 h-48 border-8 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                        <AvatarImage src={sortedWinners[0].avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-slate-800 text-4xl font-black">{sortedWinners[0].name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-4 -right-4 bg-yellow-500 p-4 rounded-full border-4 border-slate-900 shadow-xl">
                        <Trophy className="text-slate-900" size={32} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-yellow-500 font-black text-3xl italic tracking-tighter truncate max-w-[200px]">{sortedWinners[0].name}</p>
                      <p className="text-white font-black text-4xl">{sortedWinners[0].score} <span className="text-sm opacity-50">PTS</span></p>
                    </div>
                    <div className="w-full h-48 bg-yellow-500/20 rounded-t-[3rem] border-t-8 border-yellow-500 flex items-center justify-center shadow-[0_-20px_50px_rgba(234,179,8,0.1)]">
                      <span className="text-6xl font-black text-yellow-500">1º</span>
                    </div>
                  </div>
                )}

                {/* Terceiro Lugar */}
                {sortedWinners[2] && (
                  <div className="order-3 flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-1000 delay-500">
                    <div className="relative">
                      <Avatar className="w-28 h-28 border-4 border-amber-700 shadow-2xl">
                        <AvatarImage src={sortedWinners[2].avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-slate-800 text-xl font-black">{sortedWinners[2].name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-amber-700 p-2 rounded-full border-4 border-slate-900">
                        <Medal className="text-slate-900" size={18} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-amber-700 font-black text-lg truncate max-w-[150px]">{sortedWinners[2].name}</p>
                      <p className="text-white font-black text-xl">{sortedWinners[2].score} <span className="text-xs opacity-50">PTS</span></p>
                    </div>
                    <div className="w-full h-24 bg-amber-700/20 rounded-t-2xl border-t-4 border-amber-700 flex items-center justify-center">
                      <span className="text-3xl font-black text-amber-700">3º</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/home')} className="bg-blue-600 hover:bg-blue-500 h-16 px-12 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-105">
                  <Home className="mr-2" /> VOLTAR AO INÍCIO
                </Button>
                <Button variant="outline" onClick={() => navigate('/ranking')} className="border-yellow-600 text-yellow-500 h-16 px-12 text-xl font-black rounded-2xl hover:bg-yellow-600 hover:text-white">
                  <Trophy className="mr-2" /> VER RANKING GERAL
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <ScoreBoard score={state.score} current={state.currentQuestionIndex === 999 ? 9 : state.currentQuestionIndex >= 8 ? state.currentQuestionIndex + 2 : state.currentQuestionIndex + 1} total={QUESTIONS.length + 1} playerName={playerName} />
              
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

      {!isMobile && !state.isGameOver && (
        <div className="w-96 h-full border-l border-white/10">
          <RankingSidebar players={roomPlayers} hostId={hostId} />
        </div>
      )}
    </div>
  );
};

export default Game;