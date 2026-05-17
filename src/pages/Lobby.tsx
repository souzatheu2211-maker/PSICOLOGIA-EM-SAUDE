"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Play, Plus, LogIn, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Lobby = () => {
  const [code, setCode] = useState('');
  const [showRules, setShowRules] = useState(false);
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
      showError("Sala não encontrada!");
    } else {
      navigate(`/game?room=${data.code}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">Área de Jogo</h1>
          <p className="text-blue-400 font-bold">Crie uma sala ou entre em uma existente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-blue-600 border-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="text-green-500" /> Criar Sala
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-6">Você será o host e poderá iniciar o jogo para todos.</p>
              <Button 
                onClick={createRoom} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 h-12 font-bold"
              >
                CRIAR NOVA SALA
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-blue-600 border-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogIn className="text-blue-500" /> Entrar na Sala
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="CÓDIGO DA SALA" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="bg-slate-800 border-blue-900 text-white text-center font-black text-xl h-12"
              />
              <Button 
                onClick={joinRoom}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 h-12 font-bold"
              >
                ENTRAR AGORA
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowRules(!showRules)}
            className="w-full p-4 flex justify-between items-center text-blue-400 font-bold hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-2"><Info size={18} /> REGRAS DO JOGO</span>
            {showRules ? <ChevronUp /> : <ChevronDown />}
          </button>
          {showRules && (
            <div className="p-6 text-slate-400 text-sm space-y-2 border-t border-slate-800 animate-in slide-in-from-top-2">
              <p>• 15 perguntas de múltipla escolha.</p>
              <p>• Errou nas 2 primeiras? Eliminado!</p>
              <p>• Pergunta 6 é a Rodada da Maldade (sem ajudas).</p>
              <p>• Use as ajudas com sabedoria: 50/50, Plateia e Telefone.</p>
              <p>• O Host decide quando o jogo começa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;