"use client";

import { useState, useEffect } from "react";
import { getOrCreateClientUserId } from "@/lib/clientUserId";

export default function SettingsPage() {
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
    }, []);

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold text-neutral-100">Settings & profile</h1>
                <p className="text-sm text-neutral-400 max-w-xl">
                    Eunoia currently uses an anonymous ID on this device to link your assessments, mood logs, and history. This is not a login and does not identify you by name.
                </p>
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md max-w-2xl">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 shrink-0">
                        <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div className="space-y-3 w-full">
                        <div>
                            <h2 className="text-lg font-medium text-neutral-100">
                                Anonymous Device ID
                            </h2>
                            <p className="text-xs text-neutral-500 mt-1">
                                This ID is stored only in your browser&apos;s local storage and used to group your history. Clearing browser data will reset it.
                            </p>
                        </div>
                        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 relative group">
                            <p className="font-mono text-sm text-neutral-300 break-all select-all">
                                {userId}
                            </p>
                            <span className="absolute top-3 right-3 text-[10px] text-neutral-600 uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Local Only
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
