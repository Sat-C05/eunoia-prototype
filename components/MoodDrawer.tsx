"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";

type MoodLog = {
    id: string;
    createdAt: string;
    userId: string | null;
    mood: number;
    note: string | null;
};

interface MoodDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MoodDrawer({ isOpen, onClose }: MoodDrawerProps) {
    const { notify } = useNotifications();
    const router = useRouter();
    const [mood, setMood] = useState<number | null>(null);
    const [note, setNote] = useState("");
    const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [userId] = useState<string>(() => getOrCreateClientUserId());

    const moodOptions = [
        { value: 1, label: "Rough", emoji: "😫", color: "from-red-500 to-rose-600", bg: "bg-rose-950", accent: "text-rose-400" },
        { value: 2, label: "Low", emoji: "😕", color: "from-orange-500 to-amber-600", bg: "bg-orange-950", accent: "text-orange-400" },
        { value: 3, label: "Okay", emoji: "😐", color: "from-blue-500 to-indigo-600", bg: "bg-slate-900", accent: "text-blue-400" },
        { value: 4, label: "Good", emoji: "🙂", color: "from-teal-400 to-emerald-500", bg: "bg-teal-950", accent: "text-teal-400" },
        { value: 5, label: "Great", emoji: "🤩", color: "from-purple-400 to-pink-500", bg: "bg-purple-950", accent: "text-purple-400" },
    ];

    const FACTORS = ["Sleep 😴", "Work 💼", "Family 🏠", "Health 💊", "Study 📚", "Social 👯", "Weather ⛈️", "Food 🍔"];

    const recentMoodAvg = logs.length > 0
        ? logs.slice(0, 5).reduce((acc, l) => acc + l.mood, 0) / Math.min(logs.length, 5)
        : 5;

    const currentMoodConfig = mood ? moodOptions.find(m => m.value === mood) : null;
    const bgGradient = currentMoodConfig ? currentMoodConfig.bg : "bg-neutral-900";

    async function loadLogs() {
        try {
            setIsLoadingLogs(true);
            const res = await fetch(`/api/mood/recent?userId=${encodeURIComponent(userId)}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs ?? []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingLogs(false);
        }
    }

    useEffect(() => {
        if (isOpen && userId) loadLogs();
    }, [isOpen, userId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (mood === null) {
            notify("error", "Please select a mood first");
            return;
        }

        try {
            setIsSubmitting(true);
            const factorString = selectedFactors.length > 0 ? `FACTORS:${selectedFactors.join(',')} | ` : "";
            const finalNote = factorString + note.trim();

            const res = await fetch("/api/mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood, note: finalNote || null, userId }),
            });

            if (!res.ok) throw new Error("Failed");

            notify("success", "Check-in saved");
            setNote("");
            setSelectedFactors([]);
            loadLogs();
        } catch (error) {
            notify("error", "Failed to save mood");
        } finally {
            setIsSubmitting(false);
        }
    }

    function parseNote(rawNote: string | null) {
        if (!rawNote) return { factors: [], text: null };
        const factorMatch = rawNote.match(/^FACTORS:(.*?) \| (.*)/) || rawNote.match(/^FACTORS:(.*?) \|$/);
        if (factorMatch) {
            return {
                factors: factorMatch[1].split(','),
                text: factorMatch[2] || null
            };
        } else if (rawNote.startsWith("FACTORS:")) {
            return {
                factors: rawNote.replace("FACTORS:", "").split(",").map(s => s.trim()),
                text: null
            }
        }
        return { factors: [], text: rawNote };
    }

    function formatDateTime(input: string) {
        const d = new Date(input);
        if (Number.isNaN(d.getTime())) return { date: "—", time: "—" };
        return {
            date: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
            time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
    }

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed top-2 bottom-2 right-2 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-50 transition-all animate-in slide-in-from-right duration-300 flex flex-col ${bgGradient} text-white border border-white/10`}>

                {/* Background FX - Scoped to drawer */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className={`absolute -top-[10%] -right-[10%] w-[70%] h-[40%] rounded-full blur-[80px] opacity-20 transition-all duration-1000 ${currentMoodConfig ? `bg-gradient-to-br ${currentMoodConfig.color}` : "bg-purple-900"}`} />
                    <div className={`absolute top-[30%] -left-[10%] w-[60%] h-[50%] rounded-full blur-[80px] opacity-10 transition-all duration-1000 ${currentMoodConfig ? `bg-gradient-to-tr ${currentMoodConfig.color}` : "bg-blue-900"}`} />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5 bg-black/10 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">InnerSpace</h2>
                        <p className="text-xs text-white/50">Your mental sanctuary</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Smart Prompt */}
                    {!isLoadingLogs && recentMoodAvg < 2.8 && (
                        <div className="bg-teal-900/30 border border-teal-500/30 p-4 rounded-2xl flex flex-col gap-3 shadow-lg backdrop-blur-sm">
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-teal-200">We noticed things have been tough.</h3>
                                <p className="text-xs text-teal-400/80">
                                    A conversation with professional might help clear the fog.
                                </p>
                            </div>
                            <button
                                onClick={() => { router.push('/booking'); onClose(); }}
                                className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold rounded-lg text-sm transition-all"
                            >
                                Book Session
                            </button>
                        </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mood Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-white/50 pl-1">How are you feeling?</label>
                            <div className="grid grid-cols-5 gap-2">
                                {moodOptions.map((opt) => {
                                    const isSelected = mood === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setMood(opt.value)}
                                            className={`group relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 ${isSelected
                                                    ? `bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105 z-10 ring-1 ring-white/20`
                                                    : "hover:bg-white/5 hover:scale-105"
                                                }`}
                                        >
                                            <span className={`text-2xl mb-1 transition-transform duration-200 ${isSelected ? 'scale-125' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                                                {opt.emoji}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                            {mood && (
                                <div className="text-center text-sm font-medium text-white/80 animate-in fade-in duration-300">
                                    {moodOptions.find(m => m.value === mood)?.label}
                                </div>
                            )}
                        </div>

                        {/* Factors */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-white/50 pl-1">What's affecting you?</label>
                            <div className="flex flex-wrap gap-2">
                                {FACTORS.map(f => {
                                    const isActive = selectedFactors.includes(f);
                                    return (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => {
                                                setSelectedFactors(prev => isActive ? prev.filter(x => x !== f) : [...prev, f]);
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${isActive
                                                    ? "bg-white text-black border-white shadow-md scale-105"
                                                    : "bg-black/20 text-white/60 border-white/5 hover:border-white/20 hover:bg-white/5"
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-white/50 pl-1">Journal</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Express yourself..."
                                rows={3}
                                className="w-full bg-black/20 border-2 border-white/5 rounded-xl p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-black/30 transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg ${currentMoodConfig
                                    ? `bg-gradient-to-r ${currentMoodConfig.color} text-white hover:shadow-xl hover:scale-[1.02]`
                                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                }`}
                        >
                            {isSubmitting ? "Saving..." : "Log Check-in"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="h-px bg-white/10 w-full" />

                    {/* History */}
                    <div className="space-y-4 pb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white/80">Recents</h3>
                            <button onClick={loadLogs} className="text-[10px] text-white/40 hover:text-white uppercase tracking-wider">
                                Refresh
                            </button>
                        </div>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-white/10">
                            {isLoadingLogs ? (
                                <div className="text-white/40 italic text-xs">Loading...</div>
                            ) : logs.length === 0 ? (
                                <div className="text-white/40 italic text-xs">No entries yet.</div>
                            ) : (
                                logs.map((log) => {
                                    const { factors, text } = parseNote(log.note);
                                    const mConf = moodOptions.find(m => m.value === log.mood);
                                    const { date, time } = formatDateTime(log.createdAt);

                                    return (
                                        <div key={log.id} className="relative animate-in slide-in-from-right-2 duration-300">
                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-neutral-900 border border-white/30 z-10" />

                                            <div className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{mConf?.emoji}</span>
                                                        <div>
                                                            <div className="text-xs font-bold text-white/90">{mConf?.label}</div>
                                                            <div className="text-[10px] text-white/40">{date} • {time}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {factors.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {factors.map((f, i) => (
                                                            <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/60 border border-white/5">
                                                                {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {text && (
                                                    <p className="text-xs text-white/70 leading-relaxed font-light border-t border-white/5 pt-2 mt-1">
                                                        "{text}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
