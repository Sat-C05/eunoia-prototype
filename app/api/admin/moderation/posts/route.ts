import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest) {
    const session = await getSession();
    /* 
    if (!session || !session.user || session.user.email !== "admin@eunoia.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } 
    */

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
