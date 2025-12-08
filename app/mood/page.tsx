"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";

type MoodLog = {
    id: string;
    createdAt: string;
    userId: string | null;
    mood: number;
    note: string | null;
};

export default function MoodPage() {
    const { notify } = useNotifications();
    const [mood, setMood] = useState<number | null>(null);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [userId] = useState<string>(() => getOrCreateClientUserId());

    const moodOptions = [
        { value: 1, label: "Very low", emoji: "😢" },
        { value: 2, label: "Low", emoji: "🙁" },
        { value: 3, label: "Okay", emoji: "😐" },
        { value: 4, label: "Good", emoji: "🙂" },
        { value: 5, label: "Great", emoji: "😄" },
    ];

    async function loadLogs() {
        try {
            setIsLoadingLogs(true);
            const res = await fetch(`/api/mood/recent?userId=${encodeURIComponent(userId)}`);
            if (!res.ok) throw new Error("Failed to fetch mood logs");
            const data = await res.json();
            setLogs(data.logs ?? []);
        } catch (error) {
            console.error(error);
            notify("error", "Failed to load recent moods");
        } finally {
            setIsLoadingLogs(false);
        }
    }

    useEffect(() => {
        if (userId) {
            loadLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (mood === null) {
            notify("error", "Please select how you feel today");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/mood", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mood,
                    note: note.trim() || null,
                    userId,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                const message = data?.error ?? "Failed to log mood";
                notify("error", message);
                return;
            }

            notify("success", "Mood logged for today");
            setNote("");
            // keep same mood selected, feels nicer
            loadLogs();
        } catch (error) {
            console.error(error);
            notify("error", "Something went wrong while logging mood");
        } finally {
            setIsSubmitting(false);
        }
    }

    function formatDateTime(input: string) {
        const d = new Date(input);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString();
    }

    function moodLabel(value: number) {
        const found = moodOptions.find((m) => m.value === value);
        return found ? `${found.emoji} ${found.label}` : value;
    }

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold text-neutral-100">Mood log</h1>
                <p className="text-sm text-neutral-400 max-w-xl">
                    Take a few seconds to check in with yourself. Logging your mood over time can help you notice patterns and know when to reach out for support.
                </p>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                {/* Mood input card */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md space-y-6"
                >
                    <div className="space-y-1">
                        <h2 className="text-lg font-medium text-neutral-100">How are you feeling today?</h2>
                        <p className="text-xs text-neutral-400">
                            Choose the option that best matches your overall mood right now.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {moodOptions.map((option) => {
                            const selected = mood === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setMood(option.value)}
                                    className={[
                                        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300",
                                        selected
                                            ? "border-purple-500 bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105"
                                            : "border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-600 hover:bg-neutral-900/80 hover:text-neutral-200",
                                    ].join(" ")}
                                >
                                    <span className="text-base">{option.emoji}</span>
                                    <span>{option.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                            Add a note (optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-purple-500 focus:bg-neutral-900/80 transition-colors placeholder:text-neutral-600"
                            placeholder="Anything you want to remember about today?"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : "Save mood for today"}
                        </button>
                    </div>
                </form>

                {/* Recent moods card */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md space-y-4 max-h-[600px] flex flex-col">
                    <div className="flex items-center justify-between gap-2 shrink-0">
                        <div className="space-y-1">
                            <h2 className="text-lg font-medium text-neutral-100">Recent moods</h2>
                            <p className="text-xs text-neutral-400">
                                Your latest check-ins.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={loadLogs}
                            className="rounded-full border border-neutral-700 bg-transparent px-3 py-1 text-xs text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800/50"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                        {isLoadingLogs ? (
                            <p className="text-sm text-neutral-500 italic p-2">Loading recent moods…</p>
                        ) : logs.length === 0 ? (
                            <p className="text-sm text-neutral-500 italic p-2">
                                No moods logged yet. Your history will show up here after you start logging.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {logs.map((log) => (
                                    <li
                                        key={log.id}
                                        className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 transition-colors hover:border-neutral-700"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="font-medium text-sm text-neutral-200">
                                                {moodLabel(log.mood)}
                                            </div>
                                            <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                                                {formatDateTime(log.createdAt)}
                                            </div>
                                        </div>
                                        {log.note && (
                                            <p className="text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/50 pt-2 mt-2">
                                                {log.note}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
