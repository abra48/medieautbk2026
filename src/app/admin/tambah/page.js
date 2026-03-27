'use client';
import { useEffect } from 'react';

export default function TambahSoalRedirect() {
  useEffect(() => {
    window.location.href = '/admin/dashboard';
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
}
