import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to ensure array response even if DB fails
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeFetch(modelName: any, query: any) {
    try {
        return await modelName.findMany(query);
    } catch (e) {
        console.warn(`Failed to export ${modelName}`, e);
        return [];
    }
}

import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const anonymousId = searchParams.get('anonymousId');
    const session = await getSession();

    if (!anonymousId && !session) {
        return NextResponse.json({ error: 'ID or Session required' }, { status: 400 });
    }

    // Build Query Clause
    const whereClause: any = { OR: [] };
    if (anonymousId) whereClause.OR.push({ anonymousId });
    if (session?.userId) whereClause.OR.push({ userId: session.userId });

    // Fallback if no valid IDs found (shouldn't happen given check above)
    if (whereClause.OR.length === 0) return NextResponse.json({ error: 'No user context found' }, { status: 400 });

    try {
        // Fetch all data points in parallel
        const [assessments, moodLogs, experientialLogs, capacityLogs, journalEntries] = await Promise.all([
            safeFetch(prisma.assessment, { where: whereClause }),
            safeFetch(prisma.moodLog, { where: whereClause }),
            safeFetch(prisma.experientialLog, { where: whereClause }),
            safeFetch(prisma.capacityLog, { where: whereClause }),
            safeFetch(prisma.journalEntry, { where: whereClause })
        ]);

        const exportData = {
            generatedAt: new Date().toISOString(),
            user: {
                anonymousId: anonymousId || "N/A",
                userId: session?.userId || "N/A",
                // @ts-expect-error - session type inference issue
                name: session?.user?.name || "Guest"
            },
            stats: {
                assessments: assessments.length,
                moodLogs: moodLogs.length,
                journalEntries: journalEntries.length
            },
            data: {
                assessments,
                moodLogs,
                experientialLogs,
                capacityLogs,
                journalEntries
            }
        };

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="eunoia-export-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
