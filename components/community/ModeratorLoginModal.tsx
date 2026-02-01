"use client";

import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModeratorLoginModal({ isOpen, onClose }: Props) {
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passcode }),
            });

            if (res.ok) {
                window.location.href = "/moderator";
            } else {
                setError("Invalid Passcode");
            }
        } catch {
            setError("Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">✕</button>

                <h2 className="text-lg font-bold text-white mb-2">Moderator Access</h2>
                <p className="text-neutral-400 text-sm mb-6">Enter your admin passcode to manage content.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="Passcode"
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                    />

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Verifying..." : "Enter Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
