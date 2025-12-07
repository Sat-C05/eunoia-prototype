// app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        background:
          'radial-gradient(circle at top, #1d4ed8 0, #020617 40%, #000 100%)',
        color: '#e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          backgroundColor: 'rgba(15,23,42,0.9)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 0 40px rgba(15,23,42,0.9)',
          border: '1px solid rgba(148,163,184,0.4)',
        }}
      >


        <h1
          style={{
            fontSize: '2.3rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Eunoia
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#cbd5f5',
            marginBottom: '1.5rem',
            maxWidth: '32rem',
          }}
        >
          A campus-first digital mental health companion for students, designed
          for privacy, early support, and easy access to professional help.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <Link
            href="/assessment"
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '999px',
              backgroundColor: '#3b82f6',
              color: '#f9fafb',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            Take Self-Assessment
          </Link>
          <Link
            href="/booking"
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '999px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(148,163,184,0.9)',
              color: '#e5e7eb',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            Book a Counselor (Demo)
          </Link>
          <Link
            href="/forum"
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '999px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(148,163,184,0.9)',
              color: '#e5e7eb',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            Peer Support (Coming Soon)
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#9ca3af',
          }}
        >
          <div>
            <strong style={{ color: '#e5e7eb' }}>Privacy-first</strong>
            <p style={{ margin: 0 }}>
              Responses stay on this demo device. No real data is stored.
            </p>
          </div>
          <div>
            <strong style={{ color: '#e5e7eb' }}>Not a diagnosis</strong>
            <p style={{ margin: 0 }}>
              This tool offers guidance only. For urgent help, contact a
              professional.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
