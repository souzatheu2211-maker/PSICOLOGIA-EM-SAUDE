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
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error("E-mail ou senha errados! O seu Superego está decepcionado com essa memória... kkkk");
          }
          throw error;
        }
        showSuccess("Acesso liberado! Seu Ego está pronto para o desafio! 🧠✨");
        navigate('/home');
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
        
        showSuccess("Registro concluído! Agora você é oficialmente um aspirante a mestre da mente! 🎓🔥");
        setIsLogin(true);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logos with Animation */}
        <div className="flex items-center gap-6 mb-4">
          <img src="/src/assets/logo-fsss.png" alt="FSSS" className="h-14 object-contain animate-float" />
          <img src="/src/assets/logo-enf.png" alt="ENF" className="h-14 object-contain animate-float [animation-delay:0.3s]" />
        </div>

        <Card className="w-full glass-dark border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 mb-4">
          <CardHeader className="text-center pt-6 pb-4">
            <div className="mx-auto w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-2">
              <BrainCircuit className="text-blue-400 animate-pulse" size={24} />
            </div>
            <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tight">
              {isLogin ? 'Acessar Portal' : 'Criar Registro'}
            </CardTitle>
            <CardDescription className="text-blue-300/70 text-[10px] font-medium">
              {isLogin ? 'Entre para continuar seus estudos' : 'Junte-se à comunidade acadêmica'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-blue-300 uppercase ml-1 tracking-wider">Nome Completo</label>
                  <Input 
                    placeholder="Seu nome acadêmico" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs focus:ring-blue-500/50"
                    required
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-blue-300 uppercase ml-1 tracking-wider">E-mail</label>
                <Input 
                  type="email" 
                  placeholder="seumail@gmail.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs focus:ring-blue-500/50"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-blue-300 uppercase ml-1 tracking-wider">Senha</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-xs focus:ring-blue-500/50"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 h-11 text-xs font-black rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 mt-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn className="mr-2" size={16} /> : <UserPlus className="mr-2" size={16} />)}
                {isLogin ? 'ENTRAR NO SISTEMA' : 'FINALIZAR CADASTRO'}
              </Button>

              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-400/80 text-[10px] hover:text-blue-300 transition-colors font-bold uppercase tracking-tighter"
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