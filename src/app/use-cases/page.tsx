"use client"

import { Button } from "@/components/ui/button"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import FAQSection from "@/components/landing-page/faq-section"
import { useRouter } from "next/navigation"
import { ArrowRight, BarChart3, Users, Zap, Target, Building2, CheckCircle, Play } from "lucide-react"
import { motion, animate } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import Agencies from "@/assets/Landing-page/use-cases/1,agency.webp"
import Ecommerce from "@/assets/Landing-page/use-cases/2.e-commerece.webp"
import SmallBusiness from "@/assets/Landing-page/use-cases/3.small-business.webp"
import SocialMedia from "@/assets/Landing-page/use-cases/4.socilmedia.webp"
import Enterprise from "@/assets/Landing-page/use-cases/5.enterprise-deatil.webp"
import IconAgencies from "@/assets/Landing-page/use-cases/1.agency-icon.webp"
import IconEcommerce from "@/assets/Landing-page/use-cases/2.ecommerce-icon.webp"
import IconFreelancers from "@/assets/Landing-page/use-cases/3.freelancers-icon.webp"
import IconSocialMedia from "@/assets/Landing-page/use-cases/4.socila-media-icon.webp"
import IconEnterprise from "@/assets/Landing-page/use-cases/5.enterprise-icon.webp"
import CaseStudySection from "@/components/landing-page/case-study-section"
import PromoImg from "@/assets/Landing-page/use-cases/use-case-cta.webp"
import Image from "next/image"
import BlogSection from "@/components/landing-page/blog-section"

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
            { value: 1, suffix: "", label: "min per ad", prefix: "Results in under " },
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
function InlineCounter({ value, suffix = "", prefix = "", duration = 2.5 }) {
    const nodeRef = useRef(null);
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
                node.textContent = `${prefix}${Math.round(latest)}${suffix}`;
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

    // Function to scroll to video section
    const scrollToVideo = () => {
        videoSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-24">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="mb-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                            <Zap className="w-4 h-4 mr-2" />
                            AI-Powered Ad Analytics
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                        Adalyze AI Works for <span className="text-primary">Every Business</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        From agencies to e-commerce, see how we help you maximize ad ROI with intelligent insights and automated optimization.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Button
                            onClick={() => window.open("/register", "_blank", "noopener,noreferrer")}
                            className="bg-primary hover:bg-primary/90 text-lg px-3 py-6 text-primary-foreground">
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    {/* Business personas - Clean and Simple */}
                    {/* <div className="max-w-5xl mx-auto px-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                            {[
                                { img: IconAgencies.src, label: "Agencies" },
                                { img: IconEcommerce.src, label: "E-commerce" },
                                { img: IconFreelancers.src, label: "Freelancers" },
                                { img: IconSocialMedia.src, label: "Social Media" },
                                { img: IconEnterprise.src, label: "Enterprise" },
                            ].map(({ img, label }, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl shadow-sm 
                   hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                                >
                                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-4 
                        group-hover:bg-primary/10 transition-colors">
                                        <img
                                            src={img}
                                            alt={label}
                                            className="w-10 h-10 object-contain group-hover:opacity-90 transition-opacity"
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div> */}


                </div>
            </section>


            {/* Features Section - Updated with Inline Counters */}
            <section className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Built for Your Business Model
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Whether you're a solo freelancer or managing enterprise campaigns, Adalyze AI adapts to your workflow.
                        </p>
                    </div>

                    <div className="space-y-16">
                        {features.map((feature, index) => {
                            const isEven = index % 2 === 0

                            return (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                                >
                                    {/* Text Side */}
                                    <motion.div
                                        initial={{ x: isEven ? -50 : 50, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        className={`space-y-4 ${!isEven ? "lg:order-2" : ""}`}
                                    >
                                        {feature.badge && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                                                {feature.badge}
                                            </span>
                                        )}

                                        <h3 className="text-2xl sm:text-3xl font-bold text-primary">
                                            {feature.title}
                                        </h3>

                                        <p className="text-gray-300 text-base leading-relaxed">
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
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                                            {feature.metrics.map((metric, i) => (
                                                <div key={i} className="text-center py-2 px-2 bg-black rounded-lg border border-primary/10">
                                                    <div className="text-2xl font-bold text-primary mb-1">
                                                        {metric.prefix}
                                                        <InlineCounter
                                                            value={metric.value}
                                                            suffix={metric.suffix}
                                                            duration={2.5}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {metric.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            onClick={() => window.open("/register", "_blank", "noopener,noreferrer")}
                                            variant="outline"
                                            className="text-white border-primary hover:bg-primary hover:text-white"
                                        >
                                            {feature.buttonText}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </motion.div>

                                    {/* Image Side - Clean without backgrounds */}
                                    <div className={`flex justify-center ${!isEven ? "lg:order-1" : ""}`}>
                                        <div className="w-full max-w-lg">
                                            <img
                                                src={feature.desktopImage.src}
                                                alt={feature.title}
                                                className="w-full h-auto rounded-lg shadow-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Video Section - Add ref here */}
            <section
                ref={videoSectionRef}
                className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/20"
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative max-w-6xl mx-auto"
                >
                    {/* Video Container */}
                    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-black/20 border-10 border-primary/20">
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

            <CaseStudySection />

            {/* CTA Section - Cleaner */}
            <div className="relative w-full overflow-hidden text-white">
                {/* Background Glow - Simplified */}
                <div className="absolute inset-0 z-0 bg-[#0f0a07]">
                    <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#db4900] opacity-20 rounded-full blur-[120px]" />
                    <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-[#ff6b00] opacity-15 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-6">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                                Ready to Analyze Your Ads?
                            </h2>

                            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                                Start your free trial and see results in minutes. Join thousands of businesses already maximizing their ad ROI with Adalyze AI.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button
                                    onClick={() => window.open("/register", "_blank", "noopener,noreferrer")}
                                    className="px-6 py-3"
                                >
                                    Start Free Trial <ArrowRight className="ml-2" />
                                </Button>
                                <Button
                                    onClick={() => window.open("/register", "_blank", "noopener,noreferrer")}
                                    variant="outline"
                                    className="px-6 py-3 border-white/30 text-white hover:bg-white/10"
                                >
                                    Schedule Demo
                                </Button>
                            </div>
                        </div>

                        {/* Right Content – Image without background */}
                        <div className="flex justify-center lg:justify-end">
                            <div className="w-full max-w-md">
                                <Image
                                    src={PromoImg}
                                    alt="Adalyze AI Assistant"
                                    className="rounded-lg w-full h-auto"
                                    width={400}
                                    height={300}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FAQSection />
            <BlogSection />
            <LandingPageFooter />
        </div>
    )
}
