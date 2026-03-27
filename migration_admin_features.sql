-- ============================================
-- MEDIEA Admin Features — Database Migration
-- Tabel: popup, info, tips
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Tabel Pop-up
CREATE TABLE IF NOT EXISTS public.popup (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  gambar_url TEXT,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.popup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read active popup" ON public.popup FOR SELECT USING (aktif = true);
CREATE POLICY "Allow admin full access popup" ON public.popup FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin WHERE id = auth.uid())
);

-- 2. Tabel Info / Pengumuman
CREATE TABLE IF NOT EXISTS public.info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  tipe TEXT DEFAULT 'info' CHECK (tipe IN ('info', 'warning', 'success')),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read active info" ON public.info FOR SELECT USING (aktif = true);
CREATE POLICY "Allow admin full access info" ON public.info FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin WHERE id = auth.uid())
);

-- 3. Tabel Tips Belajar
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  kategori TEXT DEFAULT 'Umum' CHECK (kategori IN ('Umum', 'Penalaran', 'Matematika', 'Bahasa', 'Motivasi')),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read active tips" ON public.tips FOR SELECT USING (aktif = true);
CREATE POLICY "Allow admin full access tips" ON public.tips FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin WHERE id = auth.uid())
);
