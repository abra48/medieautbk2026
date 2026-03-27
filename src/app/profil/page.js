'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama_lengkap: '', nisn: '', asal_sekolah: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [skorCount, setSkorCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);


  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = '/login';
    setUser(session.user);

    const { data: adminData } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
    setIsAdmin(!!adminData);

    const { data: siswaData } = await supabase.from('siswa').select('id, nama_lengkap, asal_sekolah, created_at, nisn').eq('id', session.user.id).single();
    if (siswaData) {
      setProfil(siswaData);
      setForm({ nama_lengkap: siswaData.nama_lengkap || '', nisn: siswaData.nisn || '', asal_sekolah: siswaData.asal_sekolah || '' });
    }

    const { count } = await supabase.from('skor').select('*', { count: 'exact', head: true }).eq('siswa_id', session.user.id);
    setSkorCount(count || 0);

    const { data: scores } = await supabase.from('skor').select('total_skor').eq('siswa_id', session.user.id).order('total_skor', { ascending: false }).limit(1);
    if (scores && scores.length > 0) setBestScore(Math.round(scores[0].total_skor));

    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    const { error: err } = await supabase.from('siswa').update(form).eq('id', user.id);
    if (err) { setError(err.message); }
    else { setSuccess('Profil berhasil diperbarui!'); setProfil({ ...profil, ...form }); }
    setSaving(false);
  }



  const initials = (profil?.nama_lengkap || user?.email || '?').substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar isAdmin={isAdmin} user={user} />
        <main className="main-content"><div className="loading-center"><div className="spinner" /></div></main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar isAdmin={isAdmin} user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>Profil Saya</h1>
          <p>Kelola informasi akunmu</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          {/* Profile Card + Form */}
          <div className="card animate-slideUp">
            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <div className="avatar lg">
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{profil?.nama_lengkap || 'Belum diisi'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{user?.email}</div>
                <span className={`badge ${isAdmin ? 'badge-red' : 'badge-blue'}`}>
                  {isAdmin ? '🔑 Admin' : '🎓 Siswa'}
                </span>
              </div>
            </div>

            {/* Alerts */}
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            {/* Edit Form */}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" value={form.nama_lengkap} onChange={e => setForm({ ...form, nama_lengkap: e.target.value })} placeholder="Masukkan nama lengkap" />
              </div>
              <div className="form-group">
                <label className="form-label">NISN</label>
                <input className="form-input" value={form.nisn} onChange={e => setForm({ ...form, nisn: e.target.value })} placeholder="Nomor Induk Siswa Nasional" />
              </div>
              <div className="form-group">
                <label className="form-label">Asal Sekolah</label>
                <input className="form-input" value={form.asal_sekolah} onChange={e => setForm({ ...form, asal_sekolah: e.target.value })} placeholder="Contoh: SMAN 1 Makassar" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><div className="spinner-sm" /> Menyimpan...</> : '💾 Simpan Perubahan'}
              </button>
            </form>
          </div>

          {/* Right Column: Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Tryout Stats */}
            <div className="card animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div className="stat-icon blue" style={{ width: 42, height: 42 }}>📊</div>
                <div>
                  <div className="stat-value" style={{ fontSize: 24 }}>{skorCount}</div>
                  <div className="stat-label">Tryout Selesai</div>
                </div>
              </div>
              {bestScore > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="stat-icon green" style={{ width: 42, height: 42 }}>🏅</div>
                  <div>
                    <div className="stat-value" style={{ fontSize: 24 }}>{bestScore}</div>
                    <div className="stat-label">Skor Terbaik</div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="card animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                Informasi Akun
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Terdaftar', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
                  { label: 'NISN', value: profil?.nisn || '-' },
                  { label: 'Sekolah', value: profil?.asal_sekolah || '-' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="card animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="/siswa/dashboard" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>🎯 Mulai Tryout</a>
                <a href="/leaderboard" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>🏆 Leaderboard</a>
                <a href="/skor" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>📈 Riwayat Skor</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
