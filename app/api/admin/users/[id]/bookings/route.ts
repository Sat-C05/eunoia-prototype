import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = params.id;

        const bookings = await prisma.booking.findMany({
            where: { userId },
            orderBy: { slot: 'desc' }
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user bookings" }, { status: 500 });
    }
}
