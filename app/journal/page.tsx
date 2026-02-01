"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { useNotifications } from "@/components/NotificationProvider";

// Prompts to cycle through
const PROMPTS = [
    "What is something small that went well today?",
    "What is a thought that feels heavy right now?",
    "If you could speak to your younger self, what would you say?",
    "What does 'rest' look like for you today?",
    "List three things that ground you.",
    "Describe your current mood as a landscape."
];

export default function JournalPage() {
    const [prompt, setPrompt] = useState("");
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [entries, setEntries] = useState<any[]>([]);
    const { notify } = useNotifications();

    // New State for "Reading Mode"
    const [viewingId, setViewingId] = useState<string | null>(null);

    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
        fetchEntries();

        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString('en-US', options));
    }, []);

    const fetchEntries = async () => {
        const id = getOrCreateClientUserId();
        try {
            const res = await fetch(`/api/journal?anonymousId=${id}`);
            const data = await res.json();
            if (data.entries) setEntries(data.entries);
        } catch (e) { }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        setIsSaving(true);
        try {
            const finalTitle = title.trim() || `Journal Entry - ${new Date().toLocaleDateString()}`;

            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    anonymousId: userId,
                    content,
                    title: finalTitle,
                    prompt: prompt,
                    tags: ["Daily Prompt"],
                    mood: "Neutral"
                })
            });

            if (!res.ok) throw new Error("Save failed");

            notify("success", "Entry saved securely.");
            // Reset to new entry after save
            startNewEntry();
            fetchEntries();
        } catch (e) {
            console.error(e);
            notify("error", "Failed to save entry. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (entryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this entry?")) return;

        try {
            const res = await fetch('/api/journal', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: entryId, anonymousId: userId })
            });
            if (res.ok) {
                notify("success", "Entry deleted.");
                if (viewingId === entryId) startNewEntry();
                fetchEntries();
            } else {
                throw new Error("Delete failed");
            }
        } catch {
            notify("error", "Could not delete entry.");
        }
    };

    const loadEntry = (entry: any) => {
        setViewingId(entry.id);
        setTitle(entry.title || "");
        setContent(entry.content);
        setPrompt(entry.prompt || "");
    };

    const startNewEntry = () => {
        setViewingId(null);
        setTitle("");
        setContent("");
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12 relative overflow-hidden flex flex-col lg:flex-row gap-12">

            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px] animate-pulse" />
            </div>

            {/* Left: Editor Area */}
            <div className="relative z-10 flex-grow max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex justify-between items-start">
                    <div>
                        <Link href="/community" className="text-sm font-bold text-neutral-500 hover:text-white mb-6 block">← Back to Hub</Link>

                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                                {viewingId ? "Reading Entry" : "Daily Reflection"}
                            </span>
                            <span className="text-xs font-mono text-neutral-500">{currentDate}</span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-light mt-2 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 min-h-[3rem]">
                            {prompt}
                        </h2>

                        {!viewingId && (
                            <button
                                onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}
                                className="text-xs text-neutral-600 hover:text-white mt-2 underline decoration-neutral-800"
                            >
                                Shuffle Prompt
                            </button>
                        )}
                    </div>

                    {viewingId && (
                        <button
                            onClick={startNewEntry}
                            className="bg-white/10 hover:bg-white text-white hover:text-black px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <span>+</span> New Entry
                        </button>
                    )}
                </header>

                <div className="relative group space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title your entry (optional)..."
                        readOnly={!!viewingId} // Read-only if viewing
                        className="w-full bg-transparent border-b border-white/10 p-2 text-xl font-light focus:outline-none focus:border-white/30 transition-colors placeholder:text-neutral-700"
                    />

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing..."
                        readOnly={!!viewingId}
                        className={`w-full h-[500px] bg-white/5 border border-white/10 rounded-3xl p-8 text-lg font-light leading-relaxed resize-none focus:outline-none transition-all placeholder:text-neutral-700 ${viewingId ? 'cursor-default focus:border-white/10' : 'focus:border-white/20 focus:bg-white/[0.07]'}`}
                    />

                    {!viewingId && (
                        <div className="absolute bottom-6 right-6 flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !content.trim()}
                                className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-white/5"
                            >
                                {isSaving ? "Saving..." : "Save Entry"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: History Sidebar */}
            <aside className="relative z-10 w-full lg:w-96 space-y-6">
                <div className="border-b border-white/5 pb-4 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Your History</h3>
                    <span className="text-xs text-neutral-600">{entries.length} Entries</span>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-hide">
                    {entries.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                            <p className="text-sm text-neutral-500 italic">No entries yet.</p>
                            <button onClick={startNewEntry} className="mt-4 text-sm text-indigo-400 font-bold hover:underline">Start Writing</button>
                        </div>
                    ) : (
                        entries.map(entry => (
                            <div
                                key={entry.id}
                                onClick={() => loadEntry(entry)}
                                className={`w-full p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 group relative ${viewingId === entry.id
                                    ? "bg-white/10 border-white/20 shadow-xl shadow-indigo-900/20"
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wide bg-white/5 px-2 py-1 rounded">
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>

                                    {/* Visible Delete Button */}
                                    <button
                                        onClick={(e) => handleDelete(entry.id, e)}
                                        className="text-neutral-600 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded-full transition-colors"
                                        title="Delete Entry"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>

                                <h4 className={`text-base font-medium transition-colors ${viewingId === entry.id ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                                    {entry.title || "Untitled Entry"}
                                </h4>

                                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                    {entry.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </div>
    );
}
