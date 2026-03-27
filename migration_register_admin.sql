-- ============================================================
-- SQL untuk dijalankan di Supabase SQL Editor
-- ============================================================

-- 1. Pastikan tabel kode_admin sudah ada
-- CREATE TABLE IF NOT EXISTS kode_admin (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   kode text NOT NULL UNIQUE,
--   status_terpakai boolean DEFAULT false,
--   created_at timestamptz DEFAULT now()
-- );

-- 2. RPC Function: register_admin (transactional)
CREATE OR REPLACE FUNCTION register_admin(
  p_admin_id uuid,
  p_nama_lengkap text,
  p_tingkat_akses text,
  p_kode text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_kode_id uuid;
BEGIN
  -- Validate code exists and is unused
  SELECT id INTO v_kode_id
  FROM kode_admin
  WHERE kode = p_kode AND status_terpakai = false
  LIMIT 1;

  IF v_kode_id IS NULL THEN
    RAISE EXCEPTION 'Kode admin tidak valid atau sudah terpakai';
  END IF;

  -- Insert into admin table
  INSERT INTO admin (id, nama_lengkap, tingkat_akses)
  VALUES (p_admin_id, p_nama_lengkap, p_tingkat_akses);

  -- Mark code as used
  UPDATE kode_admin SET status_terpakai = true WHERE id = v_kode_id;
END;
$$;

-- 3. Contoh: Insert kode admin baru (ganti 'KODE_RAHASIA_123' dengan kode pilihan Anda)
-- INSERT INTO kode_admin (kode) VALUES ('KODE_RAHASIA_123');
