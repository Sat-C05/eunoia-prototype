"use client";

import { useEffect, useState } from "react";

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

function formatDate(input: string) {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
}

export default function AdminDashboardClient() {
    const [severitySummary, setSeveritySummary] = useState<SeveritySummaryResponse | null>(null);
    const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function loadData() {
        try {
            setIsLoading(true);
            const [severityRes, assessmentsRes, bookingsRes] = await Promise.all([
                fetch("/api/admin/severity-summary", { cache: "no-store" }),
                fetch("/api/admin/assessments/recent?limit=20", { cache: "no-store" }),
                fetch("/api/admin/bookings/recent?limit=20", { cache: "no-store" }),
            ]);

            const severity = severityRes.ok ? await severityRes.json() : null;
            const assessmentsJson = assessmentsRes.ok ? await assessmentsRes.json() : { assessments: [] };
            const bookingsJson = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };

            setSeveritySummary(severity);
            setAssessments(assessmentsJson.assessments ?? []);
            setBookings(bookingsJson.bookings ?? []);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const severities = severitySummary?.bySeverity ?? {};
    const totalAssessments = severitySummary?.totalCount ?? 0;
    const windowDays = severitySummary?.days ?? 30;

    async function handleDeleteAssessment(id: string) {
        if (!confirm("Are you sure you want to delete this assessment?")) return;
        await fetch(`/api/admin/assessments/${id}`, { method: "DELETE" });
        setAssessments((prev) => prev.filter((a) => a.id !== id));
    }

    async function handleDeleteBooking(id: string) {
        if (!confirm("Are you sure you want to delete this booking?")) return;
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
            const data = await res.json().catch(() => null);
            const updated = data?.booking as BookingRow | undefined;
            if (updated) {
                setBookings((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
                );
            } else {
                // fallback: re-fetch
                loadData();
            }
        }
    }

    return (
        <div className="space-y-8">
            <header className="space-y-2 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-100">Admin dashboard</h1>
                    <p className="text-sm text-neutral-400 max-w-xl">
                        Overview of recent mental health assessments and counseling bookings.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={loadData}
                    className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-500 transition-colors"
                >
                    {isLoading ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            {/* Top cards */}
            <section className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md">
                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Assessments (last {windowDays} days)</div>
                    <div className="mt-4 text-4xl font-bold text-neutral-100">{totalAssessments}</div>
                    <div className="mt-2 text-xs text-neutral-500">
                        Total PHQ-9/GAD-7 submissions.
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md">
                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Severity distribution</div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {Object.keys(severities).length === 0 && (
                            <span className="text-neutral-500">No data yet</span>
                        )}
                        {Object.entries(severities).map(([severity, count]) => (
                            <span
                                key={severity}
                                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-950/50 px-3 py-1.5 transition-colors hover:border-neutral-600"
                            >
                                <span className="capitalize text-neutral-200 font-medium">{severity}</span>
                                <span className="text-neutral-500 font-mono">({count})</span>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md">
                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Recent bookings</div>
                    <div className="mt-4 text-4xl font-bold text-neutral-100">{bookings.length}</div>
                    <div className="mt-2 text-xs text-neutral-500">
                        Number of bookings fetched in the latest window.
                    </div>
                </div>
            </section>

            {/* Recent assessments table */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-100">Recent assessments</h2>
                    <p className="text-sm text-neutral-400">
                        Latest submissions with score and severity.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-neutral-950/40 text-neutral-400 border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {assessments.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-sm text-neutral-500 italic"
                                        >
                                            No assessments found yet.
                                        </td>
                                    </tr>
                                )}
                                {assessments.map((a) => (
                                    <tr key={a.id} className="transition-colors hover:bg-neutral-800/30">
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-300">
                                            {formatDate(a.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-neutral-500">
                                            {a.userId ? `${a.userId.substring(0, 8)}...` : "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-400">
                                            {a.assessmentType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-200 font-medium">
                                            {a.totalScore}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium capitalize text-neutral-300">
                                                {a.severity ?? '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap align-top text-xs">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAssessment(a.id)}
                                                className="rounded-full border border-neutral-700 px-2 py-1 text-[10px] text-neutral-300 hover:border-red-500 hover:text-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Recent bookings table */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-100">Recent bookings</h2>
                    <p className="text-sm text-neutral-400">
                        Latest counseling booking requests.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-neutral-950/40 text-neutral-400 border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Slot</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {bookings.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-sm text-neutral-500 italic"
                                        >
                                            No bookings found yet.
                                        </td>
                                    </tr>
                                )}
                                {bookings.map((b) => (
                                    <tr key={b.id} className="transition-colors hover:bg-neutral-800/30">
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-300">
                                            {formatDate(b.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-200 font-medium">
                                            {b.studentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-400">
                                            {b.studentEmail ?? "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-300">
                                            {formatDate(b.slot)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-300">
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap align-top text-xs space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateBookingStatus(b.id, "CONFIRMED")}
                                                className="rounded-full border border-neutral-700 px-2 py-1 text-[10px] text-neutral-300 hover:border-green-500 hover:text-green-300 transition-colors"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateBookingStatus(b.id, "CANCELLED")}
                                                className="rounded-full border border-neutral-700 px-2 py-1 text-[10px] text-neutral-300 hover:border-yellow-500 hover:text-yellow-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteBooking(b.id)}
                                                className="rounded-full border border-neutral-700 px-2 py-1 text-[10px] text-red-300 hover:border-red-500 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
