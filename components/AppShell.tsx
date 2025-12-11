'use client';

import { useState, type ReactNode } from 'react';
import { NavBar } from './NavBar';
import { NotificationProvider } from './NotificationProvider';
import { MoodDrawer } from './MoodDrawer';

interface AppShellProps {
    children: ReactNode;
    user?: any; // Avoiding complex type imports for now
}

export function AppShell({ children, user }: AppShellProps) {
    const [isMoodOpen, setIsMoodOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_50%)] text-neutral-100 relative">
            <NotificationProvider>
                <NavBar user={user} />
                <main className="mx-auto max-w-5xl px-4 py-6 md:py-8 space-y-8">
                    {children}
                </main>

                {/* Mood Drawer & Floating Trigger */}
                <MoodDrawer isOpen={isMoodOpen} onClose={() => setIsMoodOpen(false)} />

                {/* Floating Trigger - Right Side */}
                <button
                    onClick={() => setIsMoodOpen(true)}
                    className="fixed right-0 top-[40%] -translate-y-1/2 z-40 bg-white/5 hover:bg-white/10 border-l border-t border-b border-white/10 backdrop-blur-md rounded-l-xl py-4 px-2 shadow-lg transition-all duration-300 hover:pl-4 group"
                    title="Log Mood"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xl group-hover:scale-125 transition-transform duration-300">✨</span>
                        <span className="[writing-mode:vertical-rl] text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                            Mood
                        </span>
                    </div>
                </button>

            </NotificationProvider>
        </div>
    );
}
