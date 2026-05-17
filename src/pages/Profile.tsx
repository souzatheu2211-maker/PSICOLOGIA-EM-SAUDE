"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Save, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    else showSuccess("Perfil atualizado com sucesso!");
    setSaving(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase.from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      showSuccess("Foto de perfil atualizada!");
    } catch (error: any) {
      showError("Erro ao subir foto. Verifique se o bucket 'avatars' existe no Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="w-full flex justify-start">
          <Button variant="ghost" onClick={() => navigate('/home')} className="text-blue-400 hover:text-blue-300">
            <ArrowLeft className="mr-2" size={18} /> Voltar
          </Button>
        </div>

        <Card className="w-full glass-dark border-blue-600/30 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="text-center pt-10">
            <div className="relative mx-auto w-32 h-32 mb-6">
              <Avatar className="w-full h-full border-4 border-blue-600 shadow-2xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-slate-800 text-3xl font-black text-blue-400">
                  {name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full border-4 border-slate-900 hover:bg-blue-500 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                {uploading ? <Loader2 className="animate-spin text-white" size={20} /> : <Camera size={20} className="text-white" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tight">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-10 px-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-300 uppercase ml-1 tracking-widest">Nome de Exibição</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white rounded-2xl h-12 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-300 uppercase ml-1 tracking-widest">E-mail da Conta</label>
              <Input 
                value={profile?.email} 
                disabled
                className="bg-white/5 border-white/10 text-slate-500 rounded-2xl h-12 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 h-12 font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" size={18} />} SALVAR ALTERAÇÕES
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-900/50 text-red-500 hover:bg-red-900/20 h-12 font-black rounded-2xl transition-all"
              >
                <LogOut className="mr-2" size={18} /> SAIR DA CONTA
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-6">
          <img src="/src/assets/logo-fsss.png" alt="FSSS" className="h-12 object-contain opacity-50" />
          <img src="/src/assets/logo-enf.png" alt="ENF" className="h-12 object-contain opacity-50" />
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Profile;