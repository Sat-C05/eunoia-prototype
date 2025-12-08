"use client";

export default function ResourcesPage() {
    const sections = [
        {
            title: "If you are in crisis",
            items: [
                "If you are having thoughts of self-harm or suicide, please contact emergency services or a trusted adult immediately.",
                "Do not rely on this app in a crisis. Reach out to a friend, family member, or campus counselor.",
            ],
        },
        {
            title: "Campus support (example placeholders)",
            items: [
                "Counseling center: Mon–Fri, 9am–5pm",
                "Student mentor program: Peer support for academic and emotional issues",
            ],
        },
        {
            title: "Self-help tools",
            items: [
                "Deep breathing: Inhale for 4 seconds, hold for 4, exhale for 6.",
                "Grounding: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
            ],
        },
        {
            title: "About PHQ-9 & GAD-7",
            items: [
                "PHQ-9 is a screening tool for depressive symptoms, not a diagnosis.",
                "GAD-7 screens for generalized anxiety symptoms.",
            ],
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold text-neutral-100">Support & resources</h1>
                <p className="text-sm text-neutral-400 max-w-xl">
                    Eunoia is a starting point, not a replacement for real support. Use these resources as a guide to find the help you need.
                </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
                {sections.map((section) => (
                    <div
                        key={section.title}
                        className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl backdrop-blur-md transition-all hover:border-neutral-700 hover:bg-neutral-900/80"
                    >
                        <h2 className="text-lg font-medium text-neutral-100 mb-4 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                            {section.title}
                        </h2>
                        <ul className="space-y-3">
                            {section.items.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm text-neutral-400">
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-neutral-600 shrink-0" />
                                    <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>
        </div>
    );
}
