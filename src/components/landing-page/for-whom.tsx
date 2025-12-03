'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Building2, ShoppingCart, User, Share2, Building, Megaphone } from 'lucide-react';
import image1 from "@/assets/Landing-page/1.agency.webp"
import image2 from "@/assets/Landing-page/2.ecommerce.webp"
import image3 from "@/assets/Landing-page/3.freelancers.webp"
import image4 from "@/assets/Landing-page/4.social-media-manager.webp"
import image5 from "@/assets/Landing-page/5.enterprise.webp"
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/eventTracker';

const teamMembers = [
    {
        id: "marketing-agencies",
        title: "Marketing Agencies",
        description: "AI insights and automation to boost client ROI.",
        image: image1,
        icon: Building2,
    },
    {
        id: "ecommerce-brands",
        title: "E-commerce Brands",
        description: "High-performing ad creatives that drive sales.",
        image: image2,
        icon: ShoppingCart,
    },
    {
        id: "freelancers",
        title: "Freelancers",
        description: "Budget-friendly tools to maximize ad spend.",
        image: image3,
        icon: User,
    },
    {
        id: "social-media-managers",
        title: "Social Media Managers",
        description: "Engaging ads that boost reach and performance.",
        image: image4,
        icon: Megaphone,
    },
    {
        id: "enterprises",
        title: "Enterprise & Large Brands",
        description: "Enterprise-grade AI for multi-market campaigns.",
        image: image5,
        icon: Building,
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.8, rotateX: -15 },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            delay: index * 0.1,
            duration: 0.6,
            ease: [0.17, 0.67, 0.83, 1] as const,
        },
    }),
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,
            stiffness: 200,
            damping: 15,
        },
    },
};

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
            id='for-whom'
            className="relative h-auto lg:h-[300vh]" ref={containerRef}>
            {/* Section Title - Optimized for small screens */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}
                className="text-center py-2 sm:py-3 px-2"
            >
                <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2">
                    Who Benefits from <span className='text-primary'>Adalyze AI</span>
                </h2>
                <p className="text-white font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1"> Designed for Marketers, Designers & Ad Agencies</p>
                <p className="text-sm sm:text-base text-white/80 max-w-xl sm:max-w-2xl mx-auto ">
                    Adalyze AI helps marketers, designers, and agencies create better ads with AI-powered insights, ad scores, and trend analysis to boost performance and ROI.
                </p>
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
                                    className="w-80 aspect-[5/6] rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-cover bg-center relative"
                                    style={{ backgroundImage: `url(${member.image.src})` }}
                                >
                                    {/* Dark overlay for readability */}
                                    <div className="absolute inset-0 bg-black/70" />

                                    {/* Content */}
                                    <div className="relative p-6 flex flex-col justify-end h-full">
                                        <h3 className="text-3xl font-semibold text-white mb-2">
                                            {member.title}
                                        </h3>
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
                        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white uppercase tracking-wider">
                            For Whom We Are Made
                        </h2>
                        <div className="w-32 h-1 bg-primary mx-auto mt-4"></div>
                    </div>
                </motion.div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 pb-28">
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.1 }}
                    variants={containerVariants}
                >
                    {teamMembers.map((member, index) => {
                        const IconComponent = member.icon;
                        const isLast = index === teamMembers.length - 1;

                        return (
                            <motion.div
                                key={member.id}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.2 }}
                                variants={cardVariants}
                                whileHover={{
                                    scale: 1.08,
                                    y: -8,
                                    rotateY: 5,
                                    transition: {
                                        type: "spring" as const,
                                        stiffness: 300,
                                        damping: 20,
                                    },
                                }}
                                whileTap={{ scale: 0.95 }}
                                className={`text-center relative overflow-hidden group rounded-2xl py-4 px-2 bg-black border border-[#2b2b2b]
                                          ${isLast ? "col-span-full w-full" : ""}`}
                            >

                                {/* Icon */}
                                <motion.div
                                    className="flex justify-center mb-3 pt-4 relative z-10"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false }}
                                    variants={iconVariants}
                                    whileHover={{
                                        scale: 1.2,
                                        rotate: 360,
                                        transition: {
                                            type: "spring" as const,
                                            stiffness: 300,
                                            damping: 15,
                                        },
                                    }}
                                >
                                    <IconComponent className="w-10 h-10 text-primary bounce-slow" />
                                </motion.div>

                                {/* Title */}
                                <motion.h3
                                    className="text-sm font-medium text-white pb-4 relative z-10"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: false }}
                                    transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {member.title}
                                </motion.h3>

                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Button positioned at bottom of this section only */}
            <div className="absolute bottom-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8">
                <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
                    <motion.div
                        whileHover={{ scale: 1.08, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Button
                            onClick={() => { router.push("/use-cases"); trackEvent("LP_Know_More_button_clicked", window.location.href); }}
                            className="flex items-center cursor-pointer gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-white text-sm sm:text-base md:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[140px] sm:min-w-[160px] bg-primary hover:bg-primary/90 shadow-lg"
                        >
                            Know more
                        </Button>
                    </motion.div>
                </div>
                <motion.div
                    className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-4 sm:mt-6 md:mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                />
            </div>

        </section>

    );
}
