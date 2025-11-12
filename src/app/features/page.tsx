"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Features1 from "@/assets/landing-page/features/Features1.webp"
import Features2 from "@/assets/landing-page/features/Features2.webp"
import Features3 from "@/assets/landing-page/features/Features3.webp"
import Features4 from "@/assets/landing-page/features/Features4.webp"
import Features5 from "@/assets/landing-page/features/Features5.webp"
import Features1Mobile from "@/assets/landing-page/features/Features1-mobile.webp"
import Features2Mobile from "@/assets/landing-page/features/Features2-mobile.webp"
import Features3Mobile from "@/assets/landing-page/features/Features3-mobile.webp"
import Features4Mobile from "@/assets/landing-page/features/Features4-mobile.webp"
import Features5Mobile from "@/assets/landing-page/features/Features5-mobile.webp"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { trackEvent } from "@/lib/eventTracker"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import FeaturesBanner from "@/assets/Landing-page/features/features-banner.webp"

const features = [
  {
    title: "AI-Powered Ad Performance Prediction",
    description:
      "Predict the effectiveness of any ad — image, carousel, or video — before you launch. Adalyze AI uses advanced AI to estimate CTR, engagement, and ROI, helping marketers make data-driven decisions and avoid wasted spend.",
    buttonText: "Predict Now",
    desktopImage: Features1,
    mobileImage: Features1Mobile,
  },
  {
    title: "Multi-Channel Creative Insights",
    description:
      "Get platform-specific recommendations for Facebook, Instagram, LinkedIn, Google Ads, and more. Adalyze AI analyzes visual elements, copy, and layout to maximize engagement across channels.",
    buttonText: "Analyze Across Platforms",
    desktopImage: Features2,
    mobileImage: Features2Mobile,
  },
  {
    title: "Competitor & Market Benchmarking",
    description:
      "Compare your campaigns against top-performing ads in your industry. Identify trends, design patterns, and messaging strategies to stay ahead and outperform competitors.",
    buttonText: "Benchmark Your Ads",
    desktopImage: Features3,
    mobileImage: Features3Mobile,
  },
  {
    title: "Automated Creative Optimization",
    description:
      "Adalyze AI doesn't just identify problems — it provides actionable suggestions for improvement. From call-to-action tweaks to visual framing, instantly optimize creatives for maximum impact.",
    buttonText: "Optimize Creatives",
    desktopImage: Features4,
    mobileImage: Features4Mobile,
  },
  {
    title: "Performance & ROI Analytics Dashboard",
    description:
      "Track campaign performance with AI-driven analytics. Monitor CTR, conversions, audience engagement, and cost efficiency — all in one intuitive dashboard. Make informed decisions faster than ever.",
    buttonText: "Explore Dashboard",
    desktopImage: Features5,
    mobileImage: Features5Mobile,
  },
];

export default function FeaturesSection() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize() // initial value
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden w-full">

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="h-screen pt-32 sm:pt-32 md:pt-36 pb-10 sm:pb-12 md:pb-14 px-4 sm:px-6 w-full">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 w-full">
            <div className="order-2 md:order-1 md:max-w-2xl w-full">
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.2
                }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="block"
                >
                  Tools That Make
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="block text-primary"
                >
                  Your Ads More Effective
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.8
                }}
              >
                Adalyze AI delivers ad scoring, trend insights, and predictions to boost conversions and maximize ROI.

              </motion.p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 w-full">
                <Button size="lg"
                  onClick={() => {
                    window.open("/register", "_blank", "noopener,noreferrer");
                    trackEvent("Agencies_Start_Free_Trial_button_clicked", window.location.href);
                  }}
                  className="flex items-center cursor-pointer gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors w-full sm:w-auto"
                >
                  Start Your Free Trial
                </Button>
              </div>
            </div>
            <div className="order-1 md:order-2 flex items-center justify-center md:justify-end w-full h-auto md:h-full min-h-[300px] sm:min-h-[400px] md:min-h-[450px] overflow-hidden">
              <Image
                src={FeaturesBanner}
                alt="Agency Dashboard Preview"
                className="object-contain w-full h-auto max-w-full md:max-w-md lg:max-w-lg xl:max-w-xl bounce-slow"
                width={1000}
                height={750}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 pt-34 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">

          {/* Features */}
          <div className="space-y-20 sm:space-y-24 lg:space-y-32 w-full">
            {features.map((feature, index) => {
              const isEven = index % 2 === 0;

              return (
                <div key={index} className="relative w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center w-full">
                    {/* Image Side - Uses CSS order for desktop zigzag */}
                    <motion.div
                      initial={{
                        x: isEven ? -100 : 100,
                        opacity: 0,
                      }}
                      whileInView={{
                        x: 0,
                        opacity: 1,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      viewport={{ once: false, amount: 0.3 }}
                      className={`flex justify-center lg:flex-none w-full ${isEven ? "lg:order-1" : "lg:order-2"
                        }`}
                    >
                      <div className="w-full bounce-slow max-w-full lg:max-w-2xl h-60 sm:h-72 lg:h-80 flex items-center justify-center shadow-md mx-auto overflow-hidden">
                        <img
                          src={isMobile ? feature.mobileImage.src : feature.desktopImage.src}
                          alt={feature.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </motion.div>

                    {/* Text Side - Uses CSS order for desktop zigzag */}
                    <motion.div
                      initial={{
                        x: isEven ? 100 : -100,
                        opacity: 0,
                      }}
                      whileInView={{
                        x: 0,
                        opacity: 1,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      viewport={{ once: false, amount: 0.3 }}
                      className={`space-y-4 sm:space-y-6 px-0 sm:px-2 w-full ${isEven ? "lg:order-2" : "lg:order-1"
                        }`}
                    >
                      <h2 className="text-2xl sm:text-3xl font-bold text-primary break-words">{feature.title}</h2>
                      <p className="text-gray-300 text-base sm:text-lg leading-relaxed break-words">
                        {feature.description}
                      </p>

                      {/* Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2,
                          type: "spring",
                          stiffness: 80,
                        }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.08, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block"
                      >
                        <Button
                          onClick={() => {
                            window.open("/register", "_blank", "noopener,noreferrer");
                            trackEvent("LP_Features_button_clicked", window.location.href);
                          }}
                          variant="outline"
                          className="text-white cursor-pointer hover:bg-primary hover:text-white border-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                        >
                          {feature.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Mobile-only divider after each section */}
                  <div className="block lg:hidden mt-6 border-t border-[#db4900]/40 w-full mx-auto" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-18 w-full px-4">
          <Button
            onClick={() => {
              window.open("/register", "_blank", "noopener,noreferrer");
              trackEvent("Features_page_button_clicked", window.location.href);
            }}
            className="text-white cursor-pointer text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
          >
            Try Features Now
          </Button>
        </div>

      </div>
      <LandingPageFooter />
    </div>
  )
}
