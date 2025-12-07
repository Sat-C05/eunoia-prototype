'use client';

import { useState } from 'react';

const SLOTS = [
    'Mon 4:00–4:30 PM',
    'Tue 11:00–11:30 AM',
    'Wed 2:00–2:30 PM',
    'Thu 5:00–5:30 PM',
];

export default function BookingPage() {
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const handleBook = async (slot: string) => {
        setSelectedSlot(slot);
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slotTime: slot }),
            });

            if (!res.ok) {
                throw new Error('Failed to book');
            }

            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage(`Your slot is booked (demo): ${data.slotTime}`);
            } else {
                setStatus('error');
                setMessage('Failed to book a slot. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage('Failed to book a slot. Please try again.');
        }
    };

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
                    Book a Counselor
                </h1>
                <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', opacity: 0.8 }}>
                    These are demo slots to show how booking would work in the full system.
                </p>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    {SLOTS.map((slot) => (
                        <button
                            key={slot}
                            onClick={() => handleBook(slot)}
                            disabled={status === 'loading' && selectedSlot === slot}
                            style={{
                                textAlign: 'left',
                                padding: '0.8rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(148,163,184,0.4)',
                                backgroundColor:
                                    selectedSlot === slot ? 'rgba(37,99,235,0.2)' : 'rgba(15,23,42,0.9)',
                                color: '#e5e7eb',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                            }}
                        >
                            {slot}
                        </button>
                    ))}
                </div>

                {message && (
                    <p
                        style={{
                            marginBottom: '0.75rem',
                            fontSize: '0.95rem',
                            color: status === 'success' ? '#4ade80' : '#f97373',
                        }}
                    >
                        {message}
                    </p>
                )}

                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    In a real deployment, these slots would sync with the institution&apos;s
                    calendar system and counselors&apos; availability.
                </p>
            </div>
        </main>
    );
}
