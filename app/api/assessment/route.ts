import { NextResponse } from 'next/server';
import { getPhq9Severity } from '@/lib/assessmentConfig';
import { logEvent } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const answers: number[] = [];

        for (let i = 1; i <= 9; i++) {
            const raw = body[`q${i}`];

            // Accept string or number, convert to number
            const value =
                typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);

            if (Number.isNaN(value)) {
                return NextResponse.json(
                    { error: `Invalid value for q${i}` },
                    { status: 400 }
                );
            }

            answers.push(value);
        }

        const totalScore = answers.reduce((sum, v) => sum + v, 0);

        const severity = getPhq9Severity(totalScore);

        logEvent('assessment_submitted', {
            totalScore,
            severity,
        });

        // No DB write yet – this is a stateless demo endpoint.
        return NextResponse.json(
            {
                totalScore,
                severity,
            },
            { status: 200 }
        );
    } catch (error) {
        logEvent('assessment_error', {
            error:
                error instanceof Error ? error.message : 'Unknown error in /api/assessment',
        });

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
