'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ResultContent() {
    const searchParams = useSearchParams();
    const score = searchParams.get('score');
    const severity = searchParams.get('severity');

    let message = '';
    if (severity) {
        const s = severity.toLowerCase();
        if (s.includes('none') || s.includes('minimal')) {
            message = "Your symptoms appear minimal. Continue prioritizing your self-care and well-being.";
        } else if (s.includes('mild')) {
            message = "You may be experiencing mild symptoms. It's good to keep an eye on how you're feeling.";
        } else if (s.includes('moderate')) {
            message = "Your symptoms suggest moderate distress. Speaking with a counselor could be very helpful.";
        } else {
            message = "Your results indicate significant symptoms. We strongly recommend speaking with a mental health professional.";
        }
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <h1 style={{ marginBottom: '1rem' }}>Assessment Results</h1>
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Total Score: <strong>{score}</strong></p>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Severity: <strong>{severity}</strong></p>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>{message}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link
                    href="/booking"
                    style={{
                        padding: '0.8rem 1.5rem',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        fontSize: '1rem'
                    }}
                >
                    Book a Counselor
                </Link>

                <Link
                    href="/"
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
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Suspense fallback={<div>Loading results...</div>}>
                <ResultContent />
            </Suspense>
        </main>
    );
}
