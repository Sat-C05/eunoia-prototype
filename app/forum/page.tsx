'use client';

import Link from 'next/link';

export default function ForumComingSoonPage() {
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
                    maxWidth: '700px',
                    width: '100%',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    boxShadow: '0 0 40px rgba(15,23,42,0.9)',
                    border: '1px solid rgba(148,163,184,0.4)',
                }}
            >
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    Peer Support Space (Coming Soon)
                </h1>
                <p style={{ fontSize: '0.95rem', marginBottom: '1rem', opacity: 0.9 }}>
                    In the full version of Eunoia, students will be able to share their
                    thoughts anonymously in a moderated peer support space.
                </p>

                <ul
                    style={{
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem',
                        paddingLeft: '1.2rem',
                        color: '#cbd5f5',
                    }}
                >
                    <li>Anonymous, campus-only discussions</li>
                    <li>Basic keyword filters for safety</li>
                    <li>Human moderators for escalation</li>
                </ul>

                <p
                    style={{
                        fontSize: '0.8rem',
                        color: '#9ca3af',
                        marginBottom: '1.5rem',
                    }}
                >
                    This feature is intentionally not enabled in the prototype to keep the
                    focus on safety and core flows (assessment and booking).
                </p>

                <Link
                    href="/"
                    style={{
                        padding: '0.8rem 1.4rem',
                        borderRadius: '999px',
                        backgroundColor: '#3b82f6',
                        color: '#f9fafb',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                    }}
                >
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
