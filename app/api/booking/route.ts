import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Support both old 'slotTime' payload and new fuller payload
        const slotStr = body.slot || body.slotTime;
        const studentName = body.studentName || "Anonymous Student";
        const { userId } = body;

        if (!slotStr) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Try to parse slot string to date, fallback to now if invalid
        let slotDate = new Date(slotStr);
        if (isNaN(slotDate.getTime())) {
            slotDate = new Date();
        }

        const booking = await prisma.booking.create({
            data: {
                studentName,
                studentEmail: body.studentEmail ?? null,
                reason: body.reason ?? null,
                slot: slotDate,
                status: "PENDING",
                userId: userId ?? null,
            },
        });

        logEvent("booking_created", { id: booking.id, slot: booking.slot });

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            slotTime: slotStr
        });
    } catch (error) {
        logEvent("booking_error", { error: (error as Error).message });
        return NextResponse.json(
            { error: `Failed to create booking: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}
