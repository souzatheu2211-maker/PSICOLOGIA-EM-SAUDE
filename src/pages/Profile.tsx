"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Save, LogOut, Loader2, User } from 'lucide-react';
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setName(data.name || '');
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showError("O nome não pode estar vazio!");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          name: name.trim(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      showSuccess("Perfil atualizado com sucesso! ✨");
      await fetchProfile(); // Recarrega os dados
    } catch (error: any) {
      showError("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showError("A foto deve ter no máximo 5MB!");
        return;
      }

      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      showSuccess("Foto de perfil atualizada! 📸");
    } catch (error: any) {
      showError("Erro ao subir foto: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center relative pb-32">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Card className="w-full glass-dark border-blue-600/30 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center pt-12">
            <div className="relative mx-auto w-40 h-40 mb-8">
              <Avatar className="w-full h-full border-4 border-blue-600 shadow-2xl">
                <AvatarImage src={profile?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-slate-800 text-4xl font-black text-blue-400">
                  <User size={60} />
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-2 right-2 bg-blue-600 p-4 rounded-full border-4 border-slate-900 hover:bg-blue-500 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                {uploading ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera size={24} className="text-white" />}
              </button>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
            </div>
            <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tight">Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-12 px-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-300 uppercase ml-1 tracking-widest">Nome de Guerra</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="bg-white/5 border-white/10 text-white rounded-2xl h-14 text-lg focus:ring-blue-500/50"
              />
            </div>

            <div className="flex flex-col gap-4 pt-6">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 h-14 font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" size={20} />} SALVAR ALTERAÇÕES
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-900/50 text-red-500 hover:bg-red-900/20 h-14 font-black rounded-2xl transition-all"
              >
                <LogOut className="mr-2" size={20} /> SAIR DA CONTA
              </Button>
            </div>
          </CardContent>
        </Card>
        <Footer />
      </div>
    </div>
  );
};

export default Profile;