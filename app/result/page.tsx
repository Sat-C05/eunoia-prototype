// app/result/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type AssessmentType } from '@/lib/assessmentConfig';

function getRecommendations(type: AssessmentType, severity: string): string[] {
    const s = severity.toLowerCase();

    if (type === "PHQ9") {
        if (s.includes("minimal")) {
            return [
                "Your score suggests minimal depressive symptoms.",
                "Keep using tools like the mood log and self-care habits to maintain your well-being.",
            ];
        }
        if (s.includes("mild") || s.includes("moderate")) {
            return [
                "Your score suggests mild to moderate depressive symptoms.",
                "Consider talking to a trusted friend or mentor about how you’ve been feeling.",
                "If these feelings persist or worsen, consider booking a counseling session.",
            ];
        }
        return [
            "Your score suggests more significant depressive symptoms.",
            "It may be helpful to speak with a mental health professional or campus counselor soon.",
            "If you ever feel at risk of harming yourself, please contact emergency services or a local helpline immediately.",
        ];
    }

    // GAD-7 cases
    if (s.includes("minimal")) {
        return [
            "Your score suggests minimal anxiety symptoms.",
            "Continue using healthy coping strategies like sleep, movement, and breaks.",
        ];
    }
    if (s.includes("mild") || s.includes("moderate")) {
        return [
            "Your score suggests mild to moderate anxiety symptoms.",
            "Notice when worries feel overwhelming and experiment with grounding or breathing exercises.",
            "Talking with a counselor or mentor can also help you manage stress more effectively.",
        ];
    }

    return [
        "Your score suggests more significant anxiety symptoms.",
        "It may be helpful to speak with a mental health professional or campus counselor soon.",
        "If anxiety is interfering with your daily life or sleep, please seek support rather than handling it alone.",
    ];
}

function getMessage(severity: string | null) {
    if (!severity) return null;

    const text = severity.toLowerCase();

    if (text.includes('minimal')) {
        return {
            heading: 'You seem to be doing okay overall.',
            body: 'Your responses suggest minimal depressive symptoms. Keep maintaining the routines that support you — healthy sleep, movement, and staying connected to people you trust.',
        };
    }
    if (text.includes('mild')) {
        return {
            heading: 'You may be going through a mildly stressful phase.',
            body: 'Mild symptoms can often be managed with self-care: regular sleep, breaks from screens, light exercise, and talking openly with someone you trust about how you feel.',
        };
    }
    if (text.includes('moderately severe')) {
        return {
            heading: 'It looks like you might be struggling quite a bit.',
            body: 'Your responses suggest a higher level of distress. It would be a good idea to speak to a counselor or mental health professional and not carry this alone.',
        };
    }
    if (text.includes('moderate')) {
        return {
            heading: 'You may be experiencing noticeable distress.',
            body: 'Moderate symptoms can impact your day-to-day life. Consider reaching out to a counselor, mentor, or trusted person, and making space in your routine for rest and support.',
        };
    }
    if (text.includes('severe')) {
        return {
            heading: 'You deserve support right now.',
            body: 'Your responses suggest significant distress. It is strongly recommended to talk to a mental health professional as soon as possible. If you have thoughts of self-harm or feel unsafe, please seek urgent help immediately.',
        };
    }

    return null;
}

import { Suspense } from 'react';

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const scoreParam = searchParams.get('score');
    const severityParam = searchParams.get('severity');

    const score = scoreParam ? Number(scoreParam) : null;
    const severity = severityParam || null;
    const type = searchParams.get('type');
    const message = getMessage(severity);

    const hasValidData = score !== null && !Number.isNaN(score) && !!severity;
    const recs = hasValidData ? getRecommendations(type as AssessmentType || 'PHQ9', severity!) : [];

    return (
        <div className="flex justify-center items-center py-10">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-xl backdrop-blur-md">
                <h1 className="text-3xl font-bold mb-2 text-neutral-100">
                    Your Assessment Result
                </h1>

                {!hasValidData ? (
                    <div>
                        <p className="mb-6 text-neutral-400 text-sm">
                            We could not find your assessment data. Please take the
                            self-assessment again.
                        </p>
                        <Link
                            href="/assessment"
                            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-purple-500 hover:shadow-lg"
                        >
                            Take Self-Assessment
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-8 mb-8 mt-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                                    Total Score
                                </p>
                                <p className="text-4xl font-bold text-neutral-100">{score}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                                    Severity
                                </p>
                                <p className="text-xl font-semibold text-purple-400">
                                    {severity}
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
                                <p className="font-semibold text-blue-200 mb-2">
                                    {message.heading}
                                </p>
                                <p className="text-sm text-blue-100 leading-relaxed">
                                    {message.body}
                                </p>
                            </div>
                        )}

                        {recs.length > 0 && (
                            <div className="mb-8 rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
                                <p className="text-sm font-medium text-neutral-300 mb-3 uppercase tracking-wide">
                                    Recommended Next Steps
                                </p>
                                <ul className="space-y-2 list-disc pl-4">
                                    {recs.map((line) => (
                                        <li
                                            key={line}
                                            className="text-sm text-neutral-400"
                                        >
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 mb-6">
                            <Link
                                href="/booking"
                                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-900/20"
                            >
                                Book a Counselor (Demo)
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.push('/assessment')}
                                className="inline-flex items-center justify-center rounded-lg border border-neutral-700 bg-transparent px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
                            >
                                Retake Assessment
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-200"
                            >
                                Back to Home
                            </Link>
                        </div>

                        <p className="text-xs text-neutral-500 pt-4 border-t border-neutral-800/50">
                            This is a prototype for educational purposes. It does not provide
                            a medical diagnosis. If you ever feel unsafe or have thoughts of
                            self-harm, please reach out to a trusted person, counselor, or
                            emergency services immediately.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="text-center py-20 text-neutral-500">Loading result...</div>}>
            <ResultContent />
        </Suspense>
    );
}
