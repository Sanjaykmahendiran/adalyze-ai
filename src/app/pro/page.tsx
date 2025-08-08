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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import logo from "@/assets/ad-logo.png"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import StaticProSkeleton from "@/components/Skeleton-loading/pro-skeleton"
import { useRouter } from "next/navigation"

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
    title: "25 Uploads",
    description:
      "Upload as many creatives up to 25 each month without any restrictions.",
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
  const [isYearly, setIsYearly] = useState<boolean>(false)
  const [pricingData, setPricingData] = useState<PricingPlan[]>([])
  const [faqData, setFaqData] = useState<FAQ[]>([])
  const [testimonialData, setTestimonialData] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollAmount = 300

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

        setPricingData(pricing)
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

  const freePlan = useMemo(
    () => pricingData.find((plan) => plan.plan_name === "Free"),
    [pricingData]
  )
  const proPlan = useMemo(
    () => pricingData.find((plan) => plan.plan_name === "Pro"),
    [pricingData]
  )

  const freeFeatures = useMemo(
    () => (freePlan ? parseFeatures(freePlan.features) : []),
    [freePlan]
  )
  const proFeatures = useMemo(
    () => (proPlan ? parseFeatures(proPlan.features) : []),
    [proPlan]
  )

  // Payment verification function
  const verifyPayment = async (paymentData: RazorpayResponse) => {
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
        toast.success("Payment Successful! Your Pro subscription has been activated.")
        router.refresh()
      } else {
        throw new Error(result.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error("Payment verification failed. Please contact support if amount was deducted.")
    }
  }

  // Initiate payment function
  const initiatePayment = async (currency: 'INR' | 'USD' = 'INR', selectedPlan: PricingPlan | undefined = proPlan) => {
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
        name: 'Adalyze Pro',
        description: `${selectedPlan.plan_name} Subscription`,
        order_id: orderData.order_id,
        handler: function (response: RazorpayResponse) {
          verifyPayment(response)
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
          <p className="text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
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
        <div className="min-h-screen text-white space-y-16">
          {/* Hero Section */}
          <div className="text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="font-bold mb-4 sm:mb-6 leading-tight px-2 sm:px-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              Unlock smarter ad insights with Adalyze Pro
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-3xl mx-auto px-4">
              Take your ad performance to the next level with advanced AI analysis,
              unlimited uploads, and premium features.
            </p>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
                Choose Your Plan
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 flex-wrap">
                <span
                  className={`text-sm ${!isYearly ? 'text-white font-medium' : 'text-gray-400'
                    }`}
                >
                  Monthly
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#2b2b2b]"
                  aria-label="Toggle billing period"
                />
                <span
                  className={`text-sm ${isYearly ? 'text-white font-medium' : 'text-gray-400'
                    }`}
                >
                  Yearly
                </span>
                <Badge className="bg-green-600 text-white">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              {freePlan && (
                <div className="bg-[#121212] rounded-lg p-6 sm:p-8 shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col w-full">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">
                      {freePlan.plan_name}
                    </h3>
                    <div className="text-2xl sm:text-3xl font-bold mb-2 flex flex-wrap items-baseline gap-1">
                      <span>${freePlan.price_usd}</span>
                      <span className="text-base sm:text-lg text-gray-400">/month</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-6">
                      ₹{freePlan.price_inr}/month
                    </div>
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      {freeFeatures.map((feature, index) => (
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

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full border-[#2b2b2b] bg-transparent hover:bg-[#2a2a2a] text-sm sm:text-base"
                      type="button"
                      onClick={() => initiatePayment('INR', freePlan)}
                      disabled={paymentLoading || !razorpayLoaded}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ₹{freePlan.price_inr}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-gray-500 text-gray-400 hover:bg-gray-800 text-sm sm:text-base"
                      type="button"
                      onClick={() => initiatePayment('USD', freePlan)}
                      disabled={paymentLoading || !razorpayLoaded}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ${freePlan.price_usd}
                        </>
                      )}
                    </Button>
                  </div>

                  {!razorpayLoaded && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Loading payment gateway...
                    </p>
                  )}
                </div>
              )}

              {/* Pro Plan */}
              {proPlan && (
                <div className="bg-[#121212] rounded-lg p-6 sm:p-8 relative shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col w-full">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                      Most Popular
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">
                      {proPlan.plan_name}
                    </h3>
                    <div className="text-2xl sm:text-3xl font-bold mb-2 flex flex-wrap items-baseline gap-1">
                      <span>${proPlan.price_usd}</span>
                      <span className="text-base sm:text-lg text-gray-400">/month</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-6">
                      ₹{proPlan.price_inr}/month
                    </div>
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      {proFeatures.map((feature, index) => (
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

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
                      type="button"
                      onClick={() => initiatePayment('INR', proPlan)}
                      disabled={paymentLoading || !razorpayLoaded}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ₹{proPlan.price_inr}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 text-sm sm:text-base"
                      type="button"
                      onClick={() => initiatePayment('USD', proPlan)}
                      disabled={paymentLoading || !razorpayLoaded}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ${proPlan.price_usd}
                        </>
                      )}
                    </Button>
                  </div>

                  {!razorpayLoaded && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Loading payment gateway...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Testimonials */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8 sm:mb-12">
              What Our Users Say
            </h2>

            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                  ref={scrollRef}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div
                    className="flex gap-3 sm:gap-4 lg:gap-6 pb-4 px-4 sm:px-6"
                    style={{ width: 'max-content' }}
                  >
                    {testimonialData.map((testimonial) => (
                      <div
                        key={testimonial.testi_id}
                        className="bg-[#121212] rounded-lg p-4 sm:p-6 w-[280px] sm:w-[320px] lg:w-[360px] flex-shrink-0 flex flex-col border border-[#2a2a2a] snap-center"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#a63a00] flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base truncate">
                              {testimonial.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-400 truncate">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex gap-1 mb-3 sm:mb-4"
                          aria-label={`Rating: 5 out of 5`}
                        >
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="text-gray-300 flex-1 leading-relaxed text-sm sm:text-base">
                          "{testimonial.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                type="button"
                className="hidden lg:block absolute top-1/2 -left-2 lg:left-0 bg-black/80 p-2 lg:p-3 rounded-full hover:bg-gray-800 z-10 border border-[#2a2a2a] transition-colors"
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                type="button"
                className="hidden lg:block absolute top-1/2 -right-2 lg:right-0 bg-black/80 p-2 lg:p-3 rounded-full hover:bg-gray-800 z-10 border border-[#2a2a2a] transition-colors"
              >
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>

              {/* Mobile scroll indicator */}
              <div className="md:hidden text-center mt-4">
                <p className="text-xs text-gray-500">
                  ← Swipe to see more testimonials →
                </p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  )
}

export default ProPage