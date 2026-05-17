"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Save, LogOut, Loader2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setName(data?.name || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({ name }).eq('id', user?.id);
    
    if (error) showError(error.message);
    else showSuccess("Perfil atualizado!");
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
      <Card className="w-full max-w-md bg-slate-900 border-blue-600 border-2">
        <CardHeader className="text-center">
          <div className="relative mx-auto w-32 h-32 mb-4">
            <Avatar className="w-full h-full border-4 border-blue-600">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-slate-800 text-3xl font-black text-blue-400">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-slate-900 hover:bg-blue-500 transition-colors">
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <CardTitle className="text-white text-2xl font-black uppercase italic">{name || 'Seu Perfil'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-300 uppercase">Nome de Exibição</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-blue-900 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-300 uppercase">Email</label>
            <Input 
              value={profile?.email} 
              disabled
              className="bg-slate-800 border-blue-900 text-slate-500"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 font-bold"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />} SALVAR ALTERAÇÕES
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-red-900 text-red-500 hover:bg-red-900/20 font-bold"
            >
              <LogOut className="mr-2" /> SAIR DA CONTA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;