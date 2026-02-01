import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    // In production, add Admin Auth check here
    try {
        const posts = await prisma.post.findMany({
            where: { isFlagged: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ posts });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) { // Not used here, dynamic route needs folder structure
    return NextResponse.json({ error: "Use specific ID route" });
}
