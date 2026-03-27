'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

// UTBK subtest order — matches real SNBT 2026
const SUBTEST_ORDER = [
  { key: 'LIT_INDO', name: 'Literasi Bahasa Indonesia', icon: '🇮🇩', duration: 25, color: '#f59e0b' },
  { key: 'LIT_ING', name: 'Literasi Bahasa Inggris', icon: '🇬🇧', duration: 25, color: '#ec4899' },
  { key: 'PM', name: 'Penalaran Matematika', icon: '📐', duration: 30, color: '#ef4444' },
  { key: 'PU', name: 'Penalaran Umum', icon: '🧠', duration: 30, color: '#3b82f6' },
  { key: 'PBM', name: 'Pemahaman Bacaan & Menulis', icon: '📖', duration: 25, color: '#8b5cf6' },
  { key: 'PPU', name: 'Pengetahuan & Pemahaman Umum', icon: '🌍', duration: 20, color: '#06b6d4' },
  { key: 'PK', name: 'Pengetahuan Kuantitatif', icon: '🔢', duration: 35, color: '#10b981' },
];

function TryoutContent() {
  const { user, loading: authLoading, siswaData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // States
  const [allSoal, setAllSoal] = useState({}); // { PU: [...], PBM: [...], ... }
  const [loading, setLoading] = useState(true);
  const [currentSubtestIdx, setCurrentSubtestIdx] = useState(0);
  const [currentSoalIdx, setCurrentSoalIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { 'PU_0': 'A', ... }
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'exam' | 'subtestDone' | 'result'
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // MathJax re-typeset
  useEffect(() => {
    function tryTypeset(retries = 0) {
      if (typeof window === 'undefined') return;
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
      } else if (retries < 30) {
        setTimeout(() => tryTypeset(retries + 1), 300);
      }
    }
    const t = setTimeout(() => tryTypeset(), 200);
    return () => clearTimeout(t);
  }, [currentSoalIdx, currentSubtestIdx, phase, loading]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user]);

  // Fetch ALL soal grouped by kategori
  useEffect(() => {
    if (!user) return;
    async function fetchAll() {
      const { data } = await supabase.from('soal').select('*').order('created_at');
      const grouped = {};
      SUBTEST_ORDER.forEach(s => { grouped[s.key] = []; });
      (data || []).forEach(soal => {
        if (grouped[soal.kategori]) grouped[soal.kategori].push(soal);
      });
      setAllSoal(grouped);
      setLoading(false);
    }
    fetchAll();
  }, [user]);

  const currentSubtest = SUBTEST_ORDER[currentSubtestIdx];
  const currentSoalList = allSoal[currentSubtest?.key] || [];
  const currentSoal = currentSoalList[currentSoalIdx];
  const ansKey = (sub, idx) => `${sub}_${idx}`;

  // Timer for current subtest
  useEffect(() => {
    if (phase !== 'exam' || !currentSubtest) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishSubtest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentSubtestIdx]);

  function startSubtest() {
    setCurrentSoalIdx(0);
    setTimeLeft(currentSubtest.duration * 60);
    setPhase('exam');
    startTimeRef.current = Date.now();
  }

  function finishSubtest() {
    clearInterval(timerRef.current);
    if (currentSubtestIdx < SUBTEST_ORDER.length - 1) {
      setPhase('subtestDone');
    } else {
      submitAll();
    }
  }

  function nextSubtest() {
    setCurrentSubtestIdx(prev => prev + 1);
    setCurrentSoalIdx(0);
    setPhase('intro');
  }

  const submitAll = useCallback(async () => {
    clearInterval(timerRef.current);
    setPhase('result');

    // Calculate scores per subtest
    const subtestScores = {};
    let totalCorrect = 0;
    let totalSoal = 0;

    SUBTEST_ORDER.forEach(sub => {
      const soalList = allSoal[sub.key] || [];
      let correct = 0;
      soalList.forEach((soal, idx) => {
        if (answers[ansKey(sub.key, idx)] === soal.kunci_jawaban) correct++;
      });
      subtestScores[sub.key] = soalList.length > 0 ? Math.round((correct / soalList.length) * 1000) : 0;
      totalCorrect += correct;
      totalSoal += soalList.length;
    });

    const totalSkor = totalSoal > 0 ? Math.round((totalCorrect / totalSoal) * 1000) : 0;

    if (user) {
      await supabase.from('skor').insert({
        siswa_id: user.id,
        nama_peserta: siswaData?.nama_lengkap || user.email?.split('@')[0] || 'Anonim',
        total_skor: totalSkor,
        detail_subtest: subtestScores,
      });
    }
  }, [allSoal, answers, user, siswaData]);

  function selectAnswer(label) {
    setAnswers({ ...answers, [ansKey(currentSubtest.key, currentSoalIdx)]: label });
  }

  function toggleFlag() {
    const k = ansKey(currentSubtest.key, currentSoalIdx);
    setFlags({ ...flags, [k]: !flags[k] });
  }

  function formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  // Loading
  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memuat soal simulasi UTBK...</p>
      </div>
    );
  }

  // ===================== INTRO SCREEN =====================
  if (phase === 'intro') {
    const soalCount = currentSoalList.length;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-body)' }}>
        <div className="card animate-slideUp" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: 40 }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {SUBTEST_ORDER.map((s, i) => (
              <div key={s.key} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < currentSubtestIdx ? 'var(--success)' : i === currentSubtestIdx ? currentSubtest.color : 'var(--border)',
                transition: 'all 300ms',
              }} />
            ))}
          </div>

          <div style={{ fontSize: 48, marginBottom: 16 }}>{currentSubtest.icon}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Subtest {currentSubtestIdx + 1} dari {SUBTEST_ORDER.length}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>{currentSubtest.name}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
            {soalCount > 0
              ? `${soalCount} soal • Waktu: ${currentSubtest.duration} menit. Timer akan berjalan otomatis setelah kamu menekan "Mulai".`
              : 'Belum ada soal untuk subtest ini. Klik tombol di bawah untuk lompat ke subtest berikutnya.'
            }
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: currentSubtest.color }}>{soalCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Jumlah Soal</div>
            </div>
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: currentSubtest.color }}>{currentSubtest.duration}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Menit</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => router.push('/siswa/dashboard')}>
              ← Keluar
            </button>
            {soalCount > 0 ? (
              <button className="btn btn-primary" style={{ flex: 1, background: currentSubtest.color }} onClick={startSubtest}>
                Mulai Subtest →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={currentSubtestIdx < SUBTEST_ORDER.length - 1 ? nextSubtest : submitAll}>
                {currentSubtestIdx < SUBTEST_ORDER.length - 1 ? 'Subtest Berikutnya →' : 'Lihat Hasil'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===================== SUBTEST DONE SCREEN =====================
  if (phase === 'subtestDone') {
    const soalList = currentSoalList;
    let answered = 0;
    soalList.forEach((_, idx) => { if (answers[ansKey(currentSubtest.key, idx)]) answered++; });
    const nextSub = SUBTEST_ORDER[currentSubtestIdx + 1];

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-body)' }}>
        <div className="card animate-slideUp" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
            {currentSubtest.name} Selesai!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Dijawab: {answered}/{soalList.length} soal
          </p>

          {nextSub && (
            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Subtest berikutnya</div>
              <div style={{ fontSize: 28 }}>{nextSub.icon}</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{nextSub.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(allSoal[nextSub.key] || []).length} soal • {nextSub.duration} menit</div>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={nextSubtest}>
            Lanjut ke {nextSub?.name || 'Hasil'} →
          </button>
        </div>
      </div>
    );
  }

  // ===================== RESULT SCREEN =====================
  if (phase === 'result') {
    let totalCorrect = 0, totalCount = 0;
    const details = SUBTEST_ORDER.map(sub => {
      const soalList = allSoal[sub.key] || [];
      let correct = 0;
      soalList.forEach((soal, idx) => {
        if (answers[ansKey(sub.key, idx)] === soal.kunci_jawaban) correct++;
      });
      totalCorrect += correct;
      totalCount += soalList.length;
      const score = soalList.length > 0 ? Math.round((correct / soalList.length) * 1000) : 0;
      return { ...sub, correct, total: soalList.length, score };
    });
    const totalSkor = totalCount > 0 ? Math.round((totalCorrect / totalCount) * 1000) : 0;
    const pct = totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0;

    let verdict, verdictColor;
    if (totalSkor >= 700) { verdict = '🌟 Luar Biasa!'; verdictColor = 'var(--success)'; }
    else if (totalSkor >= 550) { verdict = '🎯 Sangat Baik!'; verdictColor = 'var(--brand-primary-light)'; }
    else if (totalSkor >= 400) { verdict = '📈 Baik'; verdictColor = 'var(--warning)'; }
    else { verdict = '💪 Perlu Latihan'; verdictColor = 'var(--danger)'; }

    return (
      <div style={{ minHeight: '100vh', padding: 24, background: 'var(--bg-body)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="card animate-slideUp" style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Hasil Simulasi UTBK/SNBT
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, color: verdictColor, lineHeight: 1.1, marginBottom: 8 }}>{totalSkor}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: verdictColor, marginBottom: 16 }}>{verdict}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{totalCorrect}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Benar</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{totalCount - totalCorrect}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Salah</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{pct}%</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Akurasi</div></div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => router.push('/siswa/dashboard')}>← Dashboard</button>
              <button className="btn btn-outline" onClick={() => router.push('/skor')}>📈 Riwayat</button>
            </div>
          </div>

          {/* Per-subtest breakdown */}
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Skor per Subtest</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {details.map(d => (
              <div key={d.key} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 28 }}>{d.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.correct}/{d.total} benar</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: d.score >= 700 ? 'var(--success)' : d.score >= 400 ? 'var(--warning)' : 'var(--danger)' }}>
                  {d.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===================== EXAM SCREEN =====================
  if (!currentSoal) return null;

  const timerClass = timeLeft <= 60 ? 'danger' : timeLeft <= 300 ? 'warning' : '';
  const answeredInSubtest = currentSoalList.filter((_, idx) => answers[ansKey(currentSubtest.key, idx)]).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge" style={{ background: `${currentSubtest.color}20`, color: currentSubtest.color, fontWeight: 700 }}>
            {currentSubtest.icon} {currentSubtest.name}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {currentSoalIdx + 1}/{currentSoalList.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className={`tryout-timer ${timerClass}`}>⏱ {formatTime(timeLeft)}</div>
          <button className="btn btn-sm btn-outline" onClick={finishSubtest}>Kumpulkan</button>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Soal panel */}
        <div style={{ flex: 1, padding: '24px 28px', maxWidth: 800, margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          <div className="animate-fadeIn" key={`${currentSubtestIdx}_${currentSoalIdx}`}>
            {/* Soal text */}
            <div className="soal-html-content" style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 20, color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: currentSoal.teks_soal }} />

            {currentSoal.gambar_soal && (
              <img src={currentSoal.gambar_soal} alt="" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', marginBottom: 20, border: '1px solid var(--border)' }} />
            )}

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {['A', 'B', 'C', 'D', 'E'].map(l => {
                const opsi = currentSoal[`opsi_${l.toLowerCase()}`];
                if (!opsi) return null;
                const selected = answers[ansKey(currentSubtest.key, currentSoalIdx)] === l;
                return (
                  <button key={l} className={`answer-option ${selected ? 'selected' : ''}`} onClick={() => selectAnswer(l)}>
                    <span className="answer-option-label">{l}</span>
                    <span className="soal-html-content" dangerouslySetInnerHTML={{ __html: opsi }} />
                  </button>
                );
              })}
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" disabled={currentSoalIdx === 0} onClick={() => setCurrentSoalIdx(i => i - 1)}>← Sebelumnya</button>
                <button className="btn btn-outline" disabled={currentSoalIdx === currentSoalList.length - 1} onClick={() => setCurrentSoalIdx(i => i + 1)}>Selanjutnya →</button>
              </div>
              <button className={`btn btn-sm ${flags[ansKey(currentSubtest.key, currentSoalIdx)] ? 'btn-success' : 'btn-outline'}`} onClick={toggleFlag}>
                🚩 {flags[ansKey(currentSubtest.key, currentSoalIdx)] ? 'Ditandai' : 'Tandai'}
              </button>
            </div>
          </div>
        </div>

        {/* Nav sidebar */}
        <aside className="tryout-aside" style={{
          width: 220, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
          position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Navigasi</div>
          <div className="soal-nav-grid">
            {currentSoalList.map((_, idx) => {
              let cls = '';
              if (idx === currentSoalIdx) cls = 'current';
              else if (answers[ansKey(currentSubtest.key, idx)]) cls = 'answered';
              if (flags[ansKey(currentSubtest.key, idx)]) cls += ' flagged';
              return <button key={idx} className={`soal-nav-btn ${cls}`} onClick={() => setCurrentSoalIdx(idx)}>{idx + 1}</button>;
            })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{answeredInSubtest}/{currentSoalList.length} dijawab</div>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${(answeredInSubtest / currentSoalList.length) * 100}%` }} /></div>

          {/* Subtest progress */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Progress Simulasi</div>
            {SUBTEST_ORDER.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: i === currentSubtestIdx ? currentSubtest.color : 'var(--text-muted)', fontWeight: i === currentSubtestIdx ? 700 : 400, marginBottom: 4 }}>
                <span>{i < currentSubtestIdx ? '✅' : i === currentSubtestIdx ? '▶' : '○'}</span>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .tryout-aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function TryoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    }>
      <TryoutContent />
    </Suspense>
  );
}
