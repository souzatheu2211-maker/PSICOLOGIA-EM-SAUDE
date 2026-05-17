"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-blue-600 border-2 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black text-white italic uppercase">
            {isLogin ? 'Entrar no Jogo' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-blue-400">
            {isLogin ? 'Acesse sua conta para jogar e estudar' : 'Preencha os dados para começar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-300 uppercase">Nome Completo</label>
                <Input 
                  placeholder="Seu nome" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800 border-blue-900 text-white"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-300 uppercase">Email</label>
              <Input 
                type="email" 
                placeholder="email@exemplo.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-blue-900 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-300 uppercase">Senha</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-blue-900 text-white"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-lg font-bold"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn className="mr-2" /> : <UserPlus className="mr-2" />)}
              {isLogin ? 'ENTRAR' : 'CADASTRAR'}
            </Button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 text-sm hover:underline font-bold"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;