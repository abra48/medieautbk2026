'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminRedirect() {
  useEffect(() => {
    async function redirect() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
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
