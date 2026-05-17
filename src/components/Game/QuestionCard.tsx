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
      "w-full p-8 md:p-12 rounded-[3.5rem] shadow-2xl transition-all duration-700 border-4 backdrop-blur-2xl relative overflow-hidden",
      isMaldade ? "bg-red-950/40 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]" : 
      "bg-slate-900/60 border-blue-500/50 shadow-[0_0_80px_rgba(37,99,235,0.15)]"
    )}>
      {/* Efeito de brilho de fundo */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {isMaldade && (
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <h2 className="text-4xl font-black text-red-500 uppercase tracking-tighter animate-pulse italic drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            RODADA DA MALDADE
          </h2>
          <p className="text-red-300/70 text-[10px] font-bold tracking-[0.4em] mt-1">SEM AJUDAS • ERRO = ELIMINAÇÃO</p>
        </div>
      )}
      
      <div className="mb-12 text-center relative z-10">
        <h3 className="text-2xl md:text-4xl font-black text-white leading-tight italic tracking-tight drop-shadow-lg">
          {question.text}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctAnswer;
          const isSelected = index === selectedOption;
          const isHidden = hiddenOptions.includes(index);
          const prob = probabilities[index];

          if (isHidden && !showResult) {
            return <div key={index} className="h-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10" />;
          }

          return (
            <div key={index} className="relative group">
              <Button
                onClick={() => onAnswer(index)}
                disabled={showResult}
                className={cn(
                  "w-full h-auto py-6 md:py-8 px-8 md:px-10 text-left justify-start text-base md:text-xl font-bold border-4 transition-all duration-500 whitespace-normal rounded-[2.5rem] relative overflow-hidden group",
                  // Estado Normal
                  !showResult && !isSelected && "bg-white/5 hover:bg-white/10 border-white/10 hover:border-blue-400/50 text-slate-300",
                  // Selecionado (antes do resultado)
                  !showResult && isSelected && "bg-blue-600 border-white scale-[1.02] shadow-[0_0_30px_rgba(37,99,235,0.4)] text-white",
                  // Resultado: Correto
                  showResult && isCorrect && "bg-emerald-600 border-emerald-400 scale-[1.05] shadow-[0_0_40px_rgba(16,185,129,0.6)] text-white z-20",
                  // Resultado: Errado Selecionado
                  showResult && isSelected && !isCorrect && "bg-red-600 border-red-400 animate-shake shadow-[0_0_40px_rgba(239,68,68,0.6)] text-white z-20",
                  // Resultado: Outras opções
                  showResult && !isCorrect && !isSelected && "opacity-30 grayscale scale-95"
                )}
              >
                <div className={cn(
                  "mr-4 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-colors",
                  isSelected ? "bg-white text-blue-600" : "bg-white/10 text-yellow-500"
                )}>
                  {letters[index]}
                </div>
                <span className="flex-1 leading-snug">{option}</span>
              </Button>
              
              {prob !== undefined && prob > 0 && !showResult && (
                <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl animate-bounce z-30 border-2 border-white">
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