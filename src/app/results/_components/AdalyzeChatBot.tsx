/* --- Adalyze AI Chatbot (Premium UI) --- */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, UserRound, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIChatIcon from "@/assets/ai-chat-icon.png";
import Image from 'next/image';
import ExpertConsultationPopup from '@/components/expert-form';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

type Sender = "ai" | "user";

interface ChatMessage {
    id: string;
    sender: Sender;
    text: string;
    thinking?: boolean;
}

interface AskAPIResponse {
    answer?: string;
    suggested_questions?: string[];
    ask_count?: number;
    ask_limit?: number;
    askCount?: number;
    askLimit?: number;
    limit_reached?: boolean;
    limitReached?: boolean;
    error?: string;
}

interface ChatLogEntry {
    al_id: number;
    ad_upload_id: number;
    user_id: number;
    question: string;
    answer: string;
    created_date: string;
}

interface AdalyzeChatBotProps {
    adUploadId: number;
    userName?: string;
    userImage?: string;
}

export default function AdalyzeChatBot({ adUploadId, userName, userImage }: AdalyzeChatBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [askCount, setAskCount] = useState<number | null>(null);
    const [askLimit, setAskLimit] = useState<number | null>(null);
    const [limitReached, setLimitReached] = useState(false);

    const [suggested, setSuggested] = useState<string[]>([]);
    const [showExpertForm, setShowExpertForm] = useState(false);

    const fetchedInitialSuggestionsRef = useRef(false);
    const chatRef = useRef<HTMLDivElement>(null);

    const reachedLimit = useMemo(() => {
        if (limitReached) return true;
        if (askCount != null && askLimit != null) return askCount >= askLimit;
        return false;
    }, [askCount, askLimit, limitReached]);

    const scrollToBottom = () => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    };

    useEffect(scrollToBottom, [messages]);

    // Prevent body scroll when chat is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const appendMessage = useCallback((m: ChatMessage) => {
        setMessages(prev => [...prev, m]);
    }, []);

    const replaceLastThinking = useCallback((content: string) => {
        setMessages(prev => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
                if (next[i].thinking) {
                    next[i] = { ...next[i], thinking: false, text: content };
                    break;
                }
            }
            return next;
        });
    }, []);

    const runInitial = useCallback(async () => {
        appendMessage({
            id: crypto.randomUUID(),
            sender: "ai",
            text: "Connecting to Adalyze AI…",
            thinking: true
        });

        try {
            const res = await fetch("https://adalyzeai.xyz/App/askadalyze.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ad_upload_id: adUploadId, question: "" })
            });
            const data: AskAPIResponse = await res.json();

            replaceLastThinking(data.answer || "Here are some suggestions to begin with.");
            setSuggested(data.suggested_questions || []);

            setAskCount(data.ask_count ?? data.askCount ?? null);
            setAskLimit(data.ask_limit ?? data.askLimit ?? null);
            setLimitReached(data.limit_reached ?? data.limitReached ?? false);
        } catch {
            replaceLastThinking("Failed to connect to Adalyze AI.");
        }
    }, [adUploadId, appendMessage, replaceLastThinking]);

    // Load history first; if none, fall back to initial call
    useEffect(() => {
        const loadHistoryOrInitial = async () => {
            fetchedInitialSuggestionsRef.current = true;
            setLoading(true);
            try {
                const historyRes = await fetch(
                    `https://adalyzeai.xyz/App/api.php?gofor=getchathistory&ad_upload_id=${adUploadId}`,
                    { cache: 'no-store' }
                );

                const raw = await historyRes.text();
                let parsed: unknown = raw;
                try {
                    parsed = JSON.parse(raw);
                } catch {
                    // keep as text; may be "0"
                }

                const isZero = parsed === 0 || parsed === "0";
                const isArray = Array.isArray(parsed);

                if (isArray && (parsed as ChatLogEntry[]).length > 0) {
                    const entries = parsed as ChatLogEntry[];

                    const sorted = [...entries].sort((a, b) => {
                        const ta = new Date(a.created_date).getTime();
                        const tb = new Date(b.created_date).getTime();
                        if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return ta - tb;
                        return a.al_id - b.al_id;
                    });

                    const mapped: ChatMessage[] = [];
                    for (const e of sorted) {
                        const q = (e.question ?? "").trim();
                        const a = (e.answer ?? "").trim();

                        // Only show user bubble when question is non-empty
                        if (q) mapped.push({ id: `u-${e.al_id}`, sender: "user", text: q });

                        // Always show AI when answer is non-empty
                        if (a) mapped.push({ id: `a-${e.al_id}`, sender: "ai", text: a });
                    }

                    setMessages(mapped);
                    setSuggested([]); // no suggestions from history
                    const questionCount = entries.filter(e => (e.question ?? "").trim().length > 0).length;
                    setAskCount(questionCount);
                    // Set limit to 10 if not already set
                    if (askLimit === null) {
                        setAskLimit(10);
                    }
                    // If chat history has 10 questions, set limit as reached
                    if (questionCount >= 10) {
                        setLimitReached(true);
                        setSuggested([]);
                    }
                } else if (isZero || (isArray && (parsed as any[]).length === 0)) {
                    await runInitial();
                } else {
                    await runInitial(); // unknown shape -> safe fallback
                }
            } catch {
                // If history fails, start a new session gracefully
                await runInitial();
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && !fetchedInitialSuggestionsRef.current) {
            void loadHistoryOrInitial();
        }
    }, [isOpen, adUploadId, runInitial]);

    const sendQuestion = useCallback(
        async (forcedQuestion?: string) => {
            const question = forcedQuestion?.trim() || input.trim();
            if (!question || loading || reachedLimit) return;

            appendMessage({
                id: crypto.randomUUID(),
                sender: "user",
                text: question
            });

            setInput("");

            appendMessage({
                id: crypto.randomUUID(),
                sender: "ai",
                text: "Thinking...",
                thinking: true
            });

            setLoading(true);

            try {
                const res = await fetch("https://adalyzeai.xyz/App/askadalyze.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ad_upload_id: adUploadId, question })
                });

                const data: AskAPIResponse = await res.json();

                if (data.error) {
                    replaceLastThinking(data.error);
                    // Check if error message indicates limit reached
                    const isLimitError = data.error.includes("limit") || data.error.includes("reached");
                    const limitReachedValue = data.limit_reached ?? data.limitReached ?? isLimitError;
                    setLimitReached(limitReachedValue);
                    // Clear suggestions when limit is reached
                    if (limitReachedValue) {
                        setSuggested([]);
                    }
                } else {
                    replaceLastThinking(data.answer || "No answer available.");
                    setSuggested(data.suggested_questions || []);

                    setAskCount(data.ask_count ?? data.askCount ?? askCount);
                    setAskLimit(data.ask_limit ?? data.askLimit ?? askLimit);
                }
            } catch {
                replaceLastThinking("Something went wrong. Try again.");
            } finally {
                setLoading(false);
            }
        },
        [input, loading, reachedLimit, adUploadId, appendMessage, replaceLastThinking, askCount, askLimit]
    );

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed right-3 sm:right-4 bottom-16 sm:bottom-20 z-[999]
              w-16 h-16 sm:w-20 sm:h-20 
              flex items-center justify-center text-white 
               cursor-pointer bounce-slow"
                        aria-label="Open chat"
                    >
                        <Image src={AIChatIcon} alt="Chat" width={46} height={46} className="w-full h-full object-contain p-2 sm:p-0" priority />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Background Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
                    />
                )}
            </AnimatePresence>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.97 }}
                        transition={{ duration: 0.28 }}
                        className="fixed bottom-4 sm:bottom-14 right-2 sm:right-4 z-[999] w-[calc(100vw-1rem)] sm:w-[92vw] md:w-[40vw] h-[calc(100vh-2rem)] sm:h-[90vh] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] bg-[#171717] rounded-2xl sm:rounded-3xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#2b2b2b] rounded-t-2xl flex-shrink-0">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <h2 className="text-sm sm:text-lg md:text-xl text-white truncate">
                                    Let&apos;s Chat With <span className="text-primary font-bold text-base sm:text-xl md:text-2xl">Adalyze AI Bot</span>
                                </h2>

                                {askCount !== null && (
                                    <span className="inline-flex items-center text-xs sm:text-sm font-medium text-primary bg-primary/20 border border-primary backdrop-blur-sm rounded-full px-2 sm:px-3 py-0.5 sm:py-1 flex-shrink-0">
                                        Chat Limit: {askCount}{askLimit ? `/${askLimit}` : '/10'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="cursor-pointer p-1"
                                    aria-label="Close chat"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={chatRef}
                            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-[#333] min-h-0"
                        >
                            {messages.map((m, index) => (
                                <motion.div
                                    key={m.id}
                                    initial={{
                                        opacity: 0,
                                        y: m.sender === "user" ? 20 : 20,
                                        x: m.sender === "user" ? 20 : -20,
                                        scale: 0.9
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        x: 0,
                                        scale: 1
                                    }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                        delay: index === messages.length - 1 ? 0.1 : 0
                                    }}
                                    className={`flex gap-2 sm:gap-3 ${m.sender === "user" ? "justify-end" : ""}`}
                                >
                                    {/* AI avatar */}
                                    {m.sender === "ai" && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: 0.2,
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 15
                                            }}
                                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12  flex items-center justify-center text-white flex-shrink-0"
                                        >
                                            <Image src={AIChatIcon} alt="Chat" width={46} height={46} className="w-full h-full object-contain" priority />
                                        </motion.div>
                                    )}

                                    {/* Bubble */}
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            scale: 0.8,
                                            y: m.sender === "user" ? 10 : 10
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            y: 0
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            ease: [0.25, 0.46, 0.45, 0.94],
                                            delay: 0.15
                                        }}
                                        className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl sm:rounded-3xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow break-words
                                            ${m.sender === "ai" ? "bg-black text-white" : "bg-[#3d3d3d] text-white"}
                                            ${m.thinking ? "flex items-center justify-center py-0" : ""}
                                        `}
                                    >
                                        {m.thinking ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex gap-1 items-center justify-center"
                                            >
                                                <span className="typing-dot"></span>
                                                <span className="typing-dot"></span>
                                                <span className="typing-dot"></span>
                                            </motion.div>
                                        ) : (
                                            <motion.span
                                                key={m.text}
                                                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{
                                                    duration: 0.4,
                                                    ease: [0.25, 0.46, 0.45, 0.94]
                                                }}
                                            >
                                                {m.text}
                                            </motion.span>
                                        )}
                                    </motion.div>


                                    {/* User avatar */}
                                    {m.sender === "user" && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: 0.2,
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 15
                                            }}
                                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#3d3d3d] text-white flex items-center justify-center overflow-hidden flex-shrink-0 relative"
                                        >
                                            {userImage ? (
                                                <Image
                                                    src={userImage}
                                                    alt={userName || "User"}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : userName ? (
                                                <span className="text-xs sm:text-sm font-semibold relative z-10">
                                                    {userName.charAt(0).toUpperCase()}
                                                </span>
                                            ) : (
                                                <UserRound className="w-3 h-3 sm:w-4 sm:h-4" />
                                            )}
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Suggested Questions or Talk to Expert */}
                        {reachedLimit ? (
                            <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col items-center gap-2 sm:gap-3 flex-shrink-0">
                                <p className="text-xs sm:text-sm text-white/70 text-center px-2">
                                    You&apos;ve reached your question limit. Want to talk to an expert?
                                </p>
                                <Button
                                    onClick={() => setShowExpertForm(true)}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full"
                                >
                                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Talk to Expert
                                </Button>
                            </div>
                        ) : (
                            suggested.length > 0 && (
                                <div className="px-3 sm:px-4 py-2 flex flex-wrap gap-1.5 sm:gap-2 flex-shrink-0">
                                    {suggested.map((q, i) => (
                                        <motion.button
                                            key={q}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full bg-transparent border-2 border-[#3d3d3d] 
                                           text-white hover:bg-[#3d3d3d] transition text-left break-words cursor-pointer"
                                            onClick={() => sendQuestion(q)}
                                        >
                                            {q}
                                        </motion.button>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Input */}
                        <div className="p-3 sm:p-4 bg-[#171717] rounded-b-2xl flex items-center justify-center flex-shrink-0">
                            <div className="flex items-center w-full bg-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-md border border-gray-200">

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !reachedLimit && sendQuestion()}
                                    placeholder="Write a message"
                                    disabled={reachedLimit}
                                    className="flex-1 bg-transparent text-black placeholder-black/60 outline-none text-sm sm:text-base pr-2 sm:pr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                />

                                <button
                                    onClick={() => sendQuestion(input)}
                                    disabled={loading || reachedLimit}
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary hover:bg-primary/90 rounded-full transition disabled:opacity-50 flex-shrink-0"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </button>

                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Typing animation */}
            <style>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 999px;
          animation: blink 1.4s infinite both;
        }
        .typing-dot:nth-child(2) { animation-delay: .2s; }
        .typing-dot:nth-child(3) { animation-delay: .4s; }

        @keyframes blink {
          0%, 100% { 
            opacity: .3; 
            transform: translateY(0) scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: translateY(-4px) scale(1.1); 
          }
        }
      `}</style>


            {/* Expert Consultation Form */}
            <ExpertConsultationPopup
                isOpen={showExpertForm}
                onClose={() => setShowExpertForm(false)}
                onSubmit={async (formData) => {
                    // Handle expert consultation form submission
                    try {
                        const userId = Cookies.get("userId");
                        if (!userId) {
                            toast.error('User ID not found. Please log in again.');
                            throw new Error('User ID not found');
                        }

                        const response = await fetch('https://adalyzeai.xyz/App/api.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                gofor: 'exptalkrequest',
                                user_id: userId,
                                prefdate: formData.prefdate,
                                preftime: formData.preftime,
                                comments: formData.comments
                            })
                        });

                        if (response.ok) {
                            toast.success('Expert call request submitted successfully!');
                            // Show success message in chat
                            appendMessage({
                                id: crypto.randomUUID(),
                                sender: 'ai',
                                text: 'Your consultation request has been submitted successfully. Our expert will contact you soon!'
                            });
                        } else {
                            throw new Error('Failed to submit request');
                        }
                    } catch (error) {
                        console.error('Error submitting expert call request:', error);
                        toast.error(error instanceof Error ? error.message : 'Failed to submit expert call request. Please try again.');
                        throw error;
                    }
                }}
            />
        </>
    );
}
