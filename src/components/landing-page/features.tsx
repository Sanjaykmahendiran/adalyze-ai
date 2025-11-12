"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
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
    <div id="features" className="min-h-screen text-white py-12 sm:py-16 px-4 sm:px-6 overflow-x-hidden lg:overflow-x-visible">
      <div className="max-w-6xl mx-auto">
        {/* Section Title - Optimized for small screens */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center py-2 sm:py-3 mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2 px-1">
            Our Features
          </h2>
          <p className="text-white font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1">Tools That Make Your Ads More Effective</p>
          <p className="text-sm sm:text-base text-white/80 max-w-xl sm:max-w-2xl mx-auto px-1">
            Adalyze AI offers powerful features like ad scoring, trend analysis, and performance predictions which give actionable insights to create ads that convert and maximize ROI. AI-powered insights and automated optimization to boost client ROI.
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-20 sm:space-y-24 lg:space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;

            return (
              <div key={index} className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
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
                    className={`flex justify-center lg:flex-none ${isEven ? "lg:order-1" : "lg:order-2"
                      }`}
                  >
                    <div className="w-full bounce-slow max-w-2xl h-60 sm:h-72 lg:h-80 flex items-center justify-center shadow-md mx-auto">
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
                    className={`space-y-4 sm:space-y-6 px-2 ${isEven ? "lg:order-2" : "lg:order-1"
                      }`}
                  >
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary">{feature.title}</h2>
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
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

        <div className="flex justify-center mt-18">
          <Button
            onClick={() => {
              router.push("/features");
              trackEvent("LP_Features_button_clicked", window.location.href);
            }}
            className="text-white cursor-pointer  text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
          >
            Explore Adalyze AI Features
          </Button>
        </div>
      </div>

      <motion.div
        className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-12 sm:mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
    </div>
  )
}
