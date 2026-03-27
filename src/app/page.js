'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  useEffect(() => {
    async function redirect() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }

      // Auto-create siswa profile for Google OAuth users
      const { data: existing } = await supabase.from('siswa').select('id').eq('id', session.user.id).single();
      if (!existing) {
        const meta = session.user.user_metadata || {};
        await supabase.from('siswa').insert({
          id: session.user.id,
          nama_lengkap: meta.full_name || meta.name || session.user.email?.split('@')[0] || '',
          nisn: '',
          asal_sekolah: '',
        });
      }

      const { data } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
      window.location.href = data ? '/admin/dashboard' : '/siswa/dashboard';
    }
    redirect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}
