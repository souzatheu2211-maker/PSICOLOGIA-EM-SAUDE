"use client";

import React from 'react';
import { Lightbulb, BarChart3, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AidsProps {
  used: {
    fiftyFifty: boolean;
    hint: boolean;
    probabilities: boolean;
  };
  onUse: (type: 'fiftyFifty' | 'hint' | 'probabilities') => void;
  disabled?: boolean;
  usedThisTurn?: boolean;
}

const Aids = ({ used, onUse, disabled, usedThisTurn }: AidsProps) => {
  return (
    <div className="flex justify-center gap-6 my-8">
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="lg"
          disabled={used.fiftyFifty || disabled || usedThisTurn}
          onClick={() => onUse('fiftyFifty')}
          className={cn(
            "rounded-2xl w-20 h-20 border-4 transition-all shadow-xl",
            used.fiftyFifty ? "bg-slate-800 border-slate-700 text-slate-600" : 
            "bg-gradient-to-br from-blue-600 to-blue-900 border-blue-400 text-white hover:scale-110 hover:shadow-blue-500/50"
          )}
        >
          <Scissors size={32} />
        </Button>
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">50/50</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="lg"
          disabled={used.hint || disabled || usedThisTurn}
          onClick={() => onUse('hint')}
          className={cn(
            "rounded-2xl w-20 h-20 border-4 transition-all shadow-xl",
            used.hint ? "bg-slate-800 border-slate-700 text-slate-600" : 
            "bg-gradient-to-br from-yellow-500 to-yellow-800 border-yellow-400 text-white hover:scale-110 hover:shadow-yellow-500/50"
          )}
        >
          <Lightbulb size={32} />
        </Button>
        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Dica</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="lg"
          disabled={used.probabilities || disabled || usedThisTurn}
          onClick={() => onUse('probabilities')}
          className={cn(
            "rounded-2xl w-20 h-20 border-4 transition-all shadow-xl",
            used.probabilities ? "bg-slate-800 border-slate-700 text-slate-600" : 
            "bg-gradient-to-br from-purple-600 to-purple-900 border-purple-400 text-white hover:scale-110 hover:shadow-purple-500/50"
          )}
        >
          <BarChart3 size={32} />
        </Button>
        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Chances</span>
      </div>
    </div>
  );
};

export default Aids;