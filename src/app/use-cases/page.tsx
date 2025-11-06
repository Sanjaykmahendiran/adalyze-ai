"use client"

import { Button } from "@/components/ui/button"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import { useRouter } from "next/navigation"
import { ArrowRight, BarChart3, Users, Zap, Target, Building2, CheckCircle, Play } from "lucide-react"
import { motion, animate } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import Agencies from "@/assets/Landing-page/use-cases/1,agency.webp"
import Ecommerce from "@/assets/Landing-page/use-cases/2.e-commerece.webp"
import SmallBusiness from "@/assets/Landing-page/use-cases/3.small-business.webp"
import SocialMedia from "@/assets/Landing-page/use-cases/4.socilmedia.webp"
import Enterprise from "@/assets/Landing-page/use-cases/5.enterprise-deatil.webp"
import UseCasesBanner from "@/assets/Landing-page/use-cases/use-case-banner.webp"
import CaseStudySection from "@/components/landing-page/case-study-section"
import PromoImg from "@/assets/Landing-page/use-cases/use-case-cta.webp"
import Image from "next/image"
import BlogSection from "@/components/landing-page/blog-section"
import { trackEvent } from "@/lib/eventTracker"

const features = [
    {
        badge: "Agencies",
        title: "Empower Your Clients' Ads with AI Insights",
        description: "Manual ad analysis is slow, inaccurate, and hard to scale.",
        benefits: [
            "Analyze multiple client campaigns in seconds",
            "Predict ad performance & CTR before launch",
            "Optimize creatives to maximize client ROI",
        ],
        metrics: [
            { value: 50, suffix: "+", label: "campaigns daily" },
            { value: 95, suffix: "%", label: "accuracy" },
            { value: 30, suffix: "%", label: "spend saved", prefix: "Up to " },
        ],
        buttonText: "See How Agencies Use Adalyze",
        desktopImage: Agencies,

    },
    {
        badge: "E-commerce",
        title: "Boost Sales with High-Performing Ads",
        description: "Low ROI on campaigns, wasted ad spend, unclear performance metrics.",
        benefits: [
            "Identify winning ads before spending big",
            "Reduce ad costs while improving conversion",
            "Get actionable recommendations for every campaign",
        ],
        metrics: [
            { value: 40, suffix: "%", label: "more conversions", prefix: "20-" },
            { value: 25, suffix: "%", label: "spend reduced" },
            { value: 60, suffix: "s", label: "instant score", prefix: "< " },
        ],
        buttonText: "Start Optimizing Your E-commerce Ads",
        desktopImage: Ecommerce,
    },
    {
        badge: "Small Business",
        title: "Make Every Ad Count, Even on a Small Budget",
        description: "Limited time and resources to test multiple creatives.",
        benefits: [
            "Quickly analyze and improve ad designs",
            "Save ad spend while increasing engagement",
            "Professional insights without hiring a team",
        ],
        metrics: [
            { value: 60, suffix: "", label: "sec per analysis" },
            { value: 10, suffix: "+", label: "insights per campaign" },
            { value: 20, suffix: "%", label: "spend saved" },
        ],
        buttonText: "Try Adalyze for Free",
        desktopImage: SmallBusiness,
    },
    {
        badge: "social media Manager",
        title: "Deliver Engaging Ads That Work",
        description: "Struggling to maintain engagement and CTR across platforms.",
        benefits: [
            "Evaluate ad creatives before posting",
            "Optimize for higher engagement & shares",
            "Track which ad styles perform best per platform",
        ],
        metrics: [
            { value: 25, suffix: "%", label: "CTR boost", prefix: "15-" },
            { value: 30, suffix: "%", label: "more engagement" },
            { value: 10, suffix: "+", label: "platform insights" },
        ],
        buttonText: "See How Social Media Managers Use Adalyze",
        desktopImage: SocialMedia,
    },
    {
        badge: "Enterprise",
        title: "Scale Your Ad Strategy with AI Precision",
        description: "Managing multiple campaigns across markets is complex and costly.",
        benefits: [
            "Analyze hundreds of ads at once",
            "Gain actionable insights for cross-market campaigns",
            "Improve ROI while maintaining brand consistency",
        ],
        metrics: [
            { value: 100, suffix: "+", label: "ads at once" },
            { value: 20, suffix: "%", label: "ROI increase" },
            { value: 50, suffix: "+", label: "insights per campaign" },
        ],
        buttonText: "Learn How Large Brands Optimize Ads",
        desktopImage: Enterprise,
    },
];

// Inline Counter Component
function InlineCounter({ value, suffix = "", prefix = "", duration = 2.5 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(node);
        return () => observer.unobserve(node);
    }, []);

    useEffect(() => {
        if (!isInView) return;

        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, value, {
            duration,
            onUpdate(latest) {
                if (node) {
                    node.textContent = `${prefix}${Math.round(latest)}${suffix}`;
                }
            },
        });

        return () => controls.stop();
    }, [value, duration, isInView, prefix, suffix]);

    return (
        <motion.span
            ref={nodeRef}
            className="text-primary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4 }}
        >
            {prefix}0{suffix}
        </motion.span>
    );
}

export default function UseCases() {
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)

    // Add ref for video section
    const videoSectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024)
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])


    return (
        <div className="min-h-screen overflow-x-hidden w-full">
            <Header />

            {/* Hero Section */}
            <section className="h-screen pt-32 sm:pt-34 md:pt-36 pb-10 sm:pb-12 md:pb-14 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">
                        <div className="order-2 md:order-1 md:max-w-2xl w-full">
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
                                    Adalyze AI Works for
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="block text-primary"
                                >
                                    Every Business
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
                                From agencies to e-commerce, Adalyze helps maximize ROI with intelligent insights and automated optimization.
                            </motion.p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 mb-5 w-full sm:w-auto">
                                <Button size="lg"
                                    onClick={() => {
                                        window.open("/register", "_blank", "noopener,noreferrer");
                                        trackEvent("UC_Start_Free_Trial_button_clicked", window.location.href);
                                    }}
                                    className="flex items-center justify-center cursor-pointer gap-2 px-6 sm:px-8 py-3 sm:py-4 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-0 sm:min-w-[220px]"
                                >
                                    Start Your Free Trial
                                </Button>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 flex items-center justify-center md:justify-end w-full h-auto md:h-full min-h-[300px] sm:min-h-[400px] md:min-h-[450px] md:max-w-md lg:max-w-lg xl:max-w-xl overflow-hidden">
                            <Image
                                src={UseCasesBanner}
                                alt="Agency Dashboard Preview"
                                className="object-contain w-full h-auto max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl bounce-slow"
                                width={1000}
                                height={750}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Updated with Inline Counters */}
            <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-24 overflow-hidden">
                <div className="max-w-6xl mx-auto w-full">

                    <div className="space-y-24 sm:space-y-32 lg:space-y-40">
                        {features.map((feature, index) => {
                            const isEven = index % 2 === 0

                            return (
                                <div key={index} className="relative">
                                    <div
                                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full "
                                    >
                                        {/* Image Side - First on mobile, positioned based on desktop layout */}
                                        <div className={`flex justify-center  ${!isEven ? "lg:order-1" : ""} ${isEven ? "order-1 lg:order-2" : "order-1"}`}>
                                            <div className="w-full max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg bounce-slow px-2 sm:px-0">
                                                <img
                                                    src={feature.desktopImage.src}
                                                    alt={feature.title}
                                                    className="w-full h-auto max-w-full rounded-lg shadow-lg bounce-slow"
                                                />
                                            </div>
                                        </div>

                                        {/* Text Side */}
                                        <motion.div
                                            initial={{ x: isEven ? -50 : 50, opacity: 0 }}
                                            whileInView={{ x: 0, opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            viewport={{ once: true, amount: 0.3 }}
                                            className={`space-y-4 w-full ${!isEven ? "lg:order-2" : ""} ${isEven ? "order-2 lg:order-1" : "order-2"}`}
                                        >
                                            {feature.badge && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-base font-bold bg-white text-primary border border-primary/20">
                                                    {feature.badge}
                                                </span>
                                            )}

                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                                                {feature.title}
                                            </h3>

                                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                                {feature.description}
                                            </p>

                                            {/* Regular Benefits */}
                                            <div className="space-y-2">
                                                {feature.benefits.map((benefit, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm text-foreground">{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Animated Metrics */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 w-full">
                                                {feature.metrics.map((metric, i) => (
                                                    <div key={i} className="text-center py-2 px-2 bg-black rounded-lg border border-primary/10 min-w-0">
                                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-1 break-words">
                                                            {metric.prefix}
                                                            <InlineCounter
                                                                value={metric.value}
                                                                suffix={metric.suffix}
                                                                duration={2.5}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground break-words">
                                                            {metric.label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* <Button
                                                onClick={() => { window.open("/register", "_blank", "noopener,noreferrer"); trackEvent("UC_See_How_button_clicked", window.location.href); }}
                                                variant="outline"
                                                className="text-white border-primary hover:bg-primary hover:text-white"
                                            >
                                                {feature.buttonText}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button> */}
                                        </motion.div>
                                    </div>

                                    {/* Mobile-only divider after each section */}
                                    <div className="block lg:hidden mt-6 border-t border-[#db4900]/40 w-full mx-auto" />
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-center mt-20">
                        <Button
                            onClick={() => { window.open("/register", "_blank", "noopener,noreferrer"); trackEvent("UC_Start_Free_Trial_button_clicked", window.location.href); }}
                            className="bg-primary hover:bg-primary/90 text-lg px-3 py-6 text-primary-foreground">
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>

            </section>

            {/* Video Section - Add ref here */}
            <section
                ref={videoSectionRef}
                className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/20 overflow-hidden"
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative max-w-6xl mx-auto w-full"
                >
                    {/* Video Container */}
                    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-black/20 border border-primary/20">
                        {/* Video Element */}
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <video
                                className="absolute top-0 left-0 w-full h-full object-cover rounded-2xl"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            >
                                <source
                                    src="https://adalyze.app/uploads/Process_Video.mp4"
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </motion.div>
            </section>

            <CaseStudySection category="" />

            {/* CTA Section - Cleaner */}
            <div className="relative w-full overflow-hidden text-white">
                {/* Background Glow - Simplified */}
                <div className="absolute inset-0 z-0 bg-[#0f0a07] overflow-hidden">
                    <div className="absolute -top-10 -left-10 sm:-top-20 sm:-left-20 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] bg-[#db4900] opacity-20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[120px]" />
                    <div className="absolute -bottom-10 -right-10 sm:-bottom-20 sm:-right-20 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] bg-[#ff6b00] opacity-15 rounded-full blur-[50px] sm:blur-[70px] md:blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-4 sm:space-y-6">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                                Ready to Analyze Your Ads?
                            </h2>

                            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                                Start your free trial and see results in minutes. Join thousands of businesses already maximizing their ad ROI with Adalyze AI.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                                <Button
                                    onClick={() => { window.open("/register", "_blank", "noopener,noreferrer"); trackEvent("UC_Start_Free_Trial_button_clicked", window.location.href); }}
                                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                                >
                                    Start Free Trial <ArrowRight className="ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Right Content – Image without background */}
                        <div className="flex justify-center lg:justify-end order-first lg:order-last overflow-hidden">
                            <div className="w-full max-w-full sm:max-w-sm md:max-w-md px-2 sm:px-0">
                                <Image
                                    src={PromoImg}
                                    alt="Adalyze AI Assistant"
                                    className="rounded-lg w-full h-auto max-w-full"
                                    width={400}
                                    height={300}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BlogSection />
            <LandingPageFooter />
        </div>
    )
}
