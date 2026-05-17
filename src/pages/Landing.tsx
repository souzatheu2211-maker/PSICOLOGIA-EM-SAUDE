"use client";

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Brain, HeartPulse, Sparkles, Coffee } from 'lucide-react';
import Footer from '@/components/Footer';

// Importando as imagens
import logoFsss from '@/assets/logo-fsss.png';
import logoEnf from '@/assets/logo-enf.png';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home');
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Logos Section with Animation */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <img 
            src={logoFsss} 
            alt="FSSS Logo" 
            className="h-20 md:h-24 object-contain drop-shadow-2xl animate-float" 
          />
          <div className="h-12 w-px bg-white/20"></div>
          <img 
            src={logoEnf} 
            alt="Enfermagem Logo" 
            className="h-20 md:h-24 object-contain drop-shadow-2xl animate-float [animation-delay:0.5s]" 
          />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-200 via-blue-400 to-blue-700 italic uppercase tracking-tighter mb-1 drop-shadow-2xl">
          Show do Milhão
        </h1>
        <p className="text-blue-300 text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
          <Sparkles className="text-yellow-400 animate-pulse" size={16} />
          Psicologia em Saúde
          <Sparkles className="text-yellow-400 animate-pulse" size={16} />
        </p>

        {/* Funny Catchy Phrase Section */}
        <div className="glass p-6 md:p-8 rounded-[2.5rem] max-w-xl mb-8 relative group hover:bg-white/15 transition-all">
          <div className="absolute -top-4 -right-4 bg-yellow-500 p-3 rounded-xl rotate-12 shadow-xl group-hover:rotate-0 transition-transform">
            <Coffee className="text-black" size={24} />
          </div>
          
          <h2 className="text-xl md:text-2xl font-black text-white italic leading-tight mb-2">
            "Psicologia na Enfermagem: Onde o <span className="text-blue-400">Id</span> quer dormir, o <span className="text-blue-400">Superego</span> quer estudar e o <span className="text-blue-400">Ego</span> só quer que o plantão acabe logo!"
          </h2>
          <p className="text-slate-400 text-xs font-medium">
            Prepare sua mente (e seu café), o desafio vai começar.
          </p>
        </div>

        <Button 
          onClick={() => navigate('/auth')} 
          className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-16 text-xl font-black rounded-full shadow-[0_0_40px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95 animate-bounce mb-4"
        >
          INICIAR JORNADA
        </Button>
        
        <Footer />
      </div>
    </div>
  );
};

export default Landing;