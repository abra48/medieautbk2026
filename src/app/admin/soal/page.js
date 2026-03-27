'use client';
import { useState, useEffect, useRef } from 'react';
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
const KATEGORI_LIST = Object.keys(KATEGORI_MAP);

export default function AdminSoalPage() {
  const [user, setUser] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    kategori: KATEGORI_LIST[0], teks_soal: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '', kunci_jawaban: 'A', pembahasan: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const fileRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    const { data } = await supabase.from('soal').select('*').order('created_at', { ascending: false });
    setSoalList(data || []);
    setLoading(false);
  }

  function handleImage(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setFormError('Maks 5MB'); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  function startEdit(soal) {
    setEditId(soal.id);
    setForm({
      kategori: soal.kategori, teks_soal: soal.teks_soal,
      opsi_a: soal.opsi_a, opsi_b: soal.opsi_b, opsi_c: soal.opsi_c, opsi_d: soal.opsi_d, opsi_e: soal.opsi_e,
      kunci_jawaban: soal.kunci_jawaban, pembahasan: soal.pembahasan || '',
    });
    setImagePreview(soal.gambar_soal || '');
    setImageFile(null);
    setShowForm(true);
    window.scrollTo(0, 0);
  }

  function resetForm() {
    setEditId(null);
    setForm({ kategori: KATEGORI_LIST[0], teks_soal: '', opsi_a: '', opsi_b: '', opsi_c: '', opsi_d: '', opsi_e: '', kunci_jawaban: 'A', pembahasan: '' });
    setImageFile(null); setImagePreview(''); setFormError(''); setFormSuccess('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    if (!form.teks_soal || !form.opsi_a || !form.opsi_b || !form.opsi_c || !form.opsi_d || !form.opsi_e) {
      setFormError('Teks soal dan semua opsi wajib diisi'); return;
    }
    setSaving(true);
    try {
      let gambar_soal = editId ? (imagePreview && !imageFile ? imagePreview : null) : null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `soal-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('gambar-soal').upload(fileName, imageFile, { upsert: false });
        if (upErr) throw new Error('Upload gagal: ' + upErr.message);
        const { data: urlData } = supabase.storage.from('gambar-soal').getPublicUrl(fileName);
        gambar_soal = urlData.publicUrl;
      }
      const payload = { ...form, gambar_soal };
      if (editId) {
        const { error } = await supabase.from('soal').update(payload).eq('id', editId);
        if (error) throw error;
        setFormSuccess('Soal berhasil diupdate!');
      } else {
        const { error } = await supabase.from('soal').insert(payload);
        if (error) throw error;
        setFormSuccess('Soal berhasil ditambahkan!');
      }
      resetForm(); setShowForm(false); fetchData();
    } catch (err) { setFormError(err.message); }
    setSaving(false);
  }

  async function deleteSoal(id) {
    if (!confirm('Hapus soal ini?')) return;
    await supabase.from('soal').delete().eq('id', id);
    setSoalList(soalList.filter(s => s.id !== id));
  }

  let filtered = soalList;
  if (filterKategori) filtered = filtered.filter(s => s.kategori === filterKategori);
  if (searchQuery) filtered = filtered.filter(s => s.teks_soal?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="app-layout">
      <Sidebar isAdmin user={user} />
      <main className="main-content">
        <div className="page-header">
          <h1>📝 Bank Soal TO</h1>
          <p>Kelola soal tryout UTBK/SNBT per subtest</p>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children">
          <div className="stat-card">
            <div className="stat-icon blue">📝</div>
            <div><div className="stat-value">{soalList.length}</div><div className="stat-label">Total Soal</div></div>
          </div>
          {KATEGORI_LIST.slice(0, 3).map(k => (
            <div key={k} className="stat-card">
              <div className="stat-icon cyan">📦</div>
              <div>
                <div className="stat-value">{soalList.filter(s => s.kategori === k).length}</div>
                <div className="stat-label">{k}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + Search + Add */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              <button onClick={() => setFilterKategori('')} className={`btn btn-sm ${!filterKategori ? 'btn-primary' : 'btn-outline'}`}>
                Semua ({soalList.length})
              </button>
              {KATEGORI_LIST.map(k => (
                <button key={k} onClick={() => setFilterKategori(k)} className={`btn btn-sm ${filterKategori === k ? 'btn-primary' : 'btn-outline'}`} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {k} ({soalList.filter(s => s.kategori === k).length})
                </button>
              ))}
            </div>
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-primary">
              {showForm ? '✕ Tutup' : '➕ Tambah Soal'}
            </button>
          </div>
          <input className="form-input" placeholder="🔍 Cari soal..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ maxWidth: 400 }} />
        </div>

        {/* Form */}
        {showForm && (
          <div className="card animate-slideUp" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{editId ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}</h2>
            {formError && <div className="alert alert-error">⚠️ {formError}</div>}
            {formSuccess && <div className="alert alert-success">✅ {formSuccess}</div>}

            <form onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kategori / Subtest</label>
                  <select className="form-select" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                    {KATEGORI_LIST.map(k => <option key={k} value={k}>{KATEGORI_MAP[k]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kunci Jawaban</label>
                  <select className="form-select" value={form.kunci_jawaban} onChange={e => setForm({ ...form, kunci_jawaban: e.target.value })}>
                    {['A', 'B', 'C', 'D', 'E'].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teks Soal</label>
                <textarea className="form-textarea" placeholder="Tulis teks soal..." value={form.teks_soal} onChange={e => setForm({ ...form, teks_soal: e.target.value })} style={{ minHeight: 120 }} />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Gambar (opsional)</label>
                <div className={`file-upload-zone ${imagePreview ? 'active' : ''}`} onClick={() => fileRef.current?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="" style={{ maxHeight: 140, borderRadius: 8 }} />
                  ) : (
                    <div><div className="icon">📸</div><p>Klik untuk upload gambar</p></div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              </div>

              <div className="admin-options-grid">
                {['A', 'B', 'C', 'D', 'E'].map(l => (
                  <div key={l} className="option-item">
                    <span className={`option-label ${form.kunci_jawaban === l ? 'correct' : ''}`}>{l}</span>
                    <input className="form-input" placeholder={`Opsi ${l}`} value={form[`opsi_${l.toLowerCase()}`]} onChange={e => setForm({ ...form, [`opsi_${l.toLowerCase()}`]: e.target.value })} />
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Pembahasan (opsional)</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }} placeholder="Penjelasan jawaban..." value={form.pembahasan} onChange={e => setForm({ ...form, pembahasan: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <><div className="spinner-sm" /> Menyimpan...</> : editId ? '💾 Update' : '💾 Simpan'}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn btn-outline">Batal</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">📋</div>
            <h3>Belum ada soal{filterKategori ? ` untuk ${KATEGORI_MAP[filterKategori]}` : ''}</h3>
            <p>Klik "Tambah Soal" untuk mulai.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kategori</th>
                  <th>Soal</th>
                  <th>Img</th>
                  <th>Kunci</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td><span className="badge badge-blue">{s.kategori}</span></td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.teks_soal?.substring(0, 80)}...
                      </div>
                    </td>
                    <td>{s.gambar_soal ? <img src={s.gambar_soal} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td><span className="badge badge-green">{s.kunci_jawaban}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => startEdit(s)} className="btn btn-sm btn-outline" style={{ color: 'var(--warning)' }}>✏️</button>
                        <button onClick={() => deleteSoal(s.id)} className="btn btn-sm btn-danger">🗑️</button>
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
