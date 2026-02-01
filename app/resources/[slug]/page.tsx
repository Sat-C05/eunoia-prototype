import { getResourceContent } from "@/lib/resources";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Force dynamic rendering if file changes matter, or static if cached.
export const dynamic = 'force-dynamic';

export default async function ResourcePage({ params }: { params: { slug: string } }) {
    const resource = await getResourceContent(params.slug);

    if (!resource) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 lg:p-12 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Nav */}
                <div className="mb-8">
                    <Link href="/community" className="text-sm font-bold text-neutral-500 hover:text-white transition-colors">
                        ← Back to Community
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-10 pb-10 border-b border-white/10">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70">
                        {resource.frontmatter.title || "Resource"}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider">
                            Guide
                        </span>
                        <span>5 min read</span>
                    </div>
                </header>

                {/* Content */}
                <article className="prose prose-invert prose-lg max-w-none prose-headings:font-light prose-p:text-neutral-300 prose-a:text-blue-400 prose-strong:text-white prose-blockquote:border-l-blue-500 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {resource.content}
                    </ReactMarkdown>
                </article>

                {/* Footer */}
                <div className="mt-16 pt-10 border-t border-white/10 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left bg-neutral-900/30 p-8 rounded-3xl">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Need to talk?</h3>
                        <p className="text-neutral-400 text-sm">Our counselors are here to listen.</p>
                    </div>
                    <Link
                        href="/booking"
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-xl"
                    >
                        Book a Session
                    </Link>
                </div>
            </div>
        </div>
    );
}
