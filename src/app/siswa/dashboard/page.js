'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import UNIVERSITAS_DATA from '@/lib/universitas';

const KATEGORI_MAP = {
  PU: { name: 'Penalaran Umum', icon: '🧠', color: '#3b82f6', duration: 30 },
  PBM: { name: 'Pemahaman Bacaan & Menulis', icon: '📖', color: '#8b5cf6', duration: 25 },
  PPU: { name: 'Pengetahuan & Pemahaman Umum', icon: '🌍', color: '#06b6d4', duration: 20 },
  PK: { name: 'Pengetahuan Kuantitatif', icon: '🔢', color: '#10b981', duration: 35 },
  LIT_INDO: { name: 'Literasi Bahasa Indonesia', icon: '🇮🇩', color: '#f59e0b', duration: 25 },
  LIT_ING: { name: 'Literasi Bahasa Inggris', icon: '🇬🇧', color: '#ec4899', duration: 25 },
  PM: { name: 'Penalaran Matematika', icon: '📐', color: '#ef4444', duration: 30 },
};
const KATEGORI_LIST = Object.keys(KATEGORI_MAP);

export default function SiswaDashboard() {
  const { user, role, loading: authLoading, siswaData, logout } = useAuth();
  const [soalCounts, setSoalCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastScore, setLastScore] = useState(null);
  const [bestScore, setBestScore] = useState(0);
  const [tryoutCount, setTryoutCount] = useState(0);
  const router = useRouter();

  // Pop-up, Info, Tips state
  const [activePopup, setActivePopup] = useState(null);
  const [infoList, setInfoList] = useState([]);
  const [tipsList, setTipsList] = useState([]);

  // Target universitas state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetUnivId, setTargetUnivId] = useState('');
  const [targetJurusan, setTargetJurusan] = useState('');
  const [univSearch, setUnivSearch] = useState('');
  const [savedTarget, setSavedTarget] = useState(null); // { univ, jurusan, passing_grade }

  useEffect(() => {
    if (!authLoading && role === 'admin') window.location.href = '/admin/dashboard';
    if (!authLoading && !role && !user) window.location.href = '/login';
  }, [authLoading, role, user]);

  useEffect(() => { if (user) fetchData(); }, [user]);

  async function fetchData() {
    const { data: soalList } = await supabase.from('soal').select('kategori');
    const counts = {};
    KATEGORI_LIST.forEach(k => { counts[k] = 0; });
    (soalList || []).forEach(s => {
      if (counts[s.kategori] !== undefined) counts[s.kategori]++;
    });
    setSoalCounts(counts);

    const { data: scores } = await supabase
      .from('skor').select('total_skor, created_at')
      .eq('siswa_id', user.id).order('created_at', { ascending: false }).limit(1);
    if (scores && scores.length > 0) setLastScore(scores[0]);

    const { data: allScores } = await supabase
      .from('skor').select('total_skor').eq('siswa_id', user.id);
    if (allScores && allScores.length > 0) {
      setBestScore(Math.max(...allScores.map(s => Number(s.total_skor))));
    }

    const { count } = await supabase.from('skor').select('*', { count: 'exact', head: true }).eq('siswa_id', user.id);
    setTryoutCount(count || 0);

    // Load saved target from localStorage
    const saved = localStorage.getItem(`mediea_target_${user.id}`);
    if (saved) {
      try { setSavedTarget(JSON.parse(saved)); } catch(e) {}
    }

    // Fetch active pop-up, info, tips
    try {
      const { data: popupData } = await supabase.from('popup').select('*').eq('aktif', true).order('created_at', { ascending: false }).limit(1);
      if (popupData && popupData.length > 0) {
        const dismissedKey = `mediea_popup_dismissed_${popupData[0].id}`;
        if (!sessionStorage.getItem(dismissedKey)) {
          setActivePopup(popupData[0]);
        }
      }

      const { data: infoData } = await supabase.from('info').select('*').eq('aktif', true).order('created_at', { ascending: false }).limit(5);
      setInfoList(infoData || []);

      const { data: tipsData } = await supabase.from('tips').select('*').eq('aktif', true).order('created_at', { ascending: false }).limit(4);
      setTipsList(tipsData || []);
    } catch (e) {
      // Tables might not exist yet, silently ignore
      console.log('Info/tips tables not available yet');
    }

    setLoading(false);
  }

  function dismissPopup() {
    if (activePopup) {
      sessionStorage.setItem(`mediea_popup_dismissed_${activePopup.id}`, 'true');
    }
    setActivePopup(null);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  function startTryout(kategori) {
    router.push(`/siswa/tryout?subtest=${kategori}`);
  }

  // Target university logic
  const filteredUniv = useMemo(() => {
    if (!univSearch) return UNIVERSITAS_DATA;
    const q = univSearch.toLowerCase();
    return UNIVERSITAS_DATA.filter(u =>
      u.nama.toLowerCase().includes(q) || u.singkatan.toLowerCase().includes(q) || u.lokasi.toLowerCase().includes(q)
    );
  }, [univSearch]);

  const selectedUniv = UNIVERSITAS_DATA.find(u => u.id === targetUnivId);

  function saveTarget() {
    if (!selectedUniv || !targetJurusan) return;
    const jur = selectedUniv.jurusan.find(j => j.nama === targetJurusan);
    if (!jur) return;
    const target = {
      univ_id: selectedUniv.id,
      univ_nama: selectedUniv.nama,
      univ_singkatan: selectedUniv.singkatan,
      jurusan: jur.nama,
      rumpun: jur.rumpun,
      passing_grade: jur.passing_grade,
    };
    localStorage.setItem(`mediea_target_${user.id}`, JSON.stringify(target));
    setSavedTarget(target);
    setShowTargetModal(false);
    setUnivSearch('');
  }

  function removeTarget() {
    localStorage.removeItem(`mediea_target_${user.id}`);
    setSavedTarget(null);
  }

  const totalSoal = Object.values(soalCounts).reduce((a, b) => a + b, 0);
  const targetProgress = savedTarget ? Math.min(100, Math.round((bestScore / savedTarget.passing_grade) * 100)) : 0;

  if (authLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-brand">
          <div className="top-bar-brand-icon"><img src="https://cdn.phototourl.com/free/2026-03-27-2dee9557-ff89-4c80-ad48-83650d00521a.png" alt="MEDIEA" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /></div>
          <div>
            <div className="top-bar-title">Dashboard Siswa</div>
            <div className="top-bar-subtitle">{siswaData?.nama_lengkap || user?.email}</div>
          </div>
        </div>
        <div className="top-bar-actions">
          <span className="badge badge-green">🎓 Siswa</span>
          <button onClick={logout} className="btn btn-ghost" style={{ color: 'var(--text-muted)', fontSize: 13 }}>Logout</button>
        </div>
      </header>

      <div className="container-xl" style={{ padding: '32px 24px' }}>
        {/* Welcome Banner */}
        <div className="welcome-banner animate-fadeIn">
          <h1>Halo, {siswaData?.nama_lengkap || 'Siswa'} 👋</h1>
          <p>Siap latihan? Pilih subtest di bawah dan mulai simulasi UTBK/SNBT seperti ujian asli.</p>
          {siswaData?.asal_sekolah && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span>🏫 {siswaData.asal_sekolah}</span>
              {siswaData.nisn && <span>📋 NISN: {siswaData.nisn}</span>}
            </div>
          )}
        </div>

        {/* Target Universitas Card */}
        {savedTarget ? (
          <div className="card animate-slideUp" style={{ marginBottom: 24, background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.08) 100%)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>🎯 Target Universitas</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{savedTarget.jurusan}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {savedTarget.univ_nama} ({savedTarget.univ_singkatan}) • {savedTarget.rumpun}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Skor terbaikmu: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(bestScore)}</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>Target: <strong style={{ color: 'var(--warning)' }}>{savedTarget.passing_grade}</strong></span>
                    </div>
                    <div className="progress-bar" style={{ height: 8 }}>
                      <div className="progress-bar-fill" style={{
                        width: `${targetProgress}%`,
                        background: targetProgress >= 100 ? 'var(--success)' : targetProgress >= 80 ? 'var(--warning)' : 'var(--brand-primary)',
                      }} />
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4, fontWeight: 700, color: targetProgress >= 100 ? 'var(--success)' : targetProgress >= 80 ? 'var(--warning)' : 'var(--brand-primary-light)' }}>
                      {targetProgress >= 100 ? '✅ Targetmu sudah tercapai! Pertahankan!' : targetProgress >= 80 ? `⚡ Hampir! Butuh ${savedTarget.passing_grade - Math.round(bestScore)} poin lagi` : `📈 Progress ${targetProgress}% — semangat!`}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-outline" onClick={() => { setTargetUnivId(savedTarget.univ_id); setTargetJurusan(savedTarget.jurusan); setShowTargetModal(true); }}>Ubah</button>
                <button className="btn btn-sm btn-ghost" onClick={removeTarget} style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="card card-interactive animate-slideUp"
            style={{ width: '100%', textAlign: 'left', marginBottom: 24, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', padding: 20 }}
            onClick={() => setShowTargetModal(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--brand-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Pilih Target Universitas & Jurusan</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Lacak progressmu menuju PTN impian</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--brand-primary-light)', fontWeight: 600, fontSize: 13 }}>Pilih →</span>
            </div>
          </button>
        )}

        {/* Quick Stats */}
        <div className="stats-grid stagger-children" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-icon blue">📝</div>
            <div><div className="stat-value">{totalSoal}</div><div className="stat-label">Total Soal</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div><div className="stat-value">{tryoutCount}</div><div className="stat-label">Tryout Selesai</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">⭐</div>
            <div><div className="stat-value">{lastScore ? Math.round(lastScore.total_skor) : '-'}</div><div className="stat-label">Skor Terakhir</div></div>
          </div>
        </div>

        {/* Section Title */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Pilih Subtest</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Klik salah satu subtest untuk mulai simulasi dengan timer</p>
        </div>

        {/* Subtest Cards */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {KATEGORI_LIST.map(k => {
              const info = KATEGORI_MAP[k];
              const count = soalCounts[k] || 0;
              return (
                <div key={k} className="subtest-card" onClick={() => count > 0 && startTryout(k)} style={{ opacity: count === 0 ? 0.5 : 1, cursor: count === 0 ? 'default' : 'pointer' }}>
                  <div className="subtest-card-icon" style={{ background: `${info.color}18` }}>{info.icon}</div>
                  <div className="subtest-card-title">{info.name}</div>
                  <div className="subtest-card-meta">{count} soal • {info.duration} menit</div>
                  {count > 0 ? <div className="subtest-card-action">Mulai Tryout →</div> : <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Belum ada soal</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Info / Pengumuman Section */}
        {infoList.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 14 }}>📣 Info & Pengumuman</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {infoList.map(item => (
                <div key={item.id} className={`siswa-info-card ${item.tipe || 'info'}`}>
                  <div className="siswa-info-title">{item.judul}</div>
                  <div className="siswa-info-body">{item.isi}</div>
                  <div className="siswa-info-date">{formatDate(item.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Belajar Section */}
        {tipsList.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 14 }}>💡 Tips Belajar</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {tipsList.map(item => (
                <div key={item.id} className="siswa-tips-card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>
                    {{ Umum: '📚', Penalaran: '🧠', Matematika: '🔢', Bahasa: '📖', Motivasi: '🔥' }[item.kategori] || '💡'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{item.judul}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.isi}</div>
                  <div style={{ marginTop: 10 }}><span className="badge badge-blue" style={{ fontSize: 10 }}>{item.kategori}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <a href="/leaderboard" className="btn btn-outline">🏆 Leaderboard</a>
          <a href="/skor" className="btn btn-outline">📈 Riwayat Skor</a>
          <a href="/profil" className="btn btn-outline">👤 Profil Saya</a>
        </div>
      </div>

      {/* Target University Modal */}
      {showTargetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowTargetModal(false)}>
          <div className="card animate-slideUp" style={{ maxWidth: 560, width: '100%', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>🎯 Pilih Target Universitas</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Pilih PTN dan jurusan impianmu</p>
              </div>
              <button onClick={() => setShowTargetModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
            </div>

            {/* Content */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              {/* Search */}
              <div className="form-group">
                <label className="form-label">Cari Universitas</label>
                <input className="form-input" placeholder="Ketik nama, singkatan, atau kota..." value={univSearch} onChange={e => setUnivSearch(e.target.value)} />
              </div>

              {/* University Selection */}
              <div className="form-group">
                <label className="form-label">Universitas</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 6 }}>
                  {filteredUniv.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setTargetUnivId(u.id); setTargetJurusan(''); }}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
                        background: targetUnivId === u.id ? 'var(--brand-primary-subtle)' : 'transparent',
                        color: targetUnivId === u.id ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                        cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{u.nama}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.singkatan} • {u.lokasi}</div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.jurusan.length} jurusan</span>
                    </button>
                  ))}
                  {filteredUniv.length === 0 && (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      Tidak ditemukan universitas yang cocok
                    </div>
                  )}
                </div>
              </div>

              {/* Jurusan Selection */}
              {selectedUniv && (
                <div className="form-group animate-fadeIn">
                  <label className="form-label">Jurusan — {selectedUniv.singkatan}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 6 }}>
                    {selectedUniv.jurusan.map(j => (
                      <button
                        key={j.nama}
                        onClick={() => setTargetJurusan(j.nama)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
                          background: targetJurusan === j.nama ? 'var(--brand-primary-subtle)' : 'transparent',
                          color: targetJurusan === j.nama ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                          cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{j.nama}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{j.rumpun}</div>
                        </div>
                        <span className="badge badge-yellow" style={{ fontSize: 10 }}>Min: {j.passing_grade}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowTargetModal(false)}>Batal</button>
              <button
                className="btn btn-primary"
                disabled={!selectedUniv || !targetJurusan}
                onClick={saveTarget}
              >
                💾 Simpan Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Pop-up Modal */}
      {activePopup && (
        <div className="modal-overlay" onClick={dismissPopup}>
          <div className="modal-content popup-preview" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={dismissPopup}>✕</button>
            {activePopup.gambar_url && (
              <img src={activePopup.gambar_url} alt="" className="popup-preview-img" />
            )}
            <h2 className="popup-preview-title">{activePopup.judul}</h2>
            <p className="popup-preview-body">{activePopup.isi}</p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={dismissPopup}>
              Mengerti 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
