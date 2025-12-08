// app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-20">
      <div className="w-full max-w-4xl rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 shadow-2xl backdrop-blur-md text-center relative overflow-hidden">

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="mb-6 text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
            Find Your Balance.
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-neutral-400 leading-relaxed">
            Eunoia is your confidential campus companion. Assess your mental well-being, log your mood, and connect with support—all in one private space.
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/assessment"
              className="group relative inline-flex items-center justify-center rounded-full bg-neutral-100 px-8 py-3.5 text-base font-semibold text-neutral-900 transition-all hover:bg-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Start Self-Assessment
              <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-6 transition-colors hover:border-neutral-700">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <strong className="block mb-2 text-neutral-200 font-semibold">Validated Tools</strong>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Use clinically-backed screenings like PHQ-9 and GAD-7 to understand your symptoms.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-6 transition-colors hover:border-neutral-700">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <strong className="block mb-2 text-neutral-200 font-semibold">Privacy First</strong>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Your data stays local. We prioritize your anonymity and data security above all.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-6 transition-colors hover:border-neutral-700">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 text-pink-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <strong className="block mb-2 text-neutral-200 font-semibold">Easy Support</strong>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Book appointments or find resources instantly when you need help.
              </p>
            </div>
          </div>

          <div className="mt-10 py-4 border-t border-neutral-800/50">
            <p className="text-xs text-neutral-500">
              ⚠️ For urgent help, please contact emergency services or your campus crisis line.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
