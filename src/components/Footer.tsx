"use client";

import React from 'react';
import { Instagram } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Footer = () => {
  const location = useLocation();
  const isSystem = !['/', '/auth'].includes(location.pathname);

  return (
    <footer className={cn(
      "w-full flex flex-col items-center gap-1 text-slate-400 transition-all",
      isSystem ? "fixed bottom-20 left-0 right-0 z-40 pointer-events-none opacity-40" : "py-4 mt-4"
    )}>
      <div className="flex flex-col items-center text-center">
        <p className="font-medium text-[8px] uppercase tracking-widest">Desenvolvido por Matheus Souza</p>
        <p className="font-bold text-blue-400 text-[7px]">ENFERMAGEM - FSSS</p>
        <p className="text-[7px] opacity-60">© 2026 Todos os direitos reservados.</p>
      </div>
      {!isSystem && (
        <a 
          href="https://www.instagram.com/theu_souz2?igsh=NXhiejZ0OTh1cHd5&utm_source=qr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-pink-500 transition-colors group pointer-events-auto"
        >
          <Instagram size={12} className="group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-semibold">@theu_souz2</span>
        </a>
      )}
    </footer>
  );
};

export default Footer;