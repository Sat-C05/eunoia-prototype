"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";

export default function BookingPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedCounselor, setSelectedCounselor] = useState<{ id: string, name: string, role: string, color: string, avatar: string, bio: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookedSlots, setBookedSlots] = useState<{ slot: string, counselorId: string }[]>([]);
    const [status, setStatus] = useState<"idle" | "loading">("idle");
    const { notify } = useNotifications();
    const [userId, setUserId] = useState<string>("");

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d;
    });

    const COUNSELORS = [
        {
            id: 'c1',
            name: 'Dr. Sarah Mitchell',
            role: 'Clinical Psychologist',
            color: 'bg-indigo-500', // Professional solid accent
            avatar: 'SM',
            bio: 'Specializes in CBT and anxiety management for students.'
        },
        {
            id: 'c2',
            name: 'Mr. James Chen',
            role: 'Student Counselor',
            color: 'bg-teal-600',
            avatar: 'JC',
            bio: 'Focuses on academic stress and peer relationship guidance.'
        },
        {
            id: 'c3',
            name: 'Ms. Emily Rodriguez',
            role: 'Mental Health Specialist',
            color: 'bg-blue-600',
            avatar: 'ER',
            bio: 'Expert in mindfulness and emotional regulation techniques.'
        }
    ];

    const MORNING_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM"];
    const AFTERNOON_SLOTS = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const start = new Date();
            const end = new Date();
            end.setDate(end.getDate() + 10);

            const res = await fetch(`/api/booking?start=${start.toISOString()}&end=${end.toISOString()}`);
            if (res.ok) {
                const data = await res.json();
                setBookedSlots(data.bookings || []);
            }
        } catch (e) {
            console.error("Failed to fetch bookings", e);
        }
    };

    const isSlotBooked = (date: Date, timeString: string) => {
        const slotDate = new Date(date);
        const [time, modifier] = timeString.split(' ');
        const [rawHours, minutes] = time.split(':').map(Number);
        let hours = rawHours;

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        slotDate.setHours(hours, minutes, 0, 0);

        return bookedSlots.some(b => {
            const bookedDate = new Date(b.slot);
            return bookedDate.getTime() === slotDate.getTime() && b.counselorId === selectedCounselor?.id;
        });
    };

    const handleBook = async (timeString: string) => {
        if (!selectedCounselor) return;

        setSelectedSlot(timeString);
        setStatus('loading');

        const slotDate = new Date(selectedDate);
        const [time, modifier] = timeString.split(' ');
        const [rawHours, minutes] = time.split(':').map(Number);
        let hours = rawHours;

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        slotDate.setHours(hours, minutes, 0, 0);

        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slot: slotDate.toISOString(),
                    studentName: "Student",
                    reason: `Booking with ${selectedCounselor.name}`,
                    userId,
                    counselorId: selectedCounselor.id,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || 'Failed to book');
            }
            const data = await res.json();

            if (data.success) {
                notify('success', `Confirmed: ${data.slotTime} with ${selectedCounselor.name}`);
                await fetchBookings();
                setStep(1);
                setSelectedCounselor(null);
                setSelectedSlot(null);
            } else {
                notify('error', 'Failed to book a slot. Please try again.');
            }
        } catch (err) {
            const msg = err && (err as Error).message;
            console.error(err);
            notify('error', `Booking failed: ${msg}. Slot might be taken.`);
        } finally {
            setStatus('idle');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCounselorSelect = (c: any) => {
        setSelectedCounselor(c);
        setSelectedDate(weekDates[0]);
        setStep(2);
    };

    return (
        <div className="space-y-8">

            {/* Standard Uniform Header (Formal) */}
            <header className="space-y-2 border-b border-white/5 pb-6">
                <h1 className="text-3xl font-semibold text-white tracking-tight">Consultation Booking</h1>
                <p className="text-neutral-400 max-w-2xl">
                    Select a qualified professional to schedule a confidential 1-on-1 session.
                </p>
            </header>

            {/* Main Content Area */}
            <div className="min-h-[500px] relative">

                {step === 1 && (
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {COUNSELORS.map((c) => (
                            <div
                                key={c.id}
                                className="group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:border-white/10"
                            >
                                {/* Avatar */}
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${c.color}`}>
                                    {c.avatar}
                                </div>

                                {/* Info */}
                                <div className="flex-grow text-center md:text-left space-y-1">
                                    <h3 className="text-xl font-medium text-white group-hover:text-blue-200 transition-colors">
                                        {c.name}
                                    </h3>
                                    <p className="text-sm font-medium text-white/50 uppercase tracking-wide">
                                        {c.role}
                                    </p>
                                    <p className="text-sm text-neutral-400 max-w-lg">
                                        {c.bio}
                                    </p>
                                </div>

                                {/* Action */}
                                <button
                                    onClick={() => handleCounselorSelect(c)}
                                    className="px-6 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm font-medium text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors min-w-[140px]"
                                >
                                    Check Schedule
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {step === 2 && selectedCounselor && (
                    <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 shadow-xl backdrop-blur-sm animate-in zoom-in-[0.99] duration-200">

                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-white/40 hover:text-white transition-colors text-sm font-medium hover:underline underline-offset-4"
                                >
                                    ← Back
                                </button>
                                <div className="h-6 w-px bg-white/10" />
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${selectedCounselor.color}`}>
                                        {selectedCounselor.avatar}
                                    </div>
                                    <span className="font-semibold text-white">{selectedCounselor.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Formal Date Picker */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Date</label>
                                <div className="flex flex-wrap gap-2">
                                    {weekDates.map((date) => {
                                        const isSelected = date.toDateString() === selectedDate.toDateString();
                                        return (
                                            <button
                                                key={date.toISOString()}
                                                onClick={() => setSelectedDate(date)}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isSelected
                                                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-200'
                                                    : 'border-white/5 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200'
                                                    }`}
                                            >
                                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Formal Slot Picker */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Time Slot</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {ALL_SLOTS.map((slot) => {
                                        const booked = isSlotBooked(selectedDate, slot);
                                        const loading = status === 'loading' && selectedSlot === slot;

                                        return (
                                            <button
                                                key={slot}
                                                onClick={() => !booked && handleBook(slot)}
                                                disabled={booked || status === 'loading'}
                                                className={`py-2 px-3 rounded text-xs font-medium border transition-all ${booked
                                                    ? 'border-transparent bg-neutral-900 text-neutral-600 cursor-not-allowed decoration-slice'
                                                    : 'border-white/5 bg-white/5 text-neutral-300 hover:bg-neutral-800 hover:border-white/10 hover:text-white'
                                                    } ${loading ? 'animate-pulse bg-blue-500/20' : ''}`}
                                            >
                                                {slot}
                                                {booked && <span className="block text-[9px] text-red-900/50 uppercase font-bold mt-1">Booked</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
