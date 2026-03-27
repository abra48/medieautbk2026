'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'siswa' | null
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [siswaData, setSiswaData] = useState(null);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkRole(session.user);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await checkRole(session.user);
    } else {
      setLoading(false);
    }
  }

  async function checkRole(u) {
    // Check admin first
    const { data: admin, error: adminErr } = await supabase
      .from('admin')
      .select('id, nama_lengkap, tingkat_akses, created_at')
      .eq('id', u.id)
      .single();

    if (adminErr && adminErr.code !== 'PGRST116') {
      console.error('Error checking admin role:', adminErr);
    }

    if (admin) {
      setRole('admin');
      setAdminData(admin);
      setUser(u);
      setLoading(false);
      return;
    }

    // Then check siswa
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id, nama_lengkap, asal_sekolah, created_at, nisn')
      .eq('id', u.id)
      .single();

    if (siswaErr && siswaErr.code !== 'PGRST116') {
      console.error('Error checking siswa role:', siswaErr);
    }

    if (siswa) {
      setRole('siswa');
      setSiswaData(siswa);
    } else {
      // No record in either table — don't assume a role
      setRole(null);
    }

    setUser(u);
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    window.location.href = '/login';
  }

  return { user, role, loading, adminData, siswaData, logout };
}
