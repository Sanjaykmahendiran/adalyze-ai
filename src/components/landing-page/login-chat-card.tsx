"use client";

import { useState, ChangeEvent } from "react";
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

interface LoginChatCardProps {
    onClose: () => void;
}

interface FormState {
    email: string;
    category: string;
    query: string;
}

const LoginChatCard: React.FC<LoginChatCardProps> = ({ onClose }) => {
    const [formState, setFormState] = useState<FormState>({
        email: "",
        category: "",
        query: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const { email, category, query } = formState;

        try {
            setIsSubmitting(true);

            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "needhelp",
                    email,
                    category,
                    query,
                }),
            });

            const result = await response.json();

            if (response.ok && result?.status !== "error") {
                toast.success(
                    "Enquiry submitted successfully.\nWe will get back in 24 hours.",
                    {
                        duration: 5000,
                        style: { whiteSpace: "pre-line" },
                    }
                );
                onClose();
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
            <Card className="w-full shadow-lg bg-[#1f1f21]">
                <CardHeader>
                    <CardTitle className="flex justify-between items-start text-lg">
                        <div>
                            <div className="text-white">Need Help? We&apos;re Here for You!</div>
                            <div className="text-gray-300 text-sm font-thin">
                                Have questions before registering? Submit your enquiry, and we&apos;ll assist you promptly!
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4 text-white" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[400px] overflow-auto">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
                            Email
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
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-1 text-white">
                            Category
                        </label>
                        <Input
                            id="category"
                            name="category"
                            value={formState.category}
                            onChange={handleChange}
                            placeholder="App Issue, Feedback, etc."
                            required
                            className="bg-[#2b2b2b] border-[#2b2b2b] text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="query" className="block text-sm font-medium mb-1 text-white">
                            Message
                        </label>
                        <Textarea
                            id="query"
                            name="query"
                            value={formState.query}
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
                        disabled={isSubmitting || !formState.email || !formState.category || !formState.query}
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
            <Toaster />
        </>
    );
};

export default LoginChatCard;