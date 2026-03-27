'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

const KATEGORI_OPTIONS = ['Umum', 'Penalaran', 'Matematika', 'Bahasa', 'Motivasi'];

export default function AdminTipsPage() {
  const [user, setUser] = useState(null);
  const [tipsList, setTipsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', kategori: 'Umum', aktif: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return (window.location.href = '/login');
    const { data: admin } = await supabase.from('admin').select('id').eq('id', session.user.id).single();
    if (!admin) return (window.location.href = '/siswa/dashboard');
    setUser(session.user);
    fetchData();
  }

  async function fetchData() {
    const { data } = await supabase.from('tips').select('*').order('created_at', { ascending: false });
    setTipsList(data || []);
    setLoading(false);
  }

  function resetForm() {
    setEditId(null);
    setForm({ judul: '', isi: '', kategori: 'Umum', aktif: true });
    setError(''); setSuccess('');
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({ judul: item.judul, isi: item.isi, kategori: item.kategori || 'Umum', aktif: item.aktif });
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.judul || !form.isi) { setError('Judul dan isi wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { judul: form.judul, isi: form.isi, kategori: form.kategori, aktif: form.aktif };
      if (editId) {
        const { error: err } = await supabase.from('tips').update(payload).eq('id', editId);
        if (err) throw err;
        setSuccess('Tips berhasil diupdate!');
      } else {
        const { error: err } = await supabase.from('tips').insert(payload);
        if (err) throw err;
        setSuccess('Tips berhasil ditambahkan!');
      }
      resetForm(); setShowForm(false); fetchData();
    } catch (err) { setError(err.message); }
    setSaving(false);
  }

  async function toggleAktif(item) {
    await supabase.from('tips').update({ aktif: !item.aktif }).eq('id', item.id);
    setTipsList(tipsList.map(t => t.id === item.id ? { ...t, aktif: !t.aktif } : t));
  }

  async function handleDelete(id) {
    if (!confirm('Hapus tips ini?')) return;
    await supabase.from('tips').delete().eq('id', id);
    setTipsList(tipsList.filter(t => t.id !== id));
  }

  const KATEGORI_EMOJI = { Umum: '📚', Penalaran: '🧠', Matematika: '🔢', Bahasa: '📖', Motivasi: '🔥' };

  const filtered = filterKategori ? tipsList.filter(t => t.kategori === filterKategori) : tipsList;

  return (
    <div className="app-layout">
      <Sidebar isAdmin user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>💡 Tips Belajar</h1>
          <p>Kelola tips dan trik belajar untuk siswa</p>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon yellow">💡</div>
            <div><div className="stat-value">{tipsList.length}</div><div className="stat-label">Total Tips</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div><div className="stat-value">{tipsList.filter(t => t.aktif).length}</div><div className="stat-label">Aktif</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan">📦</div>
            <div><div className="stat-value">{KATEGORI_OPTIONS.length}</div><div className="stat-label">Kategori</div></div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setFilterKategori('')} className={`btn btn-sm ${!filterKategori ? 'btn-primary' : 'btn-outline'}`}>
              Semua ({tipsList.length})
            </button>
            {KATEGORI_OPTIONS.map(k => (
              <button key={k} onClick={() => setFilterKategori(k)} className={`btn btn-sm ${filterKategori === k ? 'btn-primary' : 'btn-outline'}`}>
                {KATEGORI_EMOJI[k]} {k} ({tipsList.filter(t => t.kategori === k).length})
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? '✕ Tutup' : '➕ Tambah Tips'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card animate-slideUp" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editId ? '✏️ Edit Tips' : '💡 Tips Baru'}
            </h2>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Judul Tips</label>
                  <input className="form-input" placeholder="Contoh: Cara Cepat Menghafal Rumus" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select className="form-select" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                    {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{KATEGORI_EMOJI[k]} {k}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Isi Tips</label>
                <textarea className="form-textarea" placeholder="Tulis tips lengkap untuk siswa..." value={form.isi} onChange={e => setForm({ ...form, isi: e.target.value })} style={{ minHeight: 140 }} />
              </div>
              <div className="form-group">
                <label className="toggle-switch">
                  <input type="checkbox" checked={form.aktif} onChange={e => setForm({ ...form, aktif: e.target.checked })} />
                  <span className="toggle-slider" />
                  <span className="toggle-text">{form.aktif ? 'Langsung Tampil' : 'Simpan sebagai Draft'}</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <><div className="spinner-sm" /> Menyimpan...</> : editId ? '💾 Update' : '💾 Simpan'}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn btn-outline">Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Tips Cards Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">💡</div>
            <h3>Belum ada tips{filterKategori ? ` kategori ${filterKategori}` : ''}</h3>
            <p>Tambahkan tips belajar untuk siswa.</p>
          </div>
        ) : (
          <div className="tips-admin-grid">
            {filtered.map((item) => (
              <div key={item.id} className="card tips-admin-card">
                <div className="tips-admin-card-header">
                  <span className="tips-admin-emoji">{KATEGORI_EMOJI[item.kategori] || '📚'}</span>
                  <span className={`badge ${item.aktif ? 'badge-green' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                    {item.aktif ? 'Aktif' : 'Draft'}
                  </span>
                </div>
                <h3 className="tips-admin-card-title">{item.judul}</h3>
                <p className="tips-admin-card-body">{item.isi?.substring(0, 100)}{item.isi?.length > 100 ? '...' : ''}</p>
                <div className="tips-admin-card-footer">
                  <span className="badge badge-blue" style={{ fontSize: 10 }}>{item.kategori}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => toggleAktif(item)} className="btn btn-sm btn-ghost" title={item.aktif ? 'Nonaktifkan' : 'Aktifkan'}>
                      {item.aktif ? '🚫' : '✅'}
                    </button>
                    <button onClick={() => startEdit(item)} className="btn btn-sm btn-ghost" style={{ color: 'var(--warning)' }}>✏️</button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
