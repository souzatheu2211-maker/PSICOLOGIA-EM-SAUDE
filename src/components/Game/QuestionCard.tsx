"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Question } from '@/types/game';
import { Button } from '@/components/ui/button';

interface QuestionCardProps {
  question: Question;
  onAnswer: (index: number) => void;
  disabledOptions?: number[];
  isMaldade?: boolean;
  isBonus?: boolean;
  isTrick?: boolean;
}

const QuestionCard = ({ 
  question, 
  onAnswer, 
  disabledOptions = [], 
  isMaldade, 
  isBonus,
  isTrick 
}: QuestionCardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setSelected(null);
    setShowResult(false);
  }, [question]);

  const handleSelect = (index: number) => {
    if (selected !== null || disabledOptions.includes(index)) return;
    setSelected(index);
    setShowResult(true);
    setTimeout(() => {
      onAnswer(index);
    }, 1500);
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn(
      "w-full max-w-3xl mx-auto p-6 rounded-2xl shadow-2xl transition-all duration-500",
      isMaldade ? "bg-red-950 border-4 border-red-600 animate-pulse" : 
      isBonus ? "bg-yellow-900/20 border-4 border-yellow-500" :
      isTrick ? "bg-purple-950 border-4 border-purple-500" :
      "bg-slate-900 border-4 border-blue-600"
    )}>
      {isMaldade && (
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter animate-bounce">
            😈 RODADA DA MALDADE 😈
          </h2>
          <p className="text-red-200 text-sm font-bold">SEM AJUDAS! ERRO = -30 PTS + RISCO DE ELIMINAÇÃO</p>
        </div>
      )}
      
      {isBonus && (
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black text-yellow-500 uppercase tracking-tighter">
            ⭐ RODADA BÔNUS ⭐
          </h2>
          <p className="text-yellow-200 text-sm font-bold">PONTUAÇÃO DOBRADA!</p>
        </div>
      )}

      {isTrick && (
        <div className="text-center mb-4">
          <h2 className="text-3xl font-black text-purple-500 uppercase tracking-tighter">
            💀 PEGADINHA DO PROFESSOR 💀
          </h2>
          <p className="text-purple-200 text-sm font-bold">ERROU = ELIMINADO NA HORA!</p>
        </div>
      )}

      <div className="mb-8 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.text}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctAnswer;
          const isSelected = index === selected;
          const isDisabled = disabledOptions.includes(index);

          return (
            <Button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isDisabled || (selected !== null && !isSelected)}
              className={cn(
                "h-auto py-4 px-6 text-left justify-start text-lg font-semibold border-2 transition-all duration-300 whitespace-normal",
                isDisabled ? "opacity-20 grayscale cursor-not-allowed" : "opacity-100",
                !showResult && isSelected && "bg-blue-500 border-white scale-105",
                showResult && isCorrect && "bg-green-600 border-green-400 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.6)]",
                showResult && isSelected && !isCorrect && "bg-red-600 border-red-400 animate-shake",
                !isSelected && !isCorrect && showResult && "opacity-50",
                !showResult && !isSelected && "bg-slate-800 hover:bg-slate-700 border-blue-900"
              )}
            >
              <span className="mr-3 text-yellow-400 font-black">{letters[index]})</span>
              {option}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;