import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const slotTime = body?.slotTime;

        if (!slotTime || typeof slotTime !== 'string') {
            return NextResponse.json(
                { error: 'Invalid or missing slotTime' },
                { status: 400 }
            );
        }

        // For now, we do NOT save to a database. This is a demo endpoint.
        // In a full version, we would create a booking record here.

        return NextResponse.json(
            {
                success: true,
                slotTime,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in /api/booking:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
