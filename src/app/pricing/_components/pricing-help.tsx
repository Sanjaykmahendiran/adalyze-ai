"use client";

import { useState, ChangeEvent, useRef, useCallback, useEffect } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import ChatIcon from "@/assets/Chat-icon-suggesto.png";
import Cookies from "js-cookie";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";


interface PricingHelpProps {
    onClose: () => void;
}

interface FormState {
    user_id: string;
    email: string;
    category: string;
    description: string;
}

const PricingHelp: React.FC = () => {
    const [formState, setFormState] = useState<FormState>({
        user_id: "",
        email: "",
        category: "",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatRef = useRef<HTMLDivElement | null>(null);
    const prefersReducedMotion = useReducedMotion();

    const userId = Cookies.get("userId");

    useEffect(() => {
        if (userId) {
            setFormState((prev) => ({ ...prev, user_id: userId }));
        }
    }, [userId]);

    const toggleChat = useCallback(() => {
        setIsChatOpen((prev) => !prev);
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const { category, description, email } = formState;

        if (!category || !description || (!userId && !email)) {
            toast.error("Please fill all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch("https://adalyzeai.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "needhelp",
                    user_id: userId || null,
                    email: userId ? null : email,
                    category,
                    description,
                }),
            });

            const result = await response.json();

            if (response.ok && result?.status !== "error") {
                toast.success(
                    "Enquiry submitted successfully.\nWe will get back within 24 hours.",
                    {
                        duration: 5000,
                        style: { whiteSpace: "pre-line" },
                    }
                );
                setIsChatOpen(false);
            } else {
                toast.error("Failed to submit enquiry. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-col items-end gap-3 z-50">
                {/* Chat toggle */}
                <AnimatePresence>
                    {!isChatOpen && (
                        <motion.button
                            key="chat-toggle"
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={toggleChat}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-white touch-manipulation"
                            aria-label="Open Info Assistant chat"
                        >
                            <Image src={ChatIcon} alt="Chat" width={56} height={56} className="w-full h-full" priority />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Chat panel */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            key="chat-panel"
                            ref={chatRef}
                            className="fixed bottom-20 right-2 w-[92vw] sm:w-[360px] md:w-[400px] max-w-sm z-50"
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                        >
                            <Card className="w-full shadow-lg bg-[#1f1f21]">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start text-lg">
                                        <div>
                                            <div className="text-white">Need Help? We&apos;re Here for You!</div>
                                            <div className="text-gray-300 text-sm font-thin">
                                                Have questions before registering? Submit your enquiry and we&apos;ll assist you promptly!
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                                            <X className="h-4 w-4 text-white" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4 max-h-[400px] overflow-auto">
                                    {/* Email field (only if no userId) */}
                                    {!userId && (
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formState.email}
                                                onChange={handleChange}
                                                placeholder="Enter your email"
                                                required
                                                className="bg-[#2b2b2b] border-[#2b2b2b] text-white"
                                            />
                                        </div>
                                    )}

                                    {/* Category dropdown */}
                                    <div>
                                        <label
                                            htmlFor="category"
                                            className="block text-sm font-medium mb-1 text-white"
                                        >
                                            Category
                                        </label>
                                        <Select
                                            value={formState.category}
                                            onValueChange={(value) =>
                                                setFormState((prev) => ({ ...prev, category: value }))
                                            }
                                        >
                                            <SelectTrigger
                                                id="category"
                                                className="w-full bg-[#2b2b2b] border-[#2b2b2b] text-white"
                                            >
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#2b2b2b] text-white border-[#3a3a3a]">
                                                <SelectItem value="Ad Upload Issue">Ad Upload Issue</SelectItem>
                                                <SelectItem value="AI Analysis Problem">AI Analysis Problem</SelectItem>
                                                <SelectItem value="A/B Testing Help">A/B Testing Help</SelectItem>
                                                <SelectItem value="Report or Insights Clarification">
                                                    Report or Insights Clarification
                                                </SelectItem>
                                                <SelectItem value="Billing or Subscription">
                                                    Billing or Subscription
                                                </SelectItem>
                                                <SelectItem value="Account or Login Issue">
                                                    Account or Login Issue
                                                </SelectItem>
                                                <SelectItem value="Feature Request">Feature Request</SelectItem>
                                                <SelectItem value="Other / General Query">
                                                    Other / General Query
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>


                                    {/* Message */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium mb-1 text-white">
                                            Message
                                        </label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formState.description}
                                            onChange={handleChange}
                                            placeholder="Describe your issue or feedback..."
                                            rows={5}
                                            required
                                            className="bg-[#2b2b2b] border-[#2b2b2b] text-white"
                                        />
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={
                                            isSubmitting ||
                                            !formState.category ||
                                            !formState.description ||
                                            (!userId && !formState.email)
                                        }
                                        className="w-full"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader className="h-4 w-4 animate-spin" />
                                                <span>Submitting...</span>
                                            </div>
                                        ) : (
                                            "Submit"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Toaster />
        </>
    );
};

export default PricingHelp;
