"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Trophy, Brain, HeartPulse, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

const Landing = () => {
  const navigate = useNavigate();

  const phrases = [
    "Onde a mente encontra o cuidado.",
    "Desvendando os mistérios da psique na enfermagem.",
    "Conhecimento que transforma o cuidar.",
    "A ciência da alma a serviço da vida."
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-6 text-center overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 animate-pulse"><Brain size={100} /></div>
        <div className="absolute bottom-20 right-20 animate-bounce duration-1000"><HeartPulse size={80} /></div>
      </div>
      
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center pt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Logos Section */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <img src="/src/assets/logo-fsss.png" alt="FSSS Logo" className="h-16 md:h-20 object-contain drop-shadow-lg" />
          <div className="h-12 w-px bg-white/20"></div>
          <img src="/src/assets/logo-enf.png" alt="Enfermagem Logo" className="h-16 md:h-20 object-contain drop-shadow-lg" />
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-200 via-blue-400 to-blue-700 italic uppercase tracking-tighter mb-2 drop-shadow-2xl">
          Show do Milhão
        </h1>
        <p className="text-blue-300 text-lg md:text-xl font-bold tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
          <Sparkles className="text-yellow-400 animate-pulse" size={20} />
          Psicologia em Saúde
          <Sparkles className="text-yellow-400 animate-pulse" size={20} />
        </p>

        {/* Catchy Phrases Carousel-like display */}
        <div className="h-8 mb-12 overflow-hidden">
          <div className="animate-vertical-scroll">
            {phrases.map((phrase, i) => (
              <p key={i} className="text-slate-400 italic text-sm h-8 flex items-center justify-center">
                "{phrase}"
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
          <div className="glass p-6 rounded-3xl hover:bg-white/15 transition-all group">
            <BookOpen className="mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-white font-bold text-sm mb-2">Estude</h3>
            <p className="text-slate-400 text-[11px]">Materiais exclusivos preparados para sua jornada acadêmica.</p>
          </div>
          <div className="glass p-6 rounded-3xl hover:bg-white/15 transition-all group">
            <Play className="mx-auto mb-4 text-green-400 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-white font-bold text-sm mb-2">Jogue</h3>
            <p className="text-slate-400 text-[11px]">Desafie seus colegas em uma competição de conhecimento real.</p>
          </div>
          <div className="glass p-6 rounded-3xl hover:bg-white/15 transition-all group">
            <Trophy className="mx-auto mb-4 text-yellow-400 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-white font-bold text-sm mb-2">Ranking</h3>
            <p className="text-slate-400 text-[11px]">Destaque-se entre os melhores da turma e conquiste o topo.</p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/auth')} 
          className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-16 text-xl font-black rounded-full shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95"
        >
          COMEÇAR JORNADA
        </Button>
      </div>
      
      <Footer />

      <style>{`
        @keyframes vertical-scroll {
          0%, 20% { transform: translateY(0); }
          25%, 45% { transform: translateY(-2rem); }
          50%, 70% { transform: translateY(-4rem); }
          75%, 95% { transform: translateY(-6rem); }
          100% { transform: translateY(0); }
        }
        .animate-vertical-scroll {
          animation: vertical-scroll 12s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Landing;