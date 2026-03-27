'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

const KATEGORI_MAP = {
  PU: 'Penalaran Umum',
  PBM: 'Pemahaman Bacaan & Menulis',
  PPU: 'Pengetahuan & Pemahaman Umum',
  PK: 'Pengetahuan Kuantitatif',
  LIT_INDO: 'Literasi Bahasa Indonesia',
  LIT_ING: 'Literasi Bahasa Inggris',
  PM: 'Penalaran Matematika',
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ soal: 0, siswa: 0, skor: 0, popup: 0, info: 0, tips: 0 });
  const [recentInfo, setRecentInfo] = useState([]);
  const [recentTips, setRecentTips] = useState([]);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return (window.location.href = '/login');
    const { data: admin } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
    if (!admin) return (window.location.href = '/siswa/dashboard');
    setUser(session.user);
    fetchStats();
  }

  async function fetchStats() {
    try {
      const [
        { count: soalCount },
        { count: siswaCount },
        { count: skorCount },
        { count: popupCount },
        { count: infoCount },
        { count: tipsCount },
        { data: infoData },
        { data: tipsData },
      ] = await Promise.all([
        supabase.from('soal').select('*', { count: 'exact', head: true }),
        supabase.from('siswa').select('*', { count: 'exact', head: true }),
        supabase.from('skor').select('*', { count: 'exact', head: true }),
        supabase.from('popup').select('*', { count: 'exact', head: true }),
        supabase.from('info').select('*', { count: 'exact', head: true }),
        supabase.from('tips').select('*', { count: 'exact', head: true }),
        supabase.from('info').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('tips').select('*').order('created_at', { ascending: false }).limit(3),
      ]);
      setStats({
        soal: soalCount || 0, siswa: siswaCount || 0, skor: skorCount || 0,
        popup: popupCount || 0, info: infoCount || 0, tips: tipsCount || 0,
      });
      setRecentInfo(infoData || []);
      setRecentTips(tipsData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  const quickLinks = [
    { href: '/admin/popup', label: 'Kelola Pop-up', emoji: '📢', desc: 'Atur pop-up untuk siswa', color: 'var(--brand-primary-subtle)' },
    { href: '/admin/info', label: 'Kirim Info', emoji: '📣', desc: 'Broadcast pengumuman', color: 'var(--success-subtle)' },
    { href: '/admin/soal', label: 'Bank Soal', emoji: '📝', desc: 'Tambah & kelola soal TO', color: 'var(--warning-subtle)' },
    { href: '/admin/tips', label: 'Tips Belajar', emoji: '💡', desc: 'Tips & trik belajar', color: 'var(--info-subtle)' },
    { href: '/admin/passing-grade', label: 'Passing Grade', emoji: '🎯', desc: 'Skor minimal per jurusan', color: 'var(--danger-subtle)' },
  ];

  return (
    <div className="app-layout">
      <Sidebar isAdmin user={user} />
      <main className="main-content">
        {/* Welcome */}
        <div className="welcome-banner">
          <h1>👋 Halo, Admin!</h1>
          <p>Kelola seluruh konten MEDIEA dari sini. Semoga produktif hari ini!</p>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children">
          <div className="stat-card">
            <div className="stat-icon blue">📝</div>
            <div><div className="stat-value">{stats.soal}</div><div className="stat-label">Total Soal</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">👥</div>
            <div><div className="stat-value">{stats.siswa}</div><div className="stat-label">Siswa</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">📊</div>
            <div><div className="stat-value">{stats.skor}</div><div className="stat-label">Total Tryout</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan">📢</div>
            <div><div className="stat-value">{stats.popup}</div><div className="stat-label">Pop-up</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">📣</div>
            <div><div className="stat-value">{stats.info}</div><div className="stat-label">Info</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">💡</div>
            <div><div className="stat-value">{stats.tips}</div><div className="stat-label">Tips</div></div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="page-header" style={{ marginTop: 8 }}>
          <h1 style={{ fontSize: 20 }}>⚡ Menu Cepat</h1>
        </div>
        <div className="admin-quick-grid stagger-children">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href} className="card card-interactive admin-quick-card">
              <div className="admin-quick-emoji" style={{ background: link.color }}>{link.emoji}</div>
              <div>
                <div className="admin-quick-label">{link.label}</div>
                <div className="admin-quick-desc">{link.desc}</div>
              </div>
              <span className="admin-quick-arrow">→</span>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="admin-recent-grid">
          {/* Recent Info */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>📣 Info Terbaru</h3>
              <Link href="/admin/info" className="btn btn-sm btn-ghost">Lihat Semua →</Link>
            </div>
            {recentInfo.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Belum ada info.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentInfo.map(item => (
                  <div key={item.id} className={`alert alert-${item.tipe || 'info'}`} style={{ marginBottom: 0 }}>
                    <strong>{item.judul}</strong>
                    <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 8 }}>{formatDate(item.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tips */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>💡 Tips Terbaru</h3>
              <Link href="/admin/tips" className="btn btn-sm btn-ghost">Lihat Semua →</Link>
            </div>
            {recentTips.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Belum ada tips.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentTips.map(item => (
                  <div key={item.id} style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.judul}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {item.isi?.substring(0, 60)}{item.isi?.length > 60 ? '...' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
