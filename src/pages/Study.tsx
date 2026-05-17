"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Plus, Loader2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Study = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic">Material de Estudos</h1>
            <p className="text-blue-400 font-bold">Prepare-se para o Show do Milhão</p>
          </div>
          {isAdmin && (
            <Button className="bg-green-600 hover:bg-green-500">
              <Plus className="mr-2" /> ADICIONAR PDF
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <Card key={item.id} className="bg-slate-900 border-blue-900 hover:border-blue-500 transition-all group">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="text-blue-400" />
                  </div>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm mb-6">{item.description || 'Sem descrição disponível.'}</p>
                  <Button 
                    asChild
                    className="w-full bg-slate-800 hover:bg-blue-600 text-white border border-blue-900"
                  >
                    <a href={item.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2" size={16} /> BAIXAR PDF
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {materials.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
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