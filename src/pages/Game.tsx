"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QUESTIONS, PROFESSOR_TRICK, MOTIVATIONAL_PHRASES } from '@/data/questions';
import { GameState, Player } from '@/types/game';
import QuestionCard from '@/components/Game/QuestionCard';
import ScoreBoard from '@/components/Game/ScoreBoard';
import Aids from '@/components/Game/Aids';
import RankingSidebar from '@/components/Game/RankingSidebar';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Home, Trophy, RotateCcw, Users, Eye, Maximize, Minimize, Timer as TimerIcon, Sparkles } from 'lucide-react';
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
    timeLeft: 20,
    selectedOption: null,
    showResult: false
  });

  // Real-time: Busca jogadores da sala
  useEffect(() => {
    if (!roomCode) return;

    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, current_score, is_eliminated')
        .eq('current_room_id', roomCode);
      
      if (data) {
        setRoomPlayers(data.map(p => ({
          id: p.id,
          name: p.name,
          avatar_url: p.avatar_url,
          score: p.current_score,
          is_eliminated: p.is_eliminated
        })));
      }
    };

    fetchPlayers();

    // Inscrição Real-time
    const channel = supabase
      .channel(`room-${roomCode}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: `current_room_id=eq.${roomCode}`
      }, () => {
        fetchPlayers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  useEffect(() => {
    const name = localStorage.getItem('currentPlayer');
    if (!name) {
      navigate('/lobby');
      return;
    }
    setPlayerName(name);
    if (isHost) toggleFullscreen();
  }, [navigate, isHost]);

  // Timer Logic
  useEffect(() => {
    if (state.isGameOver || state.showResult) return;

    if (state.timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.timeLeft, state.isGameOver, state.showResult]);

  const handleTimeUp = async () => {
    const currentQ = QUESTIONS[state.currentQuestionIndex];
    const isCorrect = state.selectedOption === currentQ.correctAnswer;
    
    setState(prev => ({ ...prev, showResult: true }));

    if (isCorrect) {
      let points = currentQ.difficulty === 'fácil' ? 10 : currentQ.difficulty === 'médio' ? 20 : 40;
      if (currentQ.isBonus) points *= 2;
      
      const newScore = state.score + points;
      setState(prev => ({ ...prev, score: newScore }));
      
      // Atualiza no Supabase para o ranking real-time
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ current_score: newScore }).eq('id', user.id);
      }
      
      showSuccess(`Tempo esgotado! Você acertou: +${points} pts`);
    } else {
      if (state.currentQuestionIndex < 2 || currentQ.isMaldade) {
        setIsSpectator(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ is_eliminated: true }).eq('id', user.id);
        }
        showError("Tempo esgotado e você errou! ELIMINADO.");
      } else {
        showError("Tempo esgotado! Você errou.");
      }
    }

    // Espera 3 segundos e vai para a próxima
    setTimeout(() => {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= QUESTIONS.length) {
        setState(prev => ({ ...prev, isGameOver: true, isWinner: isCorrect }));
      } else {
        setState(prev => ({ 
          ...prev, 
          currentQuestionIndex: nextIndex, 
          timeLeft: 20, 
          selectedOption: null, 
          showResult: false 
        }));
        setProbabilities([]);
        setUsedAidThisTurn(false);
      }
    }, 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const useAid = (type: 'fiftyFifty' | 'hint' | 'probabilities') => {
    if (state.aidsUsed[type] || usedAidThisTurn) return;

    const currentQ = QUESTIONS[state.currentQuestionIndex];
    
    if (type === 'hint') {
      toast.info(`DICA: ${currentQ.hint}`, { duration: 6000 });
    } else if (type === 'probabilities') {
      const probs = [0, 0, 0, 0];
      probs[currentQ.correctAnswer] = 70;
      const remaining = 30;
      currentQ.options.forEach((_, i) => {
        if (i !== currentQ.correctAnswer) probs[i] = Math.floor(remaining / 3);
      });
      setProbabilities(probs);
    }

    setState(prev => ({
      ...prev,
      aidsUsed: { ...prev.aidsUsed, [type]: true }
    }));
    setUsedAidThisTurn(true);
  };

  if (state.isGameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-2xl w-full glass-dark border-4 border-blue-600 p-12 rounded-[4rem] shadow-[0_0_100px_rgba(37,99,235,0.3)] animate-in zoom-in duration-700 relative z-10">
          <div className="mb-8 relative inline-block">
            <Trophy className="text-yellow-500 animate-bounce" size={120} />
            <Sparkles className="absolute -top-4 -right-4 text-white animate-pulse" size={40} />
          </div>
          
          <h2 className="text-6xl font-black mb-6 text-white italic uppercase tracking-tighter">
            {state.isWinner ? "Mestre da Mente!" : "Fim da Jornada"}
          </h2>
          
          <div className="bg-blue-900/30 p-8 rounded-[2.5rem] mb-10 border border-blue-500/30 backdrop-blur-md">
            <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Sua Pontuação Final</p>
            <p className="text-7xl font-black text-yellow-400 drop-shadow-lg">{state.score} <span className="text-2xl">PTS</span></p>
          </div>

          <div className="flex flex-col gap-4">
            <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 h-20 text-2xl font-black rounded-3xl shadow-xl shadow-blue-900/40 transition-all active:scale-95">
              <RotateCcw className="mr-3" size={28} /> JOGAR NOVAMENTE
            </Button>
            <Button variant="ghost" onClick={() => navigate('/home')} className="text-slate-400 font-bold hover:text-white">
              <Home className="mr-2" size={20} /> Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 glass-dark p-4 rounded-3xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/40">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sala Ativa</p>
              <p className="text-white font-black italic text-xl">{roomCode}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Tempo</p>
              <div className={cn(
                "flex items-center gap-2 font-black text-3xl italic",
                state.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"
              )}>
                <TimerIcon size={24} />
                {state.timeLeft}s
              </div>
            </div>
            <Button variant="ghost" onClick={toggleFullscreen} className="text-blue-400 hover:bg-white/5 rounded-2xl h-12 w-12 p-0">
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </Button>
          </div>
        </div>

        {isSpectator && (
          <div className="bg-red-600/20 border-2 border-red-600/50 p-4 rounded-3xl mb-8 flex items-center justify-center gap-3 animate-pulse backdrop-blur-md">
            <Eye className="text-red-500" size={24} />
            <span className="text-red-500 font-black uppercase text-sm tracking-widest">Modo Espectador: Você foi eliminado!</span>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full">
          <ScoreBoard 
            score={state.score} 
            current={state.currentQuestionIndex + 1} 
            total={QUESTIONS.length} 
            playerName={playerName} 
          />

          <div className="w-full mb-6">
            <Progress value={(state.timeLeft / 20) * 100} className={cn(
              "h-2 bg-slate-800 transition-all duration-1000",
              state.timeLeft <= 5 ? "bg-red-900" : "bg-blue-900"
            )} />
          </div>

          <QuestionCard 
            question={QUESTIONS[state.currentQuestionIndex]} 
            onAnswer={(idx) => !state.showResult && setState(prev => ({ ...prev, selectedOption: idx }))} 
            selectedOption={state.selectedOption}
            showResult={state.showResult}
            probabilities={probabilities}
            isMaldade={QUESTIONS[state.currentQuestionIndex].isMaldade}
          />

          {!isSpectator && (
            <Aids 
              used={state.aidsUsed} 
              onUse={useAid} 
              disabled={QUESTIONS[state.currentQuestionIndex].isMaldade || state.showResult}
              usedThisTurn={usedAidThisTurn}
            />
          )}
        </div>
      </div>

      {/* Real-time Ranking Sidebar (TV Mode) */}
      <RankingSidebar players={roomPlayers} />
    </div>
  );
};

export default Game;