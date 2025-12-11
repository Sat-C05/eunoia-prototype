import { NextRequest, NextResponse } from "next/server";
import {
    getSeverityForAssessment,
    type AssessmentType,
} from "@/lib/assessmentConfig";
import { logEvent } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Support prompt's array style inputs
        // answers as before
        let answers: number[] = [];
        if (Array.isArray(body.answers)) {
            answers = body.answers.map((v: unknown) => Number(v) || 0);
        } else {
            // Fallback for current frontend which sends q1..q9
            for (let i = 1; i <= 9; i++) {
                // We only push if property exists to avoid pushing 0s for missing optional GAD questions etc
                // But for PHQ9 we expect 9.
                const val = body[`q${i}`];
                if (val !== undefined) {
                    answers.push(Number(val) || 0);
                }
            }
        }

        const totalScore = answers.reduce((sum, val) => sum + val, 0);

        const requestedType = (body.assessmentType || body.type) as AssessmentType | undefined;
        const assessmentType: AssessmentType =
            requestedType === "GAD7" || requestedType === "PHQ9"
                ? requestedType
                : "PHQ9";

        const severity = getSeverityForAssessment(assessmentType, totalScore);

        // Save to DB (SQLite) - rawAnswers is a String in the schema
        await prisma.assessment.create({
            data: {
                // Only link to User table if it looks like a valid Auth ID (CUID), not a UUID client ID.
                userId: body.userId && body.userId.length > 20 ? body.userId : null,
                assessmentType,
                totalScore,
                severity,
                rawAnswers: JSON.stringify(answers),
            },
        });

        logEvent("assessment_submitted", { totalScore, severity, assessmentType });

        return NextResponse.json({ totalScore, severity, assessmentType });
    } catch (error) {
        logEvent("assessment_error", { error: (error as Error).message });
        return NextResponse.json(
            { error: "Failed to submit assessment" },
            { status: 500 }
        );
    }
}
