"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Plus, LogIn, ArrowLeft, Sparkles } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import Footer from '@/components/Footer';

const Lobby = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return navigate('/auth');

    const { data, error } = await supabase.from('rooms').insert({
      code: newCode,
      host_id: user.id,
      status: 'waiting'
    }).select().single();

    if (error) showError(error.message);
    else {
      showSuccess(`Sala criada! Código: ${newCode}`);
      navigate(`/game?room=${newCode}&host=true`);
    }
    setLoading(false);
  };

  const joinRoom = async () => {
    if (!code) return;
    setLoading(true);
    const { data, error } = await supabase.from('rooms').select('*').eq('code', code.toUpperCase()).single();
    
    if (error || !data) {
      showError("Sala não encontrada! Verifique o código.");
    } else {
      navigate(`/game?room=${data.code}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in duration-700">
        <div className="w-full flex justify-start">
          <Button variant="ghost" onClick={() => navigate('/home')} className="text-blue-400 hover:text-blue-300">
            <ArrowLeft className="mr-2" size={18} /> Voltar
          </Button>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600/20 rounded-2xl mb-4">
            <Sparkles className="text-blue-400 animate-pulse" size={32} />
          </div>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">Área de Jogo</h1>
          <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">Crie uma sala ou entre em uma existente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-dark border-blue-600/30 rounded-[2.5rem] overflow-hidden group hover:border-blue-500 transition-all">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="text-green-500" size={32} />
              </div>
              <CardTitle className="text-white text-2xl font-black italic uppercase">Criar Sala</CardTitle>
            </CardHeader>
            <CardContent className="pb-10 px-8">
              <p className="text-slate-400 text-sm mb-8 text-center">Você será o host e poderá iniciar o jogo para todos os seus colegas.</p>
              <Button 
                onClick={createRoom} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 h-14 font-black rounded-2xl shadow-lg shadow-green-900/20 transition-all active:scale-95"
              >
                CRIAR NOVA SALA
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-dark border-blue-600/30 rounded-[2.5rem] overflow-hidden group hover:border-blue-500 transition-all">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LogIn className="text-blue-500" size={32} />
              </div>
              <CardTitle className="text-white text-2xl font-black italic uppercase">Entrar na Sala</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-10 px-8">
              <div className="space-y-2">
                <Input 
                  placeholder="CÓDIGO" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-white text-center font-black text-2xl h-14 rounded-2xl focus:ring-blue-500/50"
                />
              </div>
              <Button 
                onClick={joinRoom}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 h-14 font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                ENTRAR AGORA
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <div className="flex items-center gap-8">
            <img src="/src/assets/logo-fsss.png" alt="FSSS" className="h-16 object-contain opacity-70" />
            <img src="/src/assets/logo-enf.png" alt="ENF" className="h-16 object-contain opacity-70" />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Lobby;