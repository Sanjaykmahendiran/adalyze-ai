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
        <div className="min-h-screen bg-black">
            {/* Header */}
            <Header />

            {/* Hero Section - Mobile First */}
            <section className="py-8 sm:py-12 lg:py-16 mt-16 sm:mt-20 lg:mt-28 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                        Join the AdalyzeAI 
                        <span className="block sm:inline"> Affiliate Program</span>
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto px-2">
                        Earn up to <span className="text-primary font-semibold">30% commission</span> by helping users discover next-generation AI marketing tools.
                        Promote cutting-edge AI solutions for marketers, agencies, and business owners.
                    </p>
                    <Button
                        onClick={() => router.push("/register")}
                        size="lg" 
                        className="text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg hover:scale-105 transition-transform duration-200 w-full sm:w-auto"
                    >
                        Apply Now - It's Free
                    </Button>
                </div>
            </section>

            {/* How to Get Started - Mobile Optimized */}
            <section className="py-8 sm:py-12 lg:py-16 px-4 text-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-white">
                        How to Get Started
                    </h2>

                    {/* Mobile: Stack vertically, Desktop: Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {steps.map((item, idx) => (
                            <Card
                                key={idx}
                                className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300 relative group"
                            >
                                <CardContent className="p-6 sm:p-8 text-center">
                                    {/* Badge - Mobile Optimized */}
                                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-white text-xs sm:text-sm font-semibold px-3 sm:px-5 py-1 sm:py-2 rounded-full shadow-md group-hover:scale-110 transition-transform duration-200">
                                            {item.step}
                                        </span>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="pt-4 sm:pt-6">
                                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-white">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Apply button under steps - Mobile Optimized */}
                    <div className="text-center mt-8 sm:mt-12">
                        <Button 
                            onClick={() => router.push("/register")} 
                            className="text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg font-semibold w-full sm:w-auto max-w-xs"
                        >
                            Start Your Journey
                        </Button>
                    </div>
                </div>
            </section>

            {/* Testimonials - Responsive */}
            <Testimonials />

            {/* Program Benefits & Features - Mobile First */}
            <section className="py-12 sm:py-16 lg:py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-white">
                        Program Benefits & Features
                    </h2>

                    {/* Mobile: 1 column, Tablet: 2 columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        
                        {/* Commission Rate */}
                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="bg-green-900/30 p-2 sm:p-3 rounded-full flex-shrink-0">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                                            High Commission Rate
                                        </h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Earn up to <span className="text-green-400 font-semibold">30% recurring commission</span> per sale for the first 12
                                            months. High-value commissions on premium AI marketing tools.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cookie Duration */}
                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="bg-blue-900/30 p-2 sm:p-3 rounded-full flex-shrink-0">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                                            Extended Cookie Duration
                                        </h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            <span className="text-blue-400 font-semibold">60-day</span> referral cookie life. Earn on sales made up to two months
                                            after the initial click.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Marketing Assets */}
                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="bg-purple-900/30 p-2 sm:p-3 rounded-full flex-shrink-0">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                                            Marketing Assets
                                        </h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Access banners, social media templates, email templates, and
                                            comprehensive guides in your affiliate dashboard to maximize
                                            conversions.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Terms */}
                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="bg-orange-900/30 p-2 sm:p-3 rounded-full flex-shrink-0">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                                            Fast Payment Terms
                                        </h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Monthly payouts processed by the <span className="text-orange-400 font-semibold">15th</span>. Minimum $50 payout via
                                            PayPal or bank transfer. Track earnings in real-time.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Support & Training */}
                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="bg-teal-900/30 p-2 sm:p-3 rounded-full flex-shrink-0">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                                            Support & Training
                                        </h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Dedicated affiliate support team, regular strategy updates, and
                                            comprehensive onboarding to help you succeed.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Program Restrictions */}
                        <Card className="bg-[#121212] border border-[#2b2b2b] rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300">
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="bg-indigo-900/30 p-2 sm:p-3 rounded-full flex-shrink-0">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">
                                            Program Guidelines
                                        </h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            <span className="text-indigo-400 font-semibold">Organic promotion only</span> - Paid advertising campaigns on search engines, social media
                                            platforms, or similar channels are prohibited for affiliate
                                            links.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom CTA - Mobile Optimized */}
                    <div className="text-center mt-12 sm:mt-16">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/20">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                                Ready to Start Earning?
                            </h3>
                            <p className="text-gray-300 mb-6 text-sm sm:text-base max-w-2xl mx-auto">
                                Join thousands of successful affiliates who are already earning with AdalyzeAI. 
                                No experience required - we'll guide you every step of the way.
                            </p>
                            <Button 
                                onClick={() => router.push("/register")} 
                                size="lg"
                                className="text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                            >
                                Join the Program Now
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ and Footer */}
            <FAQSection />
            <LandingPageFooter />
        </div>
    )
}
