"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Question } from '@/types/game';
import { Button } from '@/components/ui/button';

interface QuestionCardProps {
  question: Question;
  onAnswer: (index: number) => void;
  selectedOption: number | null;
  showResult: boolean;
  probabilities?: number[];
  isMaldade?: boolean;
  hiddenOptions?: number[];
}

const QuestionCard = ({ 
  question, 
  onAnswer, 
  selectedOption,
  showResult,
  probabilities = [],
  isMaldade,
  hiddenOptions = []
}: QuestionCardProps) => {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn(
      "w-full p-6 md:p-10 rounded-[3rem] shadow-2xl transition-all duration-700 border-4 backdrop-blur-xl relative overflow-hidden",
      isMaldade ? "bg-red-950/60 border-red-600 animate-pulse" : 
      "bg-slate-900/80 border-blue-600 shadow-blue-500/20"
    )}>
      {isMaldade && (
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter animate-bounce italic">
            😈 RODADA DA MALDADE 😈
          </h2>
          <p className="text-red-200 text-[10px] font-bold tracking-widest">SEM AJUDAS! ERRO = ELIMINAÇÃO DIRETA</p>
        </div>
      )}
      
      <div className="mb-8 text-center">
        <h3 className="text-xl md:text-2xl font-black text-white leading-tight italic">
          {question.text}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctAnswer;
          const isSelected = index === selectedOption;
          const isHidden = hiddenOptions.includes(index);
          const prob = probabilities[index];

          if (isHidden && !showResult) {
            return <div key={index} className="h-16 md:h-20 bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-800" />;
          }

          return (
            <div key={index} className="relative group">
              <Button
                onClick={() => onAnswer(index)}
                disabled={showResult}
                className={cn(
                  "w-full h-auto py-4 md:py-6 px-6 md:px-8 text-left justify-start text-sm md:text-lg font-bold border-4 transition-all duration-300 whitespace-normal rounded-[2rem] relative overflow-hidden",
                  !showResult && isSelected && "bg-blue-600 border-white scale-105 shadow-2xl z-10",
                  showResult && isCorrect && "bg-green-600 border-green-400 scale-105 shadow-[0_0_30px_rgba(34,197,94,0.6)] z-10",
                  showResult && isSelected && !isCorrect && "bg-red-600 border-red-400 animate-shake z-10",
                  !isSelected && showResult && "opacity-40 grayscale",
                  !showResult && !isSelected && "bg-slate-800/50 hover:bg-slate-700 border-blue-900/50 hover:border-blue-400"
                )}
              >
                <span className="mr-3 text-yellow-400 font-black text-xl">{letters[index]})</span>
                <span className="flex-1">{option}</span>
              </Button>
              
              {prob !== undefined && prob > 0 && !showResult && (
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce z-20 border-2 border-white">
                  {prob}% CHANCE
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;