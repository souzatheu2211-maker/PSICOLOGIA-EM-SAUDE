"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Plus, Loader2, Trash2, Upload } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Study = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMaterials();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      setIsAdmin(data?.is_admin || false);
    }
  };

  const fetchMaterials = async () => {
    const { data, error } = await supabase.from('study_materials').select('*').order('created_at', { ascending: false });
    if (error) showError(error.message);
    else setMaterials(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showError("Apenas arquivos PDF são permitidos!");
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('study_materials').insert({
        title: file.name.replace('.pdf', ''),
        pdf_url: publicUrl,
        description: `Material postado em ${new Date().toLocaleDateString()}`
      });

      if (dbError) throw dbError;

      showSuccess("Material enviado com sucesso! 📚");
      fetchMaterials();
    } catch (error: any) {
      showError("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (id: string, url: string) => {
    if (!confirm("Deseja remover este material?")) return;

    const fileName = url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('study-materials').remove([fileName]);
    }
    
    const { error } = await supabase.from('study_materials').delete().eq('id', id);
    if (error) showError(error.message);
    else {
      showSuccess("Material removido.");
      fetchMaterials();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Material de Estudos</h1>
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">"O conhecimento é o melhor remédio para a ansiedade acadêmica."</p>
          </div>
          {isAdmin && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading}
                className="bg-green-600 hover:bg-green-500 h-12 font-black rounded-xl shadow-lg shadow-green-900/20"
              >
                {uploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" size={18} />} 
                SUBIR PDF
              </Button>
            </>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <Card key={item.id} className="glass-dark border-blue-900/50 hover:border-blue-500 transition-all group rounded-[2rem] overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="text-blue-400" />
                  </div>
                  <CardTitle className="text-white text-lg font-bold leading-tight">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-xs mb-6 line-clamp-2">{item.description || 'Sem descrição disponível.'}</p>
                  <div className="flex gap-2">
                    <Button 
                      asChild
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl h-10 text-xs"
                    >
                      <a href={item.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2" size={14} /> BAIXAR
                      </a>
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => deleteMaterial(item.id, item.pdf_url)}
                        className="rounded-xl h-10 w-10 bg-red-900/50 hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {materials.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800">
                <p className="text-slate-500 font-bold italic">Nenhum material postado ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Study;