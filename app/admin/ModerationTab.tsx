"use client";

import { useEffect, useState } from "react";

type FlaggedPost = {
    id: string;
    content: string;
    createdAt: string;
    anonymousId: string;
    isFlagged: boolean;
};

export default function ModerationTab() {
    const [posts, setPosts] = useState<FlaggedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFlaggedPosts();
    }, []);

    async function loadFlaggedPosts() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/moderation/posts");
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAction(id: string, action: 'DELETE' | 'RESTORE') {
        const url = `/api/admin/moderation/posts/${id}`;
        await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        });
        setPosts(prev => prev.filter(p => p.id !== id));
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
            <div className="rounded-2xl border border-white/5 bg-neutral-950/40 flex flex-col max-h-[70vh]">
                <div className="overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm relative">
                        <thead className="bg-neutral-900 text-white/40 uppercase text-xs font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 bg-neutral-900">Content</th>
                                <th className="px-6 py-4 bg-neutral-900">User ID</th>
                                <th className="px-6 py-4 bg-neutral-900 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                            {posts.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 max-w-md truncate" title={p.content}>
                                        {p.content}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-white/50">{p.anonymousId}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleAction(p.id, 'RESTORE')} className="text-green-400 hover:text-green-300 text-xs font-bold">Restore</button>
                                        <button onClick={() => handleAction(p.id, 'DELETE')} className="text-red-400 hover:text-red-300 text-xs font-bold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-white/30 italic">No flagged content found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
