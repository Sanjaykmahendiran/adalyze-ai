"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import FAQSection from "@/components/landing-page/faq-section"
import Testimonials from "@/components/landing-page/testimonials"
import { useRouter } from "next/navigation"

const steps = [
    {
        step: "STEP 1",
        title: "Sign Up",
        description:
            "Complete a quick application form to join the program. Approval is usually swift and open to marketers, creators, and agencies.",
    },
    {
        step: "STEP 2",
        title: "Access Your Dashboard",
        description:
            "Get a unique affiliate link and access detailed tracking and marketing assets to promote AdalyzeAI effectively.",
    },
    {
        step: "STEP 3",
        title: "Start Promoting",
        description:
            "Share your link across YouTube, Twitter, TikTok, blogs, or email. Creative assets and guides provided.",
    },
    {
        step: "STEP 4",
        title: "Earn & Track Commissions",
        description:
            "Earn recurring commission on every qualifying sale for up to 12 months. Track clicks, conversions, and payouts in your dashboard.",
    },
]

export default function AffiliatePage() {
    const router = useRouter()


    return (
        <div className="min-h-screen ">
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="py-10 mt-28 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold mb-6">Join the AdalyzeAI Affiliate Program</h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Earn up to 30% commission by helping users discover next-generation AI marketing tools.
                        Promote cutting-edge AI solutions for marketers, agencies, and business owners.
                    </p>
                    <Button
                        onClick={() => router.push("/register")}
                        size="lg" className=" text-white px-8 py-3">
                        Apply Now
                    </Button>
                </div>
            </section>

            {/* How to Get Started */}
            <section className="py-8  px-4  text-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">How to Get Started</h2>

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((item, idx) => (
                            <Card
                                key={idx}
                                className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-md relative"
                            >
                                <CardContent className="p-8 text-center">
                                    {/* Badge */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-white text-sm font-semibold px-5 py-1 rounded-full shadow-md">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-gray-300">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Apply button under steps */}
                    <div className="text-center mt-10">
                        <Button onClick={() => router.push("/register")} className=" text-white px-8 py-3 rounded-xl shadow-md">
                            Apply Now
                        </Button>
                    </div>
                </div>
            </section>


            <Testimonials />

            {/* About AdalyzeAI Affiliate Program */}
            <section className="py-16 px-4 ">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12 text-white">
                        Program Benefits & Features
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-900/30 p-3 rounded-full">
                                        <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 text-white">
                                            Commission Rate
                                        </h3>
                                        <p className="text-gray-300">
                                            Earn up to 30% recurring commission per sale for the first 12
                                            months. High-value commissions on premium AI marketing tools.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-900/30 p-3 rounded-full">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 text-white">
                                            Cookie Duration
                                        </h3>
                                        <p className="text-gray-300">
                                            60-day referral cookie life. Earn on sales made up to two months
                                            after the initial click.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-900/30 p-3 rounded-full">
                                        <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 text-white">
                                            Marketing Assets
                                        </h3>
                                        <p className="text-gray-300">
                                            Access banners, social media templates, email templates, and
                                            comprehensive guides in your affiliate dashboard to maximize
                                            conversions.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-orange-900/30 p-3 rounded-full">
                                        <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 text-white">
                                            Payment Terms
                                        </h3>
                                        <p className="text-gray-300">
                                            Monthly payouts processed by the 15th. Minimum $50 payout via
                                            PayPal or bank transfer. Track earnings in real-time.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-teal-900/30 p-3 rounded-full">
                                        <div className="w-6 h-6 bg-teal-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 text-white">
                                            Support & Training
                                        </h3>
                                        <p className="text-gray-300">
                                            Dedicated affiliate support team, regular strategy updates, and
                                            comprehensive onboarding to help you succeed.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-indigo-900/30 p-3 rounded-full">
                                        <div className="w-6 h-6 bg-indigo-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2 text-white">
                                            Program Restrictions
                                        </h3>
                                        <p className="text-gray-300">
                                            Paid advertising campaigns on search engines, social media
                                            platforms, or similar channels are prohibited for affiliate
                                            links. Organic promotion only.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>


            <FAQSection />
            <LandingPageFooter />
        </div>
    )
}
