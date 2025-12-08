'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/assessment', label: 'Self-Assessment' },
    { href: '/mood', label: 'Mood Tracker' },
    { href: '/booking', label: 'Book a Counselor' },
    { href: '/forum', label: 'Peer Support' },
    { href: '/resources', label: 'Resources' },
    { href: '/settings', label: 'Settings' },
    { href: '/admin', label: 'Admin' },
];

export function NavBar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/70 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-slate-900 shadow-[0_0_18px_rgba(56,189,248,0.8)]" />
                    <span className="text-sm font-semibold uppercase tracking-widest text-neutral-100">
                        Eunoia
                    </span>
                </div>

                <nav className="flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href !== '/' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={[
                                    "rounded-full px-3 py-1 text-xs transition-colors",
                                    isActive
                                        ? "border border-purple-500 bg-purple-900/40 text-neutral-50"
                                        : "text-neutral-300 hover:bg-neutral-800"
                                ].join(" ")}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
