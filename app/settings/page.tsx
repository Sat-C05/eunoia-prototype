"use client";

import { useState, useEffect } from "react";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { useNotifications } from "@/components/NotificationProvider";

export default function SettingsPage() {
    const [userId, setUserId] = useState<string>("");
    const { notify } = useNotifications();

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(userId);
        notify("success", "ID copied to clipboard");
    };

    return (
        <div className="space-y-8">
            {/* Standard Uniform Header */}
            <header className="space-y-2 border-b border-white/5 pb-6">
                <h1 className="text-3xl font-semibold text-white tracking-tight">Settings & Privacy</h1>
                <p className="text-neutral-400 max-w-2xl">
                    Manage your local application preferences and view your anonymous identity.
                </p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">

                {/* ID Card - Simplified for Standard Layout */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Identity</h3>
                    <div className="p-6 rounded-xl bg-neutral-900/40 border border-white/5 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 text-white/70">
                                🆔
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Anonymous Passport</h4>
                                <p className="text-xs text-neutral-500">Device-local ID</p>
                            </div>
                        </div>

                        <p className="text-sm text-neutral-400">
                            This unique string links your data on this device. It identifies you without personal details.
                        </p>

                        <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 text-xs font-mono text-neutral-300 hover:border-white/20 transition-colors group"
                        >
                            <span className="truncate">{userId}</span>
                            <span className="opacity-0 group-hover:opacity-100 bg-white/10 px-2 py-0.5 rounded text-white font-sans transition-opacity">Copy</span>
                        </button>
                    </div>
                </section>

                {/* Preferences - Simplified for Standard Layout */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Preferences</h3>

                    <div className="space-y-3">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🌙</span>
                                <span className="text-sm font-medium text-white">Dark Mode</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-900 px-2 py-1 rounded">Active</span>
                        </div>

                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🔔</span>
                                <span className="text-sm font-medium text-white">Notifications</span>
                            </div>
                            <span className="text-[10px] text-neutral-500">Coming Soon</span>
                        </div>

                        <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 flex items-center justify-between cursor-pointer hover:bg-red-500/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🗑️</span>
                                <span className="text-sm font-medium text-red-200">Clear Data</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
