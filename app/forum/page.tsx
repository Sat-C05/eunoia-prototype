"use client";

import Link from "next/link";

export default function ForumComingSoonPage() {
    return (
        <div className="space-y-8">
            {/* Standard Uniform Header */}
            <header className="space-y-2 border-b border-white/5 pb-6">
                <h1 className="text-3xl font-semibold text-white tracking-tight">Peer Support</h1>
                <p className="text-neutral-400 max-w-2xl">
                    A safe, anonymous community space for students.
                </p>
            </header>

            <div className="min-h-[400px] flex items-center justify-center">
                <div className="max-w-xl w-full text-center space-y-6 p-12 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
                    <div className="text-6xl animate-pulse">🚧</div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Under Construction</h2>
                        <p className="text-neutral-400">
                            We are building a moderated, anonymous space for authentic connection. Coming soon to Eunoia.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                            <span>🛡️ Moderated</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <span>👻 Anonymous</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline underline-offset-4">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
