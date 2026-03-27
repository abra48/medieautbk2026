'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';

export default function AdminPopupPage() {
  const [user, setUser] = useState(null);
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', gambar_url: '', aktif: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewPopup, setPreviewPopup] = useState(null);

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
    const { data } = await supabase.from('popup').select('*').order('created_at', { ascending: false });
    setPopups(data || []);
    setLoading(false);
  }

  function resetForm() {
    setEditId(null);
    setForm({ judul: '', isi: '', gambar_url: '', aktif: true });
    setError(''); setSuccess('');
  }

  function startEdit(item) {
    setEditId(item.id);
    setForm({ judul: item.judul, isi: item.isi, gambar_url: item.gambar_url || '', aktif: item.aktif });
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.judul || !form.isi) { setError('Judul dan isi wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { judul: form.judul, isi: form.isi, gambar_url: form.gambar_url || null, aktif: form.aktif };
      if (editId) {
        const { error: err } = await supabase.from('popup').update(payload).eq('id', editId);
        if (err) throw err;
        setSuccess('Pop-up berhasil diupdate!');
      } else {
        const { error: err } = await supabase.from('popup').insert(payload);
        if (err) throw err;
        setSuccess('Pop-up berhasil ditambahkan!');
      }
      resetForm(); setShowForm(false); fetchData();
    } catch (err) { setError(err.message); }
    setSaving(false);
  }

  async function toggleAktif(item) {
    await supabase.from('popup').update({ aktif: !item.aktif }).eq('id', item.id);
    setPopups(popups.map(p => p.id === item.id ? { ...p, aktif: !p.aktif } : p));
  }

  async function handleDelete(id) {
    if (!confirm('Hapus pop-up ini?')) return;
    await supabase.from('popup').delete().eq('id', id);
    setPopups(popups.filter(p => p.id !== id));
  }

  return (
    <div className="app-layout">
      <Sidebar isAdmin user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>📢 Kelola Pop-up</h1>
          <p>Atur pop-up yang muncul di dashboard siswa</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? '✕ Tutup' : '➕ Tambah Pop-up'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card animate-slideUp" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {editId ? '✏️ Edit Pop-up' : '➕ Pop-up Baru'}
            </h2>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Judul Pop-up</label>
                <input className="form-input" placeholder="Contoh: Selamat Datang!" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Isi / Pesan</label>
                <textarea className="form-textarea" placeholder="Tuliskan pesan pop-up..." value={form.isi} onChange={e => setForm({ ...form, isi: e.target.value })} style={{ minHeight: 120 }} />
              </div>
              <div className="admin-form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">URL Gambar (opsional)</label>
                  <input className="form-input" placeholder="https://example.com/image.png" value={form.gambar_url} onChange={e => setForm({ ...form, gambar_url: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={form.aktif} onChange={e => setForm({ ...form, aktif: e.target.checked })} />
                    <span className="toggle-slider" />
                    <span className="toggle-text">{form.aktif ? 'Aktif' : 'Nonaktif'}</span>
                  </label>
                </div>
              </div>
              {form.gambar_url && (
                <div style={{ marginBottom: 16 }}>
                  <img src={form.gambar_url} alt="" style={{ maxHeight: 120, borderRadius: 8, border: '1px solid var(--border)' }} onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <><div className="spinner-sm" /> Menyimpan...</> : editId ? '💾 Update' : '💾 Simpan'}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn btn-outline">Batal</button>
                {form.judul && (
                  <button type="button" className="btn btn-ghost" onClick={() => setPreviewPopup({ judul: form.judul, isi: form.isi, gambar_url: form.gambar_url })}>
                    👁️ Preview
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : popups.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">📢</div>
            <h3>Belum ada pop-up</h3>
            <p>Buat pop-up pertama untuk siswa.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Judul</th>
                  <th>Isi</th>
                  <th>Gambar</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {popups.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, maxWidth: 180 }}>{item.judul}</td>
                    <td style={{ maxWidth: 250 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.isi?.substring(0, 60)}...
                      </div>
                    </td>
                    <td>
                      {item.gambar_url ? (
                        <img src={item.gambar_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <button className={`badge ${item.aktif ? 'badge-green' : 'badge-neutral'}`} onClick={() => toggleAktif(item)} style={{ cursor: 'pointer', border: 'none' }}>
                        {item.aktif ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setPreviewPopup(item)} className="btn btn-sm btn-ghost" title="Preview">👁️</button>
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

        {/* Preview Modal */}
        {previewPopup && (
          <div className="modal-overlay" onClick={() => setPreviewPopup(null)}>
            <div className="modal-content popup-preview" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setPreviewPopup(null)}>✕</button>
              {previewPopup.gambar_url && (
                <img src={previewPopup.gambar_url} alt="" className="popup-preview-img" />
              )}
              <h2 className="popup-preview-title">{previewPopup.judul}</h2>
              <p className="popup-preview-body">{previewPopup.isi}</p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setPreviewPopup(null)}>
                Mengerti 👍
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
