import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const logs = await prisma.moodLog.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { createdAt: "desc" },
        take: 30,
    });

    return NextResponse.json({ logs });
}
