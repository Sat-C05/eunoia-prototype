import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const answers: number[] = [];

        for (let i = 1; i <= 9; i++) {
            const raw = body[`q${i}`];

            // Accept string or number, convert to number
            const value = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);

            if (Number.isNaN(value)) {
                return NextResponse.json(
                    { error: `Invalid value for q${i}` },
                    { status: 400 }
                );
            }

            answers.push(value);
        }

        const totalScore = answers.reduce((sum, v) => sum + v, 0);

        let severity = 'Minimal';

        if (totalScore <= 4) {
            severity = 'Minimal';
        } else if (totalScore <= 9) {
            severity = 'Mild';
        } else if (totalScore <= 14) {
            severity = 'Moderate';
        } else if (totalScore <= 19) {
            severity = 'Moderately severe';
        } else {
            severity = 'Severe';
        }

        // For now, we DO NOT save to any database.
        // We just compute and return the result.
        return NextResponse.json(
            {
                totalScore,
                severity,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in /api/assessment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
