"use client";

import { BeforeAfter } from "@/components/landing-page/beforeafter";
import { motion } from "framer-motion";
import After1 from "@/assets/Landing-page/before-after/after-1.jpg"
import After2 from "@/assets/Landing-page/before-after/after-2.jpg"
import After3 from "@/assets/Landing-page/before-after/after-3.jpg"
import After4 from "@/assets/Landing-page/before-after/after-4.jpg"
import After5 from "@/assets/Landing-page/before-after/after-5.jpg"
import Before1 from "@/assets/Landing-page/before-after/before-1.jpg"
import Before2 from "@/assets/Landing-page/before-after/before-2.jpg"
import Before3 from "@/assets/Landing-page/before-after/before-3.jpg"
import Before4 from "@/assets/Landing-page/before-after/before-4.jpg"
import Before5 from "@/assets/Landing-page/before-after/before-5.jpg"

export default function IssuesBeforeAfter() {
    const comparisons = [
        {
            title: "Ad Visual Optimization",
            predicted_ctr_change: "10%",
            overall_score: "90",
            before: Before1,
            after: After1,
        },
        {
            title: "Audience Targeting Precision",
            predicted_ctr_change: "10%",
            overall_score: "90",
            before: Before2,
            after: After2,
        },
        {
            title: "Creative Performance Insights",
            predicted_ctr_change: "10%",
            overall_score: "90",
            before: Before3,
            after: After3,
        },
    ];

    return (
        <section id="issues-before-after" className="w-full  py-16 px-4 text-white ">
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
                className="text-center py-2 sm:py-3 mb-16 sm:mb-20"
            >
                <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2 px-1">
                    See the Difference with Adalyze AI
                </h2>
                <p className="text-sm sm:text-base text-white/80 max-w-lg sm:max-w-xl mx-auto px-1">
                    Compare your marketing visuals before and after Adalyze AI’s optimization engine.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
                {comparisons.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center bg-black rounded-2xl shadow-md hover:shadow-xl transition"
                    >
                        <div className="w-full rounded-t-xl overflow-hidden">
                            <BeforeAfter
                                beforeImage={item.before.src}
                                afterImage={item.after.src}
                            />
                        </div>
                        <div className="w-full  p-4">
                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                            <div className="mt-3 bg-[#171717]/70 rounded-lg px-3 py-2 border border-white/10 text-sm text-white/90">

                                <div className="flex justify-between">
                                    <span>Estimated CTR</span>
                                    <span className="font-bold text-primary">
                                        {item.predicted_ctr_change}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Score</span>
                                    <span className="font-bold text-primary">
                                        {item.overall_score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
