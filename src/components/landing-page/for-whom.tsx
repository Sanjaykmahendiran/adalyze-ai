'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import image1 from "@/assets/Landing-page/1.agency.webp"
import image2 from "@/assets/Landing-page/2.ecommerce.webp"
import image3 from "@/assets/Landing-page/3.freelancers.webp"
import image4 from "@/assets/Landing-page/4.socila-media-manager.webp"
import image5 from "@/assets/Landing-page/5.enterprise.webp"
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const teamMembers = [
    {
        id: "marketing-agencies",
        title: "Marketing Agencies",
        description: "AI insights and automation to boost client ROI.",
        image: image1,
    },
    {
        id: "ecommerce-brands",
        title: "E-commerce Brands",
        description: "High-performing ad creatives that drive sales.",
        image: image2,
    },
    {
        id: "freelancers",
        title: "Freelancers & Solopreneurs",
        description: "Budget-friendly tools to maximize ad spend.",
        image: image3,
    },
    {
        id: "social-media-managers",
        title: "Social Media Managers",
        description: "Engaging ads that boost reach and performance.",
        image: image4,
    },
    {
        id: "enterprises",
        title: "Enterprise & Large Brands",
        description: "Enterprise-grade AI for multi-market campaigns.",
        image: image5,
    },
];

export default function ForWhomSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const textOpacity = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);
    const textY = useTransform(scrollYProgress, [0.6, 0.9], [50, 0]);

    return (
        <section
            id='use-cases'
            className="relative h-auto lg:h-[300vh]" ref={containerRef}>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}
                className="text-center py-2 sm:py-3 "
            >
                <p className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1">Who Benefits from <span className='text-primary'>Adalyze AI</span></p>
            </motion.div>
            {/* Sticky container (desktop only) */}
            <div className="hidden lg:flex sticky top-0 h-screen items-center justify-start overflow-hidden">
                {/* Cards container */}
                <div className="flex items-center gap-8 ml-20">
                    {teamMembers.map((member, index) => {
                        const cardX = useTransform(scrollYProgress, (progress) => {
                            if (index === 0) return 0;
                            const startProgress = 0.1 + (index - 1) * 0.1;
                            const endProgress = startProgress + 0.2;
                            if (progress < startProgress) return 0;
                            if (progress > endProgress) return -index * 320;
                            const moveProgress = (progress - startProgress) / (endProgress - startProgress);
                            return -index * 320 * moveProgress;
                        });

                        const cardY = useTransform(scrollYProgress, (progress) => {
                            if (index === 0) return 0;
                            const startProgress = 0.1 + (index - 1) * 0.1;
                            const endProgress = startProgress + 0.2;
                            if (progress < startProgress) return 0;
                            if (progress > endProgress) return index * -10;
                            const moveProgress = (progress - startProgress) / (endProgress - startProgress);
                            return index * -10 * moveProgress;
                        });

                        return (
                            <motion.div
                                key={member.id}
                                className="flex-shrink-0 p-4"
                                style={{
                                    x: cardX,
                                    y: cardY,
                                    zIndex: teamMembers.length - index
                                }}
                            >
                                <div
                                    className="w-80 h-96 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-cover bg-center relative"
                                    style={{ backgroundImage: `url(${member.image.src})` }}
                                >
                                    {/* Dark overlay for readability */}
                                    <div className="absolute inset-0 bg-black/70" />

                                    {/* Content */}
                                    <div className="relative p-6 flex flex-col justify-end h-full">
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {member.title}
                                        </h3>
                                        <p className="text-sm text-gray-300 uppercase tracking-wide">
                                            {member.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* "For Whom We Are Made" text */}
                <motion.div
                    style={{ opacity: textOpacity, y: textY }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                    <div className="text-end">
                        <h2 className="text-8xl font-bold text-white uppercase tracking-wider">
                            For Whom We Are Made
                        </h2>
                        <div className="w-32 h-1 bg-primary mx-auto mt-4"></div>
                    </div>
                </motion.div>
            </div>

            {/* Mobile fallback */}
            <div className="lg:hidden container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="bg-black rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative h-72">
                                <Image
                                    src={member.image.src}
                                    alt={member.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {member.title}
                                </h3>
                                <p className="text-sm text-gray-400 uppercase tracking-wide">
                                    {member.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Button positioned at bottom of this section only */}
            <div className="absolute bottom-0 left-0 right-0 z-50">
                <div className="flex justify-center">
                    <motion.div
                        whileHover={{ scale: 1.08, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Button
                            onClick={() => router.push("/use-cases")}
                            className="flex items-center cursor-pointer gap-2 px-6 sm:px-8 py-4 sm:py-6 text-white text-base sm:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[160px] bg-primary hover:bg-primary/90 shadow-lg"
                        >
                            Know more
                        </Button>
                    </motion.div>
                </div>
                <motion.div
                    className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-12 sm:mt-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                />
            </div>

        </section>

    );
}
