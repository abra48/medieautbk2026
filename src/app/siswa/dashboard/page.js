'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
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

  // View state: 'home' or 'tryout'
  const [view, setView] = useState('home');

  // Target universitas state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetUnivId, setTargetUnivId] = useState('');
  const [targetJurusan, setTargetJurusan] = useState('');
  const [univSearch, setUnivSearch] = useState('');
  const [savedTarget, setSavedTarget] = useState(null);

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

    // Load saved target
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
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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
  const initials = (siswaData?.nama_lengkap || user?.email || '?').substring(0, 2).toUpperCase();

  if (authLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <main className="main-content">

        {/* ============ HOME VIEW ============ */}
        {view === 'home' && (
          <div className="animate-fadeIn">
            {/* Hero Welcome Section */}
            <div className="portal-hero">
              <div className="portal-hero-content">
                <div className="portal-hero-greeting">
                  <span className="portal-hero-badge">🎓 Selamat Datang di MEDIEA</span>
                  <h1 className="portal-hero-title">
                    Halo, {siswaData?.nama_lengkap || 'Siswa'}! 👋
                  </h1>
                  <p className="portal-hero-sub">
                    Platform simulasi UTBK/SNBT 2026 terlengkap. Latih kemampuanmu dengan soal-soal berkualitas, pantau progres skormu secara real-time, dan raih PTN impian. Akses ribuan materi pembelajaran dan simulasi ujian kapan saja, di mana saja.
                  </p>
                  <div className="portal-hero-actions">
                    <button className="btn btn-primary btn-lg portal-hero-cta" onClick={() => setView('tryout')}>
                      🚀 Mulai Tryout Sekarang
                    </button>
                    <a href="https://drive.google.com/drive/folders/1S873zLiCytxyxfXtJ-ABw_T8UMZeiRdc?usp=drive_link" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                      📚 Akses Semua Materi UTBK
                    </a>
                    <a href="/leaderboard" className="btn btn-outline btn-lg">🏆 Leaderboard</a>
                  </div>
                </div>
                <div className="portal-hero-stats-box">
                  <div className="portal-hero-stat">
                    <div className="portal-hero-stat-value">{tryoutCount}</div>
                    <div className="portal-hero-stat-label">Tryout Selesai</div>
                  </div>
                  <div className="portal-hero-stat">
                    <div className="portal-hero-stat-value">{lastScore ? Math.round(lastScore.total_skor) : '—'}</div>
                    <div className="portal-hero-stat-label">Skor Terakhir</div>
                  </div>
                  <div className="portal-hero-stat">
                    <div className="portal-hero-stat-value">{Math.round(bestScore) || '—'}</div>
                    <div className="portal-hero-stat-label">Skor Terbaik</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile & Target Row */}
            <div className="portal-profile-row">
              {/* Profile Card */}
              <div className="card portal-profile-card">
                <div className="portal-profile-header">
                  <div className="portal-profile-avatar">{initials}</div>
                  <div className="portal-profile-info">
                    <h3 className="portal-profile-name">{siswaData?.nama_lengkap || 'Belum diisi'}</h3>
                    <p className="portal-profile-email">{user?.email}</p>
                  </div>
                  <a href="/profil" className="btn btn-sm btn-ghost" title="Edit Profil">✏️</a>
                </div>
                <div className="portal-profile-details">
                  <div className="portal-profile-detail-item">
                    <span className="portal-profile-detail-icon">🏫</span>
                    <div>
                      <div className="portal-profile-detail-label">Asal Sekolah</div>
                      <div className="portal-profile-detail-value">{siswaData?.asal_sekolah || 'Belum diisi'}</div>
                    </div>
                  </div>
                  <div className="portal-profile-detail-item">
                    <span className="portal-profile-detail-icon">📋</span>
                    <div>
                      <div className="portal-profile-detail-label">NISN</div>
                      <div className="portal-profile-detail-value">{siswaData?.nisn || 'Belum diisi'}</div>
                    </div>
                  </div>
                  <div className="portal-profile-detail-item">
                    <span className="portal-profile-detail-icon">📊</span>
                    <div>
                      <div className="portal-profile-detail-label">Total Soal Tersedia</div>
                      <div className="portal-profile-detail-value">{totalSoal} soal • {KATEGORI_LIST.length} subtest</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Card */}
              <div className="card portal-target-card">
                {savedTarget ? (
                  <>
                    <div className="portal-target-header">
                      <div>
                        <div className="portal-target-label">🎯 Target Universitas</div>
                        <h3 className="portal-target-jurusan">{savedTarget.jurusan}</h3>
                        <p className="portal-target-univ">{savedTarget.univ_nama} ({savedTarget.univ_singkatan}) • {savedTarget.rumpun}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => { setTargetUnivId(savedTarget.univ_id); setTargetJurusan(savedTarget.jurusan); setShowTargetModal(true); }}>Ubah</button>
                        <button className="btn btn-sm btn-ghost" onClick={removeTarget} style={{ color: 'var(--text-muted)' }}>✕</button>
                      </div>
                    </div>
                    <div className="portal-target-progress">
                      <div className="portal-target-progress-info">
                        <span>Skor terbaik: <strong>{Math.round(bestScore)}</strong></span>
                        <span>Target: <strong style={{ color: 'var(--warning)' }}>{savedTarget.passing_grade}</strong></span>
                      </div>
                      <div className="progress-bar" style={{ height: 10 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${targetProgress}%`,
                          background: targetProgress >= 100 ? 'var(--success)' : targetProgress >= 80 ? 'var(--warning)' : 'var(--brand-primary)',
                        }} />
                      </div>
                      <div className="portal-target-verdict">
                        {targetProgress >= 100 ? '✅ Target tercapai! Pertahankan!' : targetProgress >= 80 ? `⚡ Hampir! Butuh ${savedTarget.passing_grade - Math.round(bestScore)} poin lagi` : `📈 Progress ${targetProgress}% — semangat!`}
                      </div>
                    </div>
                  </>
                ) : (
                  <button className="portal-target-empty" onClick={() => setShowTargetModal(true)}>
                    <div className="portal-target-empty-icon">🎯</div>
                    <div>
                      <div className="portal-target-empty-title">Pilih Target Universitas & Jurusan</div>
                      <div className="portal-target-empty-desc">Lacak progressmu menuju PTN impian</div>
                    </div>
                    <span className="portal-target-empty-arrow">→</span>
                  </button>
                )}
              </div>
            </div>

            {/* Info Section */}
            {infoList.length > 0 && (
              <div className="portal-section">
                <h2 className="portal-section-title">📣 Info & Pengumuman</h2>
                <div className="portal-info-list">
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

            {/* Tips Section */}
            {tipsList.length > 0 && (
              <div className="portal-section">
                <h2 className="portal-section-title">💡 Tips Belajar</h2>
                <div className="portal-tips-grid">
                  {tipsList.map(item => (
                    <div key={item.id} className="siswa-tips-card">
                      <div style={{ fontSize: 28, marginBottom: 8 }}>
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

            {/* Quick Navigation */}
            <div className="portal-section">
              <h2 className="portal-section-title">🧭 Navigasi Cepat</h2>
              <div className="portal-nav-grid">
                <button onClick={() => setView('tryout')} className="card card-interactive portal-nav-item">
                  <div className="portal-nav-icon" style={{ background: 'var(--brand-primary-subtle)' }}>🚀</div>
                  <div className="portal-nav-label">Mulai Tryout</div>
                  <div className="portal-nav-desc">Simulasi UTBK/SNBT</div>
                </button>
                <a href="/skor" className="card card-interactive portal-nav-item">
                  <div className="portal-nav-icon" style={{ background: 'var(--success-subtle)' }}>📈</div>
                  <div className="portal-nav-label">Riwayat Skor</div>
                  <div className="portal-nav-desc">Lihat perkembangan</div>
                </a>
                <a href="/leaderboard" className="card card-interactive portal-nav-item">
                  <div className="portal-nav-icon" style={{ background: 'var(--warning-subtle)' }}>🏆</div>
                  <div className="portal-nav-label">Leaderboard</div>
                  <div className="portal-nav-desc">Peringkat nasional</div>
                </a>
                <a href="/profil" className="card card-interactive portal-nav-item">
                  <div className="portal-nav-icon" style={{ background: 'var(--info-subtle)' }}>👤</div>
                  <div className="portal-nav-label">Profil Saya</div>
                  <div className="portal-nav-desc">Edit data diri</div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============ TRYOUT VIEW ============ */}
        {view === 'tryout' && (
          <div className="animate-fadeIn">
            {/* Back button */}
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setView('home')} className="btn btn-ghost" style={{ gap: 8 }}>
                ← Kembali ke Beranda
              </button>
            </div>

            <div className="page-header">
              <h1>🎯 Pilih Subtest Tryout</h1>
              <p>Pilih salah satu subtest UTBK/SNBT untuk memulai simulasi dengan timer</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid stagger-children" style={{ marginBottom: 28 }}>
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
                <div><div className="stat-value">{lastScore ? Math.round(lastScore.total_skor) : '—'}</div><div className="stat-label">Skor Terakhir</div></div>
              </div>
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
          </div>
        )}

        {/* ============ TARGET UNIVERSITY MODAL ============ */}
        {showTargetModal && (
          <div className="modal-overlay" onClick={() => setShowTargetModal(false)}>
            <div className="modal-content" style={{ maxWidth: 560, padding: 0 }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>🎯 Pilih Target Universitas</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Pilih PTN dan jurusan impianmu</p>
                </div>
                <button className="modal-close" onClick={() => setShowTargetModal(false)}>✕</button>
              </div>
              <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(85vh - 140px)' }}>
                <div className="form-group">
                  <label className="form-label">Cari Universitas</label>
                  <input className="form-input" placeholder="Ketik nama, singkatan, atau kota..." value={univSearch} onChange={e => setUnivSearch(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Universitas</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 6 }}>
                    {filteredUniv.map(u => (
                      <button key={u.id} onClick={() => { setTargetUnivId(u.id); setTargetJurusan(''); }} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
                        background: targetUnivId === u.id ? 'var(--brand-primary-subtle)' : 'transparent',
                        color: targetUnivId === u.id ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                        cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'all 150ms ease',
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{u.nama}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.singkatan} • {u.lokasi}</div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.jurusan.length} jurusan</span>
                      </button>
                    ))}
                    {filteredUniv.length === 0 && (
                      <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Tidak ditemukan</div>
                    )}
                  </div>
                </div>
                {selectedUniv && (
                  <div className="form-group animate-fadeIn">
                    <label className="form-label">Jurusan — {selectedUniv.singkatan}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 6 }}>
                      {selectedUniv.jurusan.map(j => (
                        <button key={j.nama} onClick={() => setTargetJurusan(j.nama)} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
                          background: targetJurusan === j.nama ? 'var(--brand-primary-subtle)' : 'transparent',
                          color: targetJurusan === j.nama ? 'var(--brand-primary-light)' : 'var(--text-primary)',
                          cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'all 150ms ease',
                        }}>
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
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setShowTargetModal(false)}>Batal</button>
                <button className="btn btn-primary" disabled={!selectedUniv || !targetJurusan} onClick={saveTarget}>💾 Simpan Target</button>
              </div>
            </div>
          </div>
        )}

        {/* Active Pop-up Modal */}
        {activePopup && (
          <div className="modal-overlay" onClick={dismissPopup}>
            <div className="modal-content popup-preview" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={dismissPopup}>✕</button>
              {activePopup.gambar_url && <img src={activePopup.gambar_url} alt="" className="popup-preview-img" />}
              <h2 className="popup-preview-title">{activePopup.judul}</h2>
              <p className="popup-preview-body">{activePopup.isi}</p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={dismissPopup}>Mengerti 👍</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
