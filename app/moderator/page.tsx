"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
type Post = {
    id: string;
    title?: string;
    content: string;
    category: string;
    createdAt: string;
    isFlagged: boolean;
};

type Resource = {
    id: string;
    title: string;
    description: string;
    category: string;
    link: string;
    image: string | null;
};

export default function ModeratorPage() {
    const [activeTab, setActiveTab] = useState<"REVIEW" | "MANAGE">("REVIEW");
    const [flaggedPosts, setFlaggedPosts] = useState<Post[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAllData();
    }, []);

    async function fetchAllData() {
        setIsLoading(true);
        try {
            // 1. Verify Auth & Fetch Flagged
            const flagRes = await fetch("/api/admin/moderation/posts");
            if (flagRes.status === 401) {
                router.push("/");
                return;
            }
            const flagData = await flagRes.json();
            setFlaggedPosts(flagData.posts || []);

            // 2. Fetch All Posts (for Manager)
            const allRes = await fetch("/api/community/posts?limit=100");
            const allData = await allRes.json();
            setAllPosts(allData.posts || []);

            // 3. Fetch Resources
            const resRes = await fetch("/api/resources");
            const resData = await resRes.json();
            setResources(resData.resources || []);

        } catch (e) {
            console.error("Failed to load mod data", e);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleReviewAction(id: string, action: "restore" | "delete") {
        if (!confirm(action === "delete" ? "Delete permanently?" : "Restore to feed?")) return;

        // Optimistic UI
        setFlaggedPosts(prev => prev.filter(p => p.id !== id));

        await fetch(`/api/admin/moderation/posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        });

        if (action === "delete") setAllPosts(prev => prev.filter(p => p.id !== id));
    }

    async function handleDeletePost(id: string) {
        if (!confirm("Admin Delete: This cannot be undone.")) return;

        setAllPosts(prev => prev.filter(p => p.id !== id));

        await fetch(`/api/admin/moderation/posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete" })
        });
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 font-sans">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1 text-purple-400">Moderator Control</h1>
                    <p className="text-neutral-500 text-sm">Manage community safety and content.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/community" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                        ← Back to Community
                    </Link>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab("REVIEW")}
                    className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all ${activeTab === "REVIEW"
                        ? "bg-red-500/10 border-red-500/50 text-red-400"
                        : "bg-neutral-900 border-white/10 text-neutral-500 hover:text-white"
                        }`}
                >
                    Review Queue ({flaggedPosts.length})
                </button>
                <button
                    onClick={() => setActiveTab("MANAGE")}
                    className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all ${activeTab === "MANAGE"
                        ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                        : "bg-neutral-900 border-white/10 text-neutral-500 hover:text-white"
                        }`}
                >
                    Content Manager
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-neutral-600 animate-pulse">Loading data...</div>
            ) : (
                <>
                    {/* REVIEW TAB */}
                    {activeTab === "REVIEW" && (
                        <div className="space-y-4 max-w-4xl">
                            {flaggedPosts.length === 0 ? (
                                <div className="text-center py-32 rounded-3xl border border-dashed border-white/10 bg-white/5">
                                    <div className="text-4xl mb-4">✅</div>
                                    <div className="text-lg font-medium text-neutral-300">All clear</div>
                                    <p className="text-neutral-500">No flagged content to review.</p>
                                </div>
                            ) : (
                                flaggedPosts.map(post => (
                                    <div key={post.id} className="p-6 rounded-xl bg-neutral-900 border border-red-500/20 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div className="flex-grow space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300">Flagged</span>
                                                <span className="text-xs text-neutral-600 font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-neutral-200 text-lg leading-relaxed font-light">&quot;{post.content}&quot;</p>
                                        </div>
                                        <div className="flex gap-3 min-w-fit">
                                            <button onClick={() => handleReviewAction(post.id, "delete")} className="px-4 py-2 rounded-lg bg-black border border-neutral-800 text-red-400 hover:bg-red-950/30 font-bold text-sm">Delete</button>
                                            <button onClick={() => handleReviewAction(post.id, "restore")} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold text-sm">Restore</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* MANAGE TAB */}
                    {activeTab === "MANAGE" && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            <section>
                                <h3 className="text-lg font-bold mb-4 text-white">All Posts</h3>
                                <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {allPosts.map(post => (
                                        <div key={post.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 group">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] uppercase font-bold text-neutral-500">{post.category}</span>
                                                <span className="text-[10px] text-neutral-600">{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-neutral-300 line-clamp-2">{post.content}</p>
                                            <div className="pt-2 flex justify-end">
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="text-xs text-red-400 hover:text-red-300 px-3 py-1 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Force Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white">Resources</h3>
                                    <button
                                        onClick={() => {
                                            const title = prompt("Resource Title:");
                                            const description = prompt("Description:");
                                            const link = prompt("Link URL:");
                                            if (title && link) {
                                                fetch("/api/resources", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ title, description, link })
                                                }).then(() => fetchAllData());
                                            }
                                        }}
                                        className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold hover:bg-neutral-200 transition-colors"
                                    >
                                        + Add New
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {resources.map(res => (
                                        <div key={res.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 group">
                                            <div className="h-10 w-10 bg-neutral-800 rounded-lg flex items-center justify-center text-xl overflow-hidden relative">
                                                {res.image ? <img src={res.image} alt="" className="w-full h-full object-cover" /> : "📚"}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-bold text-sm truncate text-white">{res.title}</h4>
                                                <p className="text-xs text-neutral-500 truncate">{res.description}</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm("Delete this resource?")) return;
                                                    await fetch(`/api/resources/${res.id}`, { method: "DELETE" });
                                                    fetchAllData();
                                                }}
                                                className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {resources.length === 0 && <p className="text-neutral-500 text-xs text-center py-4">No resources found.</p>}
                                </div>
                            </section>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
