"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Registration failed");

            // Redirect to home/dashboard on success
            router.push("/");
            router.refresh();

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
                    <p className="text-neutral-400">Join Eunoia to track your journey securely.</p>
                </div>

                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                                placeholder="Student Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                                placeholder="student@university.edu"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 mt-4"
                        >
                            {isLoading ? "creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-neutral-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-white hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
