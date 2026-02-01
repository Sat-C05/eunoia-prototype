"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/components/NotificationProvider";
import { getOrCreateClientUserId } from "@/lib/clientUserId";
import {
  PHQ9_QUESTIONS, GAD7_QUESTIONS, PSS_QUESTIONS, UCLA_QUESTIONS, PSWQ_QUESTIONS,
  AssessmentType
} from "@/lib/assessmentConfig";
import UnifiedCheckIn from "@/components/assessment/UnifiedCheckIn";

export default function AssessmentPage() {
  const router = useRouter();
  const { notify } = useNotifications();
  const [showTools, setShowTools] = useState(false);
  const [userId, setUserId] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tool State
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("PHQ9");
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUserId(getOrCreateClientUserId());
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const loadQuestions = () => {
    switch (assessmentType) {
      case "PHQ9": return PHQ9_QUESTIONS;
      case "GAD7": return GAD7_QUESTIONS;
      case "PSS": return PSS_QUESTIONS;
      case "UCLA": return UCLA_QUESTIONS;
      case "PSWQ": return PSWQ_QUESTIONS;
      default: return PHQ9_QUESTIONS;
    }
  };

  const questions = loadQuestions();

  const getToolTitle = (type: AssessmentType) => {
    switch (type) {
      case "PHQ9": return "PHQ-9 Depression";
      case "GAD7": return "GAD-7 Anxiety";
      case "PSS": return "Perceived Stress";
      case "UCLA": return "Loneliness Scale";
      case "PSWQ": return "Worry & Overthinking";
    }
  };

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
      // Normalized answers: fill gaps with 0
      const normalizedAnswers = questions.map((_, index) => answers[index] ?? 0);

      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, assessmentType, answers: normalizedAnswers }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      notify("success", `Completed. Result: ${data.severity}`);
      router.push(`/result?score=${data.totalScore}&type=${assessmentType}&severity=${data.severity}`);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const openTool = (type: AssessmentType) => {
    setAssessmentType(type);
    setAnswers([]);
    setShowTools(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6 lg:p-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-screen content-start">

        {/* HEADER: Span Full Width */}
        <header className="lg:col-span-12 flex justify-between items-end mb-4">
          <div>
            <h1 className="text-5xl font-extralight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/50 mb-2">Self-Orientation</h1>
            <p className="text-xl text-neutral-400 font-light">Locate yourself in the lattice of experience.</p>
          </div>
        </header>

        {/* COL 1: UNIFIED CHECK-IN (Left Side - 5 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl hover:border-white/20 transition-all duration-300 h-full min-h-[500px]">
            <div className="mb-4">
              <h2 className="text-2xl font-light text-white mb-1">Daily Check-in</h2>
              <p className="text-neutral-400 text-sm">Where are you right now?</p>
            </div>
            {/* Unified Check-in Component */}
            <UnifiedCheckIn userId={userId} onSuccess={handleRefresh} />
          </section>
        </div>

        {/* COL 2: TOOLS & JOURNAL (Right Side - 8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Standards Tools Card */}
            <section className="bg-red-900/10 backdrop-blur-xl border border-red-500/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl hover:border-red-500/20 transition-all duration-300 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-xl">📐</div>
                <div>
                  <h2 className="text-2xl font-light text-white mb-1">Standard Tools</h2>
                  <p className="text-neutral-400 text-sm">Validated scales for deep dives.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button onClick={() => openTool("PSS")} className="text-left px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-neutral-300 hover:text-white group">
                  <span className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 group-hover:text-neutral-400">Stress</span>
                  <span className="font-medium text-lg">PSS-10</span>
                </button>
                <button onClick={() => openTool("PSWQ")} className="text-left px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-neutral-300 hover:text-white group">
                  <span className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 group-hover:text-neutral-400">Worry</span>
                  <span className="font-medium text-lg">PSWQ</span>
                </button>
                <button onClick={() => openTool("UCLA")} className="text-left px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-neutral-300 hover:text-white group">
                  <span className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 group-hover:text-neutral-400">Loneliness</span>
                  <span className="font-medium text-lg">UCLA-8</span>
                </button>
                <button onClick={() => openTool("GAD7")} className="text-left px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-neutral-300 hover:text-white group">
                  <span className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 group-hover:text-neutral-400">Anxiety</span>
                  <span className="font-medium text-lg">GAD-7</span>
                </button>
                <button onClick={() => openTool("PHQ9")} className="text-left px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-neutral-300 hover:text-white group md:col-span-2">
                  <span className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 group-hover:text-neutral-400">Depression</span>
                  <span className="font-medium text-lg">PHQ-9</span>
                </button>
              </div>
            </section>

            {/* Journal Card */}
            <section className="bg-indigo-900/10 backdrop-blur-xl border border-indigo-500/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl hover:border-indigo-500/20 transition-all duration-300 flex flex-col justify-center group cursor-pointer h-64 md:col-span-2" onClick={() => router.push('/journal')}>
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl">📓</div>
                <h2 className="text-2xl font-light text-white group-hover:text-indigo-200 transition-colors">Guided Journal</h2>
              </div>
              <p className="text-neutral-400 text-sm mb-4">Process your thoughts in a private space.</p>
              <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                Start Writing <span>→</span>
              </div>
            </section>

          </div>
        </div>

      </div>

      {/* MODAL: Standard Tools View */}
      {showTools && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 lg:p-12 shadow-2xl relative">
            <button
              onClick={() => setShowTools(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <header className="mb-8 border-b border-white/10 pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Standard Tool</span>
              <h2 className="text-3xl font-light text-white mt-2">{getToolTitle(assessmentType)}</h2>
            </header>

            <form onSubmit={internalSubmit} className="space-y-8">
              {questions.map((q, idx) => (
                <div key={idx} className="space-y-4 pb-6 border-b border-white/5">
                  <p className="text-lg text-neutral-200 font-light leading-relaxed">{idx + 1}. {q.text}</p>

                  {/* Rating Scale */}
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((val) => {
                      const maxVal = (assessmentType === "PSS" || assessmentType === "PSWQ") ? 4 : 3;
                      if (val > maxVal) return null;

                      return (
                        <label key={val} className={`cursor-pointer border py-3 text-center rounded-lg transition-all hover:bg-white/5 ${answers[idx] === val ? "bg-white text-black border-white font-medium" : "border-white/10 text-neutral-500"}`}>
                          <input type="radio" value={val} checked={answers[idx] === val} onChange={() => setAnswer(idx, val)} className="hidden" />
                          <span className="text-sm">{val}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Not at all</span>
                    <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Often</span>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:scale-[1.01] transition-transform">
                  {isSubmitting ? "Calculaing..." : "Show Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
