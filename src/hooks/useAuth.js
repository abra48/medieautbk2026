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
    const { data: admin } = await supabase
      .from('admin')
      .select('*')
      .eq('id', u.id)
      .single();

    if (admin) {
      setRole('admin');
      setAdminData(admin);
      setUser(u);
      setLoading(false);
      return;
    }

    // Then check siswa
    const { data: siswa } = await supabase
      .from('siswa')
      .select('*')
      .eq('id', u.id)
      .single();

    if (siswa) {
      setRole('siswa');
      setSiswaData(siswa);
    } else {
      setRole('siswa'); // default to siswa
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
