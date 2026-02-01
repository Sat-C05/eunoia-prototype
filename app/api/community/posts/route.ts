import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const { content, title, category, anonymousId } = await req.json();

        if (!content || !category || !anonymousId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Enforce max length
        if (content.length > 2000) { // Increased limit for "full post" since we truncate in UI
            return NextResponse.json({ error: "Content too long (max 2000 chars)" }, { status: 400 });
        }

        // Calculate Expiry (7 Days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const post = await prisma.post.create({
            data: {
                title: title || "Untitled Reflection",
                content,
                category,
                anonymousId,
                userId: session?.userId || null, // Link to user if logged in!
                expiresAt
            }
        });

        return NextResponse.json({ success: true, post });

    } catch (error) {
        console.error("Create Post Error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const limit = parseInt(searchParams.get("limit") || "50");

        const now = new Date();

        const posts = await prisma.post.findMany({
            where: {
                // filter expired posts
                expiresAt: {
                    gt: now
                },
                // filter flagged posts
                isFlagged: false,
                // optional category filter
                ...(category ? { category } : {})
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: { reactions: true }
                }
            }
        });

        return NextResponse.json({ posts });

    } catch (error) {
        console.error("Fetch Posts Error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
