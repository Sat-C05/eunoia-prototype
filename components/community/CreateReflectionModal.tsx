"use client";

import { useState } from "react";

const CATEGORIES = [
    "Academic Stress",
    "Loneliness",
    "Burnout",
    "Relationships",
    "Future Anxiety",
    "Other"
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
    anonymousId: string;
}

export default function CreateReflectionModal({ isOpen, onClose, onPostCreated, anonymousId }: Props) {
    const [step, setStep] = useState<"RULES" | "WRITE">("RULES");
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit() {
        if (!content.trim()) return;

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/community/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    category,
                    anonymousId
                })
            });

            if (res.ok) {
                setContent("");
                setTitle("");
                setStep("RULES"); // Reset for next time
                onPostCreated();
                onClose();
            } else {
                alert("Failed to post. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-bold text-white">
                        {step === "RULES" ? "Community Values" : "New Reflection"}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === "RULES" ? (
                        <div className="space-y-6">
                            <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
                                <p>To keep this space safe for everyone, please agree to the following:</p>
                                <ul className="space-y-3 list-disc pl-4 marker:text-purple-400">
                                    <li><strong className="text-white">Share experiences, not advice.</strong> Say "I felt..." instead of "You should..."</li>
                                    <li><strong className="text-white">No medical claims.</strong> Do not diagnose or prescribe fixes.</li>
                                    <li><strong className="text-white">No judgment.</strong> This is a place for observation, not debate.</li>
                                    <li><strong className="text-white">Personal reflection only.</strong> Focus on your own journey.</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => setStep("WRITE")}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                            >
                                I Agree & Understand
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Title <span className="text-neutral-600 font-normal">(Optional)</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Give your reflection a name..."
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Topic</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat
                                                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">New Entry</h2>
                                <input
                                    type="text"
                                    placeholder="Title your thought (optional)"
                                    className="w-full bg-transparent text-xl md:text-2xl font-light text-white placeholder-neutral-700 outline-none mb-4"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder="What&apos;s on your mind? Use &quot;I feel...&quot; or &quot;I noticed...&quot;"
                                    className="w-full h-48 bg-transparent text-lg text-neutral-300 placeholder-neutral-700 resize-none outline-none leading-relaxed"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <div className="text-right text-xs text-neutral-600">
                                    {content.length}/2000
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!content.trim() || isSubmitting}
                                    className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Post anonymously"
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-neutral-500 mt-3">
                                    Your post will disappear from public view in 7 days.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
