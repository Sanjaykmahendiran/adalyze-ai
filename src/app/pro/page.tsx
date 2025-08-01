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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import avt1 from "@/assets/avt1.jpg"
import avt2 from "@/assets/avt2.jpg"
import logo from "@/assets/ad-logo.png"
import Spinner from "@/components/overlay"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import StaticProSkeleton from "@/components/Skeleton-loading/pro-skeleton"

interface PricingPlan {
  pricing_id: number
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
  const { userDetails } = useFetchUserDetails()
  const [isYearly, setIsYearly] = useState<boolean>(false)
  const [pricingData, setPricingData] = useState<PricingPlan[]>([])
  const [faqData, setFaqData] = useState<FAQ[]>([])
  const [testimonialData, setTestimonialData] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollAmount = 340

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
          fetch("https://adalyzeai.xyz/App/api.php?gofor=pricplanlist"),
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="bg-[#1f1f1f] rounded-lg p-10 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} type="button">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <UserLayout userDetails={userDetails}>
      {loading ? <StaticProSkeleton /> : (
        <div className="min-h-screen text-white ">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
            {/* Hero Section */}
            <div className="text-center">
              <div className="mb-8 flex justify-center">
                <Image
                  src={logo}
                  alt="Adalyze Pro"
                  width={160}
                  height={100}
                  className="object-contain"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
                Unlock smarter ad insights with Adalyze Pro
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
                Take your ad performance to the next level with advanced AI
                analysis, unlimited uploads, and premium features.
              </p>
            </div>

            {/* Features Grid */}
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {staticFeatures.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.title}
                      className="bg-[#121212] rounded-lg p-6 shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="w-12 h-12 bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00] rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">Choose Your Plan</h2>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <span
                    className={`text-sm ${!isYearly ? "text-white font-medium" : "text-gray-400"
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
                    className={`text-sm ${isYearly ? "text-white font-medium" : "text-gray-400"
                      }`}
                  >
                    Yearly
                  </span>
                  <Badge className="bg-green-600 text-white">
                    Coming Soon
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                {freePlan && (
                  <div className="bg-[#121212] rounded-lg p-8 shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3">
                        {freePlan.plan_name}
                      </h3>
                      <div className="text-3xl font-bold mb-6">
                        ${freePlan.price_usd}
                        <span className="text-lg text-gray-400 ml-1">/month</span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        {freeFeatures.map((feature, index) => (
                          <li
                            key={`${feature.text}-${index}`}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#2b2b2b] bg-transparent hover:bg-[#2a2a2a]"
                      type="button"
                      aria-label="Current plan"
                    >
                      Current Plan
                    </Button>
                  </div>
                )}

                {/* Pro Plan */}
                {proPlan && (
                  <div className="bg-[#121212] rounded-lg p-8 relative shadow-lg shadow-white/5 border border-[#2a2a2a] hover:scale-[1.02] transition-all duration-300 flex flex-col">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3">
                        {proPlan.plan_name}
                      </h3>
                      <div className="text-3xl font-bold mb-2">
                        ${proPlan.price_usd}
                        <span className="text-lg text-gray-400 ml-1">/month</span>
                      </div>
                      <div className="text-sm text-gray-400 mb-6">
                        ₹{proPlan.price_inr}/month
                      </div>
                      <ul className="space-y-4 mb-8">
                        {proFeatures.map((feature, index) => (
                          <li
                            key={`${feature.text}-${index}`}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90" type="button">
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Testimonials */}
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
                What Our Users Say
              </h2>

              <div className="relative max-w-full">
                <div
                  className="overflow-x-auto scrollbar-hide"
                  ref={scrollRef}
                  aria-label="User testimonials carousel"
                >
                  <div className="flex gap-6 pb-4 px-4" style={{ width: 'max-content' }}>
                    {testimonialData.map((testimonial) => (
                      <div
                        key={testimonial.testi_id}
                        className="bg-[#121212] rounded-lg p-6 w-[320px] flex-shrink-0 flex flex-col border border-[#2a2a2a]"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#a63a00] flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {testimonial.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold truncate">{testimonial.name}</h4>
                            <p className="text-sm text-gray-400 truncate">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                        <div
                          className="flex gap-1 mb-4"
                          aria-label={`Rating: 5 out of 5`}
                        >
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="text-gray-300 flex-1 leading-relaxed">
                          "{testimonial.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prev}
                  aria-label="Previous testimonial"
                  type="button"
                  className="absolute top-1/2 left-0 -translate-y-1/2 bg-black/80 p-3 rounded-full hover:bg-gray-800 z-10 border border-[#2a2a2a]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next testimonial"
                  type="button"
                  className="absolute top-1/2 right-0 -translate-y-1/2 bg-black/80 p-3 rounded-full hover:bg-gray-800 z-10 border border-[#2a2a2a]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* FAQs */}
            <div className="w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid gap-6">
                  {faqData
                    .filter((faq) =>
                      ["Pricing", "General", "Subscription"].includes(faq.category)
                    )
                    .slice(0, 8)
                    .map((faq) => (
                      <div
                        key={faq.faq_id}
                        className="bg-[#121212] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors duration-300"
                      >
                        <h3 className="font-semibold mb-3 text-white leading-relaxed">
                          {faq.question}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
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