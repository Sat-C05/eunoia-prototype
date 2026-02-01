"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { RESOURCES } from "@/lib/resourceList";
import Image from "next/image";

export default function ProfilePage() {
    const [userId, setUserId] = useState<string>("");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "journey" | "community" | "settings">("overview");
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
        setMounted(true);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const anonId = getOrCreateClientUserId();
            const res = await fetch(`/api/user/profile?anonymousId=${anonId}`);
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await fetch(`/api/user/export?anonymousId=${userId}`);
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eunoia-profile-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            alert("Export failed.");
        }
    };

    if (!mounted) return null;

    const { data, user } = profileData || {};

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-24 relative overflow-hidden transition-colors duration-500">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-purple-900/20">
                            {user?.name ? user.name[0] : "👤"}
                        </div>
                        <div>
                            <h1 className="text-4xl font-light text-white">{user?.name || "Guest User"}</h1>
                            <p className="text-neutral-400 font-mono text-xs mt-1">ID: {userId}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {["overview", "journey", "community", "settings"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab
                                    ? "bg-white text-black scale-105 shadow-lg"
                                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 text-center text-neutral-500 animate-pulse">Loading profile data...</div>
                ) : (
                    <main className="min-h-[400px]">
                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Stats */}
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2">
                                    <span className="text-4xl font-bold text-blue-400">{data?.assessments?.length || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-neutral-400">Assessments</span>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2">
                                    <span className="text-4xl font-bold text-green-400">{data?.moodLogs?.length || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-neutral-400">Check-ins</span>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2">
                                    <span className="text-4xl font-bold text-purple-400">{data?.bookings?.length || 0}</span>
                                    <span className="text-xs uppercase tracking-widest text-neutral-400">Consultations</span>
                                </div>

                                {/* Recent Activity */}
                                <div className="md:col-span-3 p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                                    <div className="space-y-4">
                                        {data?.moodLogs?.slice(0, 3).map((log: any) => (
                                            <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                                                <div className="text-2xl">{["", "😫", "😕", "😐", "🙂", "🤩"][log.mood]}</div>
                                                <div>
                                                    <div className="text-sm font-medium">Daily Check-in</div>
                                                    <div className="text-xs text-neutral-500">{new Date(log.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* JOURNEY TAB */}
                        {activeTab === "journey" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-neutral-200">Assessment History</h2>
                                    <div className="grid gap-4">
                                        {data?.assessments?.map((a: any) => (
                                            <div key={a.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div>
                                                    <span className="font-bold text-white">{a.assessmentType}</span>
                                                    <span className="text-xs text-neutral-400 ml-2">{new Date(a.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-mono text-blue-300">Score: {a.totalScore}</div>
                                                    <div className="text-xs text-neutral-500 uppercase">{a.severity}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.assessments || data.assessments.length === 0) && <p className="text-neutral-500 italic">No assessments yet.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-neutral-200">Consultations</h2>
                                    <div className="grid gap-4">
                                        {data?.bookings?.map((b: any) => (
                                            <div key={b.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div>
                                                    <span className="font-bold text-white">{b.reason || "Session"}</span>
                                                    <div className="text-xs text-neutral-400">{new Date(b.slot).toLocaleString()}</div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                                    {b.status}
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.bookings || data.bookings.length === 0) && <p className="text-neutral-500 italic">No bookings found.</p>}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* COMMUNITY TAB */}
                        {activeTab === "community" && (
                            <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-neutral-200">My Reflections</h2>
                                    <div className="space-y-4">
                                        {data?.myPosts?.map((p: any) => (
                                            <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/5 group relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-sm font-bold text-white">{p.title || "Untitled"}</h4>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm("Delete this reflection?")) return;
                                                            await fetch(`/api/community/posts/${p.id}`, {
                                                                method: 'DELETE',
                                                                headers: { 'x-anonymous-id': userId }
                                                            });
                                                            fetchProfile();
                                                        }}
                                                        className="text-neutral-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                                <p className="text-sm text-neutral-300 line-clamp-3">"{p.content}"</p>
                                                <div className="mt-2 flex justify-between items-center text-xs text-neutral-500">
                                                    <span>{p.category}</span>
                                                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.myPosts || data.myPosts.length === 0) && <p className="text-neutral-500 italic">No posts shared yet.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-neutral-200">Saved Gems</h2>
                                    <div className="space-y-4">
                                        {/* Saved Resources */}
                                        {data?.savedResources?.length > 0 && (
                                            <div className="mb-4 space-y-2">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Reading List</h3>
                                                {data.savedResources.map((sr: any) => {
                                                    const resDef = RESOURCES.find(r => r.id === sr.resourceId);
                                                    if (!resDef) return null;
                                                    return (
                                                        <a key={sr.id} href={resDef.link} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                                            <div className="h-10 w-10 relative rounded-lg overflow-hidden shrink-0">
                                                                <Image src={resDef.image} alt={resDef.title} fill className="object-cover" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-bold text-neutral-200">{resDef.title}</div>
                                                                <div className="text-[10px] text-neutral-500">Saved {new Date(sr.savedAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Reflections</h3>
                                        {data?.savedPosts?.map((p: any) => (
                                            <div key={p.id} className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-neutral-900 border border-indigo-500/20">
                                                <p className="text-sm text-neutral-200 line-clamp-2">"{p.content}"</p>
                                                <div className="mt-2 flex justify-between items-center text-xs text-neutral-500">
                                                    <span className="text-indigo-400">Saved</span>
                                                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data?.savedPosts || data.savedPosts.length === 0) && <p className="text-neutral-500 italic">No saved items.</p>}
                                    </div>
                                </section>
                            </div >
                        )
                        }

                        {/* SETTINGS TAB */}
                        {
                            activeTab === "settings" && (
                                <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                        <h3 className="font-bold text-white">Appearance</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => setTheme("dark")} className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-neutral-400 border-white/10'}`}>Dark</button>
                                            <button onClick={() => setTheme("light")} className={`p-3 rounded-lg border ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-neutral-400 border-white/10'}`}>Light</button>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                        <h3 className="font-bold text-white">Data Control</h3>
                                        <button onClick={handleExport} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors">
                                            Download My Data
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </main >
                )}
            </div >
        </div >
    );
}
