'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function SkorPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scores, setScores] = useState([]);
  const [passingGrades, setPassingGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = '/login';
    setUser(session.user);
    const { data: admin } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
    setIsAdmin(!!admin);

    const { data: myScores } = await supabase
      .from('skor').select('*').eq('siswa_id', session.user.id)
      .order('created_at', { ascending: false });
    setScores(myScores || []);

    const { data: pg } = await supabase.from('passing_grade').select('*').order('universitas');
    setPassingGrades(pg || []);
    setLoading(false);
  }

  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => Number(s.total_skor))) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + Number(b.total_skor), 0) / scores.length) : 0;

  function getVerdict(score) {
    if (score >= 700) return { text: 'Luar Biasa', cls: 'badge-green', emoji: '🌟' };
    if (score >= 550) return { text: 'Sangat Baik', cls: 'badge-blue', emoji: '🎯' };
    if (score >= 400) return { text: 'Baik', cls: 'badge-yellow', emoji: '📈' };
    return { text: 'Perlu Latihan', cls: 'badge-red', emoji: '💪' };
  }

  function checkChance(pg) {
    if (bestScore >= pg.skor_minimal) return { text: 'Peluang Tinggi', cls: 'badge-green', icon: '✅' };
    if (bestScore >= pg.skor_minimal * 0.9) return { text: 'Hampir', cls: 'badge-yellow', icon: '⚡' };
    return { text: 'Perlu Usaha', cls: 'badge-red', icon: '❌' };
  }

  return (
    <div className="app-layout">
      <Sidebar isAdmin={isAdmin} user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>📈 Riwayat Skor</h1>
          <p>Lacak perkembangan skormu dan cek peluang lolos PTN</p>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children">
          <div className="stat-card">
            <div className="stat-icon green">🏅</div>
            <div><div className="stat-value">{Math.round(bestScore)}</div><div className="stat-label">Skor Terbaik</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📊</div>
            <div><div className="stat-value">{avgScore}</div><div className="stat-label">Rata-rata</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">🔄</div>
            <div><div className="stat-value">{scores.length}</div><div className="stat-label">Total Tryout</div></div>
          </div>
        </div>

        {/* Score Progress Chart (CSS-based) */}
        {scores.length >= 2 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>
              📊 Progres Skor
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
              {scores.slice().reverse().slice(-10).map((s, idx) => {
                const maxScore = 1000;
                const pct = Math.max(5, (Number(s.total_skor) / maxScore) * 100);
                const v = getVerdict(s.total_skor);
                return (
                  <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{Math.round(s.total_skor)}</span>
                    <div style={{
                      width: '100%', height: `${pct}%`, borderRadius: '4px 4px 0 0',
                      background: Number(s.total_skor) >= 700 ? 'var(--success)' : Number(s.total_skor) >= 400 ? 'var(--brand-primary)' : 'var(--warning)',
                      opacity: 0.7, minHeight: 6, transition: 'height 0.5s ease',
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              {scores.length > 10 ? 'Menampilkan 10 tryout terakhir' : `${scores.length} tryout`}
            </div>
          </div>
        )}

        {/* Passing Grade Comparison */}
        {passingGrades.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              🎯 Cek Peluang Lolos PTN
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Berdasarkan skor terbaikmu ({Math.round(bestScore)}):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {passingGrades.map(pg => {
                const chance = checkChance(pg);
                const progressPct = Math.min(100, Math.round((bestScore / pg.skor_minimal) * 100));
                return (
                  <div key={pg.id} style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{pg.jurusan}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pg.universitas} • Min: {pg.skor_minimal}</div>
                      </div>
                      <span className={`badge ${chance.cls}`}>{chance.icon} {chance.text}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{
                        width: `${progressPct}%`,
                        background: progressPct >= 100 ? 'var(--success)' : progressPct >= 90 ? 'var(--warning)' : 'var(--danger)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Score Table */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : scores.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">📋</div>
            <h3>Belum ada riwayat tryout</h3>
            <p>Selesaikan tryout untuk melihat skor di sini.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Total Skor</th>
                  <th>Status</th>
                  <th>Detail</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, idx) => {
                  const v = getVerdict(s.total_skor);
                  const detail = s.detail_subtest || {};
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 18 }}>
                          {v.emoji} {Math.round(s.total_skor)}
                        </span>
                      </td>
                      <td><span className={`badge ${v.cls}`}>{v.text}</span></td>
                      <td>
                        {Object.keys(detail).length > 0 ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {Object.entries(detail).map(([key, val]) => (
                              <span key={key} className="badge badge-neutral" style={{ fontSize: 10 }}>
                                {key}: {Math.round(val)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(s.created_at).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
