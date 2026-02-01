"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Resource = {
    id: string;
    title: string;
    description: string;
    image: string | null;
    link: string | null;
    category: string;
};

export default function ResourcesIndexPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchResources() {
            try {
                const res = await fetch("/api/resources");
                const data = await res.json();
                if (data.resources) setResources(data.resources);
            } catch (error) {
                console.error("Failed to load resources", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchResources();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-12">

                <header>
                    <Link href="/community" className="text-sm font-bold text-neutral-500 hover:text-white transition-colors mb-4 block">
                        ← Back to Community
                    </Link>
                    <h1 className="text-4xl font-light mb-2 text-white">Wellness Library</h1>
                    <p className="text-xl text-neutral-400 font-light">Curated guides for your journey at Eunoia.</p>
                </header>

                {isLoading ? (
                    <div className="text-center py-20 text-neutral-600 animate-pulse">Loading library...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((res) => (
                            <Link
                                key={res.id}
                                // If it's an external link or internal generic link, use it. 
                                // Our migration kept IDs like "academic" so /resources/[id] should still work if pages exist.
                                // But newly added resources might be external links.
                                href={res.link || `/resources/${res.id}`}
                                target={res.link?.startsWith("http") ? "_blank" : "_self"}
                                className="group relative flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] overflow-hidden transition-all hover:border-white/20 hover:scale-[1.01] duration-300 h-full"
                            >
                                <div className="h-48 w-full relative overflow-hidden bg-neutral-900/50">
                                    <Image
                                        src={res.image || "/images/topics/default.png"}
                                        alt={res.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-4 left-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">{res.title}</h3>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <p className="text-sm text-neutral-400 mb-6 flex-grow leading-relaxed">
                                        {res.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">{res.category || "Guide"}</span>
                                        <span className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-all">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {resources.length === 0 && <p className="text-neutral-500 text-center col-span-3">No resources available at the moment.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
