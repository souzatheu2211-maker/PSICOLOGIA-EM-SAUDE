"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Plus, LogIn, Sparkles, Sword, BrainCircuit } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import Footer from '@/components/Footer';

const Lobby = () => {
  const [profile, setProfile] = useState<any>(null);
  const [code, setCode] = useState('');
  const [warName, setWarName] = useState('');
  const [showWarNameInput, setShowWarNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const createRoom = async () => {
    if (!profile?.is_admin) return;

    setLoading(true);
    try {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newCode = `PSI${randomNum}`;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('rooms').insert({
        code: newCode,
        host_id: user?.id,
        status: 'waiting'
      });

      if (error) throw error;

      localStorage.setItem('currentPlayer', profile.name || 'Professor');
      showSuccess(`Sala criada! Código: ${newCode}`);
      navigate(`/game?room=${newCode}&host=true`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!code.startsWith('PSI')) {
      showError("O código deve começar com PSI!");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('rooms').select('*').eq('code', code.toUpperCase()).single();
      
      if (error || !data) {
        throw new Error("Sala não encontrada! Verifique o código.");
      }

      if (data.status !== 'waiting') {
        throw new Error("A partida já começou ou foi finalizada! Ninguém mais pode entrar.");
      }

      const finalName = warName.trim() || profile?.name || 'Anônimo';
      localStorage.setItem('currentPlayer', finalName);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          current_room_id: data.code,
          current_score: 0,
          is_eliminated: false
        }).eq('id', user.id);
      }

      navigate(`/game?room=${data.code}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-4xl space-y-12 relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="text-center">
          <div className="inline-flex p-4 bg-blue-600/20 rounded-3xl mb-6">
            <BrainCircuit className="text-blue-400 animate-pulse" size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4">
            Arena PSI
          </h1>
          <p className="text-blue-300 font-bold italic text-sm tracking-widest uppercase">
            "Onde o conhecimento encontra a estratégia"
          </p>
        </div>

        <div className={profile?.is_admin ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "max-w-md mx-auto w-full"}>
          {profile?.is_admin && (
            <Card className="glass-dark border-blue-500/20 rounded-[3rem] overflow-hidden group hover:border-blue-500/50 transition-all">
              <CardHeader className="text-center pt-10">
                <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="text-green-400" size={32} />
                </div>
                <CardTitle className="text-white text-2xl font-black italic uppercase">Modo Professor</CardTitle>
              </CardHeader>
              <CardContent className="pb-12 px-10">
                <Button 
                  onClick={createRoom} 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 h-14 font-black rounded-2xl shadow-xl shadow-green-900/20 transition-all active:scale-95"
                >
                  CRIAR SALA PSI
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="glass-dark border-purple-500/20 rounded-[3rem] overflow-hidden group hover:border-purple-500/50 transition-all">
            <CardHeader className="text-center pt-10">
              <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LogIn className="text-purple-400" size={32} />
              </div>
              <CardTitle className="text-white text-2xl font-black italic uppercase">Entrar no Jogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-12 px-10">
              {!showWarNameInput ? (
                <>
                  <Input 
                    placeholder="PSI0000" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="bg-white/5 border-white/10 text-white text-center font-black text-2xl h-14 rounded-2xl focus:ring-purple-500/50"
                  />
                  <Button 
                    onClick={() => code ? setShowWarNameInput(true) : showError("Digite o código!")}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 h-14 font-black rounded-2xl shadow-xl shadow-purple-900/20 transition-all active:scale-95"
                  >
                    PRÓXIMO
                  </Button>
                </>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right duration-500">
                  <Input 
                    placeholder="Seu Nome de Guerra" 
                    value={warName}
                    onChange={(e) => setWarName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-2xl focus:ring-purple-500/50"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setShowWarNameInput(false)} className="flex-1 text-slate-400">Voltar</Button>
                    <Button onClick={joinRoom} disabled={loading} className="flex-[2] bg-purple-600 hover:bg-purple-500 h-12 font-black rounded-2xl">CONFIRMAR</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Lobby;