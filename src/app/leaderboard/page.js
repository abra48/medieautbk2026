'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function LeaderboardPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState(null);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = '/login';
    setUser(session.user);
    setMyId(session.user.id);
    const { data: admin } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
    setIsAdmin(!!admin);
    fetchScores();
  }

  async function fetchScores() {
    const { data } = await supabase.from('skor').select('*').order('total_skor', { ascending: false }).limit(50);
    setScores(data || []);
    setLoading(false);
  }

  function getVerdict(score) {
    if (score >= 700) return { text: 'Luar Biasa', cls: 'badge-green' };
    if (score >= 550) return { text: 'Sangat Baik', cls: 'badge-blue' };
    if (score >= 400) return { text: 'Baik', cls: 'badge-yellow' };
    return { text: 'Perlu Latihan', cls: 'badge-red' };
  }

  function getRankClass(idx) {
    if (idx === 0) return 'rank-1';
    if (idx === 1) return 'rank-2';
    if (idx === 2) return 'rank-3';
    return 'rank-default';
  }

  const top3 = scores.slice(0, 3);
  const rest = scores.slice(3);
  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="app-layout">
      <Sidebar isAdmin={isAdmin} user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>🏆 Leaderboard</h1>
          <p>Skor tertinggi seluruh peserta tryout SNBT</p>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children">
          <div className="stat-card">
            <div className="stat-icon yellow">🏅</div>
            <div><div className="stat-value">{scores.length}</div><div className="stat-label">Total Entri</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">📈</div>
            <div><div className="stat-value">{scores.length > 0 ? Math.round(scores[0]?.total_skor || 0) : '-'}</div><div className="stat-label">Skor Tertinggi</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📊</div>
            <div><div className="stat-value">{scores.length > 0 ? Math.round(scores.reduce((a, b) => a + Number(b.total_skor), 0) / scores.length) : '-'}</div><div className="stat-label">Rata-rata</div></div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : scores.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">🏆</div>
            <h3>Belum ada skor</h3>
            <p>Selesaikan tryout untuk masuk leaderboard.</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <div className="podium animate-slideUp">
                {podiumOrder.map((s, ordIdx) => {
                  const actualRank = ordIdx === 0 ? 2 : ordIdx === 1 ? 1 : 3;
                  const initials = (s.nama_peserta || '?').substring(0, 2).toUpperCase();
                  return (
                    <div key={s.id} className="podium-item">
                      <div className="podium-avatar">{initials}</div>
                      <div className="podium-name">{s.nama_peserta || 'Anonim'}</div>
                      <div className="podium-score">{Math.round(s.total_skor)}</div>
                      <div className="podium-bar">
                        <span style={{ fontSize: 20, fontWeight: 800, opacity: 0.5 }}>
                          {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Table */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Peserta</th>
                    <th>Total Skor</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, idx) => {
                    const v = getVerdict(s.total_skor);
                    const isMe = s.siswa_id === myId;
                    const initials = (s.nama_peserta || '?').substring(0, 2).toUpperCase();
                    return (
                      <tr key={s.id} style={isMe ? { background: 'var(--brand-primary-subtle)' } : {}}>
                        <td><div className={`rank-badge ${getRankClass(idx)}`}>{idx + 1}</div></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar sm" style={isMe ? { background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary-light)', borderColor: 'var(--brand-primary)' } : {}}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>
                                {s.nama_peserta || 'Anonim'}
                                {isMe && <span style={{ color: 'var(--brand-primary-light)', fontSize: 11, marginLeft: 6, fontWeight: 700 }}>(Kamu)</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, fontSize: 18, color: idx < 3 ? 'var(--warning)' : 'var(--text-primary)' }}>
                            {Math.round(s.total_skor)}
                          </span>
                        </td>
                        <td><span className={`badge ${v.cls}`}>{v.text}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(s.created_at).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
