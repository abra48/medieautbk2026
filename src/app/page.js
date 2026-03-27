'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  useEffect(() => {
    async function redirect() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }

      const userId = session.user.id;

      // Check admin FIRST
      const { data: adminData } = await supabase.from('admin').select('id').eq('id', userId).single();
      if (adminData) {
        window.location.href = '/admin/dashboard';
        return;
      }

      // Not admin → auto-create siswa profile for Google OAuth users if needed
      const { data: existing } = await supabase.from('siswa').select('id').eq('id', userId).single();
      if (!existing) {
        const meta = session.user.user_metadata || {};
        await supabase.from('siswa').insert({
          id: userId,
          nama_lengkap: meta.full_name || meta.name || session.user.email?.split('@')[0] || '',
          nisn: '',
          asal_sekolah: '',
        });
      }

      window.location.href = '/siswa/dashboard';
    }
    redirect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}
