"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
    Check,
    Crown,
    Upload,
    Brain,
    Wrench,
    TestTube,
    Download,
    Zap,
    Star,
    Target,
    FileText,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Loader2,
    Gift,
    Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import logo from "@/assets/ad-logo.png"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import StaticProSkeleton from "@/components/Skeleton-loading/pro-skeleton"
import { useRouter } from "next/navigation"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import CompetitorTable from "@/app/pricing/_components/competitor-table"
import ProTestimonials from "../pro/_components/protestimonials"
import { event } from "@/lib/gtm"

// Extend Window interface for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PricingPlan {
    package_id: number
    plan_name: string
    price_inr: number
    price_usd: string
    features: string
    ads_limit: number
    valid_till: string
    status: number
}

interface FAQ {
    faq_id: number
    question: string
    answer: string
    category: string
    status: number
    created_date: string
}

interface Testimonial {
    testi_id: number
    content: string
    name: string
    role: string
    status: number
    created_date: string
}

interface Feature {
    text: string
    included: boolean
}

interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

type Currency = "INR" | "USD"

const staticFeatures = [
    {
        icon: Upload,
        title: "Multiple Uploads",
        description:
            "Upload multiple creatives each month based on your selected plan.",
    },
    {
        icon: TrendingUp,
        title: "Predictive Engagement Score",
        description:
            "Instantly get a smart score that predicts how engaging your ad is likely to be.",
    },
    {
        icon: Target,
        title: "Target Audience Alignment",
        description:
            "Find out how well your ad matches your selected target audience demographics.",
    },
    {
        icon: Brain,
        title: "AI-Written Ad Copy Generator",
        description:
            "Generate compelling, platform-optimized ad copies tailored to your creative.",
    },
    {
        icon: Download,
        title: "Downloadable Reports",
        description:
            "Export your ad analysis and insights as downloadable PDF reports for sharing.",
    },
    {
        icon: FileText,
        title: "In-Depth Creative Insights",
        description:
            "Unlock detailed analysis of scroll-stopping power, CTR, conversion chances, and more.",
    },
]

const parseFeatures = (featuresStr: string): Feature[] => {
    return featuresStr
        .split(";")
        .map((f) => f.trim())
        .filter(Boolean)
        .map((feature) => ({
            text: feature,
            included: true,
        }))
}

const ProPage: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { userDetails } = useFetchUserDetails()

    // Check if page parameter is "dashboard"
    const isDashboardPage = searchParams.get('page') === 'dashboard'

    const [pricingData, setPricingData] = useState<PricingPlan[]>([])
    const [faqData, setFaqData] = useState<FAQ[]>([])
    const [testimonialData, setTestimonialData] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [paymentLoading, setPaymentLoading] = useState<boolean>(false)
    const [freeTrialLoading, setFreeTrialLoading] = useState<boolean>(false)
    const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(false)
    const [userCurrency, setUserCurrency] = useState<Currency>("INR")
    const [currencyLoading, setCurrencyLoading] = useState<boolean>(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollAmount = 300

    // Currency detection function
    const detectUserCurrency = async (): Promise<Currency> => {
        try {
            // 1. Try Intl API (May not always provide currency)
            const localeCurrency = new Intl.NumberFormat().resolvedOptions().currency;
            if (localeCurrency === "INR") return "INR";

            // 2. Fetch user's country using GeoIP API
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            return data.country_code === "IN" ? "INR" : "USD";
        } catch (error) {
            console.error("Error detecting currency:", error);
            return "INR"; // Default fallback
        }
    }

    // Initialize currency detection
    useEffect(() => {
        const initializeCurrency = async () => {
            setCurrencyLoading(true)
            try {
                const detectedCurrency = await detectUserCurrency()
                setUserCurrency(detectedCurrency)
            } catch (error) {
                console.error("Currency detection failed:", error)
                setUserCurrency("INR") // Fallback to INR
            } finally {
                setCurrencyLoading(false)
            }
        }

        initializeCurrency()
    }, [])

    // Load Razorpay script
    useEffect(() => {
        const loadRazorpayScript = () => {
            return new Promise((resolve) => {
                const script = document.createElement('script')
                script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                script.async = true
                script.onload = () => {
                    setRazorpayLoaded(true)
                    resolve(true)
                }
                script.onerror = () => {
                    console.error('Failed to load Razorpay script')
                    resolve(false)
                }
                document.body.appendChild(script)
            })
        }

        if (!window.Razorpay) {
            loadRazorpayScript()
        } else {
            setRazorpayLoaded(true)
        }
    }, [])

    const next = () => {
        scrollRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }

    const prev = () => {
        scrollRef.current?.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    }

    useEffect(() => {
        let cancelled = false

        const fetchData = async () => {
            try {
                const [pricingRes, faqRes, testiRes] = await Promise.all([
                    fetch("https://adalyzeai.xyz/App/api.php?gofor=packageslist"),
                    fetch("https://adalyzeai.xyz/App/api.php?gofor=faqlist"),
                    fetch("https://adalyzeai.xyz/App/api.php?gofor=testimonialslist"),
                ])

                if (!pricingRes.ok || !faqRes.ok || !testiRes.ok) {
                    throw new Error("One or more network responses were not ok")
                }

                const pricing: PricingPlan[] = await pricingRes.json()
                const faqs: FAQ[] = await faqRes.json()
                const testimonials: Testimonial[] = await testiRes.json()

                if (cancelled) return

                setPricingData(pricing.filter((plan) => plan.status === 1))
                setFaqData(faqs.filter((faq) => faq.status === 1))
                setTestimonialData(
                    testimonials.filter((testimonial) => testimonial.status === 1)
                )
                setError(null)
            } catch (err) {
                console.error("Error fetching data:", err)
                if (!cancelled) {
                    setError("Failed to load data. Please try again later.")
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchData()
        return () => {
            cancelled = true
        }
    }, [])

    // Get specific plans
    const basicPlan = useMemo(
        () => pricingData.find((plan) => plan.plan_name === "Basic"),
        [pricingData]
    )
    const starterPlan = useMemo(
        () => pricingData.find((plan) => plan.plan_name === "Starter"),
        [pricingData]
    )
    const growthPlan = useMemo(
        () => pricingData.find((plan) => plan.plan_name === "Growth"),
        [pricingData]
    )

    const basicFeatures = useMemo(
        () => (basicPlan ? parseFeatures(basicPlan.features) : []),
        [basicPlan]
    )
    const starterFeatures = useMemo(
        () => (starterPlan ? parseFeatures(starterPlan.features) : []),
        [starterPlan]
    )
    const growthFeatures = useMemo(
        () => (growthPlan ? parseFeatures(growthPlan.features) : []),
        [growthPlan]
    )

    // Helper function to get price display based on user currency
    const getPriceDisplay = (plan: PricingPlan) => {
        if (userCurrency === "INR") {
            return {
                primary: `₹${plan.price_inr}`,
                secondary: `$${plan.price_usd}`,
                primaryCurrency: "INR" as Currency,
                secondaryCurrency: "USD" as Currency
            }
        } else {
            return {
                primary: `$${plan.price_usd}`,
                secondary: `₹${plan.price_inr}`,
                primaryCurrency: "USD" as Currency,
                secondaryCurrency: "INR" as Currency
            }
        }
    }

    // Free trial activation function
    const activateFreeTrial = async () => {
        if (!userDetails?.user_id) {
            toast.error("Unable to activate free trial. Please try again.")
            return
        }

        setFreeTrialLoading(true)

        try {
            const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=fretra&user_id=${userDetails.user_id}`)

            if (!response.ok) {
                throw new Error('Failed to activate free trial')
            }

            const result = await response.json()

            // Check if the response indicates success
            if (result.response === "Free Trial Activated") {
                toast.success("Free trial activated successfully! Enjoy 2 days of premium features.")
                router.push("/dashboard")
            } else {
                throw new Error(result.response || 'Failed to activate free trial')
            }
        } catch (error) {
            console.error('Free trial activation error:', error)
            toast.error(error instanceof Error ? error.message : "Failed to activate free trial. Please try again.")
        } finally {
            setFreeTrialLoading(false)
        }
    }

    // Payment verification function
    const verifyPayment = async (paymentData: RazorpayResponse, selectedPlan: PricingPlan) => {
        try {
            const response = await fetch('https://adalyzeai.xyz/App/verify.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    razorpay_payment_id: paymentData.razorpay_payment_id,
                    razorpay_order_id: paymentData.razorpay_order_id,
                    razorpay_signature: paymentData.razorpay_signature,
                }),
            })

            const result = await response.json()

            if (result.response === 'Payment Successful & User Upgraded') {
                toast.success("Payment Successful! Your subscription has been activated.")
                event("purchase", {
                    value: userCurrency === "INR"
                        ? selectedPlan?.price_inr || 0
                        : parseFloat(selectedPlan?.price_usd || "0"),
                    currency: userCurrency,
                    plan: selectedPlan?.plan_name,
                })
                router.push(`/thanks?order_id=${paymentData.razorpay_order_id}`)
            } else {
                throw new Error(result.message || 'Payment verification failed')
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            toast.error("Payment verification failed. Please contact support if amount was deducted.")
        }
    }

    // Initiate payment function
    const initiatePayment = async (currency: Currency, selectedPlan: PricingPlan) => {
        if (!userDetails?.user_id || !selectedPlan || !razorpayLoaded) {
            toast.error("Unable to initiate payment. Please try again.")
            return
        }

        setPaymentLoading(true)

        try {
            const orderResponse = await fetch('https://adalyzeai.xyz/App/razorpay.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userDetails.user_id.toString(),
                    package_id: selectedPlan.package_id.toString(),
                    ctype: currency,
                }),
            })

            const orderData = await orderResponse.json()

            if (!orderResponse.ok || !orderData.order_id) {
                throw new Error(orderData.message || 'Failed to create order')
            }

            const options = {
                key: 'rzp_test_28UhRPu2GtFse3',
                amount: currency === 'INR' ? selectedPlan.price_inr * 100 : Math.round(parseFloat(selectedPlan.price_usd) * 100),
                currency: currency,
                name: 'Adalyze AI',
                description: `${selectedPlan.plan_name} Plan Subscription`,
                order_id: orderData.order_id,
                handler: function (response: RazorpayResponse) {
                    verifyPayment(response, selectedPlan)
                },
                prefill: {
                    name: userDetails.name || '',
                    email: userDetails.email || '',
                    contact: userDetails.mobileno || '',
                },
                theme: {
                    color: '#ff6a00',
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(false)
                        toast("Payment cancelled. You can retry anytime.", {
                            icon: 'ℹ️',
                        })
                    }
                }
            }

            const paymentObject = new window.Razorpay(options)
            paymentObject.open()

        } catch (error) {
            console.error('Payment initiation error:', error)
            toast.error(error instanceof Error ? error.message : "Unable to process payment")
        } finally {
            setPaymentLoading(false)
        }
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center p-4 sm:p-6">
                <div className="bg-[#1f1f1f] rounded-lg p-6 sm:p-10 max-w-lg w-full mx-4">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">Something went wrong</h2>
                    <p className="text-gray-300 mb-6 text-sm sm:text-base">{error}</p>
                    <Button onClick={() => router.refresh()} type="button" className="w-full sm:w-auto">
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            {loading ? (
                <StaticProSkeleton />
            ) : (
                <div className="min-h-screen text-white space-y-16">
                    {/* Conditionally render Header only when IS dashboard page */}
                    {isDashboardPage && <Header />}

                    {isDashboardPage && <div className="h-24" />}

                    {/* Hero Section */}
                    <div className="text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Conditionally render logo only when NOT dashboard page */}
                        {!isDashboardPage && (
                            <div className="mb-6 sm:mb-8 flex justify-center">
                                <div className="w-32 h-16 sm:w-40 sm:h-20 md:w-52 md:h-[104px] relative">
                                    <Image
                                        src={logo}
                                        alt="Adalyze Pro"
                                        fill
                                        className="object-contain"
                                        priority
                                        sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 208px"
                                    />
                                </div>
                            </div>
                        )}
                        {isDashboardPage && (
                            <><h1 className="font-bold mb-4 sm:mb-6 leading-tight px-2 sm:px-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                                Unlock smarter ad insights with Adalyze AI
                            </h1><p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto px-4">
                                    Take your ad performance to the next level with advanced AI analysis,
                                    comprehensive reporting, and premium features.
                                </p></>
                        )}
                    </div>

                    {/* Pricing Section */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-12">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <h2 className="text-2xl md:text-4xl font-bold">
                                    Choose Your Plan
                                </h2>
                            </div>
                            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                                Start with our free trial or select the plan that best fits your ad analysis needs.
                            </p>
                        </div>

                        {/* Free Trial - Full Width Row */}
                        <div className="mb-8 sm:mb-12">
                            <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-lg p-4 sm:p-6 shadow-lg shadow-green-500/10 border border-green-500/30 hover:scale-[1.02] transition-all duration-300 relative max-w-6xl mx-auto">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <Badge className="bg-green-600 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                        <Gift className="w-3 h-3 mr-1" />
                                        Free Trial
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-center">
                                    {/* Left: Plan Info */}
                                    <div className="lg:col-span-2">
                                        <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                                            Try Premium Free
                                        </h3>

                                        <div className="flex items-baseline gap-2 mb-3">
                                            <span className="text-3xl sm:text-4xl font-bold">$0</span>
                                            <span className="text-base sm:text-lg text-gray-300">Validity: 2 days</span>
                                        </div>
                                        <div className="text-base text-green-400">
                                            Access all premium features for 1 ad
                                        </div>
                                    </div>

                                    {/* Right: CTA Button */}
                                    <div className="flex justify-center lg:justify-end">
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-base px-8 py-4 h-auto min-w-[200px]"
                                            type="button"
                                            onClick={() => {
                                                if (isDashboardPage) {
                                                    router.push("/register");
                                                } else {
                                                    activateFreeTrial();
                                                }
                                            }}
                                            disabled={freeTrialLoading && !isDashboardPage}
                                        >
                                            {freeTrialLoading && !isDashboardPage ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Activating...
                                                </>
                                            ) : (
                                                <>
                                                    <Gift className="w-5 h-5 mr-2" />
                                                    {isDashboardPage ? "Start Free Trial" : "Start Free Trial"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Paid Plans - Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                            {/* Basic Plan */}
                            {basicPlan && (
                                <div className="bg-[#121212] rounded-lg p-6 sm:p-8 shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col w-full">
                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                            {basicPlan.plan_name}
                                        </h3>

                                        {currencyLoading ? (
                                            <div className="mb-4">
                                                <div className="h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                                                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-2xl sm:text-3xl font-bold mb-2 flex flex items-center justify-between">
                                                    <span>{getPriceDisplay(basicPlan).primary}</span>
                                                    <span className="text-base sm:text-lg ">
                                                        Validity: {basicPlan.valid_till} days
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        <div className="text-sm text-primary mb-6">
                                            {basicPlan.ads_limit} ad analysis included
                                        </div>

                                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                            {/* FIXED: Use basicFeatures instead of starterFeatures */}
                                            {basicFeatures.map((feature, index) => (
                                                <li
                                                    key={`${feature.text}-${index}`}
                                                    className="flex items-start gap-3 text-sm sm:text-base"
                                                >
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span className="leading-relaxed">{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-auto">
                                        <Button
                                            variant="outline"
                                            className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
                                            type="button"
                                            onClick={() => {
                                                if (isDashboardPage) {
                                                    router.push("/register");
                                                } else {
                                                    initiatePayment(userCurrency, basicPlan);
                                                }
                                            }}
                                            disabled={(paymentLoading || !razorpayLoaded || currencyLoading) && !isDashboardPage}
                                        >
                                            {paymentLoading && !isDashboardPage ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {isDashboardPage ? "Pay" : `Pay ${getPriceDisplay(basicPlan).primary}`}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {!razorpayLoaded && !currencyLoading && (
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            Loading payment gateway...
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Starter Plan */}
                            {starterPlan && (
                                <div className="bg-[#121212] rounded-lg p-6 sm:p-8 relative shadow-lg shadow-white/5 border border-primary hover:scale-[1.02] transition-all duration-300 flex flex-col w-full">
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-primary text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                            Most Popular
                                        </Badge>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                            {starterPlan.plan_name}
                                        </h3>

                                        {currencyLoading ? (
                                            <div className="mb-4">
                                                <div className="h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                                                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-2xl sm:text-3xl font-bold mb-2 flex flex items-center justify-between">
                                                    <span>{getPriceDisplay(starterPlan).primary}</span>
                                                    <span className="text-base sm:text-lg ">
                                                        Validity: {starterPlan.valid_till} days
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        <div className="text-sm text-primary mb-6">
                                            {starterPlan.ads_limit} ad analyses included
                                        </div>

                                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                            {starterFeatures.map((feature, index) => (
                                                <li
                                                    key={`${feature.text}-${index}`}
                                                    className="flex items-start gap-3 text-sm sm:text-base"
                                                >
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span className="leading-relaxed">{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-auto">
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
                                            type="button"
                                            onClick={() => {
                                                if (isDashboardPage) {
                                                    router.push("/register");
                                                } else {
                                                    initiatePayment(userCurrency, starterPlan);
                                                }
                                            }}
                                            disabled={(paymentLoading || !razorpayLoaded || currencyLoading) && !isDashboardPage}
                                        >
                                            {paymentLoading && !isDashboardPage ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {isDashboardPage ? "Pay" : `Pay ${getPriceDisplay(starterPlan).primary}`}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {!razorpayLoaded && !currencyLoading && (
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            Loading payment gateway...
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Growth Plan */}
                            {growthPlan && (
                                <div className="bg-[#121212] rounded-lg p-6 sm:p-8 relative shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col w-full">
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                            <Crown className="w-3 h-3 mr-1" />
                                            Premium
                                        </Badge>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                            {growthPlan.plan_name}
                                        </h3>

                                        {currencyLoading ? (
                                            <div className="mb-4">
                                                <div className="h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                                                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-2xl sm:text-3xl font-bold mb-2 flex flex items-center justify-between">
                                                    <span>{getPriceDisplay(growthPlan).primary}</span>
                                                    <span className="text-base sm:text-lg ">
                                                        Validity: {growthPlan.valid_till} days
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        <div className="text-sm text-primary mb-6">
                                            {growthPlan.ads_limit} ad analyses included
                                        </div>

                                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                            {growthFeatures.map((feature, index) => (
                                                <li
                                                    key={`${feature.text}-${index}`}
                                                    className="flex items-start gap-3 text-sm sm:text-base"
                                                >
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span className="leading-relaxed">{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-auto">
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
                                            type="button"
                                            onClick={() => {
                                                if (isDashboardPage) {
                                                    router.push("/register");
                                                } else {
                                                    initiatePayment(userCurrency, growthPlan);
                                                }
                                            }}
                                            disabled={(paymentLoading || !razorpayLoaded || currencyLoading) && !isDashboardPage}
                                        >
                                            {paymentLoading && !isDashboardPage ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {isDashboardPage ? "Pay" : `Pay ${getPriceDisplay(growthPlan).primary}`}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {!razorpayLoaded && !currencyLoading && (
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            Loading payment gateway...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Conditionally render CompetitorTable only when dashboard page */}
                    {isDashboardPage && <CompetitorTable />}

                    {/* Features Grid */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8 sm:mb-12">
                            Features We Offer
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {staticFeatures.map((feature) => {
                                const Icon = feature.icon
                                return (
                                    <div
                                        key={feature.title}
                                        className="bg-[#121212] rounded-lg p-4 sm:p-6 shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00] rounded-lg flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0">
                                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Testimonials - hidden on mobile (smaller than lg) */}
                    {/* <div className="hidden lg:block"> */}
                        <ProTestimonials testimonialData={testimonialData} />
                    {/* </div> */}

                    {/* FAQs - Always render */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8 sm:mb-12">
                            Frequently Asked Questions
                        </h2>
                        <div className="max-w-6xl mx-auto">
                            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                                {faqData
                                    .filter((faq) =>
                                        ['Pricing', 'General', 'Subscription'].includes(faq.category)
                                    )
                                    .slice(0, 8)
                                    .map((faq) => (
                                        <div
                                            key={faq.faq_id}
                                            className="bg-[#121212] rounded-lg p-4 sm:p-6 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors duration-300"
                                        >
                                            <h3 className="font-semibold mb-3 text-white leading-relaxed text-sm sm:text-base">
                                                {faq.question}
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Conditionally render Footer only when dashboard page */}
            {isDashboardPage && <LandingPageFooter />}
        </div>
    )
}

export default ProPage
