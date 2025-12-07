import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      gap: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Eunoia</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Your path to mental well-being</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          href="/assessment"
          style={{
            padding: '0.8rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          Take Self-Assessment
        </Link>

        <Link
          href="/booking"
          style={{
            padding: '0.8rem 1.5rem',
            backgroundColor: '#fff',
            color: '#0070f3',
            border: '1px solid #0070f3',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          Book a Counselor
        </Link>
      </div>
    </main>
  );
}
