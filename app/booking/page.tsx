"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";

export default function BookingPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedCounselor, setSelectedCounselor] = useState<{ id: string, name: string, role: string, color: string, avatar: string, bio: string, tags: string[], nextAvailable: string } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [bookedSlots, setBookedSlots] = useState<{ slot: string, counselorId: string }[]>([]);
    const [status, setStatus] = useState<"idle" | "loading">("idle");
    const [filter, setFilter] = useState<string>("All");

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
            color: 'bg-indigo-500',
            avatar: 'SM',
            bio: 'Specializes in CBT and anxiety management for students.',
            tags: ["Anxiety", "Depression", "Academic"],
            nextAvailable: "Tomorrow, 10:00 AM"
        },
        {
            id: 'c2',
            name: 'Mr. James Chen',
            role: 'Student Counselor',
            color: 'bg-teal-600',
            avatar: 'JC',
            bio: 'Focuses on academic stress and peer relationship guidance.',
            tags: ["Academic", "Relationship", "Stress"],
            nextAvailable: "Today, 4:00 PM"
        },
        {
            id: 'c3',
            name: 'Ms. Emily Rodriguez',
            role: 'Mental Health Specialist',
            color: 'bg-blue-600',
            avatar: 'ER',
            bio: 'Expert in mindfulness and emotional regulation.',
            tags: ["Mindfulness", "Anxiety", "Sleep"],
            nextAvailable: "Tomorrow, 2:00 PM"
        }
    ];

    const FILTERS = ["All", "Anxiety", "Academic", "Relationship", "Stress"];

    const MORNING_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM"];
    const AFTERNOON_SLOTS = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

    const [userProfile, setUserProfile] = useState<{ name: string, email: string } | null>(null);

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
        fetchBookings();
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setUserProfile(data.user);
                }
            }
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }
    };

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

    // ... (rest of function)

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
        // If not logged in & no email provided (future feature), we warn or just book as anon.
        // For now, if logged in, we use profile.

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
                    studentName: userProfile?.name || "Anonymous Student",
                    studentEmail: userProfile?.email || null, // Critical Fix
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

    const handleQuickBook = () => {
        // Find first available counselor
        const quickMatch = COUNSELORS[0];
        handleCounselorSelect(quickMatch);
        notify("success", "Matched with next available specialist.");
    };

    const filteredCounselors = filter === "All"
        ? COUNSELORS
        : COUNSELORS.filter(c => c.tags.includes(filter));

    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-12">
                <header className="flex flex-col lg:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-light mb-2 text-white">Consultation Booking</h1>
                        <p className="text-xl text-neutral-400 font-light">Connect with a professional for a confidential session.</p>
                    </div>
                    {step === 1 && (
                        <button
                            onClick={handleQuickBook}
                            className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-white/10"
                        >
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            I need someone ASAP
                        </button>
                    )}
                </header>

                <div className="min-h-[500px] relative">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl mx-auto">

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2">
                                {FILTERS.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${filter === f
                                            ? "bg-white text-black border-white"
                                            : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            {/* ROW LAYOUT (Vertical List) */}
                            <div className="flex flex-col gap-4">
                                {filteredCounselors.map((c) => (
                                    <div
                                        key={c.id}
                                        className="group relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:border-white/10 hover:shadow-xl hover:scale-[1.005]"
                                    >
                                        {/* Avatar */}
                                        <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${c.color} bg-opacity-80 backdrop-blur-md`}>
                                            {c.avatar}
                                        </div>

                                        {/* Content info */}
                                        <div className="flex-grow min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                <h3 className="text-xl font-medium text-white group-hover:text-blue-200 transition-colors">
                                                    {c.name}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                                    {c.role}
                                                </span>
                                            </div>

                                            <p className="text-sm text-neutral-400 truncate max-w-xl">
                                                {c.bio}
                                            </p>

                                            {/* Tags Row */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {c.tags.map(t => (
                                                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-500 border border-white/5">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Column */}
                                        <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end gap-3 justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">

                                            {/* Next Available Badge */}
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-[10px] font-bold uppercase tracking-wide">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                {c.nextAvailable}
                                            </div>

                                            <button
                                                onClick={() => handleCounselorSelect(c)}
                                                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors text-sm"
                                            >
                                                Book Session
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && selectedCounselor && (
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl backdrop-blur-xl animate-in zoom-in-[0.99] duration-300">

                            <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        ←
                                    </button>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Booking With</p>
                                        <h2 className="text-2xl font-light text-white">{selectedCounselor.name}</h2>
                                    </div>
                                </div>
                                <div className={`hidden md:flex h-12 w-12 rounded-xl items-center justify-center font-bold ${selectedCounselor.color}`}>
                                    {selectedCounselor.avatar}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-12">
                                {/* Date Picker */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-white">Select Date</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {weekDates.map((date) => {
                                            const isSelected = date.toDateString() === selectedDate.toDateString();
                                            return (
                                                <button
                                                    key={date.toISOString()}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`py-4 px-2 rounded-xl border text-sm font-medium transition-all ${isSelected
                                                        ? 'border-blue-500 bg-blue-500/20 text-blue-100'
                                                        : 'border-white/5 bg-neutral-900/50 text-neutral-400 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="block text-xs uppercase opacity-70 mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                    <span className="text-lg font-light">{date.getDate()}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Slot Picker */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-white">Select Time</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ALL_SLOTS.map((slot) => {
                                            const booked = isSlotBooked(selectedDate, slot);
                                            const loading = status === 'loading' && selectedSlot === slot;

                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => !booked && handleBook(slot)}
                                                    disabled={booked || status === 'loading'}
                                                    className={`py-4 px-6 rounded-xl text-center transition-all ${booked
                                                        ? 'bg-neutral-900 text-neutral-700 cursor-not-allowed border border-transparent'
                                                        : 'bg-white/5 text-neutral-200 border border-white/5 hover:bg-white hover:text-black hover:border-white'
                                                        } ${loading ? 'animate-pulse bg-blue-500/20' : ''}`}
                                                >
                                                    <span className="text-sm font-medium">{slot}</span>
                                                    {booked && <span className="block text-[10px] uppercase font-bold text-red-900/60 mt-1">Full</span>}
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
        </div>
    );
}
