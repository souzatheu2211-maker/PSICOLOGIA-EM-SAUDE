"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogIn, BrainCircuit } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import Footer from '@/components/Footer';

const Lobby = () => {
  const [profile, setProfile] = useState<any>(null);
  const [code, setCode] = useState('');
  const [warName, setWarName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
        if (data?.name) setWarName(data.name);
      }
    };
    fetchProfile();
  }, []);

  const createRoom = async () => {
    if (!profile?.is_admin) return;

    setLoading(true);
    try {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const newCode = `PSI${randomNum}`;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: roomError } = await supabase.from('rooms').insert({
        code: newCode,
        host_id: user?.id,
        status: 'waiting',
        current_question_index: 0
      });

      if (roomError) throw roomError;

      if (user) {
        await supabase.from('profiles').update({ 
          current_room_id: newCode,
          current_score: 0,
          is_eliminated: false,
          name: warName || profile.name || 'Professor'
        }).eq('id', user.id);
      }

      localStorage.setItem('currentPlayer', warName || profile.name || 'Professor');
      showSuccess(`Sala criada! Código: ${newCode}`);
      navigate(`/game?room=${newCode}&host=true`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!code.trim() || !warName.trim()) {
      showError("Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      const { data: room, error } = await supabase.from('rooms').select('*').eq('code', code.toUpperCase()).single();
      
      if (error || !room) throw new Error("Sala não encontrada!");
      if (room.status !== 'waiting') throw new Error("A partida já começou!");

      // Verificar limite de 50 jogadores
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('current_room_id', room.code);

      if (count && count >= 50) {
        throw new Error("Sala cheia (máximo 50 participantes).");
      }

      localStorage.setItem('currentPlayer', warName.trim());
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          current_room_id: room.code,
          current_score: 0,
          is_eliminated: false,
          name: warName.trim()
        }).eq('id', user.id);
      }

      navigate(`/game?room=${room.code}`);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-32 relative overflow-hidden">
      <div className="w-full max-w-4xl space-y-12 relative z-10">
        <div className="text-center">
          <div className="inline-flex p-4 bg-blue-600/20 rounded-3xl mb-6">
            <BrainCircuit className="text-blue-400 animate-pulse" size={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4">Arena PSI</h1>
        </div>

        <div className={profile?.is_admin ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "max-w-md mx-auto w-full"}>
          {profile?.is_admin && (
            <Card className="glass-dark border-blue-500/20 rounded-[3rem] overflow-hidden">
              <CardHeader className="text-center pt-10">
                <Plus className="text-green-400 mx-auto mb-4" size={48} />
                <CardTitle className="text-white text-2xl font-black italic uppercase">Criar Sala</CardTitle>
              </CardHeader>
              <CardContent className="pb-12 px-10">
                <Button onClick={createRoom} disabled={loading} className="w-full bg-green-600 h-14 font-black rounded-2xl">CRIAR</Button>
              </CardContent>
            </Card>
          )}

          <Card className="glass-dark border-purple-500/20 rounded-[3rem] overflow-hidden">
            <CardHeader className="text-center pt-10">
              <LogIn className="text-purple-400 mx-auto mb-4" size={48} />
              <CardTitle className="text-white text-2xl font-black italic uppercase">Entrar no Jogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-12 px-10">
              <Input placeholder="Código (ex: PSI123456)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="bg-white/5 border-white/10 text-white text-center font-black h-12 rounded-2xl" />
              <Input placeholder="Nome de Guerra" value={warName} onChange={(e) => setWarName(e.target.value)} className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-2xl" />
              <Button onClick={joinRoom} disabled={loading} className="w-full bg-purple-600 h-14 font-black rounded-2xl mt-2">ENTRAR</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Lobby;