"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Visual from "@/assets/visual-ad-analysis.png"
import Video from "@/assets/video-ad-insights.png"
import CreativeSuggestion from "@/assets/creative-suggestions.png"
import PerformanceOptimizer from "@/assets/performance-optimizer.png"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const features = [
  {
    title: "Visual Ad Analysis",
    description:
      "Upload your ad creatives and let Adalyze score them based on visual appeal, engagement potential, and platform suitability. Discover what elements work — from colors and layout to focal points and text placement.",
    buttonText: "Analyze Image",
    image: Visual,
  },
  {
    title: "Video Ad Insights",
    description:
      "Get instant feedback on your video ads. Adalyze breaks down key performance indicators like attention span, message clarity, and brand recall — helping you create high-impact video campaigns.",
    buttonText: "Analyze Video",
    image: Video,
  },
  {
    title: "Creative Suggestions",
    description:
      "Not sure why an ad isn't converting? Adalyze provides AI-powered improvement tips — from call-to-action wording to image framing — ensuring your creatives stay aligned with audience expectations and platform best practices.",
    buttonText: "Get Suggestions",
    image: CreativeSuggestion,
  },
  {
    title: "Performance Optimizer",
    description:
      "Improve ROAS with Adalyze's Performance Optimizer. Compare your ad metrics to industry benchmarks, identify weak spots, and apply recommended enhancements to maximize campaign efficiency.",
    buttonText: "Optimize Now",
    image: PerformanceOptimizer,
  },
]

export default function FeaturesSection() {
  const router = useRouter()
  return (
    <div id="features" className="min-h-screen text-white py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-16 sm:mb-20 space-y-4"
        >
          <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
            Our Features
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            AI Tools for Ad Performance Analysis & Optimization
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-3xl sm:max-w-4xl mx-auto leading-relaxed px-2">
            Adalyze empowers marketers with AI-driven insights to optimize ad creatives, improve performance, and
            outsmart the competition. From analyzing visuals to providing actionable suggestions — here's how Adalyze
            elevates your campaigns.
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-20 sm:space-y-24 lg:space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0

            return (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center"
              >
                {/* Text Side */}
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
                  className={`space-y-4 sm:space-y-6 ${!isEven ? "lg:order-2" : ""} px-2`}
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                    {feature.title}
                  </h2>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Button with Floating / Bounce Entry */}
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
                      onClick={() => router.push("/register")}
                      variant="outline"
                      className="text-white cursor-pointer hover:bg-primary hover:text-white border-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                      {feature.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Image Side */}
                <div className={`flex justify-center ${!isEven ? "lg:order-1" : ""}`}>
                  <div className="w-full bounce-slow max-w-2xl h-60 sm:h-72 lg:h-80 flex items-center justify-center shadow-md mx-auto">
                    <img
                      src={feature.image.src || "/placeholder.svg"}
                      alt={feature.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

            )
          })}
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
