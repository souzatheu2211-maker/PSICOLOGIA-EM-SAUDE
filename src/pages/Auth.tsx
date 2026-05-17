"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { LogIn, UserPlus, Loader2, BrainCircuit } from 'lucide-react';
import Footer from '@/components/Footer';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showSuccess("Bem-vindo de volta!");
        navigate('/lobby');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { name } }
        });
        if (error) throw error;
        
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            name,
            email
          });
        }
        
        showSuccess("Cadastro realizado! Verifique seu email ou faça login.");
        setIsLogin(true);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Logos */}
        <div className="flex items-center gap-6 mb-2">
          <img src="/src/assets/logo-fsss.png" alt="FSSS" className="h-12 object-contain" />
          <img src="/src/assets/logo-enf.png" alt="ENF" className="h-12 object-contain" />
        </div>

        <Card className="w-full glass-dark border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
              <BrainCircuit className="text-blue-400 animate-pulse" size={32} />
            </div>
            <CardTitle className="text-3xl font-black text-white italic uppercase tracking-tight">
              {isLogin ? 'Acessar Portal' : 'Criar Registro'}
            </CardTitle>
            <CardDescription className="text-blue-300/70 text-xs font-medium">
              {isLogin ? 'Entre para continuar seus estudos' : 'Junte-se à comunidade acadêmica'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10 px-8">
            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-300 uppercase ml-1 tracking-wider">Nome Completo</label>
                  <Input 
                    placeholder="Seu nome acadêmico" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-2xl h-11 focus:ring-blue-500/50"
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-blue-300 uppercase ml-1 tracking-wider">Email Institucional</label>
                <Input 
                  type="email" 
                  placeholder="exemplo@fsss.edu.br" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-2xl h-11 focus:ring-blue-500/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-blue-300 uppercase ml-1 tracking-wider">Senha de Acesso</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-2xl h-11 focus:ring-blue-500/50"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-sm font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn className="mr-2" size={18} /> : <UserPlus className="mr-2" size={18} />)}
                {isLogin ? 'ENTRAR NO SISTEMA' : 'FINALIZAR CADASTRO'}
              </Button>

              <div className="text-center mt-6">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-400/80 text-[11px] hover:text-blue-300 transition-colors font-bold uppercase tracking-tighter"
                >
                  {isLogin ? 'Ainda não tem conta? Registre-se' : 'Já possui registro? Faça login'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Footer />
      </div>
    </div>
  );
};

export default Auth;