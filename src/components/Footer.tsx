"use client";

import React from 'react';
import { Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-auto flex flex-col items-center gap-2 text-slate-400">
      <div className="flex flex-col items-center text-center">
        <p className="font-medium text-xs uppercase tracking-widest">Desenvolvido por Matheus Souza</p>
        <p className="font-bold text-blue-400 text-[10px]">ENFERMAGEM - FSSS</p>
      </div>
      <a 
        href="https://www.instagram.com/theu_souz2?igsh=NXhiejZ0OTh1cHd5&utm_source=qr" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-pink-500 transition-colors group"
      >
        <Instagram size={16} className="group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold">@theu_souz2</span>
      </a>
    </footer>
  );
};

export default Footer;