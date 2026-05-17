"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Trophy, ShieldCheck } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 italic uppercase tracking-tighter mb-4">
          Show do Milhão
        </h1>
        <p className="text-blue-400 text-xl md:text-2xl font-bold tracking-[0.2em] uppercase mb-12">
          Psicologia em Saúde & Enfermagem
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
            <BookOpen className="mx-auto mb-4 text-blue-400" size={40} />
            <h3 className="text-white font-bold mb-2">Estude</h3>
            <p className="text-slate-400 text-sm">Acesse materiais exclusivos em PDF preparados pelos professores.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
            <Play className="mx-auto mb-4 text-green-400" size={40} />
            <h3 className="text-white font-bold mb-2">Jogue</h3>
            <p className="text-slate-400 text-sm">Crie salas, convide amigos e teste seus conhecimentos em tempo real.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
            <Trophy className="mx-auto mb-4 text-yellow-400" size={40} />
            <h3 className="text-white font-bold mb-2">Ranking</h3>
            <p className="text-slate-400 text-sm">Suba no placar da sala e mostre que você é o melhor da turma.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-blue-600 hover:bg-blue-500 text-white h-16 px-12 text-2xl font-black rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
          >
            COMEÇAR AGORA
          </Button>
        </div>
      </div>
      
      <div className="mt-12 text-slate-500 flex items-center gap-2">
        <ShieldCheck size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Ambiente Seguro & Educacional</span>
      </div>
    </div>
  );
};

export default Landing;