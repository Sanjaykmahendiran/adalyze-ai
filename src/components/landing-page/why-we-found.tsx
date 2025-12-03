"use client";

import { motion } from "framer-motion";

const features = [
    "2X ROI Growth",
    "Avoid Guesswork",
    "5X Cost Efficiency",
    "95% Accuracy Rate",
    "Turn insights into impact",
    "70% Faster Analysis",
    "50% Ad Spend Saved",
    "Actionable Insights",
    "60% Better Targeting",
    "40% Higher CTR",
    "Real-Time Tracking",
    "30% Lower CAC",
    "99% Data Reliability",
    "Conversion Boost",
    "4X Faster Decisions",
    "85% Ad Quality Score",
];


export default function WhyWeFoundSection() {
    return (
        <section
            id="why-we-found"
            className="px-4 py-10 md:px-28 md:py-32 flex flex-col items-center max-w-7xl mx-auto"
        >
            {/* Section Heading */}

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                viewport={{ once: false, amount: 0.3 }}
                className="text-center py-2 sm:py-3 mb-10 "
            >
                <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 px-1">
                    Why we found <span className="text-primary">Adalyze AI</span>
                </h2>
                <p className="text-sm sm:text-base text-white/80 max-w-xl sm:max-w-2xl mx-auto px-1">
                    Adalyze AI is the best for your business because it is a powerful tool that helps you create better ads with AI-powered insights, ad scores, and trend analysis to boost performance and ROI.
                </p>

            </motion.div>

            {/* Features falling animation */}
            <motion.div
                className="flex flex-wrap justify-center gap-3 md:gap-5 relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }} // 👈 allow re-trigger
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.08,
                        },
                    },
                }}
            >
                {features.map((feature, index) => {
                    // Use deterministic rotation based on index to prevent hydration mismatch
                    // This creates variation while being consistent between server and client
                    const rotation = ((index * 17) % 30) - 15; // Deterministic rotation between -15 and 15
                    
                    return (
                    <motion.div
                        key={feature}
                        variants={{
                            hidden: {
                                y: -200,
                                opacity: 0,
                                rotate: rotation,
                            },
                            visible: {
                                y: 0,
                                opacity: 1,
                                rotate: 0,
                                transition: {
                                    duration: 0.7,
                                    ease: [0.22, 1, 0.36, 1],
                                },
                            },
                        }}
                        className="group relative bg-gradient-to-br from-[#2e2e2e] via-[#0a0a0a] to-[#1a1a1a] p-px rounded-3xl hover:scale-105 transition-transform duration-300 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(255,255,255,0.05)]"
                        style={{
                            transformOrigin: "center",
                            position: "relative",
                        }}
                    >
                        <div className="bg-gradient-to-br from-[#0b0b0b] via-[#121212] to-[#1a1a1a] rounded-3xl px-4 py-2 md:px-6 md:py-3 flex items-center text-white text-xs sm:text-sm md:text-lg font-normal leading-tight">
                            <span className="mr-2">{feature}</span>
                        </div>
                        <span className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-700" />
                    </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
}
