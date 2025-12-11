import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mood, note, userId } = body;

        const numericMood = Number(mood);
        if (Number.isNaN(numericMood) || numericMood < 1 || numericMood > 5) {
            return NextResponse.json(
                { error: "Mood must be between 1 and 5" },
                { status: 400 }
            );
        }

        const log = await prisma.moodLog.create({
            data: {
                mood: numericMood,
                note: note ?? null,
                // Only link to User table if it looks like a valid Auth ID (CUID), not a UUID client ID.
                userId: userId && userId.length > 20 ? userId : null,
            },
        });

        logEvent("mood_logged", { id: log.id, mood: numericMood });

        return NextResponse.json({ success: true });
    } catch (error) {
        logEvent("mood_error", { error: (error as Error).message });
        return NextResponse.json(
            { error: "Failed to log mood" },
            { status: 500 }
        );
    }
}
