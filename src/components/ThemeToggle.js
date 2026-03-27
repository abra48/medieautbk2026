'use client';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('mediea_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('mediea_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  return (
    <button
      onClick={toggle}
      className="btn btn-sm btn-ghost"
      title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
      style={{ fontSize: 18, padding: '6px 10px' }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
