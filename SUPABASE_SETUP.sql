-- 1. Tabela de Perfis (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  current_room_id TEXT,
  current_score INTEGER DEFAULT 0,
  is_eliminated BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Salas (Rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES auth.users,
  status TEXT DEFAULT 'waiting',
  current_question_index INTEGER DEFAULT 0,
  question_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Materiais de Estudo (Study Materials)
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar Realtime para as tabelas (Importante para o Timer e Ranking)
-- Execute estes comandos um por um se o editor reclamar
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- 5. Políticas de Segurança (RLS) - Opcional para desenvolvimento rápido
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for study_materials" ON public.study_materials FOR ALL USING (true) WITH CHECK (true);