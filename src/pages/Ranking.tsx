"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Home, Trash2, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';

const Ranking = () => {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<Player[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('ranking') || '[]');
    const sorted = data.sort((a: Player, b: Player) => b.score - a.score);
    setRanking(sorted);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const clearRanking = () => {
    if (confirm("Tem certeza que deseja resetar o ranking?")) {
      localStorage.removeItem('ranking');
      setRanking([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" size={48} />
            <div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Ranking da Sala</h1>
              <p className="text-blue-400 font-bold text-sm uppercase">Os melhores psicólogos da enfermagem</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleFullscreen} className="border-blue-600 text-blue-400">
              {isFullscreen ? <Minimize className="mr-2" /> : <Maximize className="mr-2" />} Tela Cheia
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="border-blue-600 text-blue-400">
              <Home className="mr-2" /> Início
            </Button>
            <Button variant="destructive" onClick={clearRanking} className="bg-red-900/50 hover:bg-red-800">
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        <div className="bg-slate-900 border-4 border-blue-600 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)]">
          <Table>
            <TableHeader className="bg-blue-900/50">
              <TableRow className="border-blue-800 hover:bg-transparent">
                <TableHead className="text-white font-black uppercase w-20 text-center">Pos</TableHead>
                <TableHead className="text-white font-black uppercase">Jogador</TableHead>
                <TableHead className="text-white font-black uppercase text-center">Acertos</TableHead>
                <TableHead className="text-white font-black uppercase text-center">Status</TableHead>
                <TableHead className="text-white font-black uppercase text-right">Pontuação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-blue-400 font-bold italic">
                    Nenhum jogador no ranking ainda. Seja o primeiro!
                  </TableCell>
                </TableRow>
              ) : (
                ranking.map((player, index) => (
                  <TableRow key={player.id} className="border-blue-900/50 hover:bg-blue-900/20 transition-colors">
                    <TableCell className="text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-lg",
                        index === 0 ? "bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/20" :
                        index === 1 ? "bg-slate-300 text-black" :
                        index === 2 ? "bg-amber-700 text-white" :
                        "bg-slate-800 text-blue-400"
                      )}>
                        #{index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-white text-lg">{player.name}</TableCell>
                    <TableCell className="text-center text-green-400 font-bold">{player.correctAnswers}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-black uppercase",
                        player.status === 'finalizou' ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                      )}>
                        {player.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-2xl text-yellow-400">
                      {player.score} <span className="text-xs">pts</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Ranking;