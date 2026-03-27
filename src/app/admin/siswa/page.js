'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

const KATEGORI_MAP = {
  PU: 'Penalaran Umum',
  PBM: 'Pemahaman Bacaan & Menulis',
  PPU: 'Pengetahuan & Pemahaman Umum',
  PK: 'Pengetahuan Kuantitatif',
  LIT_INDO: 'Literasi Bahasa Indonesia',
  LIT_ING: 'Literasi Bahasa Inggris',
  PM: 'Penalaran Matematika',
};

export default function AdminSiswaPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siswaList, setSiswaList] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [skorData, setSkorData] = useState([]);
  const [skorLoading, setSkorLoading] = useState(false);
  const [totalSkorCount, setTotalSkorCount] = useState(0);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return (window.location.href = '/login');
    const { data: admin } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
    if (!admin) return (window.location.href = '/siswa/dashboard');
    setUser(session.user);
    await fetchSiswa();
    // Fetch total skor count
    const { count } = await supabase.from('skor').select('*', { count: 'exact', head: true });
    setTotalSkorCount(count || 0);
    setLoading(false);
  }

  async function fetchSiswa() {
    const { data, error } = await supabase
      .from('siswa')
      .select('id, nama_lengkap, asal_sekolah, nisn, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching siswa:', error);
      return;
    }
    setSiswaList(data || []);
  }

  async function viewSiswaDetail(siswa) {
    setSelectedSiswa(siswa);
    setSkorLoading(true);
    const { data: scores, error } = await supabase
      .from('skor')
      .select('*')
      .eq('siswa_id', siswa.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching skor:', error);
    }
    setSkorData(scores || []);
    setSkorLoading(false);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Filter & sort
  const filtered = siswaList
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (s.nama_lengkap || '').toLowerCase().includes(q) ||
             (s.asal_sekolah || '').toLowerCase().includes(q) ||
             (s.nisn || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (sortDir === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  }

  // Calculate average skor for selected siswa
  const avgSkor = skorData.length > 0
    ? Math.round(skorData.reduce((sum, s) => sum + (s.total_skor || 0), 0) / skorData.length)
    : 0;
  const bestSkor = skorData.length > 0
    ? Math.round(Math.max(...skorData.map(s => s.total_skor || 0)))
    : 0;

  return (
    <div className="app-layout">
      <Sidebar isAdmin user={user} />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <h1>👥 Monitoring Siswa</h1>
          <p>Pantau semua siswa yang terdaftar di MEDIEA dan riwayat tryout mereka</p>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div><div className="stat-value">{siswaList.length}</div><div className="stat-label">Total Siswa</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">🏫</div>
            <div><div className="stat-value">{new Set(siswaList.map(s => s.asal_sekolah).filter(Boolean)).size}</div><div className="stat-label">Sekolah</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan">📊</div>
            <div><div className="stat-value">{totalSkorCount}</div><div className="stat-label">Total Tryout</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">📅</div>
            <div>
              <div className="stat-value">
                {siswaList.filter(s => {
                  const d = new Date(s.created_at);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <div className="stat-label">Siswa Baru (Bulan Ini)</div>
            </div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <input
                className="form-input"
                placeholder="🔍 Cari nama, sekolah, atau NISN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 16 }}
              />
            </div>
            <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
              <option value="created_at">Tanggal Daftar</option>
              <option value="nama_lengkap">Nama</option>
              <option value="asal_sekolah">Asal Sekolah</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
              {sortDir === 'asc' ? '↑ A–Z' : '↓ Z–A'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { fetchSiswa(); }} title="Refresh">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Nama Lengkap</th>
                  <th style={thStyle}>NISN</th>
                  <th style={thStyle}>Asal Sekolah</th>
                  <th style={thStyle}>Tgl Daftar</th>
                  <th style={thStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      {search ? 'Tidak ada siswa yang cocok dengan pencarian' : 'Belum ada siswa terdaftar'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms ease' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--brand-primary-subtle)', color: 'var(--brand-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>
                            {(s.nama_lengkap || '?').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.nama_lengkap || 'Belum diisi'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{s.nisn || '-'}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: 'var(--text-secondary)' }}>{s.asal_sekolah || '-'}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(s.created_at)}</span>
                      </td>
                      <td style={tdStyle}>
                        <button className="btn btn-sm btn-outline" onClick={() => viewSiswaDetail(s)}>
                          📊 Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Menampilkan {filtered.length} dari {siswaList.length} siswa</span>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedSiswa && (
          <div className="modal-overlay" onClick={() => setSelectedSiswa(null)}>
            <div className="modal-content" style={{ maxWidth: 680, padding: 0 }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>📋 Detail Siswa</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{selectedSiswa.nama_lengkap}</p>
                </div>
                <button className="modal-close" onClick={() => setSelectedSiswa(null)}>✕</button>
              </div>

              <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(85vh - 140px)' }}>
                {/* Profile Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Lengkap</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{selectedSiswa.nama_lengkap || '-'}</div>
                  </div>
                  <div className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>NISN</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4, fontFamily: 'monospace' }}>{selectedSiswa.nisn || '-'}</div>
                  </div>
                  <div className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asal Sekolah</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{selectedSiswa.asal_sekolah || '-'}</div>
                  </div>
                  <div className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal Daftar</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{formatDate(selectedSiswa.created_at)}</div>
                  </div>
                </div>

                {/* Skor Summary */}
                {!skorLoading && skorData.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-primary)' }}>{skorData.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Total Tryout</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{bestSkor}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Skor Terbaik</div>
                    </div>
                    <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>{avgSkor}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Rata-rata</div>
                    </div>
                  </div>
                )}

                {/* Skor History */}
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📊 Riwayat Tryout</h3>
                {skorLoading ? (
                  <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" /></div>
                ) : skorData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    Siswa ini belum mengerjakan tryout
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
                    {skorData.map((skor, i) => (
                      <div key={skor.id || i} style={{
                        padding: '14px 18px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: skor.detail_subtest ? 10 : 0 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                              {skor.nama_peserta || 'Tryout'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {formatDate(skor.created_at)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: (skor.total_skor || 0) >= 700 ? 'var(--success)' : (skor.total_skor || 0) >= 400 ? 'var(--warning)' : 'var(--danger)' }}>
                              {Math.round(skor.total_skor || skor.skor || 0)}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>skor total</div>
                          </div>
                        </div>
                        {/* Subtest breakdown if available */}
                        {skor.detail_subtest && typeof skor.detail_subtest === 'object' && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                            {Object.entries(skor.detail_subtest).map(([key, val]) => (
                              <div key={key} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: val >= 700 ? 'var(--success)' : val >= 400 ? 'var(--warning)' : 'var(--danger)' }}>{val}</div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{key}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setSelectedSiswa(null)}>Tutup</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        table th, table td { text-align: left; }
        table tr:hover { background: var(--bg-surface-hover); }
      `}</style>
    </div>
  );
}

const thStyle = {
  padding: '12px 16px',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '12px 16px',
  whiteSpace: 'nowrap',
};
