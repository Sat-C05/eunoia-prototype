'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/components/NotificationProvider';
import { getOrCreateClientUserId } from '@/lib/clientUserId';

const SLOTS = [
    'Mon 4:00–4:30 PM',
    'Tue 11:00–11:30 AM',
    'Wed 2:00–2:30 PM',
    'Thu 5:00–5:30 PM',
];

export default function BookingPage() {
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');
    const { notify } = useNotifications();
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
    }, []);

    const handleBook = async (slot: string) => {
        setSelectedSlot(slot);
        setStatus('loading');

        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slotTime: slot,
                    userId,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to book');
            }

            const data = await res.json();

            if (data.success) {
                notify('success', `Your slot is booked (demo): ${data.slotTime}`);
            } else {
                notify('error', 'Failed to book a slot. Please try again.');
            }
        } catch (err) {
            console.error(err);
            notify('error', 'Failed to book a slot. Please try again.');
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="flex justify-center items-start pt-10 pb-20">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-xl backdrop-blur-md">
                <h1 className="text-2xl font-semibold mb-2 text-neutral-100">
                    Book a Counselor
                </h1>
                <p className="mb-8 text-sm text-neutral-400">
                    These are demo slots to show how booking would work in the full system.
                </p>

                <div className="space-y-3 mb-8">
                    {SLOTS.map((slot) => {
                        const isLoadingThis = status === 'loading' && selectedSlot === slot;
                        const isSelected = selectedSlot === slot;

                        return (
                            <button
                                key={slot}
                                onClick={() => handleBook(slot)}
                                disabled={isLoadingThis}
                                className={[
                                    "w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200",
                                    isSelected
                                        ? "border-purple-500 bg-purple-900/30 text-white shadow-md scale-[1.01]"
                                        : "border-neutral-800 bg-neutral-950/40 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900/60",
                                    isLoadingThis ? "cursor-wait opacity-80" : "cursor-pointer"
                                ].join(" ")}
                            >
                                <span className="font-medium text-sm">{slot}</span>
                                {isLoadingThis && (
                                    <span className="text-xs text-purple-300 animate-pulse">Booking...</span>
                                )}
                                {!isLoadingThis && isSelected && (
                                    <span className="text-xs text-purple-300">Selected</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="text-xs text-neutral-500 italic border-t border-neutral-800 pt-4">
                    In a real deployment, these slots would sync with the institution&apos;s
                    calendar system and counselors&apos; availability.
                </p>
            </div>
        </div>
    );
}
