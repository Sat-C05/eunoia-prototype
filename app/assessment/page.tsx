"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  type AssessmentType,
} from "@/lib/assessmentConfig";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";

const SCALE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];



const ASSESSMENT_META: Record<
  AssessmentType,
  { title: string; subtitle: string }
> = {
  PHQ9: {
    title: "PHQ-9 Depression Screening",
    subtitle:
      "A brief, clinically validated questionnaire to screen for symptoms of depression.",
  },
  GAD7: {
    title: "GAD-7 Anxiety Screening",
    subtitle:
      "A short, validated tool to screen for symptoms of generalized anxiety.",
  },
};

export default function AssessmentPage() {
  const router = useRouter();
  const { notify } = useNotifications();
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("PHQ9");
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    setUserId(getOrCreateClientUserId());
  }, []);

  const questions =
    assessmentType === "PHQ9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  // ensure answers array is sized correctly
  const normalizedAnswers = questions.map((_, index) => answers[index] ?? 0);

  function handleSelectType(type: AssessmentType) {
    setAssessmentType(type);
    setAnswers([]); // Reset answers when switching types
  }

  function setAnswer(index: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentType,
          answers: normalizedAnswers,
          userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = data?.error ?? "Failed to submit assessment";
        notify("error", message);
        return;
      }

      const data = await res.json();

      notify("success", "Assessment completed successfully.");

      // Redirect to the result page with query params
      const params = new URLSearchParams({
        score: data.totalScore.toString(),
        severity: data.severity,
        type: data.assessmentType || assessmentType, // Pass type just in case we update result page later to use it
      });

      router.push(`/result?${params.toString()}`);

    } catch (error) {
      console.error(error);
      notify("error", "Something went wrong while submitting assessment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-100">Mental health assessments</h1>
        <p className="text-sm text-neutral-400 max-w-xl">
          Choose a screening tool and answer the questions honestly.
        </p>
      </header>

      {/* Tool Picker */}
      <section className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSelectType("PHQ9")}
          className={[
            "group relative rounded-2xl border p-5 text-left transition-all duration-300",
            assessmentType === "PHQ9"
              ? "border-purple-500 bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
              : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80",
          ].join(" ")}
        >
          <div className={`font-medium text-base mb-1 ${assessmentType === "PHQ9" ? "text-purple-100" : "text-neutral-200"}`}>
            PHQ-9 · Depression
          </div>
          <div className={`text-xs ${assessmentType === "PHQ9" ? "text-purple-300/80" : "text-neutral-500 group-hover:text-neutral-400"}`}>
            Screens for symptoms of low mood and loss of interest.
          </div>
          {assessmentType === "PHQ9" && (
            <div className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSelectType("GAD7")}
          className={[
            "group relative rounded-2xl border p-5 text-left transition-all duration-300",
            assessmentType === "GAD7"
              ? "border-blue-500 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80",
          ].join(" ")}
        >
          <div className={`font-medium text-base mb-1 ${assessmentType === "GAD7" ? "text-blue-100" : "text-neutral-200"}`}>
            GAD-7 · Anxiety
          </div>
          <div className={`text-xs ${assessmentType === "GAD7" ? "text-blue-300/80" : "text-neutral-500 group-hover:text-neutral-400"}`}>
            Screens for symptoms of excessive worry and anxiety.
          </div>
          {assessmentType === "GAD7" && (
            <div className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          )}
        </button>
      </section>

      {/* Form Area */}
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-1 mb-8 border-b border-neutral-800 pb-6">
            <h2 className="text-xl font-medium text-neutral-100">
              {ASSESSMENT_META[assessmentType].title}
            </h2>
            <p className="text-sm text-neutral-400">
              {ASSESSMENT_META[assessmentType].subtitle}
            </p>
          </div>

          <p className={[
            "rounded-lg border p-4 text-sm",
            assessmentType === "PHQ9"
              ? "border-purple-500/20 bg-purple-900/10 text-purple-200"
              : "border-blue-500/20 bg-blue-900/10 text-blue-200"
          ].join(" ")}>
            Over the last 2 weeks, how often have you been bothered by the following problems?
          </p>

          <div className="space-y-6">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="space-y-3 rounded-xl border border-neutral-800/50 bg-neutral-950/30 p-4 transition-colors hover:border-neutral-700"
              >
                <div className="flex gap-3 text-sm font-medium text-neutral-200">
                  <span className="text-neutral-500 min-w-[1.5rem] text-right">
                    {index + 1}.
                  </span>
                  <span>{q.text}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pl-9 sm:grid-cols-4">
                  {SCALE_OPTIONS.map((opt) => {
                    const selected = normalizedAnswers[index] === opt.value;
                    const activeClasses = assessmentType === "PHQ9"
                      ? "border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                      : "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-900/20";

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(index, opt.value)}
                        className={[
                          "relative rounded-lg border px-2 py-3 text-xs font-medium transition-all duration-200",
                          selected
                            ? `${activeClasses} scale-[1.02]`
                            : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-600 hover:bg-neutral-800 hover:text-neutral-200",
                        ].join(" ")}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={[
                "inline-flex items-center justify-center rounded-lg px-8 py-3 text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                assessmentType === "PHQ9"
                  ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-900/20"
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-900/20"
              ].join(" ")}
            >
              {isSubmitting ? "Calculating..." : "Submit Assessment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
