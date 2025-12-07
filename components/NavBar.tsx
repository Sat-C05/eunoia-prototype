'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/assessment', label: 'Self-Assessment' },
    { href: '/booking', label: 'Book a Counselor' },
    { href: '/forum', label: 'Peer Support' },
];

export function NavBar() {
    const pathname = usePathname();

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                padding: '0.75rem 1.5rem',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '960px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 1rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(148,163,184,0.5)',
                    background:
                        'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,64,175,0.6))',
                    boxShadow: '0 10px 40px rgba(15,23,42,0.9)',
                    backdropFilter: 'blur(14px)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <div
                        style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '999px',
                            background:
                                'radial-gradient(circle at 30% 30%, #38bdf8, #4f46e5, #0f172a)',
                            boxShadow: '0 0 18px rgba(56,189,248,0.8)',
                        }}
                    />
                    <span
                        style={{
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            color: '#e5e7eb',
                        }}
                    >
                        Eunoia
                    </span>
                </div>

                <nav
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                    }}
                >
                    {navLinks.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href !== '/' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    padding: '0.35rem 0.9rem',
                                    borderRadius: '999px',
                                    textDecoration: 'none',
                                    color: isActive ? '#e5e7eb' : '#cbd5f5',
                                    backgroundColor: isActive
                                        ? 'rgba(15,23,42,0.9)'
                                        : 'transparent',
                                    border: isActive
                                        ? '1px solid rgba(191,219,254,0.8)'
                                        : '1px solid transparent',
                                    transition: 'all 0.15s ease-out',
                                }}
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
