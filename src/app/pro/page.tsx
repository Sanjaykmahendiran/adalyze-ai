"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import StaticProSkeleton from "@/components/Skeleton-loading/pro-skeleton"
import { useRouter } from "next/navigation"
import ProTestimonials from "./_components/protestimonials"
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
    ori_price_inr: number
    ori_price_usd: number
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
    const { userDetails } = useFetchUserDetails()

    const [pricingData, setPricingData] = useState<PricingPlan[]>([])
    const [faqData, setFaqData] = useState<FAQ[]>([])
    const [testimonialData, setTestimonialData] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [processingPackageId, setProcessingPackageId] = useState<number | null>(null)
    const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(false)
    const [userCurrency, setUserCurrency] = useState<'INR' | 'USD'>('INR')
    const [currencyDetecting, setCurrencyDetecting] = useState<boolean>(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollAmount = 300

    // Currency detection function
    const detectUserCurrency = async () => {
        try {
            setCurrencyDetecting(true)

            // 1. Try Intl API (May not always provide currency)
            try {
                const localeCurrency = new Intl.NumberFormat().resolvedOptions().currency
                if (localeCurrency === "INR") {
                    setUserCurrency("INR")
                    setCurrencyDetecting(false)
                    return
                }
            } catch (intlError) {
                console.log("Intl API currency detection failed:", intlError)
            }

            // 2. Fetch user's country using GeoIP API
            const response = await fetch("https://ipapi.co/json/")
            const data = await response.json()

            if (data.country_code === "IN") {
                setUserCurrency("INR")
            } else {
                setUserCurrency("USD")
            }
        } catch (error) {
            console.error("Error detecting currency:", error)
            // Default to INR if detection fails
            setUserCurrency("INR")
        } finally {
            setCurrencyDetecting(false)
        }
    }

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

    // Detect user currency on component mount
    useEffect(() => {
        detectUserCurrency()
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

    // Get specific plans - using Basic as the entry-level plan and Growth as the premium plan
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

    // Check if a plan is the user's current plan
    const isCurrentPlan = (plan: PricingPlan) => {
        return userDetails?.package_id === plan.package_id
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

                window.location.reload()
            } else {
                throw new Error(result.message || 'Payment verification failed')
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            toast.error("Payment verification failed. Please contact support if amount was deducted.")
        } finally {
            setProcessingPackageId(null)
        }
    }

    // Initiate payment function - now defaults to user's detected currency
    const initiatePayment = async (
        currency: 'INR' | 'USD' = userCurrency,
        selectedPlan: PricingPlan
    ) => {
        if (!userDetails?.user_id || !selectedPlan || !razorpayLoaded) {
            toast.error("Unable to initiate payment. Please try again.");
            return;
        }

        setProcessingPackageId(selectedPlan.package_id);

        try {
            // Fetch Razorpay key from config API
            const configResponse = await fetch('https://adalyzeai.xyz/App/api.php?gofor=config');
            const configData = await configResponse.json();

            if (!configResponse.ok || !configData.rzpaykey) {
                throw new Error("Failed to fetch Razorpay key");
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

            // Razorpay payment options
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
                        setProcessingPackageId(null);
                        toast("Payment cancelled. You can retry anytime.", { icon: 'ℹ️' });
                    },
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error(error instanceof Error ? error.message : "Unable to process payment");
        } finally {
            // Only clear if payment didn't initiate successfully
            if (!window.Razorpay) {
                setProcessingPackageId(null);
            }
        }
    };

    // Helper function to get price display with strikethrough
    const getPriceDisplay = (plan: PricingPlan) => {
        if (userCurrency === 'INR') {
            return {
                originalPrice: `₹${plan.ori_price_inr}`,
                discountedPrice: `₹${plan.price_inr}`,
                hasDiscount: plan.ori_price_inr > plan.price_inr
            }
        } else {
            return {
                originalPrice: `$${plan.ori_price_usd}`,
                discountedPrice: `$${plan.price_usd}`,
                hasDiscount: plan.ori_price_usd > parseFloat(plan.price_usd)
            }
        }
    }

    // Helper function to get primary price (for payment button)
    const getPrimaryPrice = (plan: PricingPlan) => {
        if (userCurrency === 'INR') {
            return `₹${plan.price_inr}`
        } else {
            return `$${plan.price_usd}`
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
        <UserLayout userDetails={userDetails}>
            {loading ? (
                <StaticProSkeleton />
            ) : (
                <div className="min-h-screen text-white space-y-16 pb-26 overflow-x-hidden">
                    {/* Pricing Section */}
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-8 sm:mb-12">
                                <h2 className="text-2xl md:text-4xl font-bold mb-1">
                                    Choose Your Plan
                                </h2>
                                <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                                    Pick the plan that suits your ad analysis needs.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
                                {/* Basic Plan */}
                                {basicPlan && (
                                    <div
                                        className={`relative bg-black rounded-lg p-6 sm:p-8 shadow-lg shadow-white/5 hover:scale-[1.02] transition-all duration-300 flex flex-col w-full min-w-0 ${isCurrentPlan(basicPlan) ? "border border-primary" : ""
                                            }`}
                                    >
                                        {isCurrentPlan(basicPlan) && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                <Badge className="bg-primary text-white shadow-md px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                                    Current Plan
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                                {basicPlan.plan_name}
                                            </h3>

                                            {/* Price Display with Strikethrough */}
                                            <div className="mb-2">
                                                {(() => {
                                                    const priceInfo = getPriceDisplay(basicPlan)
                                                    return (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {priceInfo.hasDiscount && (
                                                                <span className="text-lg sm:text-xl text-gray-400 line-through">
                                                                    {priceInfo.originalPrice}
                                                                </span>
                                                            )}
                                                            <span className="text-2xl sm:text-3xl font-bold text-white">
                                                                {priceInfo.discountedPrice}
                                                            </span>
                                                        </div>
                                                    )
                                                })()}
                                                <div className="text-base sm:text-lg text-gray-300">
                                                    Validity: {basicPlan.valid_till} days
                                                </div>
                                            </div>

                                            <div className="text-green-600 text-lg py-1 font-medium rounded-full inline-block group-hover:bg-[#ffccaa] transition-colors duration-300 mb-6">
                                                {basicPlan.ads_limit} ad analysis included
                                            </div>
                                            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-white/80">
                                                {basicFeatures.map((feature, index) => (
                                                    <li key={`${feature.text}-${index}`} className="flex items-start gap-3 text-sm sm:text-base">
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
                                                onClick={() => initiatePayment(userCurrency, basicPlan)}
                                                disabled={processingPackageId === basicPlan.package_id || !razorpayLoaded || currencyDetecting}
                                            >
                                                {processingPackageId === basicPlan.package_id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : currencyDetecting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Pay {getPrimaryPrice(basicPlan)}
                                                    </>
                                                )}
                                            </Button>

                                            {!razorpayLoaded && (
                                                <p className="text-xs text-gray-500 text-center mt-2">
                                                    Loading payment gateway...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Starter Plan */}
                                {starterPlan && (
                                    <div
                                        className={`relative bg-black rounded-lg p-6 sm:p-8 shadow-lg shadow-white/5 hover:scale-[1.02] transition-all duration-300 flex flex-col w-full min-w-0 ${isCurrentPlan(starterPlan) ? "border border-primary" : ""
                                            }`}
                                    >
                                        {isCurrentPlan(starterPlan) && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                <Badge className="bg-primary text-white shadow-md px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                                    Current Plan
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                                {starterPlan.plan_name}
                                            </h3>

                                            {/* Price Display with Strikethrough */}
                                            <div className="mb-2">
                                                {(() => {
                                                    const priceInfo = getPriceDisplay(starterPlan)
                                                    return (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {priceInfo.hasDiscount && (
                                                                <span className="text-lg sm:text-xl text-gray-400 line-through">
                                                                    {priceInfo.originalPrice}
                                                                </span>
                                                            )}
                                                            <span className="text-2xl sm:text-3xl font-bold text-white">
                                                                {priceInfo.discountedPrice}
                                                            </span>
                                                        </div>
                                                    )
                                                })()}
                                                <div className="text-base sm:text-lg text-gray-300">
                                                    Validity: {starterPlan.valid_till} days
                                                </div>
                                            </div>

                                            <div className="text-green-600 text-lg py-1 font-medium rounded-full inline-block group-hover:bg-[#ffccaa] transition-colors duration-300 mb-6">
                                                {starterPlan.ads_limit} ad analyses included
                                            </div>
                                            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-white/80">
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
                                                onClick={() => initiatePayment(userCurrency, starterPlan)}
                                                disabled={processingPackageId === starterPlan.package_id || !razorpayLoaded || currencyDetecting}
                                            >
                                                {processingPackageId === starterPlan.package_id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : currencyDetecting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Pay {getPrimaryPrice(starterPlan)}
                                                    </>
                                                )}
                                            </Button>

                                            {!razorpayLoaded && (
                                                <p className="text-xs text-gray-500 text-center mt-2">
                                                    Loading payment gateway...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Growth Plan */}
                                {growthPlan && (
                                    <div
                                        className={`relative bg-black rounded-lg p-6 sm:p-8 shadow-lg shadow-white/5 hover:scale-[1.02] transition-all duration-300 flex flex-col w-full min-w-0 ${isCurrentPlan(growthPlan) ? "border border-primary" : ""
                                            }`}
                                    >
                                        {isCurrentPlan(growthPlan) && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                <Badge className="bg-primary text-white shadow-md px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                                    Current Plan
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                                {growthPlan.plan_name}
                                            </h3>

                                            {/* Price Display with Strikethrough */}
                                            <div className="mb-2">
                                                {(() => {
                                                    const priceInfo = getPriceDisplay(growthPlan)
                                                    return (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {priceInfo.hasDiscount && (
                                                                <span className="text-lg sm:text-xl text-gray-400 line-through">
                                                                    {priceInfo.originalPrice}
                                                                </span>
                                                            )}
                                                            <span className="text-2xl sm:text-3xl font-bold text-white">
                                                                {priceInfo.discountedPrice}
                                                            </span>
                                                        </div>
                                                    )
                                                })()}
                                                <div className="text-base sm:text-lg text-gray-300">
                                                    Validity: {growthPlan.valid_till} days
                                                </div>
                                            </div>

                                            <div className="text-green-600 text-lg py-1 font-medium rounded-full inline-block group-hover:bg-[#ffccaa] transition-colors duration-300 mb-6">
                                                {growthPlan.ads_limit} ad analyses included
                                            </div>
                                            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-white/80">
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
                                                onClick={() => initiatePayment(userCurrency, growthPlan)}
                                                disabled={processingPackageId === growthPlan.package_id || !razorpayLoaded || currencyDetecting}
                                            >
                                                {processingPackageId === growthPlan.package_id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : currencyDetecting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Pay {getPrimaryPrice(growthPlan)}
                                                    </>
                                                )}
                                            </Button>

                                            {!razorpayLoaded && (
                                                <p className="text-xs text-gray-500 text-center mt-2">
                                                    Loading payment gateway...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 lg:mt-20">
                        {/* Section Heading */}
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-2xl md:text-4xl font-semibold text-white/90 mb-3">
                                Features We Offer
                            </h2>
                        </div>

                        {/* Features Grid */}
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
                                {staticFeatures.map((feature) => {
                                    const Icon = feature.icon
                                    return (
                                        <div
                                            key={feature.title}
                                            className="bg-black rounded-lg p-4 sm:p-6 shadow-lg  hover:scale-[1.02] transition-all duration-300 flex flex-col h-full min-w-0"
                                        >
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-b from-[#db4900] via-[#db4900] to-[#a63a00] rounded-lg flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0">
                                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-2 sm:mb-3">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Testimonials - hidden on mobile (smaller than lg) */}
                    <div className="hidden lg:block">
                        <ProTestimonials testimonialData={testimonialData} />
                    </div>

                    {/* FAQ Grid */}
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl text-white/90 font-bold text-center mb-8 sm:mb-12">
                                Frequently Asked Questions
                            </h2>
                            <div className="w-full">
                                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 w-full">
                                    {faqData
                                        .filter((faq) => ["Pricing", "General", "Subscription"].includes(faq.category))
                                        .slice(0, 8)
                                        .map((faq) => (
                                            <div key={faq.faq_id} className="bg-black rounded-lg p-4 sm:p-6  transition-colors duration-300 min-w-0">
                                                <h3 className="font-semibold mb-3 text-gray-300 leading-relaxed text-sm sm:text-base">
                                                    {faq.question}
                                                </h3>
                                                <p className="text-white/50 leading-relaxed text-sm sm:text-base">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    )
}

export default ProPage
