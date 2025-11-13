"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
    Check,
    Upload,
    Brain,
    Download,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import StaticProSkeleton from "@/components/Skeleton-loading/pro-skeleton"
import { useRouter } from "next/navigation"
import ProTestimonials from "./_components/protestimonials"
import confetti from "canvas-confetti"
import { trackEvent } from "@/lib/eventTracker"
import { trackPurchase } from "@/lib/gtm"
import { trackPaymentSuccess, trackConversion } from "@/lib/ga4"
import Cookies from "js-cookie"

// Extend Window interface for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PricingPlan {
    package_id: number
    type: number  // Added type field - 1 = Single, 2 = Multi
    plan_name: string
    price_inr: number
    base_price: string  // Base price before tax
    tax: number  // Tax amount
    ori_price_inr: number  // Added original INR price
    ori_price_usd: number  // Added original USD price
    price_usd: string
    features: string
    brands_count: number  // Added brands_count field
    ads_limit: string  // Changed to string to handle "Unlimited"
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
type PackageType = 1 | 2  // 1 = Single, 2 = Multi
type BillingPeriod = "monthly" | "half-yearly" | "yearly"

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
    const isFreeTrailUser = userDetails?.fretra_status === 1
    const [pricingData, setPricingData] = useState<PricingPlan[]>([])
    const [faqData, setFaqData] = useState<FAQ[]>([])
    const [testimonialData, setTestimonialData] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [paymentLoading, setPaymentLoading] = useState<{ [key: number]: boolean }>({})
    const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(false)
    const [userCurrency, setUserCurrency] = useState<Currency>("INR")
    const [currencyLoading, setCurrencyLoading] = useState<boolean>(true)
    const [selectedPackageType, setSelectedPackageType] = useState<PackageType>(1)  // Default to Single (1)
    const [lastSelectedPackageId, setLastSelectedPackageId] = useState<number | null>(null);

    // Update selected package type based on user type
    useEffect(() => {
        if (userDetails?.type === "2") {
            setSelectedPackageType(2)  // Multi
        } else if (userDetails?.type === "1") {
            setSelectedPackageType(1)  // Single
        }
    }, [userDetails?.type])
    const [billingPeriods, setBillingPeriods] = useState<{ [key: number]: BillingPeriod }>({})
    const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false)
    const [countdown, setCountdown] = useState<number>(5)
    const [lastOrderType, setLastOrderType] = useState<string>("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const userId = Cookies.get("userId")

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


    // Countdown timer and redirect to dashboard
    useEffect(() => {
        if (!showSuccessPopup) return;
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Redirect logic: if package_id is 3 or 4 and lastOrderType is 'new' or 'agency'
                    if ((lastSelectedPackageId === 3 || lastSelectedPackageId === 4) && (lastOrderType === "new" || lastOrderType === "agency")) {
                        router.push("/myaccount?action=add-agency")
                    } else {
                        router.push("/dashboard")
                    }
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);
        return () => clearInterval(interval);
    }, [showSuccessPopup, router, lastSelectedPackageId, lastOrderType]);

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
                    fetch("https://adalyzeai.xyz/App/api.php?gofor=packages"),
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

    // Get filtered active plans by type
    const activePlans = useMemo(() => {
        // If user type is 2, only show Multi Brand plans
        if (userDetails?.type === "2") {
            return pricingData.filter((plan) => plan.status === 1 && plan.type === 2)
        }
        // If user type is 1 or no user details, use selected package type
        return pricingData.filter((plan) => plan.status === 1 && plan.type === selectedPackageType)
    }, [pricingData, selectedPackageType, userDetails?.type])

    // Helper function to get features for any plan
    const getPlanFeatures = (plan: PricingPlan) => parseFeatures(plan.features)

    // Check if a plan is the user's current plan
    const isCurrentPlan = (plan: PricingPlan) => {
        return userDetails?.package_id === plan.package_id && userDetails?.type === plan.type.toString()
    }

    // Helper function to get billing period for a specific plan
    const getBillingPeriod = (planId: number): BillingPeriod => {
        return billingPeriods[planId] || "monthly"
    }

    // Helper function to set billing period for a specific plan
    const setBillingPeriodForPlan = (planId: number, period: BillingPeriod) => {
        setBillingPeriods(prev => ({
            ...prev,
            [planId]: period
        }))
    }

    // Helper function to calculate price based on billing period
    const calculatePrice = (basePrice: number, period: BillingPeriod) => {
        switch (period) {
            case "monthly":
                return basePrice
            case "half-yearly":
                return basePrice * 5  // 5 months (1 month free)
            case "yearly":
                return basePrice * 10  // 10 months (2 months free)
            default:
                return basePrice
        }
    }

    // Helper function to calculate ads limit based on billing period
    const calculateAdsLimit = (baseAdsLimit: string, period: BillingPeriod) => {
        if (baseAdsLimit === "Unlimited") return "Unlimited"

        const numericLimit = parseInt(baseAdsLimit)
        switch (period) {
            case "monthly":
                return baseAdsLimit
            case "half-yearly":
                return (numericLimit * 6).toString()  // 6 months worth
            case "yearly":
                return (numericLimit * 12).toString()  // 12 months worth
            default:
                return baseAdsLimit
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

                // Trigger confetti animation
                confetti({
                    particleCount: 600,
                    spread: 90,
                    angle: 90,
                    origin: { x: 0.5, y: 0.5 },
                    colors: ["#db4900"],
                })

                // Show success popup
                setShowSuccessPopup(true)
                setCountdown(5)
                setLastSelectedPackageId(selectedPlan.package_id); // <- store the package_id
                const eventName = isFreeTrailUser ? `free_trail_user_upgrade_Payment_Successful_${selectedPlan.plan_name}` : `upgrade_Payment_Successful_${selectedPlan.plan_name}`
                trackEvent(eventName, window.location.href, userDetails?.email?.toString(), userCurrency, selectedPlan?.price_inr || 0)
                trackPaymentSuccess(
                    userCurrency === "INR" ? selectedPlan?.price_inr || 0 : parseFloat(selectedPlan?.price_usd || "0"),
                    userCurrency,
                    paymentData.razorpay_order_id,
                    selectedPlan.plan_name,
                    userDetails?.user_id?.toString()
                );
                trackConversion.subscriptionStart(
                    selectedPlan.plan_name,
                    userCurrency === "INR" ? selectedPlan?.price_inr || 0 : parseFloat(selectedPlan?.price_usd || "0"),
                    userCurrency,
                    userDetails?.user_id?.toString()
                );
            } else {
                throw new Error(result.message || 'Payment verification failed')
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            toast.error("Payment verification failed. Please contact support if amount was deducted.")
            const eventName = isFreeTrailUser ? `free_trail_user_upgrade_Payment_Failed_${selectedPlan.plan_name}` : `upgrade_Payment_Failed_${selectedPlan.plan_name}`
            trackEvent(eventName, window.location.href, userDetails?.email?.toString(), userCurrency, selectedPlan?.price_inr || 0)
        } finally {
            // Payment verification completed
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

            // Determine order type based on user's current package and selected package
            let orderType = "new";
            const userType = parseInt(userDetails.type);
            const currentPackageId = userDetails.package_id || 0;
            const selectedPackageId = selectedPlan.package_id;
            const selectedType = selectedPlan.type;

            // If user type is 1 and package_id is 1, and they choose package_id 2 → upgrade
            if (userType === 1 && currentPackageId === 1 && selectedPackageId === 2 && selectedType === 1) {
                orderType = "upgrade";
            }
            // If user type is 2 and package_id is 3, and they choose package_id 4 → upgrade
            else if (userType === 2 && currentPackageId === 3 && selectedPackageId === 4 && selectedType === 2) {
                orderType = "upgrade";
            }
            // If user type is 1 and package_id is 1 or 2, and they choose package_id 3 or 4 from type 2 → agency
            else if (userType === 1 && (currentPackageId === 1 || currentPackageId === 2) &&
                (selectedPackageId === 3 || selectedPackageId === 4) && selectedType === 2) {
                orderType = "agency";
            }
            // If user type is 1 and package_id is 2, and they choose package_id 1 → downgrade
            else if (userType === 1 && currentPackageId === 2 && selectedPackageId === 1 && selectedType === 1) {
                orderType = "downgrade";
            }
            // If user type is 2 and package_id is 4, and they choose package_id 3 → downgrade
            else if (userType === 2 && currentPackageId === 4 && selectedPackageId === 3 && selectedType === 2) {
                orderType = "downgrade";
            }

            // Store order type for routing logic
            setLastOrderType(orderType);

            // Create order
            const orderResponse = await fetch('https://adalyzeai.xyz/App/razorpay.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userDetails.user_id.toString(),
                    package_id: selectedPlan.package_id.toString(),
                    ctype: currency,
                    period: getBillingPeriod(selectedPlan.package_id), // Add billing period to the request
                    order_type: orderType
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok || !orderData.order_id) {
                throw new Error(orderData.message || 'Failed to create order');
            }

            // Calculate the final price based on billing period
            const finalPrice = currency === 'INR'
                ? (selectedPlan.package_id === 1 ? selectedPlan.price_inr : calculatePrice(selectedPlan.price_inr, getBillingPeriod(selectedPlan.package_id)))
                : (selectedPlan.package_id === 1 ? parseFloat(selectedPlan.price_usd) : calculatePrice(parseFloat(selectedPlan.price_usd), getBillingPeriod(selectedPlan.package_id)))

            const options = {
                key: rzpKey,
                amount: Math.round(finalPrice * 100),
                currency: currency,
                name: 'Adalyze AI',
                description: `${selectedPlan.plan_name} Plan Subscription (${getBillingPeriod(selectedPlan.package_id)})`,
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
            const eventName = isFreeTrailUser ? `free_trail_user_upgrade_Payment_Failed_${selectedPlan.plan_name}` : `upgrade_Payment_Failed_${selectedPlan.plan_name}`
            trackEvent(eventName, window.location.href, userDetails?.email?.toString(), userCurrency, selectedPlan?.price_inr || 0)
        }
    }

    // Updated helper function to get price display with discount logic and billing period
    const getPriceDisplay = (plan: PricingPlan) => {
        const basePriceInr = plan.price_inr
        const baseOriPriceInr = plan.ori_price_inr
        const basePriceUsd = typeof plan.price_usd === 'string' ? parseFloat(plan.price_usd) : plan.price_usd
        const baseOriPriceUsd = typeof plan.ori_price_usd === 'string' ? parseFloat(plan.ori_price_usd) : plan.ori_price_usd

        // Get billing period for this specific plan
        const planBillingPeriod = getBillingPeriod(plan.package_id)

        // Calculate prices based on billing period (skip for first package)
        const finalPriceInr = plan.package_id === 1 ? basePriceInr : calculatePrice(basePriceInr, planBillingPeriod)
        const finalOriPriceInr = plan.package_id === 1 ? baseOriPriceInr : calculatePrice(baseOriPriceInr, planBillingPeriod)
        const finalPriceUsd = plan.package_id === 1 ? basePriceUsd : calculatePrice(basePriceUsd, planBillingPeriod)
        const finalOriPriceUsd = plan.package_id === 1 ? baseOriPriceUsd : calculatePrice(baseOriPriceUsd, planBillingPeriod)

        if (userCurrency === "INR") {
            const hasDiscount = finalOriPriceInr > finalPriceInr
            return {
                discountedPrice: `₹${finalPriceInr}`,
                originalPrice: `₹${finalOriPriceInr}`,
                hasDiscount,
                primary: `₹${finalPriceInr}`,
                secondary: `$${finalPriceUsd}`,
                primaryCurrency: "INR" as Currency,
                secondaryCurrency: "USD" as Currency,
                discountPercentage: hasDiscount ? Math.round(((finalOriPriceInr - finalPriceInr) / finalOriPriceInr) * 100) : 0,
                billingPeriod: planBillingPeriod
            }
        } else {
            const hasDiscount = finalOriPriceUsd > finalPriceUsd

            return {
                discountedPrice: `$${finalPriceUsd}`,
                originalPrice: `$${finalOriPriceUsd}`,
                hasDiscount,
                primary: `$${finalPriceUsd}`,
                secondary: `₹${finalPriceInr}`,
                primaryCurrency: "USD" as Currency,
                secondaryCurrency: "INR" as Currency,
                discountPercentage: hasDiscount ? Math.round(((finalOriPriceUsd - finalPriceUsd) / finalOriPriceUsd) * 100) : 0,
                billingPeriod: planBillingPeriod
            }
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
                <div className="min-h-screen text-white space-y-16 pb-26 overflow-x-hidden">
                    <StaticProSkeleton />
                </div>
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


                            {/* Package Type Tabs - Only show if user type is 1 */}
                            {userDetails?.type === "1" && (
                                <div className="max-w-5xl mx-auto  mb-14">
                                    <div className="flex justify-center">
                                        <div className="bg-black rounded-lg p-1 ">
                                            <button
                                                onClick={() => setSelectedPackageType(1)}
                                                className={`px-6 py-3 rounded-md text-base font-medium transition-all duration-200 ${selectedPackageType === 1
                                                    ? "bg-primary text-white shadow-lg"
                                                    : "text-white hover:text-white hover:bg-[#171717]"
                                                    }`}
                                            >
                                                Single Brand
                                            </button>
                                            <button
                                                onClick={() => setSelectedPackageType(2)}
                                                className={`px-6 py-3 rounded-md text-base font-medium transition-all duration-200 ${selectedPackageType === 2
                                                    ? "bg-primary text-white shadow-lg"
                                                    : "text-white hover:text-white hover:bg-[#171717]"
                                                    }`}
                                            >
                                                Multi Brand
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`grid gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch ${activePlans.length === 1 ? 'grid-cols-1 max-w-md' :
                                activePlans.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                                    activePlans.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
                                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                }`}>
                                {activePlans.map((plan, index) => {
                                    const planFeatures = getPlanFeatures(plan)
                                    const isPopular = index === 1 && activePlans.length >= 2 // Mark second plan as popular if we have 2+ plans

                                    return (
                                        <div key={plan.package_id} className="h-full flex">
                                            <div
                                                className={`bg-black rounded-3xl py-6 sm:py-8 px-3 sm:px-5 relative shadow-lg shadow-white/5 border-3 hover:scale-[1.02] transition-all duration-300 flex flex-col w-full h-full ${isPopular ? 'border-primary' : 'border-[#3d3d3d]'
                                                    }`}
                                            >
                                                {/* Popular Badge */}
                                                {isPopular && (
                                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                                        <Badge className="bg-primary text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                                            Most Popular
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Current Plan Badge */}
                                                {isCurrentPlan(plan) && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                        <Badge className="bg-primary text-white shadow-md px-3 sm:px-4 py-1 text-xs sm:text-sm">
                                                            Current Plan
                                                        </Badge>
                                                    </div>
                                                )}

                                                <div className="bg-[#171717] rounded-3xl p-4">
                                                    {/* Plan name with One Time text or billing dropdown in justify-between */}
                                                    {selectedPackageType === 1 && plan.package_id === 1 ? (
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div className="flex flex-col">
                                                                <h3 className="text-lg sm:text-xl font-semibold">
                                                                    {plan.plan_name}
                                                                </h3>
                                                                {plan.type === 1 && (
                                                                    <p className="text-sm text-white/70">
                                                                        Best Pick for Single Brand
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-white/80">
                                                                One Time
                                                            </div>
                                                        </div>
                                                    ) : (selectedPackageType === 1 && (plan.package_id === 2 || plan.package_id === 3)) || (selectedPackageType === 2 && plan.package_id !== 1) ? (
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div className="flex flex-col">
                                                                <h3 className="text-lg sm:text-xl font-semibold">
                                                                    {plan.plan_name}
                                                                </h3>
                                                                {plan.type === 1 && (
                                                                    <p className="text-sm text-white/70">
                                                                        Best Pick for Single Brand
                                                                    </p>
                                                                )}
                                                                {plan.type === 2 && (
                                                                    <p className="text-sm text-white/70">
                                                                        Best Pick for Multi Brand
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Select
                                                                value={getBillingPeriod(plan.package_id)}
                                                                onValueChange={(value) => setBillingPeriodForPlan(plan.package_id, value as BillingPeriod)}
                                                            >
                                                                <SelectTrigger className="w-32 py-2 text-sm bg-[#3d3d3d] border-none text-white">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-[#3d3d3d] border-none">
                                                                    <SelectItem value="monthly" className="text-white hover:bg-[#171717] ">
                                                                        Monthly
                                                                    </SelectItem>
                                                                    <SelectItem value="half-yearly" className="text-white hover:bg-[#171717] border-none">
                                                                        Half-Yearly
                                                                    </SelectItem>
                                                                    <SelectItem value="yearly" className="text-white hover:bg-[#171717] border-none">
                                                                        Yearly
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    ) : (
                                                        <h3 className="text-lg sm:text-xl font-semibold mb-3">
                                                            {plan.plan_name}
                                                        </h3>
                                                    )}

                                                    {/* Price Display with Tax Details */}
                                                    {currencyLoading ? (
                                                        <div className="mb-4">
                                                            <div className="h-8 bg-[#171717] rounded animate-pulse mb-2"></div>
                                                            <div className="h-4 bg-[#171717] rounded w-24 animate-pulse"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-4">
                                                            {(() => {
                                                                const priceInfo = getPriceDisplay(plan)
                                                                return (
                                                                    <div>
                                                                        <div className="flex items-center gap-3 mb-6">
                                                                            {priceInfo.hasDiscount && (
                                                                                <span className="text-lg sm:text-xl text-white/60 line-through">
                                                                                    {priceInfo.originalPrice}
                                                                                </span>
                                                                            )}
                                                                            <span className="text-3xl sm:text-4xl font-bold text-white">
                                                                                {priceInfo.discountedPrice}
                                                                            </span>
                                                                            {/* Savings Badge */}
                                                                            {plan.package_id !== 1 && getBillingPeriod(plan.package_id) !== 'monthly' && (
                                                                                <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
                                                                                    {getBillingPeriod(plan.package_id) === 'half-yearly' ? 'Save 1 Month' : 'Save 2 Months'}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className=" flex items-center gap-2 mb-6">
                                                                            <span
                                                                                className="inline-block bg-primary/30 text-primary text-sm font-semibold px-3 py-1 rounded-full"
                                                                            >
                                                                                Ad Credits:{" "}
                                                                                {plan.package_id === 1
                                                                                    ? (plan.ads_limit === "Unlimited" ? "Unlimited" : plan.ads_limit)
                                                                                    : calculateAdsLimit(plan.ads_limit, getBillingPeriod(plan.package_id))
                                                                                }
                                                                            </span>

                                                                            <span className="inline-block bg-primary/30 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                                                                                Validity:{" "}
                                                                                {plan.package_id === 1
                                                                                    ? `${plan.valid_till} days`
                                                                                    : getBillingPeriod(plan.package_id) === 'monthly'
                                                                                        ? `${plan.valid_till} days`
                                                                                        : getBillingPeriod(plan.package_id) === 'half-yearly'
                                                                                            ? '6 months'
                                                                                            : '12 months'
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })()}
                                                        </div>
                                                    )}

                                                    <div className="mt-auto px-3 sm:px-5">
                                                        <Button
                                                            className={`w-full text-base sm:text-lg py-6 rounded-xl ${isPopular
                                                                ? 'bg-primary hover:bg-primary/90'
                                                                : 'bg-primary hover:bg-primary/90'
                                                                }`}
                                                            type="button"
                                                            onClick={() => {
                                                                if (!userId) {
                                                                    router.push("/register");
                                                                } else {
                                                                    initiatePayment(userCurrency, plan);
                                                                }
                                                            }}
                                                            disabled={(!razorpayLoaded || currencyLoading || paymentLoading[plan.package_id])}
                                                        >
                                                            {paymentLoading[plan.package_id] ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                                    {isCurrentPlan(plan) ? 'Renew Now' : 'Upgrade'}
                                                                </>
                                                            )}
                                                        </Button>
                                                        <p className="text-xs text-white/70 text-center mt-2">
                                                            No Credit Card Required
                                                        </p>
                                                    </div>

                                                    {!razorpayLoaded && !currencyLoading && (
                                                        <p className="text-xs text-gray-500 text-center mt-2">
                                                            Loading payment gateway...
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-6">
                                                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-3">What's Included ?</h3>
                                                    <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-8">
                                                        {planFeatures.map((feature, featureIndex) => (
                                                            <li
                                                                key={`${feature.text}-${featureIndex}`}
                                                                className="flex items-start gap-3 text-sm sm:text-base"
                                                            >
                                                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                                                                <span className="leading-relaxed">{feature.text}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                        </div>
                                    )
                                })}
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

            {/* Success Popup */}
            <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
                <DialogContent className="sm:max-w-md bg-black border-green-600" showCloseButton={false}>
                    <DialogHeader>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <Check className="w-12 h-12" />
                            </div>
                            <DialogTitle className="text-2xl font-bold text-white">
                                Payment Successful!
                            </DialogTitle>
                            <DialogDescription className="text-gray-300 text-base">
                                Thank you for your payment! Your renewel has been activated successfully.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <p className="text-gray-300 text-center">
                            {((Number(lastSelectedPackageId) === 3 || Number(lastSelectedPackageId) === 4) && (lastOrderType === "new" || lastOrderType === "agency"))
                                ? `Redirecting to my account to add your Agency details in ${countdown} seconds...`
                                : `Redirecting to dashboard in ${countdown} seconds...`
                            }
                        </p>
                        <Button
                            onClick={() => {
                                // Redirect (manual): if package_id is 3 or 4 and lastOrderType is 'new' or 'agency'
                                if (((Number(lastSelectedPackageId) === 3 || Number(lastSelectedPackageId) === 4) && (lastOrderType === "new" || lastOrderType === "agency"))) {
                                    router.push("/myaccount?action=add-agency")
                                } else {
                                    router.push("/dashboard")
                                }
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            {((Number(lastSelectedPackageId) === 3 || Number(lastSelectedPackageId) === 4) && (lastOrderType === "new" || lastOrderType === "agency"))
                                ? "Go to My Account Now"
                                : "Go to Dashboard Now"
                            }
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </UserLayout>
    )
}

export default ProPage
