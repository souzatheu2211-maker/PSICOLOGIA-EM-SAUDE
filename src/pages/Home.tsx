"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

// Importando as imagens
import logoFsss from '@/assets/logo-fsss.png';
import logoEnf from '@/assets/logo-enf.png';

const Home = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      } else {
        navigate('/auth');
      }
    };
    fetchProfile();
  }, [navigate]);

  const funnyPhrases = [
    `A psicologia precisa de você, ${profile?.name?.split(' ')[0]}! Não deixe o Id ganhar hoje! 🧠`,
    `Ei ${profile?.name?.split(' ')[0]}, seu Superego mandou avisar que hoje é dia de gabaritar! 🎓`,
    `O plantão tá longe, mas o Show do Milhão tá perto. Vamos nessa, ${profile?.name?.split(' ')[0]}! ☕`,
    `${profile?.name?.split(' ')[0]}, Freud explicaria sua vontade de jogar agora... e ele aprova! 🔥`
  ];

  const randomPhrase = funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];

  return (
    <div className="min-h-screen flex flex-col items-center p-6 pb-32 relative">
      <div className="w-full max-w-4xl flex flex-col items-center gap-12 animate-in fade-in duration-1000">
        
        {/* Large Profile Section */}
        <div className="flex flex-col items-center gap-6 mt-10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
            <Avatar className="w-48 h-48 border-8 border-blue-600/30 shadow-2xl relative z-10">
              <AvatarImage src={profile?.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-blue-900 text-5xl font-black text-white">
                {profile?.name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-xs mb-2">Status: Acadêmico Ativo</p>
            <h2 className="text-4xl font-black text-white italic tracking-tighter">{profile?.name}</h2>
          </div>
        </div>

        {/* Funny Message Card */}
        <Card className="w-full glass-dark border-blue-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.1)]">
          <CardContent className="p-12 text-center">
            <div className="inline-flex p-5 bg-blue-600/20 rounded-3xl mb-8">
              <Sparkles className="text-blue-400 animate-pulse" size={40} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white italic mb-6 leading-tight">
              {profile ? randomPhrase : "Carregando sua energia psíquica..."}
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
              "Onde o <span className="text-blue-400">Id</span> quer prazer imediato, o <span className="text-blue-400">Ego</span> escolhe estudar para o Show do Milhão!"
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <img src={logoFsss} alt="FSSS" className="h-16 object-contain" />
          <img src={logoEnf} alt="ENF" className="h-16 object-contain" />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;