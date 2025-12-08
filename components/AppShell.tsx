'use client';

import type { ReactNode } from 'react';
import { NavBar } from './NavBar';
import { NotificationProvider } from './NotificationProvider';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_50%)] text-neutral-100">
            <NotificationProvider>
                <NavBar />
                <main className="mx-auto max-w-5xl px-4 py-6 md:py-8 space-y-8">
                    {children}
                </main>
            </NotificationProvider>
        </div>
    );
}
