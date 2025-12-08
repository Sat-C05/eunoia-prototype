// app/forum/page.tsx
'use client';

import Link from 'next/link';

export default function ForumComingSoonPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900/60 p-10 shadow-2xl backdrop-blur-md text-center relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <h1 className="text-3xl font-bold mb-4 text-neutral-100 relative z-10">
                    Peer Support Space
                </h1>

                <div className="inline-block px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wider uppercase mb-6">
                    Coming Soon
                </div>

                <p className="text-base text-neutral-300 mb-8 max-w-md mx-auto leading-relaxed relative z-10">
                    In the full version of Eunoia, students will be able to share their
                    thoughts anonymously in a moderated peer support space.
                </p>

                <div className="bg-neutral-950/50 rounded-xl p-6 mb-8 text-left border border-neutral-800/50 relative z-10">
                    <h3 className="text-sm font-semibold text-neutral-200 mb-3 uppercase tracking-wide">Planned Features</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-neutral-400">
                            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Anonymous, campus-only discussions</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-neutral-400">
                            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Basic keyword filters for safety</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-neutral-400">
                            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Human moderators for escalation</span>
                        </li>
                    </ul>
                </div>

                <p className="text-xs text-neutral-500 mb-8 relative z-10">
                    This feature is intentionally not enabled in the prototype to keep the
                    focus on safety and core flows (assessment and booking).
                </p>

                <Link
                    href="/"
                    className="relative z-10 inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/20"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
