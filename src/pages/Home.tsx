"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Play, BookOpen, User, Trophy, LogOut, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8 animate-in fade-in duration-700">
        {/* Header with User Info */}
        <div className="w-full flex justify-between items-center glass p-4 rounded-3xl">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-blue-500">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-blue-900 text-white font-bold">
                {profile?.name?.substring(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Bem-vindo, Acadêmico</p>
              <h2 className="text-lg font-black text-white italic">{profile?.name || 'Carregando...'}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut size={20} />
          </Button>
        </div>

        {/* Funny Message Card */}
        <Card className="w-full glass-dark border-blue-500/30 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 text-center">
            <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-6">
              <Sparkles className="text-blue-400 animate-pulse" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white italic mb-4 leading-tight">
              "Seu <span className="text-blue-400">Inconsciente</span> já sabe todas as respostas, agora só falta convencer o seu <span className="text-blue-400">Consciente</span> a não entrar em pânico!"
            </h1>
            <p className="text-slate-400 font-medium">
              Escolha seu caminho e mostre que você domina a arte de cuidar da mente.
            </p>
          </CardContent>
        </Card>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Button 
            onClick={() => navigate('/lobby')}
            className="h-32 glass hover:bg-blue-600/20 border-blue-500/50 rounded-[2rem] flex flex-col gap-2 group transition-all"
          >
            <Play className="text-blue-400 group-hover:scale-125 transition-transform" size={32} />
            <span className="text-xl font-black italic uppercase">Jogar Agora</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/study')}
            className="h-32 glass hover:bg-green-600/20 border-green-500/50 rounded-[2rem] flex flex-col gap-2 group transition-all"
          >
            <BookOpen className="text-green-400 group-hover:scale-125 transition-transform" size={32} />
            <span className="text-xl font-black italic uppercase">Materiais de Estudo</span>
          </Button>

          <Button 
            onClick={() => navigate('/ranking')}
            className="h-32 glass hover:bg-yellow-600/20 border-yellow-500/50 rounded-[2rem] flex flex-col gap-2 group transition-all"
          >
            <Trophy className="text-yellow-400 group-hover:scale-125 transition-transform" size={32} />
            <span className="text-xl font-black italic uppercase">Ranking Geral</span>
          </Button>

          <Button 
            onClick={() => navigate('/profile')}
            className="h-32 glass hover:bg-purple-600/20 border-purple-500/50 rounded-[2rem] flex flex-col gap-2 group transition-all"
          >
            <User className="text-purple-400 group-hover:scale-125 transition-transform" size={32} />
            <span className="text-xl font-black italic uppercase">Meu Perfil</span>
          </Button>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <img src="/src/assets/logo-fsss.png" alt="FSSS" className="h-12 object-contain opacity-50" />
          <img src="/src/assets/logo-enf.png" alt="ENF" className="h-12 object-contain opacity-50" />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;