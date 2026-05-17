"use client";

import React from 'react';
import { Users, Phone, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AidsProps {
  used: {
    fiftyFifty: boolean;
    audience: boolean;
    phone: boolean;
  };
  onUse: (type: 'fiftyFifty' | 'audience' | 'phone') => void;
  disabled?: boolean;
}

const Aids = ({ used, onUse, disabled }: AidsProps) => {
  return (
    <div className="flex justify-center gap-4 my-6">
      <div className="flex flex-col items-center gap-1">
        <Button
          variant="outline"
          size="lg"
          disabled={used.fiftyFifty || disabled}
          onClick={() => onUse('fiftyFifty')}
          className={cn(
            "rounded-full w-16 h-16 border-4 transition-all",
            used.fiftyFifty ? "bg-gray-800 border-gray-600 text-gray-500" : "bg-blue-900 border-blue-400 text-white hover:bg-blue-700 hover:scale-110"
          )}
        >
          <Scissors size={28} />
        </Button>
        <span className="text-[10px] font-bold text-blue-300 uppercase">50/50</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Button
          variant="outline"
          size="lg"
          disabled={used.audience || disabled}
          onClick={() => onUse('audience')}
          className={cn(
            "rounded-full w-16 h-16 border-4 transition-all",
            used.audience ? "bg-gray-800 border-gray-600 text-gray-500" : "bg-blue-900 border-blue-400 text-white hover:bg-blue-700 hover:scale-110"
          )}
        >
          <Users size={28} />
        </Button>
        <span className="text-[10px] font-bold text-blue-300 uppercase">Plateia</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Button
          variant="outline"
          size="lg"
          disabled={used.phone || disabled}
          onClick={() => onUse('phone')}
          className={cn(
            "rounded-full w-16 h-16 border-4 transition-all",
            used.phone ? "bg-gray-800 border-gray-600 text-gray-500" : "bg-blue-900 border-blue-400 text-white hover:bg-blue-700 hover:scale-110"
          )}
        >
          <Phone size={28} />
        </Button>
        <span className="text-[10px] font-bold text-blue-300 uppercase">Telefone</span>
      </div>
    </div>
  );
};

export default Aids;