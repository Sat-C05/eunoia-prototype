"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 px-8 md:px-12 overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/5 shadow-2xl text-center">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm z-0" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/70 uppercase tracking-widest backdrop-blur-md">
            ✨ Your Campus Companion
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">Balance</span>.
          </h1>

          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto font-light">
            Eunoia is your confidential space to assess well-being, log moods, and connect with support. Private, secure, and always here for you.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/assessment"
              className="group relative inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              Start Self-Assessment
              <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/resources"
              className="group inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              Explore Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid gap-8 md:grid-cols-3">
        {/* Card 1 */}
        <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:-translate-y-2 hover:border-white/10 hover:bg-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl">
              📊
            </div>
            <h3 className="text-xl font-bold text-white">Validated Tools</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Use clinically-backed screenings like PHQ-9 and GAD-7 to gain clear insights into your mental health.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:-translate-y-2 hover:border-white/10 hover:bg-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-white">Privacy First</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Your journey is yours alone. We prioritize anonymity and local data security above everything else.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:-translate-y-2 hover:border-white/10 hover:bg-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-2xl">
              🤝
            </div>
            <h3 className="text-xl font-bold text-white">Easy Support</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Connect with campus counselors or finding emergency resources takes just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="py-8 border-t border-white/5 text-center">
        <p className="text-xs text-white/30">
          ⚠️ For urgent help, please contact emergency services (911/988) or your campus crisis line.
        </p>
      </div>
    </div>
  );
}
