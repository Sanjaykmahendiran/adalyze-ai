"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Layers, Upload, Share2, Code, Clock, Lock, FileText, TrendingUp, CheckCircle } from "lucide-react"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"

export default function AgenciesPage() {
    const [formData, setFormData] = useState({
        agencyName: "",
        brandsManagedCount: "",
        analysesPerMonth: "",
        email: "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="min-h-screen ">
            {/* Navigation */}
            <Header />

            {/* Hero Section */}
            <section className="py-20  mt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                                Adalyze for Agencies — Manage Multiple Brands, Scale Creative Quality.
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                Team seats, brand workspace, usage quotas — built for agencies handling multiple clients.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-hover">
                                    Request Agency Pilot
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                                >
                                    See Agency Plans
                                </Button>
                            </div>
                        </div>
                        <div className=" slide-in-bottom" style={{ animationDelay: "0.2s" }}>
                            <div className="bg-card border border-border rounded-xl p-8 aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <Layers className="w-8 h-8 text-primary" />
                                    </div>
                                    <p className="text-muted-foreground">Agency Dashboard Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pain Points */}
            <section className="py-20 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold mb-12 text-center ">Built for Agency Workflows</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className=" transition-all duration-300 hover:-translate-y-1 bg-black p-4 rounded-xl hover:shadow-lg hover:shadow-primary/20">
                            <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Streamline Multi-Client Audits</h3>
                            <p className="text-muted-foreground">Manage audits for all your clients from one unified dashboard.</p>
                        </div>
                        <div
                            className=" transition-all duration-300 hover:-translate-y-1 bg-black p-4 rounded-xl hover:shadow-lg hover:shadow-primary/20"
                            style={{ animationDelay: "0.1s" }}
                        >
                            <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">White-Label Reports</h3>
                            <p className="text-muted-foreground">
                                Deliver branded reports to your clients with your logo and colors.
                            </p>
                        </div>
                        <div
                            className=" transition-all duration-300 hover:-translate-y-1 bg-black p-4 rounded-xl hover:shadow-lg hover:shadow-primary/20"
                            style={{ animationDelay: "0.2s" }}
                        >
                            <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                                <Share2 className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Team Collaboration & Approvals</h3>
                            <p className="text-muted-foreground">Built-in workflows for team reviews and client approvals.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold mb-12 text-center ">Powerful Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Layers, title: "Brand Management", desc: "Organize unlimited client brands" },
                            { icon: Users, title: "Team Seats", desc: "Invite team members with role-based access" },
                            { icon: Upload, title: "Bulk Upload", desc: "Audit multiple ads at once" },
                            { icon: Share2, title: "Shared Reports", desc: "Collaborate with clients seamlessly" },
                            { icon: Code, title: "API Access", desc: "Integrate with your existing tools" },
                            { icon: Clock, title: "Usage Limits", desc: "Set monthly quotas per client" },
                            { icon: Lock, title: "Priority Support", desc: "24/7 dedicated support team" },
                            { icon: FileText, title: "SLA", desc: "Service level agreements included" },
                        ].map((feature, i) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={i}
                                    className=" transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 bg-black p-4 rounded-xl p-6"
                                    style={{ animationDelay: `${(i % 4) * 0.1}s` }}
                                >
                                    <div className="w-10 h-10 bg-primary/20 rounded-lg mb-3 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Case Study */}
            <section className="py-20 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="">
                            <h2 className="text-4xl font-bold mb-6">How X Agency Reduced Revision Cycles by 38%</h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                By implementing Adalyze's agency platform, X Agency streamlined their ad audit process, reducing
                                revision cycles and improving client satisfaction.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">38% Faster Revisions</p>
                                        <p className="text-sm text-muted-foreground">Streamlined workflow</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">5x More Clients</p>
                                        <p className="text-sm text-muted-foreground">Scaled operations</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className=" slide-in-bottom" style={{ animationDelay: "0.2s" }}>
                            <div className="bg-card border border-border rounded-xl p-8 aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Case Study</p>
                                    <p className="text-lg font-semibold">X Agency Success Story</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold mb-16 text-center">
                        Pilot & Onboarding Timeline
                    </h2>

                    <div className="relative">
                        {/* Vertical center line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-primary/30" />

                        <div className="space-y-24 relative">
                            {[
                                {
                                    step: "Apply",
                                    desc: "Submit your agency details and goals to get started with the Adalyze pilot.",
                                    img: "/images/timeline/apply.png",
                                },
                                {
                                    step: "Onboarding Call",
                                    desc: "Our success team helps you integrate Adalyze into your workflow and set up your first audit.",
                                    img: "/images/timeline/onboarding.png",
                                },
                                {
                                    step: "Pilot",
                                    desc: "Run a live pilot campaign with selected clients and track AI-powered performance insights.",
                                    img: "/images/timeline/pilot.png",
                                },
                                {
                                    step: "Review",
                                    desc: "We’ll review your pilot data and optimize strategies to maximize ROI and efficiency.",
                                    img: "/images/timeline/review.png",
                                },
                                {
                                    step: "Enterprise Contract",
                                    desc: "Scale Adalyze across all accounts with custom integrations and enterprise-grade analytics.",
                                    img: "/images/timeline/enterprise.png",
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col md:flex-row items-center md:gap-16 ${i % 2 === 0 ? "md:flex-row-reverse" : ""
                                        }`}
                                >
                                    {/* Left / Right content block */}
                                    <div className="w-full md:w-1/2 md:text-right">
                                        <h3 className="text-2xl font-semibold mb-3">{item.step}</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Center line number */}
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-12 h-12 bg-primary text-primary-foreground font-bold flex items-center justify-center rounded-full z-10 shadow-lg">
                                            {i + 1}
                                        </div>
                                        {i < 4 && (
                                            <div className="w-1 h-24 bg-primary/30 -mt-1 z-0" />
                                        )}
                                    </div>

                                    {/* Image */}
                                    <div className="w-full md:w-1/2">
                                        <img
                                            src={item.img}
                                            alt={item.step}
                                            className="w-full h-72 object-cover rounded-2xl shadow-xl border border-border"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* FAQ */}
            <section className="py-20 ">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold mb-12 text-center ">FAQ & Compliance</h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: "What is your data retention policy?",
                                a: "We retain audit data for 12 months. Custom retention policies available for Enterprise plans.",
                            },
                            { q: "Is SSO available?", a: "Yes, SSO is available on Pro and Enterprise plans for enhanced security." },
                            {
                                q: "What payment options do you offer?",
                                a: "We accept credit cards, invoicing, and custom payment arrangements for Enterprise customers.",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className=" bg-card border border-border rounded-xl p-6"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <h3 className="font-semibold mb-2">{item.q}</h3>
                                <p className="text-muted-foreground">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-20 ">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold mb-12 text-center ">Request Your Agency Pilot</h2>
                    <form className="space-y-6 " style={{ animationDelay: "0.1s" }}>
                        <div>
                            <label className="block text-sm font-medium mb-2">Agency Name</label>
                            <input
                                type="text"
                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleInputChange}
                                placeholder="Your agency name"
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Number of Brands Managed</label>
                            <input
                                type="number"
                                name="brandsManagedCount"
                                value={formData.brandsManagedCount}
                                onChange={handleInputChange}
                                placeholder="e.g., 15"
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Average Analyses Per Month</label>
                            <input
                                type="number"
                                name="analysesPerMonth"
                                value={formData.analysesPerMonth}
                                onChange={handleInputChange}
                                placeholder="e.g., 200"
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your@email.com"
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <Button size="lg" className="w-full bg-primary hover:bg-primary/90 glow-hover">
                            Request Pilot
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            or{" "}
                            <a href="#" className="text-primary hover:underline">
                                Schedule a call instantly (Calendly)
                            </a>
                        </p>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <LandingPageFooter />
        </div>
    )
}
