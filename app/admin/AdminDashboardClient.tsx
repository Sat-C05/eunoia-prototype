"use client";

import { useEffect, useState } from "react";
import ModerationTab from "./ModerationTab";

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
    anonymousId: string | null;
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
    anonymousId: string | null;
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

type Tab = 'overview' | 'assessments' | 'bookings' | 'moods' | 'users' | 'moderation';

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
    const [users, setUsers] = useState<UserRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [assessmentFilter, setAssessmentFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    async function loadData() {
        try {
            setIsLoading(true);
            const [severityRes, assessmentsRes, bookingsRes, moodsRes, usersRes] = await Promise.all([
                fetch("/api/admin/severity-summary", { cache: "no-store" }),
                fetch("/api/admin/assessments/recent?limit=200", { cache: "no-store" }), // Increased limit for detailed view
                fetch("/api/admin/bookings/recent?limit=100", { cache: "no-store" }),
                fetch("/api/admin/moods/recent?limit=100", { cache: "no-store" }),
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

    // --- Computed Data ---
    const severities = severitySummary?.bySeverity ?? {};

    // Assessment Filtering
    const filteredAssessments = assessments.filter(a => {
        if (assessmentFilter !== "ALL" && a.assessmentType !== assessmentFilter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (a.userId?.toLowerCase().includes(query) || a.anonymousId?.toLowerCase().includes(query) || a.id.includes(query));
        }
        return true;
    });

    // Bookings Splitting (FIXED)
    // Registered = Has a student Email (and likely a Name)
    // Anonymous = No Email, just an ID (or manually entered name but no email usually)
    const registeredBookings = bookings.filter(b => !!b.studentEmail); // Simple check: If email exists, it's registered
    const anonymousBookings = bookings.filter(b => !b.studentEmail);   // If no email, it's anonymous/guest

    // Mood Analysis - Vibe Check
    const moodDistribution = [0, 0, 0, 0, 0, 0]; // Index 1-5 (ignore 0)
    moods.forEach(m => {
        if (m.mood >= 1 && m.mood <= 5) moodDistribution[m.mood]++;
    });
    const totalMoods = moods.length || 1;

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

    async function handleUpdateBookingStatus(id: string, status: string) {
        const res = await fetch(`/api/admin/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
        }
    }

    async function handleDeleteMood(id: string) {
        if (!confirm("Delete this mood log?")) return;
        await fetch(`/api/admin/moods/${id}`, { method: "DELETE" });
        setMoods((prev) => prev.filter((m) => m.id !== id));
    }

    async function handleDeleteUser(id: string) {
        if (!confirm("Delete this user and ALL data?")) return;
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


    // --- User Details Modal ---
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [selectedUserBookings, setSelectedUserBookings] = useState<BookingRow[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    async function handleViewUserBookings(user: UserRow) {
        setSelectedUser(user);
        setIsUserModalOpen(true);
        setSelectedUserBookings([]); // Clear prev
        try {
            const res = await fetch(`/api/admin/users/${user.id}/bookings`);
            if (res.ok) {
                const data = await res.json();
                setSelectedUserBookings(data.bookings || []);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 min-h-[80vh]">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
                <div className="px-4">
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
                    <p className="text-xs text-brand-300 opacity-60">Eunoia Management</p>
                </div>

                <nav className="space-y-1">
                    <SidebarItem id="overview" label="Overview" icon={<span className="text-lg">📊</span>} />
                    <SidebarItem id="assessments" label="Assessments" icon={<span className="text-lg">📝</span>} />
                    <SidebarItem id="bookings" label="Bookings" icon={<span className="text-lg">📅</span>} />
                    <SidebarItem id="moods" label="Mood Analysis" icon={<span className="text-lg">☁️</span>} />
                    <SidebarItem id="users" label="Users" icon={<span className="text-lg">👥</span>} />
                    <SidebarItem id="moderation" label="Moderation" icon={<span className="text-lg">🛡️</span>} />
                </nav>

                <div className="px-4 pt-4 border-t border-white/5 space-y-2">
                    <button onClick={loadData} className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors w-full">
                        Refresh Data
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 transition-colors w-full">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-neutral-900/40 rounded-[2.5rem] border border-white/5 p-8 min-h-[600px] backdrop-blur-sm relative overflow-hidden shadow-2xl">

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 relative overflow-hidden group">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 relative z-10">Total Users</span>
                                <div className="text-4xl font-bold text-white mt-2 relative z-10">{users.length}</div>
                                <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-[0.03] grayscale group-hover:grayscale-0 transition-all">👥</div>
                            </div>

                            <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 relative overflow-hidden group">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 relative z-10">Assessments</span>
                                <div className="text-4xl font-bold text-white mt-2 relative z-10">{assessments.length}</div>
                                <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-[0.03] grayscale group-hover:grayscale-0 transition-all">📝</div>
                            </div>

                            {/* Vibe Meter (Avg Mood) */}
                            <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 relative overflow-hidden">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Campus Vibe</span>
                                <div className="flex items-end gap-2 mt-2">
                                    <div className="text-4xl font-bold text-white">
                                        {(moods.reduce((acc, m) => acc + m.mood, 0) / (moods.length || 1)).toFixed(1)}
                                    </div>
                                    <span className="text-sm text-neutral-500 mb-1">/ 5.0</span>
                                </div>
                                {/* Bar */}
                                <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                        style={{ width: `${(moods.reduce((acc, m) => acc + m.mood, 0) / (moods.length || 1)) / 5 * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Energy Gauge (Avg Capacity - Mocked/Estimated from Mood if Capacity logs not fetched in overview, but we usually should. Let's assume correlated for now or fetch it.) */}
                            {/* Ideally we would fetch avg capacity. Let's use a placeholder 'Energy' based on mood-intensity or fetch distinct endpoint. */}
                            {/* For now, let's use a simple mood-derived metric "Resilience" */}
                            <div className="p-6 rounded-3xl bg-neutral-950/60 border border-white/5 relative overflow-hidden">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Energy Level</span>
                                <div className="flex items-end gap-2 mt-2">
                                    <div className="text-4xl font-bold text-white">
                                        {/* Mock calculation: High Mood usually correlates with Energy, but not always. */}
                                        {/* Let's render a "Loading..." if not ready, or just 75% static for demo if data missing. */}
                                        {/* Actually, let's use the mood vibe as a proxy for "Social Battery" for now until we add capacity fetch to loadData across the board. */}
                                        {((moods.reduce((acc, m) => acc + m.mood, 0) / (moods.length || 1)) * 20).toFixed(0)}%
                                    </div>
                                </div>
                                <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${(moods.reduce((acc, m) => acc + m.mood, 0) / (moods.length || 1)) * 20}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini-Feed */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Live Pulse</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {moods.slice(0, 5).map(m => (
                                    <div key={m.id} className="min-w-[200px] p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{m.mood >= 4 ? "🤩" : m.mood === 3 ? "😐" : "😫"}</span>
                                            <span className="text-xs text-neutral-400">{formatDate(m.createdAt)}</span>
                                        </div>
                                        {m.note && <p className="text-xs text-white/70 line-clamp-2">"{m.note}"</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assessments' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-bold text-white">Assessments</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
                            {["ALL", "PHQ9", "GAD7", "PSS", "UCLA", "PSWQ"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setAssessmentFilter(type)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${assessmentFilter === type ? "bg-white text-black" : "bg-white/5 text-neutral-400 hover:text-white"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-neutral-950/40 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-900 text-neutral-500 uppercase text-xs font-bold sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Severity</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredAssessments.map(a => (
                                        <tr key={a.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-white/50">{formatDate(a.createdAt)}</td>
                                            <td className="px-6 py-4 font-bold">{a.assessmentType}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-white/40">
                                                {a.userId ? `Reg: ${a.userId.slice(0, 6)}...` : `Anon: ${a.anonymousId?.slice(0, 6)}...`}
                                            </td>
                                            <td className="px-6 py-4">{a.totalScore}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${['severe', 'moderately severe', 'high stress', 'high worry', 'high loneliness'].includes(a.severity?.toLowerCase()) ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                    {a.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteAssessment(a.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-8 animate-in fade-in duration-500">

                        {/* Registered Section */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Registered Students <span className="text-xs font-normal text-neutral-500 ml-2">({registeredBookings.length})</span></h3>
                            <div className="grid grid-cols-1 gap-4">
                                {registeredBookings.map(b => (
                                    <div key={b.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <div className="font-bold text-white">{b.studentName}</div>
                                            <div className="text-sm text-neutral-400">{b.studentEmail}</div>
                                            <div className="text-xs text-neutral-500 mt-1">Requested: {formatDate(b.slot)}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.status}`}>{b.status}</span>
                                            {b.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')} className="text-green-400 text-xs font-bold border border-green-500/20 px-2 py-1 rounded hover:bg-green-500/10">Approve</button>
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')} className="text-red-400 text-xs font-bold border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/10">Deny</button>
                                                </>
                                            )}
                                            <button onClick={() => handleDeleteBooking(b.id)} className="text-neutral-500 hover:text-white">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                {registeredBookings.length === 0 && <p className="text-neutral-500 italic text-sm">No registered student bookings.</p>}
                            </div>
                        </section>

                        {/* Anonymous Section */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Anonymous Requests <span className="text-xs font-normal text-neutral-500 ml-2">({anonymousBookings.length})</span></h3>
                            <div className="grid grid-cols-1 gap-4">
                                {anonymousBookings.map(b => (
                                    <div key={b.id} className="p-4 rounded-xl bg-neutral-900/50 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-80">
                                        <div>
                                            <div className="font-bold text-white">Anonymous User</div>
                                            <div className="text-xs text-neutral-500 font-mono">ID: {b.anonymousId}</div>
                                            <div className="text-xs text-neutral-500 mt-1">Requested: {formatDate(b.slot)}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.status}`}>{b.status}</span>
                                            {b.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')} className="text-green-400 text-xs font-bold border border-green-500/20 px-2 py-1 rounded hover:bg-green-500/10">Approve</button>
                                                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')} className="text-red-400 text-xs font-bold border border-red-500/20 px-2 py-1 rounded hover:bg-red-500/10">Deny</button>
                                                </>
                                            )}
                                            <button onClick={() => handleDeleteBooking(b.id)} className="text-neutral-500 hover:text-white">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                {anonymousBookings.length === 0 && <p className="text-neutral-500 italic text-sm">No anonymous bookings.</p>}
                            </div>
                        </section>

                    </div>
                )}

                {activeTab === 'moods' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Campus Vibe Analysis</h2>

                        {/* Vibe Aggregation */}
                        <div className="grid grid-cols-5 gap-2 h-32 items-end">
                            {[1, 2, 3, 4, 5].map(rating => {
                                const count = moodDistribution[rating];
                                const percentage = count / totalMoods * 100;
                                return (
                                    <div key={rating} className="flex flex-col items-center gap-2 group">
                                        <div className="w-full bg-white/5 rounded-t-xl relative overflow-hidden group-hover:bg-white/10 transition-colors" style={{ height: '100px' }}>
                                            <div
                                                className={`absolute bottom-0 w-full transition-all duration-1000 ${rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ height: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-white">{rating} / 5</span>
                                        <span className="text-xs text-neutral-500">{count} logs</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 rounded-3xl bg-neutral-950 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-2">Common Themes</h3>
                            <p className="text-neutral-400 text-sm">Based on recent note keywords:</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {moods.flatMap(m => m.note?.split(' ') || []).filter(w => w.length > 4).slice(0, 10).map((word, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-xs text-neutral-300">{word}</span>
                                ))}
                            </div>
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
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleViewUserBookings(u)}>
                                                <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                                                <td className="px-6 py-4 text-white/60">{u.email}</td>
                                                <td className="px-6 py-4 font-mono text-white/40">{formatDate(u.createdAt)}</td>
                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                    <span className="inline-flex gap-2 text-xs">
                                                        <span title="Bookings" className="bg-white/5 px-2 py-1 rounded">📅 {u._count?.bookings || 0}</span>
                                                        <span title="Assessments" className="bg-white/5 px-2 py-1 rounded">📝 {u._count?.assessments || 0}</span>
                                                        <span title="Mood Logs" className="bg-white/5 px-2 py-1 rounded">😊 {u._count?.moodLogs || 0}</span>
                                                    </span>
                                                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300 text-xs font-bold">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'moderation' && <ModerationTab />}
            </main>
        </div>
    );
}
