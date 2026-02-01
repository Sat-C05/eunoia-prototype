import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        const postId = params.id;

        if (!postId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // Fetch post to check ownership
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        // Verify ownership
        // 1. If logged in, check userId
        // 2. If anon, check anonymousId (passed in header or body? usually we can't verify anon delete easily without a token, 
        //    but for this app we'll assume Client-Side check is enough for Anon-created posts if we trust the local storage 'anonymousId' passed in query/body).
        //    Let's require userId match for now for strict Profile CRUD.

        let isOwner = false;
        // @ts-ignore - session type mismatch fix
        if (session && session.userId && post.userId === session.userId) {
            isOwner = true;
        } else {
            // Check anonymous ownership if provided in safe way? 
            // For now, let's allow deletes if the user sends the matching anonymousId in a header 'X-Anonymous-ID'
            const clientAnonId = req.headers.get("x-anonymous-id");
            if (clientAnonId && post.anonymousId === clientAnonId) {
                isOwner = true;
            }
        }

        if (!isOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.post.delete({ where: { id: postId } });
        return NextResponse.json({ success: true });

    } catch (_error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        const postId = params.id;
        const body = await req.json();

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        let isOwner = false;
        // @ts-ignore
        if (session && session.userId && post.userId === session.userId) isOwner = true;
        else {
            const clientAnonId = req.headers.get("x-anonymous-id");
            if (clientAnonId && post.anonymousId === clientAnonId) isOwner = true;
        }

        if (!isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        await prisma.post.update({
            where: { id: postId },
            data: {
                content: body.content,
                // @ts-ignore - title might not be in the generated type yet if prisma generate didn't run fully or type issue
                title: body.title
            }
        });

        return NextResponse.json({ success: true });

    } catch (_error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
