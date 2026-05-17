"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS, PROFESSOR_TRICK, MOTIVATIONAL_PHRASES } from '@/data/questions';
import { GameState, Player } from '@/types/game';
import QuestionCard from '@/components/Game/QuestionCard';
import ScoreBoard from '@/components/Game/ScoreBoard';
import Aids from '@/components/Game/Aids';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';
import { Maximize, Minimize, Home, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const Game = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [usedAidThisTurn, setUsedAidThisTurn] = useState(false);
  const [trickTriggerIndex] = useState(Math.floor(Math.random() * 8) + 4); // Entre pergunta 4 e 12

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
      navigate('/');
      return;
    }
    setPlayerName(name);
  }, [navigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const saveToRanking = useCallback((finalScore: number, status: 'finalizou' | 'eliminado', corrects: number, wrongs: number) => {
    const ranking: Player[] = JSON.parse(localStorage.getItem('ranking') || '[]');
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerName,
      score: finalScore,
      correctAnswers: corrects,
      wrongAnswers: wrongs,
      status,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    ranking.push(newPlayer);
    localStorage.setItem('ranking', JSON.stringify(ranking));
  }, [playerName]);

  const handleAnswer = (selectedIndex: number) => {
    const isTrick = state.showProfessorTrick;
    const currentQ = isTrick ? PROFESSOR_TRICK : QUESTIONS[state.currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.correctAnswer;

    if (isTrick) {
      if (isCorrect) {
        showSuccess("Ufa! Você conhece o professor. +5 pontos de bônus!");
        setState(prev => ({ 
          ...prev, 
          score: prev.score + 5, 
          showProfessorTrick: false, 
          professorTrickDone: true 
        }));
      } else {
        showError("ERROU O NOME DO PROFESSOR? ELIMINADO!");
        setState(prev => ({ ...prev, isGameOver: true, eliminatedReason: "Errou o nome do professor!" }));
        saveToRanking(state.score, 'eliminado', state.correctCount, state.wrongCount + 1);
      }
      return;
    }

    if (isCorrect) {
      let points = 0;
      if (currentQ.difficulty === 'fácil') points = 10;
      else if (currentQ.difficulty === 'médio') points = 20;
      else points = 40;

      if (currentQ.isBonus) points *= 2;

      showSuccess(`Correto! +${points} pontos`);
      
      const nextIndex = state.currentQuestionIndex + 1;
      const isWinner = nextIndex >= QUESTIONS.length;

      setState(prev => ({
        ...prev,
        score: prev.score + points,
        correctCount: prev.correctCount + 1,
        currentQuestionIndex: nextIndex,
        isWinner,
        isGameOver: isWinner,
        showProfessorTrick: !prev.professorTrickDone && nextIndex === trickTriggerIndex
      }));

      if (isWinner) {
        saveToRanking(state.score + points, 'finalizou', state.correctCount + 1, state.wrongCount);
      }
    } else {
      // Lógica de Erro
      const qNum = state.currentQuestionIndex + 1;
      
      // Eliminação precoce (Q1 ou Q2)
      if (qNum <= 2) {
        showError("Eliminado! Você errou nas primeiras perguntas.");
        setState(prev => ({ ...prev, isGameOver: true, eliminatedReason: "Errou nas primeiras perguntas" }));
        saveToRanking(state.score, 'eliminado', state.correctCount, state.wrongCount + 1);
        return;
      }

      // Pergunta da Maldade (Q6)
      if (currentQ.isMaldade) {
        const penalty = 30;
        const newScore = Math.max(0, state.score - penalty);
        
        if (state.score <= 30) {
          showError("💀 ELIMINADO! Sua pontuação era muito baixa para a Maldade.");
          setState(prev => ({ ...prev, score: 0, isGameOver: true, eliminatedReason: "Vítima da Pergunta da Maldade" }));
          saveToRanking(0, 'eliminado', state.correctCount, state.wrongCount + 1);
        } else {
          showError(`Maldade! Perdeu ${penalty} pontos.`);
          setState(prev => ({
            ...prev,
            score: newScore,
            wrongCount: prev.wrongCount + 1,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            showProfessorTrick: !prev.professorTrickDone && (prev.currentQuestionIndex + 1) === trickTriggerIndex
          }));
        }
        return;
      }

      // Penalidade normal
      let penalty = 5;
      if (currentQ.difficulty === 'médio') penalty = 10;
      if (currentQ.difficulty === 'difícil') penalty = 20;

      // Penalidade extra por ajuda
      if (usedAidThisTurn) {
        penalty += 10;
        toast.error("Você usou ajuda e errou! Penalidade aumentada (+10 pts).");
      }

      showError(`Errado! Perdeu ${penalty} pontos.`);
      const newScore = Math.max(0, state.score - penalty);

      setState(prev => ({
        ...prev,
        score: newScore,
        wrongCount: prev.wrongCount + 1,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showProfessorTrick: !prev.professorTrickDone && (prev.currentQuestionIndex + 1) === trickTriggerIndex
      }));
    }

    setDisabledOptions([]);
    setUsedAidThisTurn(false);
  };

  const useAid = (type: 'fiftyFifty' | 'audience' | 'phone') => {
    if (state.aidsUsed[type]) return;
    
    const currentQ = QUESTIONS[state.currentQuestionIndex];
    setUsedAidThisTurn(true);

    if (type === 'fiftyFifty') {
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== currentQ.correctAnswer);
      const toRemove = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
      setDisabledOptions(toRemove);
      toast.info("50/50: Duas alternativas erradas removidas!");
    } else if (type === 'audience') {
      const correctChance = Math.floor(Math.random() * 30) + 60; // 60-90%
      toast.info(`Plateia diz: ${correctChance}% de chance de ser a alternativa ${['A', 'B', 'C', 'D'][currentQ.correctAnswer]}`);
    } else if (type === 'phone') {
      toast.info(`Especialista diz: "Tenho quase certeza que a resposta correta é a ${['A', 'B', 'C', 'D'][currentQ.correctAnswer]}!"`);
    }

    setState(prev => ({
      ...prev,
      aidsUsed: { ...prev.aidsUsed, [type]: true }
    }));
  };

  if (state.isGameOver) {
    const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border-4 border-blue-600 p-8 rounded-2xl shadow-2xl animate-in zoom-in duration-500">
          <h2 className={cn(
            "text-5xl font-black mb-4 uppercase italic",
            state.isWinner ? "text-yellow-500" : "text-red-600"
          )}>
            {state.isWinner ? "CAMPEÃO!" : "FIM DE JOGO"}
          </h2>
          
          <div className="space-y-4 mb-8">
            <p className="text-blue-300 font-bold text-xl">{playerName}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-3 rounded-lg border border-blue-900">
                <p className="text-[10px] text-blue-400 uppercase font-bold">Pontuação</p>
                <p className="text-2xl font-black text-yellow-400">{state.score}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-blue-900">
                <p className="text-[10px] text-blue-400 uppercase font-bold">Acertos</p>
                <p className="text-2xl font-black text-green-500">{state.correctCount}</p>
              </div>
            </div>
            {!state.isWinner && (
              <p className="text-red-400 text-sm font-bold italic">Motivo: {state.eliminatedReason || "Erros acumulados"}</p>
            )}
          </div>

          <p className="text-white italic mb-8 text-lg">"{phrase}"</p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-500 h-14 text-xl font-black">
              <RotateCcw className="mr-2" /> TENTAR NOVAMENTE
            </Button>
            <Button variant="outline" onClick={() => navigate('/ranking')} className="border-yellow-600 text-yellow-500 h-14 text-xl font-black">
              <Trophy className="mr-2" /> VER RANKING
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400">
              <Home className="mr-2" size={18} /> Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = state.showProfessorTrick ? PROFESSOR_TRICK : QUESTIONS[state.currentQuestionIndex];

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-slate-950 p-4 transition-colors duration-1000",
      currentQ.isMaldade ? "bg-red-950/30" : "bg-slate-950"
    )}>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-blue-400">
          <Home />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-blue-400">
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
      </div>

      <ScoreBoard 
        score={state.score} 
        current={state.currentQuestionIndex + 1} 
        total={QUESTIONS.length} 
        playerName={playerName} 
      />

      <div className="flex-1 flex flex-col justify-center items-center">
        <QuestionCard 
          question={currentQ} 
          onAnswer={handleAnswer} 
          disabledOptions={disabledOptions}
          isMaldade={currentQ.isMaldade}
          isBonus={currentQ.isBonus}
          isTrick={state.showProfessorTrick}
        />

        {!state.showProfessorTrick && (
          <Aids 
            used={state.aidsUsed} 
            onUse={useAid} 
            disabled={currentQ.isMaldade} 
          />
        )}
      </div>
    </div>
  );
};

export default Game;