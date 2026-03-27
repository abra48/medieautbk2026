'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

const TIPE_OPTIONS = [
  { value: 'info', label: 'ℹ️ Info', badge: 'badge-blue' },
  { value: 'warning', label: '⚠️ Peringatan', badge: 'badge-yellow' },
  { value: 'success', label: '✅ Sukses', badge: 'badge-green' },
];

export default function AdminInfoPage() {
  const [user, setUser] = useState(null);
  const [infoList, setInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', tipe: 'info', aktif: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    const { data } = await supabase.from('info').select('*').order('created_at', { ascending: false });
    setInfoList(data || []);
    setLoading(false);
  }

  function resetForm() {
    setEditId(null);
    setForm({ judul: '', isi: '', tipe: 'info', aktif: true });
    setError(''); setSuccess('');
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({ judul: item.judul, isi: item.isi, tipe: item.tipe || 'info', aktif: item.aktif });
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.judul || !form.isi) { setError('Judul dan isi wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { judul: form.judul, isi: form.isi, tipe: form.tipe, aktif: form.aktif };
      if (editId) {
        const { error: err } = await supabase.from('info').update(payload).eq('id', editId);
        if (err) throw err;
        setSuccess('Info berhasil diupdate!');
      } else {
        const { error: err } = await supabase.from('info').insert(payload);
        if (err) throw err;
        setSuccess('Info berhasil dikirim!');
      }
      resetForm(); setShowForm(false); fetchData();
    } catch (err) { setError(err.message); }
    setSaving(false);
  }

  async function toggleAktif(item) {
    await supabase.from('info').update({ aktif: !item.aktif }).eq('id', item.id);
    setInfoList(infoList.map(i => i.id === item.id ? { ...i, aktif: !i.aktif } : i));
  }

  async function handleDelete(id) {
    if (!confirm('Hapus info ini?')) return;
    await supabase.from('info').delete().eq('id', id);
    setInfoList(infoList.filter(i => i.id !== id));
  }

  function getBadgeClass(tipe) {
    return TIPE_OPTIONS.find(t => t.value === tipe)?.badge || 'badge-blue';
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="app-layout">
      <Sidebar isAdmin user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>📣 Kirim Info</h1>
          <p>Broadcast pengumuman dan informasi ke seluruh siswa</p>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon blue">📣</div>
            <div><div className="stat-value">{infoList.length}</div><div className="stat-label">Total Info</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div><div className="stat-value">{infoList.filter(i => i.aktif).length}</div><div className="stat-label">Aktif</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">🚫</div>
            <div><div className="stat-value">{infoList.filter(i => !i.aktif).length}</div><div className="stat-label">Nonaktif</div></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? '✕ Tutup' : '➕ Kirim Info Baru'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card animate-slideUp" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editId ? '✏️ Edit Info' : '📣 Info Baru'}
            </h2>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Judul</label>
                  <input className="form-input" placeholder="Contoh: Jadwal Tryout Batch 3" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipe</label>
                  <select className="form-select" value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })}>
                    {TIPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Isi Pesan</label>
                <textarea className="form-textarea" placeholder="Tulis pengumuman / info untuk siswa..." value={form.isi} onChange={e => setForm({ ...form, isi: e.target.value })} style={{ minHeight: 120 }} />
              </div>
              <div className="form-group">
                <label className="toggle-switch">
                  <input type="checkbox" checked={form.aktif} onChange={e => setForm({ ...form, aktif: e.target.checked })} />
                  <span className="toggle-slider" />
                  <span className="toggle-text">{form.aktif ? 'Langsung Aktif' : 'Simpan sebagai Draft'}</span>
                </label>
              </div>

              {/* Preview */}
              {form.judul && (
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Preview</label>
                  <div className={`alert alert-${form.tipe}`}>
                    <strong>{form.judul}</strong> — {form.isi?.substring(0, 80)}{form.isi?.length > 80 ? '...' : ''}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <><div className="spinner-sm" /> Mengirim...</> : editId ? '💾 Update' : '📨 Kirim'}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn btn-outline">Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : infoList.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">📣</div>
            <h3>Belum ada info</h3>
            <p>Kirim info pertama untuk siswa.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Judul</th>
                  <th>Tipe</th>
                  <th>Isi</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {infoList.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, maxWidth: 160 }}>{item.judul}</td>
                    <td><span className={`badge ${getBadgeClass(item.tipe)}`}>{item.tipe?.toUpperCase()}</span></td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.isi?.substring(0, 50)}...
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                    <td>
                      <button className={`badge ${item.aktif ? 'badge-green' : 'badge-neutral'}`} onClick={() => toggleAktif(item)} style={{ cursor: 'pointer', border: 'none' }}>
                        {item.aktif ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => startEdit(item)} className="btn btn-sm btn-outline" style={{ color: 'var(--warning)' }}>✏️</button>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">🗑️</button>
                      </div>
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
