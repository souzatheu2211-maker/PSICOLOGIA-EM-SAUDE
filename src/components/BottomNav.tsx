"use client";

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Play, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: Home, label: 'Início', path: '/home' },
    { icon: Play, label: 'Jogar', path: '/lobby' },
    { icon: BookOpen, label: 'Estudar', path: '/study' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  if (['/', '/auth', '/game'].includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-lg mx-auto glass-dark border-white/10 rounded-full p-2 flex justify-between items-center pointer-events-auto shadow-2xl">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 rounded-full transition-all duration-300",
                isActive ? "bg-blue-600 text-white scale-110" : "text-slate-400 hover:text-blue-300"
              )}
            >
              <Icon size={20} className={cn(isActive && "animate-pulse")} />
              <span className="text-[8px] font-bold uppercase mt-1 tracking-tighter">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;