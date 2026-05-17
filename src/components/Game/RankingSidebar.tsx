"use client";

import React from 'react';
import { Player } from '@/types/game';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Trophy, Skull, Crown } from 'lucide-react';

interface RankingSidebarProps {
  players: Player[];
  compact?: boolean;
  hostId?: string;
}

const RankingSidebar = ({ players, compact, hostId }: RankingSidebarProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className={cn(
      "bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 h-full overflow-y-auto custom-scrollbar",
      compact ? "w-full" : "w-80"
    )}>
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="text-yellow-500 animate-bounce" size={24} />
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Ranking Live</h3>
      </div>

      <div className="space-y-4">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className={cn(
              "flex items-center gap-4 p-3 rounded-2xl transition-all duration-500 animate-in slide-in-from-right",
              player.is_eliminated ? "bg-red-950/40 border border-red-900/50 grayscale" : "bg-white/5 border border-white/10"
            )}
          >
            <div className="relative">
              <Avatar className={cn(
                "w-12 h-12 border-2",
                index === 0 ? "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]" : "border-blue-500/30"
              )}>
                <AvatarImage src={player.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-slate-800 text-xs font-bold">
                  {player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {player.is_eliminated && (
                <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1 shadow-lg">
                  <Skull size={10} className="text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -left-2 bg-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded-full">
                #{index + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={cn(
                  "font-bold text-sm truncate",
                  player.is_eliminated ? "text-red-400" : "text-white"
                )}>
                  {player.name}
                </p>
                {player.id === hostId && (
                  <div className="bg-yellow-500/20 text-yellow-500 p-0.5 rounded flex items-center gap-0.5">
                    <Crown size={10} />
                    <span className="text-[8px] font-black uppercase">HOST</span>
                  </div>
                )}
              </div>
              <p className="text-yellow-500 font-black text-xs">{player.score} <span className="text-[8px] opacity-60">PTS</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingSidebar;