"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ScoreBoardProps {
  score: number;
  current: number;
  total: number;
  playerName: string;
}

const ScoreBoard = ({ score, current, total, playerName }: ScoreBoardProps) => {
  const progress = (current / total) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 bg-slate-900/80 p-4 rounded-xl border border-blue-500/30 backdrop-blur-sm">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-blue-400 text-xs font-bold uppercase">Jogador</p>
          <p className="text-white font-bold text-lg">{playerName}</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-500 text-xs font-bold uppercase">Pontuação</p>
          <p className="text-yellow-400 font-black text-2xl">{score} <span className="text-sm">pts</span></p>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-blue-300 uppercase">
          <span>Progresso</span>
          <span>Pergunta {current} de {total}</span>
        </div>
        <Progress value={progress} className="h-3 bg-slate-800 border border-blue-900" />
      </div>
    </div>
  );
};

export default ScoreBoard;