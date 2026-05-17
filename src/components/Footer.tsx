"use client";

import React from 'react';
import { Instagram } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Footer = () => {
  const location = useLocation();
  const isAuth = ['/', '/auth'].includes(location.pathname);

  return (
    <footer className={cn(
      "w-full flex flex-col items-center gap-2 text-slate-400 py-10 mt-auto",
      !isAuth && "opacity-60"
    )}>
      <div className="flex flex-col items-center text-center">
        <p className="font-medium text-[10px] uppercase tracking-widest">Desenvolvido por Matheus Souza</p>
        <p className="font-bold text-blue-400 text-[9px]">ENFERMAGEM - FSSS</p>
        <p className="text-[8px] opacity-60">© 2026 Todos os direitos reservados.</p>
      </div>
      <a 
        href="https://www.instagram.com/theu_souz2?igsh=NXhiejZ0OTh1cHd5&utm_source=qr" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group"
      >
        <Instagram size={14} className="group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-semibold">@theu_souz2</span>
      </a>
    </footer>
  );
};

export default Footer;