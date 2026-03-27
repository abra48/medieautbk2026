import './globals.css';

export const metadata = {
  title: 'MEDIEA — Simulasi UTBK/SNBT 2026',
  description: 'Platform simulasi tryout UTBK/SNBT terlengkap. Latihan soal, timer real-time, leaderboard, dan analisis skor untuk persiapan SNBT 2026.',
  keywords: 'UTBK, SNBT, simulasi, tryout, latihan soal, 2026, MEDIEA',
  openGraph: {
    title: 'MEDIEA — Simulasi UTBK/SNBT 2026',
    description: 'Platform simulasi tryout UTBK/SNBT terlengkap dengan timer, leaderboard, dan analisis skor.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.MathJax={tex:{inlineMath:[["$","$"],["\\\\(","\\\\)"]],displayMath:[["$$","$$"],["\\\\[","\\\\]"]],processEscapes:true},options:{skipHtmlTags:["script","noscript","style","textarea","pre","code"]},svg:{fontCache:"global"},startup:{typeset:true}};',
          }}
        />
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
