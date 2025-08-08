"use client";

import Image from "next/image";
import { ArrowBigRight, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import PromoImg from "@/assets/above-cta.png";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";


export default function CTASection() {
    const router = useRouter();

    return (
        <div
            className="relative w-full overflow-hidden text-white"
            id="promo-section"
        >
            {/* ✨ Background Glow */}
            {/* ✨ Orange Glow Background */}
            <div className="absolute inset-0 z-0 bg-[#0f0a07]">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#db4900] opacity-30 rounded-full blur-[180px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ffad82] opacity-20 rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#ff6b00] opacity-25 rounded-full blur-[150px] pointer-events-none" />
            </div>


            {/* 🌟 Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-14 flex flex-col-reverse md:flex-row items-center justify-center gap-10 md:gap-12">

                {/* Left Content */}
                <motion.div
                    className="w-full md:w-1/2 space-y-6 text-center md:text-left"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <div
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#db4900]/80 text-white font-medium text-xs sm:text-sm"
                        role="note"
                        aria-label="Exclusive Features"
                    >
                        For Modern Businesses 🚀
                    </div>

                    <div className="flex flex-col text-center sm:items-center md:items-start md:text-left space-y-6">
                        {/* 🔥 mainQuote style like Leonardo AI */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-snug sm:leading-tight text-white">
                            Empower your business <br />
                            with <span className="text-[#db4900]">Adalye</span>
                        </h1>


                        <div className="space-y-2 w-full max-w-md">
                            <Button
                                className="py-6"
                            >
                                Analyze Now <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Content – Image */}
                <div className="w-full md:w-1/2 overflow-visible">
                    <motion.div
                        className="relative flex justify-center md:justify-end md:pr-[-60px] lg:pr-[-80px]"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative w-[90%] max-w-2xl sm:max-w-lg md:max-w-xl translate-x-4 md:translate-x-12 lg:translate-x-16">
                            <Image
                                src={PromoImg}
                                alt="Adalye AI Assistant"
                                className="rounded-lg object-contain w-full h-auto"
                                width={800}
                                height={500}
                                sizes="(max-width: 768px) 90vw, 45vw"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
