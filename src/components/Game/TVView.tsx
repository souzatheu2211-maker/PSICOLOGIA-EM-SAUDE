"use client";

import React from 'react';
import { Question, Player } from '@/types/game';
import QuestionCard from './QuestionCard';
import RankingSidebar from './RankingSidebar';
import { Progress } from '@/components/ui/progress';
import { Timer as TimerIcon, Users, Info, Trophy, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TVViewProps {
  question: Question;
  timeLeft: number;
  roomCode: string;
  players: Player[];
  showResult: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  roomStatus: 'waiting' | 'playing' | 'finished';
}

const TVView = ({ 
  question, 
  timeLeft, 
  roomCode, 
  players, 
  showResult, 
  currentQuestionIndex, 
  totalQuestions,
  roomStatus
}: TVViewProps) => {
  
  if (roomStatus === 'finished') {
    const winners = [...players].sort((a, b) => b.score - a.score).slice(0, 3);
    
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl text-center">
          <Trophy className="text-yellow-500 mx-auto mb-6 animate-bounce" size={120} />
          <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter mb-2">Fim de Jogo!</h1>
          <p className="text-blue-400 font-bold text-2xl uppercase tracking-[0.5em] mb-16">Hall da Fama - Psicologia em Saúde</p>

          <div className="grid grid-cols-3 gap-8 items-end">
            {/* 2nd Place */}
            {winners[1] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom duration-700 delay-300">
                <div className="w-32 h-32 rounded-full border-4 border-slate-400 overflow-hidden mb-4 shadow-2xl">
                  <img src={winners[1].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winners[1].name}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-800/80 border-2 border-slate-400 p-6 rounded-t-[2rem] w-full">
                  <p className="text-slate-300 font-black text-xl truncate">{winners[1].name}</p>
                  <p className="text-slate-400 font-bold text-3xl">{winners[1].score} <span className="text-sm">PTS</span></p>
                </div>
                <div className="bg-slate-400 w-full h-24 flex items-center justify-center rounded-b-xl">
                  <span className="text-slate-900 font-black text-4xl italic">2º</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {winners[0] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom duration-1000">
                <Crown className="text-yellow-500 mb-2 animate-pulse" size={64} />
                <div className="w-48 h-48 rounded-full border-8 border-yellow-500 overflow-hidden mb-4 shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                  <img src={winners[0].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winners[0].name}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-900/90 border-4 border-yellow-500 p-8 rounded-t-[3rem] w-full">
                  <p className="text-white font-black text-3xl truncate">{winners[0].name}</p>
                  <p className="text-yellow-500 font-black text-5xl">{winners[0].score} <span className="text-xl">PTS</span></p>
                </div>
                <div className="bg-yellow-500 w-full h-40 flex items-center justify-center rounded-b-xl shadow-2xl">
                  <span className="text-slate-950 font-black text-7xl italic">1º</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {winners[2] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom duration-700 delay-500">
                <div className="w-28 h-28 rounded-full border-4 border-amber-700 overflow-hidden mb-4 shadow-2xl">
                  <img src={winners[2].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winners[2].name}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-800/80 border-2 border-amber-700 p-6 rounded-t-[2rem] w-full">
                  <p className="text-amber-600 font-black text-xl truncate">{winners[2].name}</p>
                  <p className="text-amber-700 font-bold text-3xl">{winners[2].score} <span className="text-sm">PTS</span></p>
                </div>
                <div className="bg-amber-700 w-full h-16 flex items-center justify-center rounded-b-xl">
                  <span className="text-amber-100 font-black text-3xl italic">3º</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-white font-black text-3xl italic">{currentQuestionIndex} / {totalQuestions}</p>
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
                  <Star size={24} className="animate-spin-slow" />
                </div>
                <span className="font-black uppercase text-lg tracking-widest italic">Explicação do grupo</span>
              </div>
              <p className="text-white text-xl md:text-3xl leading-relaxed italic font-medium">
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