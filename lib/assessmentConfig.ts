export type AssessmentType = "PHQ9" | "GAD7";

export type AssessmentQuestion = {
    id: string;
    text: string;
};

// PHQ-9 questions (depression)
export const PHQ9_QUESTIONS: AssessmentQuestion[] = [
    { id: "q1", text: "Little interest or pleasure in doing things" },
    { id: "q2", text: "Feeling down, depressed, or hopeless" },
    { id: "q3", text: "Trouble falling or staying asleep, or sleeping too much" },
    { id: "q4", text: "Feeling tired or having little energy" },
    { id: "q5", text: "Poor appetite or overeating" },
    { id: "q6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down" },
    { id: "q7", text: "Trouble concentrating on things, such as reading or watching TV" },
    { id: "q8", text: "Moving or speaking so slowly that other people could have noticed, or the opposite — being fidgety or restless" },
    { id: "q9", text: "Thoughts that you would be better off dead, or of hurting yourself" },
];

// GAD-7 questions (anxiety)
export const GAD7_QUESTIONS: AssessmentQuestion[] = [
    { id: "g1", text: "Feeling nervous, anxious, or on edge" },
    { id: "g2", text: "Not being able to stop or control worrying" },
    { id: "g3", text: "Worrying too much about different things" },
    { id: "g4", text: "Trouble relaxing" },
    { id: "g5", text: "Being so restless that it is hard to sit still" },
    { id: "g6", text: "Becoming easily annoyed or irritable" },
    { id: "g7", text: "Feeling afraid as if something awful might happen" },
];

// PHQ-9 severity thresholds (keep existing behavior)
export function getPhq9Severity(totalScore: number): string {
    if (totalScore <= 4) return "minimal";
    if (totalScore <= 9) return "mild";
    if (totalScore <= 14) return "moderate";
    if (totalScore <= 19) return "moderately severe";
    return "severe";
}

// GAD-7 severity thresholds
export function getGad7Severity(totalScore: number): string {
    if (totalScore <= 4) return "minimal";
    if (totalScore <= 9) return "mild";
    if (totalScore <= 14) return "moderate";
    return "severe";
}

export function getSeverityForAssessment(
    assessmentType: AssessmentType,
    totalScore: number
): string {
    if (assessmentType === "GAD7") {
        return getGad7Severity(totalScore);
    }
    // default + PHQ-9
    return getPhq9Severity(totalScore);
}
