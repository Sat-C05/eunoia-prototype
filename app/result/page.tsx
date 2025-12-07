// app/result/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function getMessage(severity: string | null) {
    if (!severity) return null;

    const text = severity.toLowerCase();

    if (text.includes('minimal')) {
        return {
            heading: 'You seem to be doing okay overall.',
            body: 'Your responses suggest minimal depressive symptoms. Keep maintaining the routines that support you — healthy sleep, movement, and staying connected to people you trust.',
        };
    }
    if (text.includes('mild')) {
        return {
            heading: 'You may be going through a mildly stressful phase.',
            body: 'Mild symptoms can often be managed with self-care: regular sleep, breaks from screens, light exercise, and talking openly with someone you trust about how you feel.',
        };
    }
    if (text.includes('moderately severe')) {
        return {
            heading: 'It looks like you might be struggling quite a bit.',
            body: 'Your responses suggest a higher level of distress. It would be a good idea to speak to a counselor or mental health professional and not carry this alone.',
        };
    }
    if (text.includes('moderate')) {
        return {
            heading: 'You may be experiencing noticeable distress.',
            body: 'Moderate symptoms can impact your day-to-day life. Consider reaching out to a counselor, mentor, or trusted person, and making space in your routine for rest and support.',
        };
    }
    if (text.includes('severe')) {
        return {
            heading: 'You deserve support right now.',
            body: 'Your responses suggest significant distress. It is strongly recommended to talk to a mental health professional as soon as possible. If you have thoughts of self-harm or feel unsafe, please seek urgent help immediately.',
        };
    }

    return null;
}

export default function ResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const scoreParam = searchParams.get('score');
    const severityParam = searchParams.get('severity');

    const score = scoreParam ? Number(scoreParam) : null;
    const severity = severityParam || null;
    const message = getMessage(severity);

    const hasValidData = score !== null && !Number.isNaN(score) && !!severity;

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
                    maxWidth: '750px',
                    width: '100%',
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    boxShadow: '0 0 40px rgba(15,23,42,0.9)',
                    border: '1px solid rgba(148,163,184,0.4)',
                }}
            >
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    Your Assessment Result
                </h1>

                {!hasValidData ? (
                    <div>
                        <p style={{ marginBottom: '1rem' }}>
                            We could not find your assessment data. Please take the
                            self-assessment again.
                        </p>
                        <Link
                            href="/assessment"
                            style={{
                                padding: '0.7rem 1.4rem',
                                borderRadius: '999px',
                                backgroundColor: '#3b82f6',
                                color: '#f9fafb',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                            }}
                        >
                            Take Self-Assessment
                        </Link>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <div>
                                <p
                                    style={{
                                        fontSize: '0.85rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        color: '#9ca3af',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    Total Score
                                </p>
                                <p style={{ fontSize: '2.4rem', fontWeight: 700 }}>{score}</p>
                            </div>
                            <div>
                                <p
                                    style={{
                                        fontSize: '0.85rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        color: '#9ca3af',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    Severity
                                </p>
                                <p
                                    style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {severity}
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div
                                style={{
                                    marginBottom: '1.5rem',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '1rem',
                                    backgroundColor: 'rgba(37,99,235,0.15)',
                                    border: '1px solid rgba(59,130,246,0.4)',
                                }}
                            >
                                <p
                                    style={{
                                        fontWeight: 600,
                                        marginBottom: '0.3rem',
                                    }}
                                >
                                    {message.heading}
                                </p>
                                <p
                                    style={{
                                        fontSize: '0.95rem',
                                        margin: 0,
                                        color: '#dbeafe',
                                    }}
                                >
                                    {message.body}
                                </p>
                            </div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                marginBottom: '1rem',
                            }}
                        >
                            <Link
                                href="/booking"
                                style={{
                                    padding: '0.8rem 1.6rem',
                                    borderRadius: '999px',
                                    backgroundColor: '#22c55e',
                                    color: '#022c22',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                }}
                            >
                                Book a Counselor (Demo)
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.push('/assessment')}
                                style={{
                                    padding: '0.8rem 1.6rem',
                                    borderRadius: '999px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid rgba(148,163,184,0.9)',
                                    color: '#e5e7eb',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Retake Assessment
                            </button>
                            <Link
                                href="/"
                                style={{
                                    padding: '0.8rem 1.4rem',
                                    borderRadius: '999px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    color: '#9ca3af',
                                }}
                            >
                                Back to Home
                            </Link>
                        </div>

                        <p
                            style={{
                                fontSize: '0.8rem',
                                color: '#9ca3af',
                            }}
                        >
                            This is a prototype for educational purposes. It does not provide
                            a medical diagnosis. If you ever feel unsafe or have thoughts of
                            self-harm, please reach out to a trusted person, counselor, or
                            emergency services immediately.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
