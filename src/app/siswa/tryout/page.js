'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

const KATEGORI_MAP = {
  PU: { name: 'Penalaran Umum', duration: 30 },
  PBM: { name: 'Pemahaman Bacaan & Menulis', duration: 25 },
  PPU: { name: 'Pengetahuan & Pemahaman Umum', duration: 20 },
  PK: { name: 'Pengetahuan Kuantitatif', duration: 35 },
  LIT_INDO: { name: 'Literasi Bahasa Indonesia', duration: 25 },
  LIT_ING: { name: 'Literasi Bahasa Inggris', duration: 25 },
  PM: { name: 'Penalaran Matematika', duration: 30 },
};

function TryoutContent() {
  const { user, loading: authLoading, siswaData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subtest = searchParams.get('subtest') || 'PU';
  const subtestInfo = KATEGORI_MAP[subtest] || KATEGORI_MAP.PU;

  // States
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(subtestInfo.duration * 60);
  const [phase, setPhase] = useState('exam'); // 'exam' | 'confirm' | 'result'
  const [showNav, setShowNav] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Fetch soal
  useEffect(() => {
    if (!user) return;
    fetchSoal();
  }, [user]);

  async function fetchSoal() {
    const { data } = await supabase
      .from('soal')
      .select('*')
      .eq('kategori', subtest)
      .order('created_at');
    setSoalList(data || []);
    setLoading(false);
    startTimeRef.current = Date.now();
  }

  // Timer
  useEffect(() => {
    if (phase !== 'exam' || loading || soalList.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, loading, soalList.length]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function selectAnswer(label) {
    setAnswers({ ...answers, [currentIdx]: label });
  }

  function toggleFlag() {
    setFlags({ ...flags, [currentIdx]: !flags[currentIdx] });
  }

  function goToSoal(idx) {
    setCurrentIdx(idx);
    setShowNav(false);
  }

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!autoSubmit && phase === 'exam') {
      setPhase('confirm');
      clearInterval(timerRef.current);
      return;
    }

    setPhase('result');
    clearInterval(timerRef.current);

    // Calculate score
    let correct = 0;
    soalList.forEach((soal, idx) => {
      if (answers[idx] === soal.kunci_jawaban) correct++;
    });

    const totalSkor = soalList.length > 0 ? Math.round((correct / soalList.length) * 1000) : 0;
    const elapsedMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);

    // Save score
    if (user) {
      await supabase.from('skor').insert({
        siswa_id: user.id,
        nama_peserta: siswaData?.nama_lengkap || user.email?.split('@')[0] || 'Anonim',
        total_skor: totalSkor,
        detail_subtest: { [subtest]: totalSkor },
      });
    }
  }, [phase, soalList, answers, user, siswaData, subtest]);

  function cancelSubmit() {
    setPhase('exam');
    // Restart timer from where it was
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memuat soal {subtestInfo.name}...</p>
      </div>
    );
  }

  // No soal
  if (soalList.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Belum ada soal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Admin belum menambahkan soal untuk subtest {subtestInfo.name}.</p>
        <button className="btn btn-primary" onClick={() => router.push('/siswa/dashboard')}>← Kembali</button>
      </div>
    );
  }

  const currentSoal = soalList[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const timerClass = timeLeft <= 60 ? 'danger' : timeLeft <= 300 ? 'warning' : '';

  // === CONFIRM SCREEN ===
  if (phase === 'confirm') {
    const unanswered = soalList.length - answeredCount;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card animate-slideUp" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Kumpulkan Jawaban?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Pastikan kamu sudah yakin dengan semua jawabanmu.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{answeredCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Dijawab</div>
            </div>
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: unanswered > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{unanswered}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Belum</div>
            </div>
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: flaggedCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{flaggedCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Ditandai</div>
            </div>
          </div>

          {unanswered > 0 && (
            <div className="alert alert-warning" style={{ justifyContent: 'center', marginBottom: 20 }}>
              ⚠️ Masih ada {unanswered} soal belum dijawab!
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={cancelSubmit}>
              ← Kembali
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSubmit(true)}>
              Kumpulkan ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === RESULT SCREEN ===
  if (phase === 'result') {
    let correct = 0;
    soalList.forEach((soal, idx) => {
      if (answers[idx] === soal.kunci_jawaban) correct++;
    });
    const totalSkor = soalList.length > 0 ? Math.round((correct / soalList.length) * 1000) : 0;
    const percentage = soalList.length > 0 ? Math.round((correct / soalList.length) * 100) : 0;

    let verdict, verdictColor;
    if (totalSkor >= 700) { verdict = '🌟 Luar Biasa!'; verdictColor = 'var(--success)'; }
    else if (totalSkor >= 550) { verdict = '🎯 Sangat Baik!'; verdictColor = 'var(--brand-primary-light)'; }
    else if (totalSkor >= 400) { verdict = '📈 Baik'; verdictColor = 'var(--warning)'; }
    else { verdict = '💪 Perlu Latihan'; verdictColor = 'var(--danger)'; }

    return (
      <div style={{ minHeight: '100vh', padding: 24 }}>
        <div className="container-xl" style={{ maxWidth: 800 }}>
          {/* Score Summary */}
          <div className="card animate-slideUp" style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Hasil — {subtestInfo.name}
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, color: verdictColor, lineHeight: 1.1, marginBottom: 8 }}>
              {totalSkor}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: verdictColor, marginBottom: 16 }}>{verdict}</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{correct}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Benar</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{soalList.length - correct}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Salah</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800 }}>{percentage}%</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Akurasi</div></div>
            </div>

            <div className="progress-bar" style={{ height: 8, maxWidth: 300, margin: '0 auto 24px' }}>
              <div className="progress-bar-fill" style={{ width: `${percentage}%`, background: percentage >= 70 ? 'var(--success)' : percentage >= 50 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => router.push('/siswa/dashboard')}>
                ← Kembali ke Dashboard
              </button>
              <button className="btn btn-outline" onClick={() => router.push('/skor')}>
                📈 Lihat Riwayat
              </button>
            </div>
          </div>

          {/* Pembahasan per soal */}
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Pembahasan Soal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {soalList.map((soal, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === soal.kunci_jawaban;
              return (
                <div key={soal.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`}>
                      {isCorrect ? '✓ Benar' : '✕ Salah'}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Soal {idx + 1}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 12 }}>{soal.teks_soal}</p>
                  {soal.gambar_soal && <img src={soal.gambar_soal} alt="" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', marginBottom: 12, border: '1px solid var(--border)' }} />}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {['A', 'B', 'C', 'D', 'E'].map(l => {
                      const opsi = soal[`opsi_${l.toLowerCase()}`];
                      if (!opsi) return null;
                      const isKey = l === soal.kunci_jawaban;
                      const isUser = l === userAns;
                      const isWrongUser = isUser && !isKey;
                      return (
                        <div key={l} className={`answer-option ${isKey ? 'correct' : isWrongUser ? 'wrong' : ''}`} style={{ cursor: 'default', padding: '10px 14px' }}>
                          <span className="answer-option-label" style={{ width: 28, height: 28, fontSize: 11 }}>{l}</span>
                          <span style={{ fontSize: 13 }}>{opsi}</span>
                          {isKey && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>✓ Kunci</span>}
                          {isWrongUser && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}>Jawabanmu</span>}
                        </div>
                      );
                    })}
                  </div>

                  {soal.pembahasan && (
                    <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 14, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', marginBottom: 6 }}>💡 Pembahasan</div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{soal.pembahasan}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // === EXAM SCREEN ===
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Exam Header */}
      <header style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="badge badge-blue">{subtestInfo.name}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Soal {currentIdx + 1} / {soalList.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className={`tryout-timer ${timerClass}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setShowNav(!showNav)}
            style={{ display: 'none' }}
            id="mobile-nav-toggle"
          >
            ≡
          </button>
        </div>
      </header>

      {/* Main Exam Area */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Soal Content */}
        <div style={{ flex: 1, padding: '28px 32px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
          {/* Soal Text */}
          <div className="animate-fadeIn" key={currentIdx}>
            <div style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 20 }}>
              {currentSoal.teks_soal}
            </div>

            {currentSoal.gambar_soal && (
              <img src={currentSoal.gambar_soal} alt="Soal" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', marginBottom: 20, border: '1px solid var(--border)' }} />
            )}

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['A', 'B', 'C', 'D', 'E'].map(l => {
                const opsi = currentSoal[`opsi_${l.toLowerCase()}`];
                if (!opsi) return null;
                const isSelected = answers[currentIdx] === l;
                return (
                  <button
                    key={l}
                    className={`answer-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectAnswer(l)}
                  >
                    <span className="answer-option-label">{l}</span>
                    <span>{opsi}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-outline"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                >
                  ← Sebelumnya
                </button>
                <button
                  className="btn btn-outline"
                  disabled={currentIdx === soalList.length - 1}
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                >
                  Selanjutnya →
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`btn btn-sm ${flags[currentIdx] ? 'btn-success' : 'btn-outline'}`}
                  onClick={toggleFlag}
                  title="Tandai soal ini"
                >
                  🚩 {flags[currentIdx] ? 'Ditandai' : 'Tandai'}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSubmit(false)}
                >
                  Kumpulkan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <aside style={{
          width: 240, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
          padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
          position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Navigasi Soal
          </div>

          <div className="soal-nav-grid">
            {soalList.map((_, idx) => {
              let cls = '';
              if (idx === currentIdx) cls = 'current';
              else if (answers[idx]) cls = 'answered';
              if (flags[idx]) cls += ' flagged';
              return (
                <button
                  key={idx}
                  className={`soal-nav-btn ${cls}`}
                  onClick={() => goToSoal(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--brand-primary)' }} />
              Soal saat ini
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--success-subtle)', border: '1px solid rgba(16,185,129,0.3)' }} />
              Sudah dijawab
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--warning-subtle)', border: '1px solid rgba(245,158,11,0.3)' }} />
              Ditandai
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--bg-input)', border: '1px solid var(--border)' }} />
              Belum dijawab
            </div>
          </div>

          {/* Summary */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Dijawab</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{answeredCount}/{soalList.length}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(answeredCount / soalList.length) * 100}%` }} />
            </div>
            {flaggedCount > 0 && (
              <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 8 }}>
                🚩 {flaggedCount} soal ditandai
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Nav Toggle CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          aside {
            display: none !important;
          }
          #mobile-nav-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function TryoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <TryoutContent />
    </Suspense>
  );
}
