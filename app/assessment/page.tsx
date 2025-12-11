"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, AssessmentType } from "@/lib/assessmentConfig";

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

  const normalizedAnswers = questions.map((_, index) => answers[index] ?? 0);

  function handleSelectType(type: AssessmentType) {
    setAssessmentType(type);
    setAnswers([]);
  }

  function setAnswer(index: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function internalSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          assessmentType,
          answers: normalizedAnswers,
        }),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      const data = await res.json();
      notify("success", `Assessment submitted. Score: ${data.totalScore} (${data.severity})`);
      router.push(`/result?score=${data.totalScore}&type=${assessmentType}&severity=${data.severity}`);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Standard Uniform Header */}
      <header className="space-y-2 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Self-Assessment</h1>
        <p className="text-neutral-400 max-w-2xl">
          Clinically validated screening tools to help you understand your current mental well-being.
        </p>
      </header>

      {/* Main Content */}
      <div className="space-y-8">

        {/* Tool Selector */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelectType("PHQ9")}
            className={`relative p-6 rounded-xl border text-left transition-all duration-200 ${assessmentType === "PHQ9"
                ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 opacity-70 hover:opacity-100"
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${assessmentType === 'PHQ9' ? 'text-purple-300' : 'text-white'}`}>PHQ-9</h3>
              {assessmentType === "PHQ9" && <span className="text-purple-400 text-lg">✓</span>}
            </div>
            <p className="text-sm text-neutral-400">Depression Screening</p>
          </button>

          <button
            onClick={() => handleSelectType("GAD7")}
            className={`relative p-6 rounded-xl border text-left transition-all duration-200 ${assessmentType === "GAD7"
                ? "bg-teal-500/10 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 opacity-70 hover:opacity-100"
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${assessmentType === 'GAD7' ? 'text-teal-300' : 'text-white'}`}>GAD-7</h3>
              {assessmentType === "GAD7" && <span className="text-teal-400 text-lg">✓</span>}
            </div>
            <p className="text-sm text-neutral-400">Anxiety Screening</p>
          </button>
        </div>

        {/* Questionnaire Form */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-white/60">
              {questions.length}
            </span>
            Questions
          </h2>

          <form onSubmit={internalSubmit} className="space-y-8">
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-4 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                <p className="text-base text-neutral-200 font-medium">
                  {idx + 1}. {q.text}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((val) => (
                    <label
                      key={val}
                      className={`cursor-pointer flex flex-col items-center justify-center py-3 px-2 rounded-lg border text-center transition-all ${answers[idx] === val
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-transparent border-white/5 text-neutral-500 hover:bg-white/5 hover:border-white/10"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={val}
                        checked={answers[idx] === val}
                        onChange={() => setAnswer(idx, val)}
                        className="sr-only"
                        required
                      />
                      <span className="text-sm">
                        {val === 0
                          ? "Not at all"
                          : val === 1
                            ? "Several days"
                            : val === 2
                              ? "More than half"
                              : "Nearly every day"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || answers.length < questions.length}
                className="px-8 py-3 rounded-lg bg-white text-black font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? "Processing..." : "Submit Assessment"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
