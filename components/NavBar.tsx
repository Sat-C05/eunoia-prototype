"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/assessment', label: 'Check-in' },
    { href: '/booking', label: 'Consult' },
    { href: '/resources', label: 'Resources' },
    { href: '/forum', label: 'Peer Support' },
    { href: '/settings', label: 'Settings' },
];

export function NavBar({ user }: { user?: { name?: string } | null }) {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-4 py-4">

                {/* Logo Area */}
                <Link href="/" className="group flex items-center gap-3 relative">
                    <div className="relative h-8 w-8">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 blur-sm opacity-70 group-hover:opacity-100 group-hover:blur-md transition-all duration-500" />
                        <div className="relative h-full w-full rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-slate-900 shadow-inner" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                        Eunoia
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
                    {navLinks.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href !== '/' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${isActive
                                    ? "text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-400">
                                Hi, <span className="text-white font-bold">{user.name || 'Student'}</span>
                            </span>
                            <button
                                onClick={async () => {
                                    await fetch('/api/auth/student-logout', { method: 'POST' });
                                    window.location.href = '/login';
                                }}
                                className="px-4 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5">
                            Log In
                        </Link>
                    )}
                    {/* Temp Admin Button - Only show if NO student user (or keep it, doesn't matter) */}
                    <Link href="/admin" className="px-3 py-1.5 text-neutral-500 hover:text-red-400 transition-colors" title="Admin Portal">
                        🔒
                    </Link>
                </div>

                {/* Mobile Menu Trigger (Simple for now) */}
                <div className="md:hidden">
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-white/50">☰</span>
                    </div>
                </div>

            </div>
        </header>
    );
}
