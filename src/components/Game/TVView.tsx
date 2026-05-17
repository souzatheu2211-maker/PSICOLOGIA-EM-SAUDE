"use client";

import React from 'react';
import { Question, Player } from '@/types/game';
import QuestionCard from './QuestionCard';
import RankingSidebar from './RankingSidebar';
import { Progress } from '@/components/ui/progress';
import { Timer as TimerIcon, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TVViewProps {
  question: Question;
  timeLeft: number;
  roomCode: string;
  players: Player[];
  showResult: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const TVView = ({ 
  question, 
  timeLeft, 
  roomCode, 
  players, 
  showResult, 
  currentQuestionIndex, 
  totalQuestions 
}: TVViewProps) => {
  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-8 relative overflow-y-auto custom-scrollbar">
        {/* TV Header */}
        <div className="flex justify-between items-center mb-8 glass-dark p-6 rounded-[2.5rem] border-2 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-4 rounded-2xl shadow-xl">
              <Users size={32} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Código da Sala</p>
              <p className="text-white font-black italic text-4xl tracking-tighter">{roomCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Pergunta</p>
              <p className="text-white font-black text-3xl italic">{currentQuestionIndex + 1} / {totalQuestions}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Tempo</p>
              <div className={cn(
                "flex items-center gap-3 font-black text-5xl italic transition-all duration-300",
                timeLeft <= 5 ? "text-red-500 scale-110 animate-pulse" : "text-white"
              )}>
                <TimerIcon size={36} />
                {timeLeft}s
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto w-full py-6">
          <div className="w-full mb-8">
            <Progress value={(timeLeft / 30) * 100} className={cn(
              "h-3 bg-slate-900 rounded-full border border-white/10",
              timeLeft <= 5 ? "bg-red-900" : "bg-blue-900"
            )} />
          </div>

          <QuestionCard 
            question={question}
            onAnswer={() => {}} // Host não responde
            selectedOption={null}
            showResult={showResult}
            isMaldade={question.isMaldade}
          />

          {showResult && (
            <div className="mt-8 w-full glass-dark p-8 rounded-[3rem] border-4 border-blue-500/30 animate-in slide-in-from-bottom duration-700 shadow-2xl">
              <div className="flex items-center gap-4 mb-4 text-blue-400">
                <div className="bg-blue-600/20 p-3 rounded-2xl">
                  <Info size={24} />
                </div>
                <span className="font-black uppercase text-lg tracking-widest italic">Explicação do Professor</span>
              </div>
              <p className="text-white text-xl md:text-2xl leading-relaxed italic font-medium">
                "{question.explanation}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TV Ranking Sidebar */}
      <div className="w-96 h-full border-l border-white/10">
        <RankingSidebar players={players} />
      </div>
    </div>
  );
};

export default TVView;