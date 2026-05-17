"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Play, Info } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Index = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('currentPlayer', name.trim());
      navigate('/game');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-black p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_5px_15px_rgba(234,179,8,0.4)] italic uppercase tracking-tighter">
            Show do Milhão
          </h1>
          <p className="text-blue-400 font-bold tracking-widest uppercase mt-2">Edição Psicologia em Saúde</p>
        </div>

        <Card className="bg-slate-900/90 border-4 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.3)] backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Bem-vindo ao Jogo!</CardTitle>
            <CardDescription className="text-blue-300">Prepare-se para testar seus conhecimentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStart} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-200 uppercase ml-1">Seu Nome / Grupo</label>
                <Input
                  placeholder="Digite seu nome..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800 border-blue-500 text-white h-12 text-lg focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black h-14 text-xl shadow-lg shadow-green-900/20"
                >
                  <Play className="mr-2 fill-current" /> JOGAR
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/ranking')}
                  className="border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-white font-black h-14 text-xl"
                >
                  <Trophy className="mr-2" /> RANKING
                </Button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-blue-950/50 rounded-lg border border-blue-800">
              <h4 className="text-blue-300 font-bold text-xs uppercase flex items-center mb-2">
                <Info size={14} className="mr-1" /> Regras Rápidas
              </h4>
              <ul className="text-[10px] text-blue-200 space-y-1 list-disc pl-4">
                <li>15 perguntas de Psicologia.</li>
                <li>Errou nas 2 primeiras? Eliminado!</li>
                <li>Pergunta 6 é a <b>RODADA DA MALDADE</b> (sem ajudas).</li>
                <li>Cuidado com a <b>PEGADINHA DO PROFESSOR</b> surpresa.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;