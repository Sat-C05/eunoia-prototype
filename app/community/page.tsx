"use client";

import { useEffect, useState } from "react";
import CreateReflectionModal from "@/components/community/CreateReflectionModal";
import ModeratorLoginModal from "@/components/community/ModeratorLoginModal";
import Image from "next/image";
import Link from "next/link";
import { useNotifications } from "@/components/NotificationProvider";

import { getOrCreateClientUserId } from "@/lib/clientUserId";

type Post = {
    id: string;
    title?: string | null;
    content: string;
    category: string;
    createdAt: string;
    expiresAt: string;
    _count: { reactions: number };
};

import { RESOURCES } from "@/lib/resourceList";

export default function CommunityPage() {
    const { notify } = useNotifications();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModLoginOpen, setIsModLoginOpen] = useState(false);
    const [userId, setUserId] = useState("");

    // View Modal State
    const [viewingPost, setViewingPost] = useState<Post | null>(null);

    // --- Soft Reactions Icons ---
    const REACTIONS = [
        { type: "WARMTH", icon: "💙", label: "With you" },
        { type: "INSIGHT", icon: "💡", label: "Insightful" },
        { type: "SOLIDARITY", icon: "🫂", label: "Hug" },
    ];

    const [resources, setResources] = useState<any[]>([]); // Dynamic Resources

    useEffect(() => {
        setUserId(getOrCreateClientUserId());
        const fetchData = async () => {
            setIsLoading(true);
            await fetchPosts();
            await fetchResources();
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory]);

    async function fetchPosts() {
        try {
            const url = selectedCategory
                ? `/api/community/posts?category=${encodeURIComponent(selectedCategory)}`
                : "/api/community/posts";

            const res = await fetch(url, { cache: "no-store" });
            const data = await res.json();
            if (data.posts) setPosts(data.posts);
        } catch { }
    }

    async function fetchResources() {
        try {
            const res = await fetch("/api/resources");
            const data = await res.json();
            if (data.resources) setResources(data.resources);
        } catch { }
    }

    async function handleReact(postId: string, type: string) {
        // Optimistic Update
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, _count: { reactions: p._count.reactions + 1 } };
            }
            return p;
        }));

        await fetch(`/api/community/posts/${postId}/react`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonymousId: userId, type }),
        });
    }

    async function handleSave(postId: string) {
        notify("success", "Saved to Profile"); // Optimistic feedback
        await fetch(`/api/community/posts/${postId}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonymousId: userId })
        });
    }

    async function handleSaveResource(resourceId: string, title: string) {
        notify("success", "Resource Saved");
        await fetch(`/api/resources/${resourceId}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonymousId: userId, title })
        });
    }


    async function handleFlag(postId: string) {
        if (!confirm("Report this post as inappropriate? It will be hidden for review.")) return;

        // Optimistic hide
        setPosts(prev => prev.filter(p => p.id !== postId));

        await fetch(`/api/community/posts/${postId}/flag`, {
            method: "POST"
        });
    }

    function getDaysLeft(expiry: string) {
        const exp = new Date(expiry);
        const now = new Date();
        const diff = exp.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days <= 0) return "Expiring soon";
        return `${days}d left`;
    }

    return (
        <div className="min-h-screen pb-20 p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Community & Support</h1>
                    <p className="text-neutral-400 text-sm max-w-xl">
                        A safe space for reflection, supported by curated resources.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
                >
                    <span>✍️</span> Share Reflection
                </button>
            </header>

            <div className="grid lg:grid-cols-12 gap-8 items-start">

                {/* Main Feed (Posts) - Spans 8 cols */}
                <main className="order-2 lg:order-1 lg:col-span-8 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 pb-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${!selectedCategory
                                ? "bg-white text-black"
                                : "bg-white/5 text-neutral-400 hover:text-white"
                                }`}
                        >
                            All
                        </button>
                        {["Academic Stress", "Loneliness", "Burnout", "Relationships", "Future Anxiety"].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === cat
                                    ? "bg-white text-black"
                                    : "bg-white/5 text-neutral-400 hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-neutral-500">
                            No reflections yet. Be the first to share.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {posts.map(post => (
                                <div
                                    key={post.id}
                                    onClick={() => setViewingPost(post)}
                                    className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 flex flex-col justify-between min-h-[180px] cursor-pointer"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{post.category}</span>
                                            <span className="text-[10px] font-mono text-neutral-600">⏱ {getDaysLeft(post.expiresAt)}</span>
                                        </div>
                                        <div>
                                            {post.title && <h3 className="text-white font-bold mb-1 line-clamp-1">{post.title}</h3>}
                                            <p className="text-neutral-400 leading-relaxed font-light text-sm line-clamp-3">
                                                "{post.content}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between items-end border-t border-white/5 mt-4 border-dashed" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-1">
                                            {REACTIONS.map(r => (
                                                <button
                                                    key={r.type}
                                                    onClick={() => handleReact(post.id, r.type)}
                                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-base opacity-60 hover:opacity-100"
                                                    title={r.label}
                                                >
                                                    {r.icon}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-neutral-600 font-mono">{post._count?.reactions || 0}</span>

                                            {/* Save Button */}
                                            <button onClick={() => handleSave(post.id)} className="text-neutral-700 hover:text-blue-400 transition-colors text-xs" title="Save to Profile">
                                                🔖
                                            </button>

                                            <button onClick={() => handleFlag(post.id)} className="text-neutral-700 hover:text-red-400 transition-colors text-xs" title="Report">
                                                🚩
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Sidebar (Resources) - Spans 4 cols */}
                <aside className="order-1 lg:order-2 lg:col-span-4 space-y-6 sticky top-24">
                    {/* Crisis Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-red-900/20 to-neutral-900/50 border border-red-500/20 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                        <h3 className="text-red-200 font-bold mb-1 relative z-10">In Crisis?</h3>
                        <p className="text-xs text-red-200/60 mb-4 relative z-10">Immediate help is available 24/7.</p>
                        <div className="flex gap-2 relative z-10">
                            <a href="tel:988" className="flex-1 text-center py-2 bg-red-600 rounded-lg text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20">Call 988</a>
                            <button className="flex-1 py-2 bg-black/40 border border-red-500/30 rounded-lg text-xs font-medium text-red-300 hover:bg-red-900/20">Campus Police</button>
                        </div>
                    </div>

                    {/* Resources List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Resources</h3>
                            <span className="text-[10px] text-neutral-600">Curated for you</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {resources.slice(0, 4).map(res => (
                                <a
                                    key={res.id}
                                    href={res.link || "#"}
                                    target="_blank"
                                    className="group flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all hover:scale-[1.02]"
                                >
                                    <div className="h-12 w-12 rounded-xl overflow-hidden relative shrink-0">
                                        <Image
                                            src={res.image}
                                            alt={res.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors truncate">{res.title}</h4>
                                        <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{res.description}</p>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-2">
                                        <div className="text-neutral-600 group-hover:text-white transition-colors">→</div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSaveResource(res.id, res.title);
                                            }}
                                            className="text-neutral-600 hover:text-blue-400 p-1"
                                            title="Save to Reading List"
                                        >
                                            🔖
                                        </button>
                                    </div>
                                </a>
                            ))}
                        </div>

                        <Link
                            href="/resources"
                            className="block text-center w-full py-3 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            View All Resources
                        </Link>
                    </div>
                </aside>

            </div>

            <CreateReflectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={fetchPosts}
                anonymousId={userId}
            />

            {/* View Post Modal */}
            {viewingPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewingPost(null)}>
                    <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-start bg-white/5 sticky top-0 backdrop-blur-md z-10">
                            <div>
                                <div className="flex gap-2 items-center mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{viewingPost.category}</span>
                                    <span className="text-[10px] text-neutral-500">{new Date(viewingPost.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-xl font-bold text-white leading-tight">
                                    {viewingPost.title || "Untitled Reflection"}
                                </h2>
                            </div>
                            <button onClick={() => setViewingPost(null)} className="text-neutral-400 hover:text-white transition-colors p-1">
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <p className="text-neutral-200 leading-relaxed text-base whitespace-pre-wrap font-light">
                                {viewingPost.content}
                            </p>
                        </div>

                        {/* Footer (Reactions) */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                            <div className="flex gap-2">
                                {REACTIONS.map(r => (
                                    <button
                                        key={r.type}
                                        onClick={() => handleReact(viewingPost.id, r.type)}
                                        className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-sm flex gap-2 items-center text-neutral-400 hover:text-white border border-white/5 hover:border-white/20"
                                    >
                                        <span>{r.icon}</span>
                                        <span className="hidden sm:inline text-xs">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => { handleSave(viewingPost.id); }}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-blue-400 transition-colors"
                            >
                                🔖 Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ModeratorLoginModal
                isOpen={isModLoginOpen}
                onClose={() => setIsModLoginOpen(false)}
            />

            <footer className="pt-20 pb-4 text-center">
                <button
                    onClick={() => setIsModLoginOpen(true)}
                    className="text-[10px] text-neutral-700 hover:text-neutral-500 transition-colors uppercase tracking-widest font-bold"
                >
                    Are you a Moderator?
                </button>
            </footer>
        </div>
    );
}
