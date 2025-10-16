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
import logo from "@/assets/ad-logo.webp"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import StaticProSkeleton from "@/components/Skeleton-loading/pro-skeleton"
import { useRouter } from "next/navigation"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import CompetitorTable from "@/app/pricing/_components/competitor-table"
import VersionCard from "./_components/version-card"
import { trackFreeTrial, trackPurchase } from "@/lib/gtm"
import { trackEvent } from "@/lib/eventTracker"
import Cookies from "js-cookie"
import PricingHelp from "./_components/pricing-help"

// Extend Window interface for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

// Updated interface to include original prices
interface PricingPlan {
    package_id: number
    plan_name: string
    price_inr: number
    ori_price_inr: number  // Added original INR price
    ori_price_usd: number  // Added original USD price
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
    const [paymentLoading, setPaymentLoading] = useState<{ [key: number]: boolean }>({})
    const [freeTrialLoading, setFreeTrialLoading] = useState<boolean>(false)
    const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(false)
    const [userCurrency, setUserCurrency] = useState<Currency>("INR")
    const [currencyLoading, setCurrencyLoading] = useState<boolean>(true)
    const userId = Cookies.get("userId");

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

    // Fetch data from API
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

    // Updated helper function to get price display with discount logic
    const getPriceDisplay = (plan: PricingPlan) => {
        if (userCurrency === "INR") {
            const hasDiscount = plan.ori_price_inr > plan.price_inr
            return {
                discountedPrice: `₹${plan.price_inr}`,
                originalPrice: `₹${plan.ori_price_inr}`,
                hasDiscount,
                primary: `₹${plan.price_inr}`,
                secondary: `$${plan.price_usd}`,
                primaryCurrency: "INR" as Currency,
                secondaryCurrency: "USD" as Currency,
                discountPercentage: hasDiscount ? Math.round(((plan.ori_price_inr - plan.price_inr) / plan.ori_price_inr) * 100) : 0
            }
        } else {
            const oriPriceUsd = typeof plan.ori_price_usd === 'string' ? parseFloat(plan.ori_price_usd) : plan.ori_price_usd
            const priceUsd = typeof plan.price_usd === 'string' ? parseFloat(plan.price_usd) : plan.price_usd
            const hasDiscount = oriPriceUsd > priceUsd

            return {
                discountedPrice: `$${plan.price_usd}`,
                originalPrice: `$${plan.ori_price_usd}`,
                hasDiscount,
                primary: `$${plan.price_usd}`,
                secondary: `₹${plan.price_inr}`,
                primaryCurrency: "USD" as Currency,
                secondaryCurrency: "INR" as Currency,
                discountPercentage: hasDiscount ? Math.round(((oriPriceUsd - priceUsd) / oriPriceUsd) * 100) : 0
            }
        }
    }

    // Free trial activation function
    const activateFreeTrial = async () => {
        if (!userDetails?.user_id) {
            toast.error("Register to activate free trial and try again.")
            setTimeout(() => {
                router.push("/register");
            }, 2000);
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
                trackFreeTrial("Free Trial", userDetails?.user_id?.toString());
                trackEvent("Free_Trial_Activated", window.location.href, userDetails?.email?.toString());
                router.push("/upload")
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
                trackPurchase(
                    userCurrency === "INR" ? selectedPlan?.price_inr || 0 : parseFloat(selectedPlan?.price_usd || "0"),
                    userCurrency,
                    paymentData.razorpay_order_id,
                    [{ name: selectedPlan.plan_name, price: userCurrency === "INR" ? selectedPlan?.price_inr || 0 : parseFloat(selectedPlan?.price_usd || "0"), quantity: 1 }]
                );
                router.push(`/thanks?order_id=${paymentData.razorpay_order_id}`)
                trackEvent(`Payment_Successful_completed_${selectedPlan.plan_name}`, window.location.href, userDetails?.email?.toString());
            } else {
                throw new Error(result.message || 'Payment verification failed')
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            toast.error("Payment verification failed. Please contact support if amount was deducted.")
            trackEvent("Payment_Failed", window.location.href, userDetails?.email?.toString());
        }
    }

    // Initiate payment function
    const initiatePayment = async (currency: Currency, selectedPlan: PricingPlan) => {
        if (!userDetails?.user_id || !selectedPlan || !razorpayLoaded) {
            toast.error("Register to initiate payment and try again.");
            setTimeout(() => {
                router.push("/register");
            }, 2000);
            return;
        }

        // Set loading only for the clicked plan
        setPaymentLoading(prev => ({ ...prev, [selectedPlan.package_id]: true }));

        try {
            // Fetch Razorpay key from API
            const configResponse = await fetch('https://adalyzeai.xyz/App/api.php?gofor=config');
            const configData = await configResponse.json();

            if (!configResponse.ok || !configData.rzpaykey) {
                throw new Error('Failed to fetch Razorpay key');
            }

            const rzpKey = configData.rzpaykey;

            // Create order
            const orderResponse = await fetch('https://adalyzeai.xyz/App/razorpay.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userDetails.user_id.toString(),
                    package_id: selectedPlan.package_id.toString(),
                    ctype: currency,
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok || !orderData.order_id) {
                throw new Error(orderData.message || 'Failed to create order');
            }

            const options = {
                key: rzpKey,
                amount: currency === 'INR' ? selectedPlan.price_inr * 100 : Math.round(parseFloat(selectedPlan.price_usd) * 100),
                currency: currency,
                name: 'Adalyze AI',
                description: `${selectedPlan.plan_name} Plan Subscription`,
                order_id: orderData.order_id,
                handler: function (response: RazorpayResponse) {
                    verifyPayment(response, selectedPlan);
                },
                prefill: {
                    name: userDetails.name || '',
                    email: userDetails.email || '',
                    contact: userDetails.mobileno || '',
                },
                theme: { color: '#db4900' },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(prev => ({ ...prev, [selectedPlan.package_id]: false }));
                        toast("Payment cancelled. You can retry anytime.", { icon: 'ℹ️' });
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error(error instanceof Error ? error.message : "Unable to process payment");
            setPaymentLoading(prev => ({ ...prev, [selectedPlan.package_id]: false }));
            trackEvent("Payment_Failed", window.location.href, userDetails?.email?.toString());
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
                            <>
                                <h1 className="font-bold mb-4 sm:mb-6 leading-tight px-2 sm:px-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                                    Smarter Ad Insights with Adalyze AI
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                                    Boost your ad performance with AI-powered analysis and detailed reports.
                                </p>
                            </>

                        )}
                    </div>

                    {/* Pricing Section */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                                            <span className="text-3xl sm:text-4xl font-bold">
                                                {userCurrency === "INR" ? "₹0" : "$0"}
                                            </span>
                                            <span className="text-base sm:text-lg text-gray-300">Validity: 5 days</span>
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
                                                if (isDashboardPage && !userId) {
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

                                        {/* Price Display with Strikethrough */}
                                        {currencyLoading ? (
                                            <div className="mb-4">
                                                <div className="h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                                                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                {(() => {
                                                    const priceInfo = getPriceDisplay(basicPlan)
                                                    return (
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {priceInfo.hasDiscount && (
                                                                    <span className="text-lg sm:text-xl text-gray-400 line-through">
                                                                        {priceInfo.originalPrice}
                                                                    </span>
                                                                )}
                                                                <span className="text-2xl sm:text-3xl font-bold text-white">
                                                                    {priceInfo.discountedPrice}
                                                                </span>
                                                            </div>
                                                            <div className="text-base sm:text-lg text-gray-300">
                                                                Validity: {basicPlan.valid_till} days
                                                            </div>
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )}

                                        <div className=" text-green-600 text-lg px-3 py-1 font-medium rounded-full inline-block group-hover:bg-[#ffccaa] transition-colors duration-300 mb-6">
                                            {basicPlan.ads_limit} ad analysis Credits
                                        </div>

                                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                            {basicFeatures.map((feature, index) => (
                                                <li
                                                    key={`${feature.text}-${index}`}
                                                    className="flex items-start gap-3 text-sm sm:text-base"
                                                >
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
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
                                                if (isDashboardPage && !userId) {
                                                    router.push("/register");
                                                } else {
                                                    initiatePayment(userCurrency, basicPlan);
                                                }
                                            }}
                                            disabled={(!isDashboardPage && (!razorpayLoaded || currencyLoading || paymentLoading[basicPlan.package_id]))}

                                        >
                                            {paymentLoading[basicPlan.package_id] && !isDashboardPage ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {isDashboardPage ? "Analyze Ad" : `Pay ${getPriceDisplay(basicPlan).primary}`}
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

                                        {/* Price Display with Strikethrough */}
                                        {currencyLoading ? (
                                            <div className="mb-4">
                                                <div className="h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                                                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                {(() => {
                                                    const priceInfo = getPriceDisplay(starterPlan)
                                                    return (
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {priceInfo.hasDiscount && (
                                                                    <span className="text-lg sm:text-xl text-gray-400 line-through">
                                                                        {priceInfo.originalPrice}
                                                                    </span>
                                                                )}
                                                                <span className="text-2xl sm:text-3xl font-bold text-white">
                                                                    {priceInfo.discountedPrice}
                                                                </span>
                                                            </div>
                                                            <div className="text-base sm:text-lg text-gray-300">
                                                                Validity: {starterPlan.valid_till} days
                                                            </div>
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )}

                                        <div className=" text-green-600 text-lg px-3 py-1 font-medium rounded-full inline-block group-hover:bg-[#ffccaa] transition-colors duration-300 mb-6">
                                            {starterPlan.ads_limit} ad analyses Credits
                                        </div>

                                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                            {starterFeatures.map((feature, index) => (
                                                <li
                                                    key={`${feature.text}-${index}`}
                                                    className="flex items-start gap-3 text-sm sm:text-base"
                                                >
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
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
                                                if (isDashboardPage && !userId) {
                                                    router.push("/register");
                                                } else {
                                                    initiatePayment(userCurrency, starterPlan);
                                                }
                                            }}
                                            disabled={(!isDashboardPage && (!razorpayLoaded || currencyLoading || paymentLoading[starterPlan.package_id]))}
                                        >
                                            {paymentLoading[starterPlan.package_id] && !isDashboardPage ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {isDashboardPage ? "Analyze Ad" : `Pay ${getPriceDisplay(starterPlan).primary}`}
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
                                    <div className="flex-1">
                                        <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                            {growthPlan.plan_name}
                                        </h3>

                                        {/* Price Display with Strikethrough */}
                                        {currencyLoading ? (
                                            <div className="mb-4">
                                                <div className="h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                                                <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                {(() => {
                                                    const priceInfo = getPriceDisplay(growthPlan)
                                                    return (
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {priceInfo.hasDiscount && (
                                                                    <span className="text-lg sm:text-xl text-gray-400 line-through">
                                                                        {priceInfo.originalPrice}
                                                                    </span>
                                                                )}
                                                                <span className="text-2xl sm:text-3xl font-bold text-white">
                                                                    {priceInfo.discountedPrice}
                                                                </span>
                                                            </div>
                                                            <div className="text-base sm:text-lg text-gray-300">
                                                                Validity: {growthPlan.valid_till} days
                                                            </div>
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )}

                                        <div className=" text-green-600 text-lg px-3 py-1 font-medium rounded-full inline-block group-hover:bg-[#ffccaa] transition-colors duration-300 mb-6">
                                            {growthPlan.ads_limit} ad analyses Credits
                                        </div>

                                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                                            {growthFeatures.map((feature, index) => (
                                                <li
                                                    key={`${feature.text}-${index}`}
                                                    className="flex items-start gap-3 text-sm sm:text-base"
                                                >
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
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
                                                if (isDashboardPage && !userId) {
                                                    router.push("/register");
                                                } else {
                                                    initiatePayment(userCurrency, growthPlan);
                                                }
                                            }}
                                            disabled={(!isDashboardPage && (!razorpayLoaded || currencyLoading || paymentLoading[growthPlan.package_id]))}

                                        >
                                            {paymentLoading[growthPlan.package_id] && !isDashboardPage ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    {isDashboardPage ? "Analyze Ad " : `Pay ${getPriceDisplay(growthPlan).primary}`}
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
                    {isDashboardPage && basicPlan && (
                        <CompetitorTable basicPrice={getPriceDisplay(basicPlan).primary} />
                    )}

                    <VersionCard />


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
                <PricingHelp  />
        </div>
    )
}

export default ProPage
