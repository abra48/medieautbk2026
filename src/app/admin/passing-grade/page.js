'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function PassingGradePage() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ universitas: '', jurusan: '', skor_minimal: '', tahun: 2026 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return window.location.href = '/login';
    const { data: admin } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
    if (!admin) return window.location.href = '/profil';
    setUser(session.user);
    fetchData();
  }

  async function fetchData() {
    const { data } = await supabase.from('passing_grade').select('*').order('universitas');
    setData(data || []);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!form.universitas || !form.jurusan || !form.skor_minimal) return setError('Semua field wajib diisi');
    setSaving(true);
    const { error: err } = await supabase.from('passing_grade').insert({
      universitas: form.universitas, jurusan: form.jurusan,
      skor_minimal: Number(form.skor_minimal), tahun: Number(form.tahun),
    });
    if (err) { setError(err.message); setSaving(false); return; }
    setForm({ universitas: '', jurusan: '', skor_minimal: '', tahun: 2026 });
    setShowForm(false); setSaving(false); fetchData();
  }

  async function handleDelete(id) {
    if (!confirm('Hapus data passing grade ini?')) return;
    await supabase.from('passing_grade').delete().eq('id', id);
    setData(data.filter(d => d.id !== id));
  }

  return (
    <div className="app-layout">
      <Sidebar isAdmin user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>🎯 Passing Grade PTN</h1>
          <p>Kelola skor minimal untuk lolos per jurusan</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Tutup' : '➕ Tambah Data'}
          </button>
        </div>

        {showForm && (
          <div className="card animate-slideUp" style={{ marginBottom: 24 }}>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Universitas</label>
                  <input className="form-input" placeholder="Contoh: Universitas Indonesia" value={form.universitas} onChange={e => setForm({ ...form, universitas: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Jurusan</label>
                  <input className="form-input" placeholder="Contoh: Teknik Informatika" value={form.jurusan} onChange={e => setForm({ ...form, jurusan: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Skor Minimal</label>
                  <input className="form-input" type="number" placeholder="Contoh: 650" value={form.skor_minimal} onChange={e => setForm({ ...form, skor_minimal: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tahun</label>
                  <input className="form-input" type="number" value={form.tahun} onChange={e => setForm({ ...form, tahun: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><div className="spinner-sm" /> Menyimpan...</> : '💾 Simpan'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : data.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">🎯</div>
            <h3>Belum ada data passing grade</h3>
            <p>Tambahkan data skor minimal per jurusan PTN.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Universitas</th>
                  <th>Jurusan</th>
                  <th>Skor Minimal</th>
                  <th>Tahun</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.universitas}</td>
                    <td>{item.jurusan}</td>
                    <td><span className="badge badge-yellow">{item.skor_minimal}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.tahun}</td>
                    <td>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
