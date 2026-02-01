"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Message = {
    id: string;
    text: React.ReactNode;
    sender: "bot" | "user";
    options?: Option[];
    type?: "text" | "crisis_card";
};

type Option = {
    label: string;
    action: () => void;
};

export default function GuideWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // --- Actions ---

    const addMessage = useCallback((msg: Message) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const handleNavigator = useCallback((path: string, label: string) => {
        addMessage({ id: Date.now().toString(), text: label, sender: "user" });
        setTimeout(() => {
            addMessage({
                id: Date.now().toString() + "nav",
                sender: "bot",
                text: "Redirecting you now..."
            });
            setTimeout(() => {
                router.push(path);
                setIsOpen(false);
            }, 800);
        }, 500);
    }, [addMessage, router]);

    const handleUserChoice = useCallback((label: string, nextStep: () => void) => {
        addMessage({ id: Date.now().toString(), text: label, sender: "user" });
        setTimeout(() => {
            nextStep();
        }, 600);
    }, [addMessage]);

    // --- Flows ---

    // Cyclic Dependency Breaker
    const resetChatRef = useRef<() => void>(() => { });

    const showCrisis = useCallback(() => {
        addMessage({
            id: Date.now().toString(),
            sender: "bot",
            text: "I hear you. If you're in immediate danger or pain, please prioritize your safety right now.",
            type: "crisis_card",
            options: [
                { label: "Start over", action: () => handleUserChoice("Start over", resetChatRef.current) }
            ]
        });
    }, [addMessage, handleUserChoice]);

    const showSupportOptions = useCallback(() => {
        addMessage({
            id: Date.now().toString(),
            sender: "bot",
            text: "It's okay not to be okay. What do you think you need most right now?",
            options: [
                { label: "To vent / Connect", action: () => handleNavigator("/community", "Start Peer Support") },
                { label: "Quiet reflection", action: () => handleNavigator("/assessment", "Go to Check-in") },
                { label: "Browse Guides", action: () => handleNavigator("/resources", "Open Library") },
            ]
        });
    }, [addMessage, handleNavigator]);

    const showExploreOptions = useCallback(() => {
        addMessage({
            id: Date.now().toString(),
            sender: "bot",
            text: "Glad you're here. This is a space for self-discovery and support. Where would you like to start?",
            options: [
                { label: "Check my mood", action: () => handleNavigator("/assessment", "Try Mood Log") },
                { label: "Browse community", action: () => handleNavigator("/community", "Visit Community") },
                { label: "Start Journaling", action: () => handleNavigator("/journal", "Open Journal") },
            ]
        });
    }, [addMessage, handleNavigator]);

    // Main Reset
    const resetChat = useCallback(() => {
        setMessages([{
            id: "init",
            sender: "bot",
            text: "Hi. I'm here to help you navigate Eunoia. How are you feeling right now?",
            options: [
                { label: "Overwhelmed / Crisis", action: () => handleUserChoice("Overwhelmed / Crisis", showCrisis) },
                { label: "Anxious / Down", action: () => handleUserChoice("Anxious / Down", showSupportOptions) },
                { label: "Curious / Exploring", action: () => handleUserChoice("Just exploring", showExploreOptions) },
            ]
        }]);
    }, [handleUserChoice, showCrisis, showSupportOptions, showExploreOptions]);

    useEffect(() => {
        resetChatRef.current = resetChat;
    }, [resetChat]);


    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none group/widget font-sans">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-6 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl w-[360px] h-[500px] flex flex-col pointer-events-auto animate-in slide-in-from-bottom-6 duration-300 overflow-hidden">

                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-white text-sm">Eunoia Guide</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>

                                {/* Bubble */}
                                {msg.sender === "bot" && (
                                    <div className="max-w-[85%] bg-white/10 text-white p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed mb-2 animate-in fade-in zoom-in-95 duration-200">
                                        {msg.text}
                                    </div>
                                )}
                                {msg.sender === "user" && (
                                    <div className="max-w-[80%] bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-sm mb-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                        {msg.text}
                                    </div>
                                )}

                                {/* Crisis Card Special Type */}
                                {msg.type === "crisis_card" && (
                                    <div className="w-full bg-red-900/20 border border-red-500/30 p-4 rounded-xl mb-3 animate-in fade-in zoom-in-95 delay-100">
                                        <h4 className="text-red-200 font-bold mb-2 text-sm">Emergency Resources</h4>
                                        <a href="tel:988" className="block w-full text-center py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold mb-2 transition-colors">Call 988 Lifeline</a>
                                        <div className="text-center text-xs text-red-300/70">Available 24/7 • Confidential</div>
                                    </div>
                                )}

                                {/* Options (Chips) */}
                                {msg.options && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {msg.options.map((opt) => (
                                            <button
                                                key={opt.label}
                                                onClick={opt.action}
                                                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300 hover:bg-white hover:text-black hover:border-white transition-all animate-in fade-in slide-in-from-bottom-2"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer (Input placeholder) */}
                    <div className="p-3 border-t border-white/10 bg-black/20 text-center">
                        <button onClick={resetChat} className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">
                            Reset Conversation
                        </button>
                    </div>

                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl shadow-black/50 flex items-center justify-center transition-all duration-500 ease-out z-50 group hover:scale-105 ${isOpen
                    ? "bg-neutral-800 rotate-90"
                    : "bg-white hover:rotate-12"
                    }`}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    // Chat/Compass Hybrid Icon
                    <div className="relative">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-black">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                )}
            </button>
        </div>
    );
}
