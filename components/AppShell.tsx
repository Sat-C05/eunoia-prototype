'use client';

import type { ReactNode } from 'react';
import { NavBar } from './NavBar';
import { NotificationProvider } from './NotificationProvider';

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div
            style={{
                minHeight: '100vh',
                background:
                    'radial-gradient(circle at top, #1d4ed8 0, #020617 40%, #000 100%)',
                color: '#e5e7eb',
            }}
        >
            <NotificationProvider>
                <NavBar />
                {children}
            </NotificationProvider>
        </div>
    );
}
