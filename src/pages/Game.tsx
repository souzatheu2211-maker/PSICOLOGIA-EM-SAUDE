"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QUESTIONS, PROFESSOR_TRICK, MOTIVATIONAL_PHRASES } from '@/data/questions';
import { GameState, Player } from '@/types/game';
import QuestionCard from '@/components/Game/QuestionCard';
import ScoreBoard from '@/components/Game/ScoreBoard';
import Aids from '@/components/Game/Aids';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Home, Trophy, RotateCcw, Users, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');
  
  const [playerName, setPlayerName] = useState('');
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [usedAidThisTurn, setUsedAidThisTurn] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);
  const [showRanking, setShowRanking] = useState(false);

  const [state, setState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    aidsUsed: { fiftyFifty: false, audience: false, phone: false },
    isGameOver: false,
    isWinner: false,
    correctCount: 0,
    wrongCount: 0,
    showProfessorTrick: false,
    professorTrickDone: false,
  });

  useEffect(() => {
    const name = localStorage.getItem('currentPlayer');
    if (!name) {
      navigate('/lobby');
      return;
    }
    setPlayerName(name);
    
    // Simulação de Ranking em tempo real (em um app real usaríamos Realtime do Supabase)
    const mockPlayers: Player[] = [
      { id: '1', name: name, score: 0, correctAnswers: 0, wrongAnswers: 0, status: 'finalizou', date: '' },
      { id: '2', name: 'Dr. Freud', score: 150, correctAnswers: 8, wrongAnswers: 1, status: 'finalizou', date: '' },
      { id: '3', name: 'Enf. Jung', score: 80, correctAnswers: 4, wrongAnswers: 2, status: 'eliminado', date: '' },
    ];
    setRoomPlayers(mockPlayers);
  }, [navigate]);

  const handleAnswer = (selectedIndex: number) => {
    if (isSpectator) return;

    const isTrick = state.showProfessorTrick;
    const currentQ = isTrick ? PROFESSOR_TRICK : QUESTIONS[state.currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.correctAnswer;

    if (isCorrect) {
      let points = currentQ.difficulty === 'fácil' ? 10 : currentQ.difficulty === 'médio' ? 20 : 40;
      if (currentQ.isBonus) points *= 2;
      
      showSuccess(`Correto! +${points} pts`);
      
      const nextIndex = state.currentQuestionIndex + 1;
      const isWinner = nextIndex >= QUESTIONS.length;

      setState(prev => ({
        ...prev,
        score: prev.score + points,
        correctCount: prev.correctCount + 1,
        currentQuestionIndex: nextIndex,
        isWinner,
        isGameOver: isWinner
      }));
    } else {
      // Lógica de Eliminação
      if (state.currentQuestionIndex < 2 || currentQ.isMaldade || state.showProfessorTrick) {
        showError("Você foi ELIMINADO! Mas pode continuar assistindo.");
        setIsSpectator(true);
      } else {
        const penalty = currentQ.difficulty === 'fácil' ? 5 : currentQ.difficulty === 'médio' ? 10 : 20;
        showError(`Errado! Perdeu ${penalty} pts`);
        setState(prev => ({
          ...prev,
          score: Math.max(0, prev.score - penalty),
          wrongCount: prev.wrongCount + 1,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      }
    }
    setDisabledOptions([]);
    setUsedAidThisTurn(false);
  };

  const winners = roomPlayers.filter(p => p.score === Math.max(...roomPlayers.map(pl => pl.score)));

  if (state.isGameOver || (isSpectator && state.currentQuestionIndex >= QUESTIONS.length)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-2xl w-full bg-slate-900 border-4 border-blue-600 p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-500">
          <Trophy className="mx-auto text-yellow-500 mb-6" size={80} />
          <h2 className="text-5xl font-black mb-4 text-white italic uppercase">Fim da Partida</h2>
          
          <div className="bg-blue-900/20 p-6 rounded-2xl mb-8 border border-blue-500/30">
            <h3 className="text-blue-400 font-bold uppercase tracking-widest mb-4">Vencedores da Sala</h3>
            <div className="space-y-2">
              {winners.map(w => (
                <div key={w.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl">
                  <span className="font-black text-white">{w.name}</span>
                  <span className="text-yellow-400 font-black">{w.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-500 h-16 text-xl font-black rounded-2xl">
              <RotateCcw className="mr-2" /> NOVO JOGO
            </Button>
            <Button variant="ghost" onClick={() => navigate('/home')} className="text-slate-400">
              <Home className="mr-2" size={18} /> Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Users size={20} className="text-white" />
          </div>
          <span className="text-white font-black italic">SALA: {roomCode || 'LOCAL'}</span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowRanking(!showRanking)}
          className="border-yellow-600 text-yellow-500 font-black rounded-xl"
        >
          <Trophy className="mr-2" size={18} /> RANKING
        </Button>
      </div>

      {isSpectator && (
        <div className="bg-red-600/20 border border-red-600 p-3 rounded-xl mb-6 flex items-center justify-center gap-2 animate-pulse">
          <Eye className="text-red-500" />
          <span className="text-red-500 font-black uppercase text-xs">Modo Espectador: Você foi eliminado!</span>
        </div>
      )}

      <ScoreBoard 
        score={state.score} 
        current={state.currentQuestionIndex + 1} 
        total={QUESTIONS.length} 
        playerName={playerName} 
      />

      <div className="flex-1 flex flex-col justify-center items-center relative">
        {showRanking && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 rounded-[2rem] border-4 border-yellow-600 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-yellow-500 italic uppercase">Ranking da Partida</h3>
              <Button variant="ghost" onClick={() => setShowRanking(false)} className="text-white">Fechar</Button>
            </div>
            <div className="space-y-3">
              {roomPlayers.sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-blue-900">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-500 font-black">#{i+1}</span>
                    <span className="text-white font-bold">{p.name} {p.id === '1' && '(Você)'}</span>
                  </div>
                  <span className="text-yellow-400 font-black">{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <QuestionCard 
          question={QUESTIONS[state.currentQuestionIndex]} 
          onAnswer={handleAnswer} 
          disabledOptions={disabledOptions}
          isMaldade={QUESTIONS[state.currentQuestionIndex].isMaldade}
        />

        {!isSpectator && (
          <Aids 
            used={state.aidsUsed} 
            onUse={(type) => {
              if (state.aidsUsed[type]) return;
              toast.info(`Ajuda ${type} usada!`);
              setState(prev => ({ ...prev, aidsUsed: { ...prev.aidsUsed, [type]: true } }));
            }} 
            disabled={QUESTIONS[state.currentQuestionIndex].isMaldade} 
          />
        )}
      </div>
    </div>
  );
};

export default Game;