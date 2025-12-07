export type SeverityLevel =
    | 'Minimal'
    | 'Mild'
    | 'Moderate'
    | 'Moderately severe'
    | 'Severe';

interface Threshold {
    maxScore: number;
    label: SeverityLevel;
}

// PHQ-9 standard thresholds
export const PHQ9_THRESHOLDS: Threshold[] = [
    { maxScore: 4, label: 'Minimal' },
    { maxScore: 9, label: 'Mild' },
    { maxScore: 14, label: 'Moderate' },
    { maxScore: 19, label: 'Moderately severe' },
    { maxScore: 27, label: 'Severe' },
];

export function getPhq9Severity(totalScore: number): SeverityLevel {
    for (const t of PHQ9_THRESHOLDS) {
        if (totalScore <= t.maxScore) {
            return t.label;
        }
    }
    // Fallback — should never hit if thresholds cover 0–27
    return 'Severe';
}
