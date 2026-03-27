'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [sekolah, setSekolah] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      const { data: admin } = await supabase.from('admin').select('id').eq('id', data.user.id).single();
      window.location.href = admin ? '/admin/dashboard' : '/siswa/dashboard';
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      if (data.user) {
        await supabase.from('siswa').insert({
          id: data.user.id,
          nama_lengkap: nama || email.split('@')[0],
          nisn: nisn,
          asal_sekolah: sekolah,
        });
      }
      setSuccess('Akun berhasil dibuat! Cek email untuk konfirmasi, lalu login.');
      setIsRegister(false);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (err) throw err;
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />
      </div>

      <div className="login-container animate-fadeIn">
        {/* Logo & Header */}
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon"><img src="https://cdn.phototourl.com/free/2026-03-27-2dee9557-ff89-4c80-ad48-83650d00521a.png" alt="MEDIEA" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /></div>
          </div>
          <h1>{isRegister ? 'Daftar Akun Baru' : 'Masuk ke MEDIEA'}</h1>
          <p>{isRegister ? 'Buat akun siswa untuk mulai simulasi' : 'Simulasi UTBK/SNBT 2026'}</p>
        </div>

        {/* Card */}
        <div className="login-card">
          {/* Tab Switcher */}
          <div className="login-tabs">
            <button
              className={`login-tab ${!isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(false); setError(''); }}
            >
              Masuk
            </button>
            <button
              className={`login-tab ${isRegister ? 'active' : ''}`}
              onClick={() => { setIsRegister(true); setError(''); }}
            >
              Daftar
            </button>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="google-btn"
          >
            {googleLoading ? (
              <div className="spinner-sm" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span>atau</span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" className="form-input" placeholder="Ahmad Fauzi" value={nama} onChange={e => setNama(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">NISN</label>
                    <input type="text" className="form-input" placeholder="0012345678" value={nisn} onChange={e => setNisn(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Asal Sekolah</label>
                    <input type="text" className="form-input" placeholder="SMAN 1 Makassar" value={sekolah} onChange={e => setSekolah(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="email@contoh.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: 44 }}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={6}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
                >
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
              {loading ? <><div className="spinner-sm" /> Memproses...</> : isRegister ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="login-footer">© 2026 MEDIEA SYSTEM — Simulasi UTBK/SNBT</p>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .login-bg { position: absolute; inset: 0; pointer-events: none; }
        .login-bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
        .login-bg-orb-1 { width: 400px; height: 400px; background: rgba(59,130,246,0.15); top: -10%; right: -5%; animation: float1 12s ease-in-out infinite; }
        .login-bg-orb-2 { width: 300px; height: 300px; background: rgba(99,102,241,0.12); bottom: -5%; left: -5%; animation: float2 15s ease-in-out infinite; }
        .login-bg-orb-3 { width: 200px; height: 200px; background: rgba(16,185,129,0.1); top: 50%; left: 50%; animation: float3 10s ease-in-out infinite; }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,30px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }
        @keyframes float3 { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.2); } }
        .login-container { width: 100%; max-width: 420px; position: relative; z-index: 1; }
        .login-header { text-align: center; margin-bottom: 28px; }
        .login-logo { display: inline-flex; margin-bottom: 16px; }
        .login-logo-icon { width: 52px; height: 52px; border-radius: 16px; background: var(--brand-gradient); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 22px; box-shadow: 0 8px 24px rgba(59,130,246,0.3); }
        .login-header h1 { font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
        .login-header p { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
        .login-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 28px; box-shadow: var(--shadow-lg); backdrop-filter: blur(12px); }
        .login-tabs { display: flex; gap: 4px; background: var(--bg-input); padding: 4px; border-radius: var(--radius-md); margin-bottom: 24px; }
        .login-tab { flex: 1; padding: 10px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 200ms ease; background: transparent; color: var(--text-muted); }
        .login-tab.active { background: var(--brand-primary); color: #fff; box-shadow: 0 2px 8px rgba(59,130,246,0.3); }
        .login-tab:not(.active):hover { color: var(--text-primary); }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms ease;
          font-family: inherit;
        }
        .google-btn:hover:not(:disabled) {
          background: var(--bg-surface-hover);
          border-color: var(--border-hover);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .login-divider span {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .login-footer { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 24px; opacity: 0.7; }
      `}</style>
    </div>
  );
}
