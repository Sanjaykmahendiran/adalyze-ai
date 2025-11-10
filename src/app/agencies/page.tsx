"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import { ArrowRight, Brain, Check, CheckCircle, Building2, FileText, Share2 } from "lucide-react"
import { trackEvent } from "@/lib/eventTracker"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import AgenciesTestimonials from "./_components/testimonials"
import AgencySuccessStories from "./_components/agency-success-stories"
import AboveCTAImg from "@/assets/Landing-page/agency/above-cta-agency.webp"
import agenciesBanner from "@/assets/Landing-page/agency/banner.webp"
import BrandManagement from "@/assets/Landing-page/agency/brand-management.webp"
import PerformanceInsights from "@/assets/Landing-page/agency/performance-insights.webp"
import AutomatedReply from "@/assets/Landing-page/agency/automated-reply.webp"
import ClientCollaboration from "@/assets/Landing-page/agency/client-collabaration-tools.webp"
import KeyFeatures from "@/assets/Landing-page/agency/key-feature.webp"
import Step1 from "@/assets/Landing-page/agency/benefit-1.webp"
import Step2 from "@/assets/Landing-page/agency/benefit-2.webp"
import Step3 from "@/assets/Landing-page/agency/benefit-3.webp"
import Step4 from "@/assets/Landing-page/agency/benefit-4.webp"
import CounterSection from "@/components/landing-page/CounterSection"
import FAQSection from "@/components/landing-page/faq-section"



export default function AgenciesPage() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])


    const agencySteps = [
        {
            stepNumber: "01",
            title: "Multi-Brand Management Dashboard",
            description:
                "Manage multiple client brands from a single AI-powered interface. Gain complete visibility across campaigns, performance, and ROI.",
            image: Step1,
            icon: Building2,
            alt: "Multi-brand management dashboard",
            points: [
                "Simplifies campaign tracking across all client accounts in one place",
                "Enables faster decisions with unified performance visibility"
            ],
        },
        {
            stepNumber: "02",
            title: "White-label Reporting for clients",
            description:
                "Deliver beautifully branded, automated reports with your agency's identity. Save hours and impress clients with real-time, data-rich updates.",
            image: Step2,
            icon: FileText,
            alt: "White-label reporting interface",
            points: [
                "Strengthens your agency's brand with custom-branded reports",
                "Automates reporting to save time and deliver transparency"
            ],
        },
        {
            stepNumber: "03",
            title: "Custom Client Sharing Links",
            description:
                "Share live campaign insights securely with personalized access links. Empower clients to view performance dashboards anytime, anywhere.",
            image: Step3,
            icon: Share2,
            alt: "Client sharing and collaboration",
            points: [
                "Gives clients secure, real-time access to their ad performance",
                "Builds trust through instant data visibility and collaboration"
            ],
        },
        {
            stepNumber: "04",
            title: "Expert Ad Suggestions",
            description:
                "Get AI-driven creative and targeting recommendations and real time expert insights tailored to your campaigns.",
            image: Step4,
            icon: Brain,
            alt: "Expert AI suggestions and insights",
            points: [
                "Improves accuracy along with expert review",
                "Deliver measurable ROI and smarter campaigns"
            ],
        },
    ]


    return (
        <div className="min-h-screen ">
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="min-h-screen pt-32 sm:pt-34 md:pt-36 pb-10 sm:pb-12 md:pb-14 px-4 sm:px-6 ">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">
                        <div className="order-2 md:order-1  md:max-w-2xl">
                            <motion.h1
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeOut",
                                    delay: 0.2
                                }}
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="block"
                                >
                                    Empower Your
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="block text-primary"
                                >
                                    Agency with AI Insights
                                </motion.span>
                            </motion.h1>
                            <motion.p
                                className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                    delay: 0.8
                                }}
                            >
                                Elevate your agency’s ad performance with AI precision. Deliver measurable results and scale effortlessly.

                            </motion.p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                                <Button 
                                    size="lg"
                                    variant="default"
                                    onClick={() => {
                                        window.open("/register", "_blank", "noopener,noreferrer");
                                        trackEvent("Agencies_Start_Free_Trial_button_clicked", window.location.href);
                                    }}
                                    className="flex items-center justify-center cursor-pointer gap-2 px-6 sm:px-8 py-5 sm:py-6 bg-[#db4900] hover:bg-[#b8400a] text-white text-base sm:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[200px] sm:min-w-[220px] z-10 relative"
                                >
                                    Start Your Free Trial
                                </Button>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 flex items-center justify-center md:justify-end w-full h-auto md:h-full min-h-[300px] sm:min-h-[400px] md:min-h-[450px] md:max-w-md lg:max-w-lg xl:max-w-xl overflow-hidden">
                            <Image
                                src={agenciesBanner}
                                alt="Agency Dashboard Preview"
                                className="object-contain w-full h-auto max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl scale-100 sm:scale-105 md:scale-100 bounce-slow"
                                width={1000}
                                height={750}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Leading Agencies Choose Adalyze AI */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-hidden">
                <div className="flex flex-col gap-8 sm:gap-10">
                    <div className="flex gap-4 flex-col items-center">
                        <div className="flex gap-2 flex-col text-center">
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                viewport={{ once: false, amount: 0.3 }}
                                className="text-center py-4 sm:py-6 mb-8"
                            >
                                <motion.h2
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 sm:mb-4 leading-tight"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeOut",
                                        delay: 0.1
                                    }}
                                    viewport={{ once: true }}
                                >
                                    <motion.span
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        viewport={{ once: true }}
                                        className="block"
                                    >
                                        Trusted by Top Agencies
                                    </motion.span>
                                </motion.h2>
                                <motion.p
                                    className="text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-4 leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: "easeOut",
                                        delay: 0.3
                                    }}
                                    viewport={{ once: true }}
                                >
                                    Smarter Ad Decisions. Faster Results.
                                </motion.p>
                                <motion.p
                                    className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: "easeOut",
                                        delay: 0.5
                                    }}
                                    viewport={{ once: true }}
                                >
                                    Agencies worldwide rely on Adalyze AI to simplify ad analysis, improve creative impact, and deliver data-backed insights — all from one smart dashboard.
                                </motion.p>
                            </motion.div>
                        </div>
                    </div>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-6 w-full"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            delay: 0.2
                        }}
                        viewport={{ once: true }}
                    >
                        <motion.div
                            className="group relative bg-black rounded-2xl lg:col-span-3 p-2 sm:p-4 flex justify-between flex-col h-[250px] sm:h-[280px] lg:h-[310px] overflow-hidden shadow-md border border-zinc-800 hover:border-orange-500/40 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.4,
                                ease: "easeOut"
                            }}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                                <Image
                                    src={BrandManagement}
                                    alt="Centralized Brand Management"
                                    fill
                                    className="object-cover opacity-20 transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col h-full justify-end">
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl tracking-tight leading-tight text-primary font-semibold ">Manage multiple brands in one place.
                                        </h3>
                                    </div>
                                    <p className="text-white/80 text-sm sm:text-base leading-relaxed space-y-1">
                                        Gain full visibility and control over every campaign from a single dashboard. Centralized tools make scaling, monitoring, and reporting effortless for agencies.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="group relative bg-black rounded-2xl lg:col-span-2 p-2 sm:p-4 flex justify-between flex-col h-[250px] sm:h-[280px] lg:h-[310px] overflow-hidden shadow-md border border-zinc-800 hover:border-orange-500/40 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.5,
                                ease: "easeOut"
                            }}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                                <Image
                                    src={PerformanceInsights}
                                    alt="Performance Insights"
                                    fill
                                    className="object-cover opacity-20 transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col h-full justify-end">
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl tracking-tight leading-tight text-primary font-semibold ">Identify underperforming ads instantly.
                                        </h3>
                                    </div>
                                    <p className="text-white/80 text-sm sm:text-base leading-relaxed space-y-1">
                                        Unlock actionable insights on engagement, ROI, and creative performance in real time to optimize smarter and faster.

                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="group relative bg-black rounded-2xl lg:col-span-2 p-2 sm:p-4 flex justify-between flex-col h-[250px] sm:h-[280px] lg:h-[310px] overflow-hidden shadow-md border border-zinc-800 hover:border-orange-500/40 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.6,
                                ease: "easeOut"
                            }}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                                <Image
                                    src={AutomatedReply}
                                    alt="Automated Reporting"
                                    fill
                                    className="object-cover opacity-20 transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col h-full justify-end">
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl tracking-tight leading-tight text-primary font-semibold ">Share insights, notes, and fixes securely.

                                        </h3>
                                    </div>
                                    <p className="text-white/80 text-sm sm:text-base leading-relaxed space-y-1">
                                        Simplify team–client communication with transparent reports and actionable insights that strengthen trust and collaboration.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="group relative bg-black rounded-2xl lg:col-span-3 p-2 sm:p-4 flex justify-between flex-col h-[250px] sm:h-[280px] lg:h-[310px] overflow-hidden shadow-md border border-zinc-800 hover:border-orange-500/40 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.7,
                                ease: "easeOut"
                            }}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                                <Image
                                    src={ClientCollaboration}
                                    alt="Client Collaboration Tools"
                                    fill
                                    className="object-cover opacity-20 transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col h-full justify-end">
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl tracking-tight leading-tight text-primary font-semibold ">Generate branded reports for clients in seconds.

                                        </h3>
                                    </div>
                                    <p className="text-white/80 text-sm sm:text-base leading-relaxed space-y-1">
                                        Transform complex ad data into clean, visual dashboards — track KPIs, ROI, and deliver transparency that your clients will love.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div className="py-8 sm:py-12 lg:py-16 mt-18">
                <CounterSection />
            </div>

            {/* Key Features for Agencies */}
            <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid bg-black rounded-lg p-6 sm:p-8 lg:p-12 grid-cols-1 gap-8 lg:gap-12 items-center lg:grid-cols-2 overflow-hidden">
                        <div className="flex gap-8 sm:gap-10 flex-col">
                            <div className="flex gap-4 flex-col">
                                <div className="flex gap-2 flex-col">
                                    <motion.h2
                                        className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-tighter max-w-2xl text-left text-primary font-bold leading-tight"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            ease: "easeOut",
                                            delay: 0.2
                                        }}
                                        viewport={{ once: true }}
                                    >
                                        <motion.span
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.4 }}
                                            viewport={{ once: true }}
                                            className="block"
                                        >
                                            Key Features
                                        </motion.span>
                                        <motion.span
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.6 }}
                                            viewport={{ once: true }}
                                            className="block"
                                        >
                                            for Agencies
                                        </motion.span>
                                    </motion.h2>
                                    <motion.p
                                        className="text-base sm:text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left mt-2 sm:mt-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: "easeOut",
                                            delay: 0.8
                                        }}
                                        viewport={{ once: true }}
                                    >
                                        Adalyze AI is designed to streamline agency operations, boost creative quality, and scale performance insights.
                                    </motion.p>
                                </div>
                            </div>
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeOut",
                                    delay: 0.4
                                }}
                                viewport={{ once: true }}
                            >
                                <motion.div
                                    className="flex flex-row gap-4 sm:gap-6 items-start"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-2 text-primary flex-shrink-0" />
                                    <div className="flex flex-col gap-1 sm:gap-2">
                                        <p className="text-sm sm:text-base font-medium">Multi-brand Ad Analysis</p>
                                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                            Analyze ads across multiple brands simultaneously.
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="flex flex-row gap-4 sm:gap-6 items-start"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-2 text-primary flex-shrink-0" />
                                    <div className="flex flex-col gap-1 sm:gap-2">
                                        <p className="text-sm sm:text-base font-medium">AI-driven Ad Scoring</p>
                                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                            Get instant AI scores for every ad.
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="flex flex-row gap-4 sm:gap-6 items-start"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 1.0 }}
                                    viewport={{ once: true }}
                                >
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-2 text-primary flex-shrink-0" />
                                    <div className="flex flex-col gap-1 sm:gap-2">
                                        <p className="text-sm sm:text-base font-medium">Ad Quality Checker</p>
                                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                            Identify creative weaknesses and optimize for better results.
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="flex flex-row gap-4 sm:gap-6 items-start"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 1.2 }}
                                    viewport={{ once: true }}
                                >
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-2 text-primary flex-shrink-0" />
                                    <div className="flex flex-col gap-1 sm:gap-2">
                                        <p className="text-sm sm:text-base font-medium">ROI Tracker</p>
                                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                            Track ad performance and ROI in real-time.
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="flex flex-row gap-4 sm:gap-6 items-start"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 1.4 }}
                                    viewport={{ once: true }}
                                >
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-2 text-primary flex-shrink-0" />
                                    <div className="flex flex-col gap-1 sm:gap-2">
                                        <p className="text-sm sm:text-base font-medium">Client-wise Dashboards</p>
                                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                            Visualize ad performance by client or brand.
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                        <motion.div
                            className="relative rounded-md aspect-square min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 1.2,
                                ease: "easeOut",
                                delay: 1.0
                            }}
                            viewport={{ once: true }}
                        >
                            <Image
                                src={KeyFeatures}
                                alt="Key Features"
                                fill
                                className="object-cover rounded-md"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Proven Impact: Agency Success Stories */}
            <AgencySuccessStories />

            {/* Agency-Only Benefits & White-Label Solutions */}
            <section className="relative py-8 sm:py-12 lg:py-16 mt-6 sm:mt-8 mb-8 sm:mb-12 px-4 sm:px-6 ">
                <div className="container mx-auto max-w-7xl">
                    {/* Section Title */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="text-center py-4 sm:py-6"
                    >
                        <motion.h2
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl max-w-6xl mx-auto font-bold text-primary mb-2 sm:mb-4 leading-tight"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                ease: "easeOut",
                                delay: 0.2
                            }}
                            viewport={{ once: true }}
                        >
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                viewport={{ once: true }}
                                className="block"
                            >
                                Agency-Only Benefits
                            </motion.span>

                        </motion.h2>
                        <motion.p
                            className="text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-4 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: 0.8
                            }}
                            viewport={{ once: true }}
                        >
                            Built for how agencies work.
                        </motion.p>
                        <motion.p
                            className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: 1.0
                            }}
                            viewport={{ once: true }}
                        >
                            From white-label reports and multi-brand dashboards to automated performance summaries, Adalyze AI is designed to help agencies scale, save time, and impress clients effortlessly.
                        </motion.p>
                    </motion.div>

                    {/* Steps Container */}
                    <div className="relative mt-8 sm:mt-12 lg:mt-16">
                        {agencySteps.map((step, index) => (
                            <div
                                key={index}
                                className="sticky top-24 gap-6 sm:gap-10 flex items-center justify-center"
                                style={{ zIndex: index + 1 }}
                            >
                                <div
                                    className={`relative rounded-xl sm:rounded-2xl overflow-visible mt-8 sm:mt-10 bg-[#121212] border border-[#db4900]/50 p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-6xl mx-auto ${index === 1 ? "md:flex-row-reverse" : ""
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                                        {/* Text Content */}
                                        <motion.div
                                            className={`flex-1 text-white ${index === 1 ? "md:pl-6 lg:pl-8" : "md:pr-6 lg:pr-8"}`}
                                            initial={{ x: -100, opacity: 0 }}
                                            whileInView={{ x: 0, opacity: 1 }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            viewport={{ once: false }}
                                        >
                                            {/* Mobile Icon and Step Layout */}
                                            <div className="flex items-center gap-4 md:hidden mb-4">
                                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#db4900] to-[#b71c1c] rounded-lg flex items-center justify-center">
                                                    <step.icon className="w-6 h-6 text-white" />
                                                </div>
                                            </div>

                                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text text-transparent leading-tight">
                                                {step.title}
                                            </h2>
                                            <p className="text-base sm:text-lg opacity-90 leading-relaxed mb-4 sm:mb-6">{step.description}</p>

                                            {/* Points Section */}
                                            {step.points && (
                                                <div className="space-y-2 sm:space-y-3">
                                                    {step.points.map((point, pointIndex) => (
                                                        <div key={pointIndex} className="flex items-start gap-2 sm:gap-3">
                                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#db4900] flex-shrink-0 mt-0.5" />
                                                            <span className="text-xs sm:text-sm text-white/80 leading-relaxed">{point}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Image */}
                                        <motion.div
                                            className="flex-shrink-0 relative z-50 hidden md:block"
                                            initial={{ x: 100, opacity: 0 }}
                                            whileInView={{ x: 0, opacity: 1 }}
                                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                                            viewport={{ once: false }}
                                        >
                                            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 overflow-visible">
                                                <Image
                                                    src={step.image || "/placeholder.svg"}
                                                    alt={step.alt}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative py-8 sm:py-12 lg:py-16 mt-6 sm:mt-8 mb-8 sm:mb-12 px-4 sm:px-6 overflow-hidden">
                <div className="container mx-auto max-w-7xl">
                    <AgenciesTestimonials />
                </div>
            </section>

            {/* FAQ */}
            <FAQSection ButtonText="Start Free Trial" category="agency" />

            {/* CTA Section */}
            <div className="relative w-full overflow-hidden text-white" id="promo-section">
                {/* ✨ Background Glow */}
                <div className="absolute inset-0 z-0 bg-[#0f0a07] overflow-hidden">
                    <div className="absolute -top-10 sm:-top-20 md:-top-40 -left-10 sm:-left-20 md:-left-40 w-[150px] sm:w-[200px] md:w-[400px] lg:w-[600px] h-[150px] sm:h-[200px] md:h-[400px] lg:h-[600px] bg-[#db4900] opacity-30 rounded-full blur-[60px] sm:blur-[90px] md:blur-[120px] lg:blur-[180px] pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] sm:w-[150px] md:w-[350px] lg:w-[500px] h-[100px] sm:h-[150px] md:h-[350px] lg:h-[500px] bg-[#ffad82] opacity-20 rounded-full blur-[50px] sm:blur-[80px] md:blur-[120px] lg:blur-[160px] pointer-events-none" />
                    <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-[120px] sm:w-[150px] md:w-[300px] lg:w-[400px] h-[120px] sm:h-[150px] md:h-[300px] lg:h-[400px] bg-[#ff6b00] opacity-25 rounded-full blur-[50px] sm:blur-[75px] md:blur-[100px] lg:blur-[150px] pointer-events-none" />
                </div>

                {/* 🌟 Main Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 flex flex-col-reverse md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
                    {/* Left Content */}
                    <motion.div
                        className="w-full md:w-1/2 space-y-4 sm:space-y-6 text-center md:text-left"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <div
                            className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#db4900]/80 text-white font-medium text-xs sm:text-sm"
                            role="note"
                            aria-label="Exclusive Features"
                        >
                            For Modern Businesses
                        </div>

                        <div className="flex flex-col text-center sm:items-center md:items-start md:text-left space-y-4 sm:space-y-6">
                            {/* 🔥 Animated Heading */}
                            <motion.h2
                                initial={{ x: -100, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                viewport={{ once: false }}
                                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight sm:leading-tight text-white px-2"
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="block"
                                >
                                    Start Elevating Your
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    viewport={{ once: true }}
                                    className="block text-primary"
                                >
                                    Client's Ad Performance Today
                                </motion.span>
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 80,
                                }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.08, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                className="space-y-2 w-full max-w-sm sm:max-w-md"
                            >
                                <Button
                                    onClick={() => {
                                        window.open("/register", "_blank", "noopener,noreferrer");
                                        trackEvent("LP_CTA_button_clicked", window.location.href);
                                    }}
                                    className="py-3 sm:py-4 md:py-6 cursor-pointer w-full sm:w-auto min-w-[180px] sm:min-w-[200px] text-sm sm:text-base font-semibold"
                                >
                                    Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Content – Image */}
                    <div className="w-full md:w-1/2 overflow-hidden">
                        <motion.div
                            className="relative flex justify-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative w-[85%] sm:w-[90%] max-w-lg sm:max-w-xl md:max-w-2xl md:translate-x-2 lg:translate-x-4 xl:translate-x-6">
                                <Image
                                    src={AboveCTAImg || "/placeholder.svg"}
                                    alt="Adalye AI Assistant"
                                    className="rounded-lg object-contain w-full h-auto"
                                    width={800}
                                    height={500}
                                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 50vw"
                                    priority
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <LandingPageFooter />
        </div>
    )
}
