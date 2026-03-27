'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

// SVG Icons as components
const icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  ),
  popup: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  soal: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  tips: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" x2="15" y1="18" y2="18"/><line x1="10" x2="14" y1="22" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  target: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  user: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
    </svg>
  ),
  trophy: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  menu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
  ),
};

export default function Sidebar({ isAdmin = false, user }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { href: '/admin/siswa', label: 'Monitoring Siswa', icon: icons.user },
    { href: '/admin/popup', label: 'Kelola Pop-up', icon: icons.popup },
    { href: '/admin/info', label: 'Kirim Info', icon: icons.info },
    { href: '/admin/soal', label: 'Bank Soal', icon: icons.soal },
    { href: '/admin/tips', label: 'Tips Belajar', icon: icons.tips },
    { href: '/admin/passing-grade', label: 'Passing Grade', icon: icons.target },
  ];

  const studentLinks = [
    { href: '/siswa/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { href: '/profil', label: 'Profil Saya', icon: icons.user },
    { href: '/leaderboard', label: 'Leaderboard', icon: icons.trophy },
    { href: '/skor', label: 'Riwayat Skor', icon: icons.chart },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {icons.menu}
      </button>

      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><img src="https://cdn.phototourl.com/free/2026-03-27-2dee9557-ff89-4c80-ad48-83650d00521a.png" alt="MEDIEA" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /></div>
          <div className="sidebar-logo-text">
            MEDIEA <span>Portal</span>
          </div>
        </div>

        {/* Section Label */}
        <div className="sidebar-section-label">
          {isAdmin ? 'Admin Panel' : 'Menu Utama'}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname === link.href || pathname?.startsWith(link.href + '/') ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="sidebar-section-label">Menu Siswa</div>
              {studentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sidebar-icon">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.email || 'User'}
              </div>
              <div className="sidebar-user-role">
                {isAdmin ? '🔑 Admin' : '🎓 Siswa'}
              </div>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{ color: 'var(--danger)' }}
          >
            <span className="sidebar-icon">{icons.logout}</span>
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
