"use client";

import { useEffect, useState } from "react";

// --- Types ---

type SeveritySummaryResponse = {
    totalCount: number;
    bySeverity: Record<string, number>;
    days: number;
};

type AssessmentRow = {
    id: string;
    createdAt: string;
    userId: string | null;
    assessmentType: string;
    totalScore: number;
    severity: string;
};

type BookingRow = {
    id: string;
    createdAt: string;
    studentName: string;
    studentEmail: string | null;
    reason: string | null;
    slot: string;
    status: string;
};

type MoodRow = {
    id: string;
    createdAt: string;
    userId: string | null;
    mood: number;
    note: string | null;
};

type UserRow = {
    id: string;
    createdAt: string;
    email: string;
    name: string;
    _count: {
        assessments: number;
        bookings: number;
        moodLogs: number;
    };
};

type Tab = 'overview' | 'assessments' | 'bookings' | 'moods' | 'users';

// --- Helpers ---

function formatDate(input: string) {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboardClient() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [severitySummary, setSeveritySummary] = useState<SeveritySummaryResponse | null>(null);
    const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [moods, setMoods] = useState<MoodRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [users, setUsers] = useState<UserRow[]>([]);

    async function loadData() {
        try {
            setIsLoading(true);
            const [severityRes, assessmentsRes, bookingsRes, moodsRes, usersRes] = await Promise.all([
                fetch("/api/admin/severity-summary", { cache: "no-store" }),
                fetch("/api/admin/assessments/recent?limit=50", { cache: "no-store" }),
                fetch("/api/admin/bookings/recent?limit=50", { cache: "no-store" }),
                fetch("/api/admin/moods/recent?limit=50", { cache: "no-store" }),
                fetch("/api/admin/users", { cache: "no-store" }),
            ]);

            const severity = severityRes.ok ? await severityRes.json() : null;
            const assessmentsJson = assessmentsRes.ok ? await assessmentsRes.json() : { assessments: [] };
            const bookingsJson = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };
            const moodsJson = moodsRes.ok ? await moodsRes.json() : { moods: [] };
            const usersJson = usersRes.ok ? await usersRes.json() : { users: [] };

            setSeveritySummary(severity);
            setAssessments(assessmentsJson.assessments ?? []);
            setBookings(bookingsJson.bookings ?? []);
            setMoods(moodsJson.moods ?? []);
            setUsers(usersJson.users ?? []);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const severities = severitySummary?.bySeverity ?? {};
    const totalAssessments = severitySummary?.totalCount ?? 0;

    // --- Actions ---

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
    }

    async function handleDeleteAssessment(id: string) {
        if (!confirm("Delete this assessment?")) return;
        await fetch(`/api/admin/assessments/${id}`, { method: "DELETE" });
        setAssessments((prev) => prev.filter((a) => a.id !== id));
    }

    async function handleDeleteBooking(id: string) {
        if (!confirm("Delete this booking?")) return;
        await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
        setBookings((prev) => prev.filter((b) => b.id !== id));
    }

    async function handleDeleteMood(id: string) {
        if (!confirm("Delete this mood log?")) return;
        await fetch(`/api/admin/moods/${id}`, { method: "DELETE" });
        setMoods((prev) => prev.filter((m) => m.id !== id));
    }

    async function handleUpdateBookingStatus(id: string, status: string) {
        const res = await fetch(`/api/admin/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            const data = await res.json().catch(() => null);
            const updated = data?.booking as BookingRow | undefined;
            if (updated) {
                setBookings((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
                );
            } else {
                loadData();
            }
        }
    }

    async function handleDeleteUser(id: string) {
        if (!confirm("Are you sure? This will delete the user and ALL their data (bookings, mood logs, etc).")) return;

        await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        setUsers((prev) => prev.filter((u) => u.id !== id));
    }

    // --- Render Components ---

    const SidebarItem = ({ id, label, icon }: { id: Tab | 'users', label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id as Tab)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === id
                ? "bg-white/10 text-white shadow-lg border border-white/5"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
        >
            <span className={activeTab === id ? "text-purple-300" : "text-neutral-500"}>{icon}</span>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row gap-8 min-h-[80vh]">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
                <div className="px-4">
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
                    <p className="text-xs text-brand-300 opacity-60">Eunoia Management</p>
                </div>

                <nav className="space-y-1">
                    <SidebarItem id="overview" label="Overview" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
                    <SidebarItem id="assessments" label="Assessments" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
                    <SidebarItem id="bookings" label="Bookings" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                    <SidebarItem id="moods" label="Mood Logs" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <SidebarItem id="users" label="Users" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                </nav>

                <div className="px-4 pt-4 border-t border-white/5 space-y-2">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors w-full"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh Data
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 transition-colors w-full">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-neutral-900/40 rounded-[2.5rem] border border-white/5 p-8 min-h-[600px] backdrop-blur-sm relative overflow-hidden shadow-2xl">
                {/* Content Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 space-y-2">
                                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Users</span>
                                    <div className="text-4xl font-bold text-white">{users.length}</div>
                                </div>
                                <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 space-y-2">
                                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Assessments</span>
                                    <div className="text-4xl font-bold text-white">{totalAssessments}</div>
                                </div>
                                <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 space-y-2">
                                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Pending Bookings</span>
                                    <div className="text-4xl font-bold text-white text-yellow-500">
                                        {bookings.filter(b => b.status === "PENDING").length}
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 space-y-2">
                                    <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Mood Logs (24h)</span>
                                    <div className="text-4xl font-bold text-white text-blue-400">
                                        {moods.length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Risk Distribution</h3>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(severities).map(([severity, count]) => (
                                    <div key={severity} className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                                        <span className={`w-2 h-2 rounded-full ${['severe', 'moderately severe'].includes(severity.toLowerCase()) ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <span className="capitalize text-white text-sm">{severity}</span>
                                        <span className="text-white/40 text-sm font-mono">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(severities).length === 0 && <span className="text-neutral-500 italic text-sm">No data available</span>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assessments' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Assessments</h2>
                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 flex flex-col max-h-[70vh]">
                            <div className="overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-sm relative">
                                    <thead className="bg-neutral-900 text-white/40 uppercase text-xs font-bold sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 bg-neutral-900">Date</th>
                                            <th className="px-6 py-4 bg-neutral-900">Type</th>
                                            <th className="px-6 py-4 bg-neutral-900">Score</th>
                                            <th className="px-6 py-4 bg-neutral-900">Severity</th>
                                            <th className="px-6 py-4 bg-neutral-900 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-white/80">
                                        {assessments.map(a => (
                                            <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 font-mono text-white/50">{formatDate(a.createdAt)}</td>
                                                <td className="px-6 py-4 font-bold">{a.assessmentType}</td>
                                                <td className="px-6 py-4">{a.totalScore}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${['severe', 'moderately severe'].includes(a.severity?.toLowerCase()) ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                        {a.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDeleteAssessment(a.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300 text-xs">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {assessments.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-white/30 italic">No assessments found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Booking Requests</h2>
                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 flex flex-col max-h-[70vh]">
                            <div className="overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-sm relative">
                                    <thead className="bg-neutral-900 text-white/40 uppercase text-xs font-bold sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 bg-neutral-900">Session Time</th>
                                            <th className="px-6 py-4 bg-neutral-900">Student</th>
                                            <th className="px-6 py-4 bg-neutral-900">Status</th>
                                            <th className="px-6 py-4 bg-neutral-900 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-white/80">
                                        {bookings.map(b => (
                                            <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white">{formatDate(b.slot)}</div>
                                                    <div className="text-xs text-white/40">Req: {formatDate(b.createdAt)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white">{b.studentName}</div>
                                                    <div className="text-xs text-white/40">{b.studentEmail || 'No email'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-300' : b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    {b.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')} className="text-green-400 hover:text-green-300 text-xs font-bold">Approve</button>
                                                            <button onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')} className="text-yellow-400 hover:text-yellow-300 text-xs">Reject</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleDeleteBooking(b.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300 text-xs">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-white/30 italic">No bookings found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'moods' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Mood Logs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                            {moods.map(m => (
                                <div key={m.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${m.mood >= 4 ? 'bg-green-500/20 text-green-300' : m.mood === 3 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                                            Mood: {m.mood}/5
                                        </div>
                                        <span className="text-xs text-white/30 font-mono">{formatDate(m.createdAt)}</span>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed mb-4">
                                        {m.note || <span className="text-white/30 italic">No note added.</span>}
                                    </p>
                                    <button
                                        onClick={() => handleDeleteMood(m.id)}
                                        className="absolute bottom-4 right-4 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                            {moods.length === 0 && <div className="col-span-2 text-center text-white/30 italic py-10">No mood logs found</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Registered Users</h2>
                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 flex flex-col max-h-[70vh]">
                            <div className="overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-sm relative">
                                    <thead className="bg-neutral-900 text-white/40 uppercase text-xs font-bold sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 bg-neutral-900">Name</th>
                                            <th className="px-6 py-4 bg-neutral-900">Email</th>
                                            <th className="px-6 py-4 bg-neutral-900">Joined</th>
                                            <th className="px-6 py-4 bg-neutral-900 text-right">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-white/80">
                                        {users.map((u: UserRow) => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                                                <td className="px-6 py-4 text-white/60">{u.email}</td>
                                                <td className="px-6 py-4 font-mono text-white/40">{formatDate(u.createdAt)}</td>
                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                    <span className="inline-flex gap-2 text-xs">
                                                        <span title="Bookings" className="bg-white/5 px-2 py-1 rounded">📅 {u._count?.bookings || 0}</span>
                                                        <span title="Assessments" className="bg-white/5 px-2 py-1 rounded">📝 {u._count?.assessments || 0}</span>
                                                        <span title="Mood Logs" className="bg-white/5 px-2 py-1 rounded">😊 {u._count?.moodLogs || 0}</span>
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300 text-xs font-bold"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-white/30 italic">No registered users found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
