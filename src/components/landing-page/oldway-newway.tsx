"use client"
import Image from "next/image"
import workflow1 from "@/assets/old-way.jpg"
import workflow2 from "@/assets/New-way.jpg"
import { Button } from "../ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

const WorkflowSection = () => {
  const router = useRouter()
  const steps = [
    {
      stepNumber: "01",
      title: "Before Adalyze: Creative Guesswork",
      image: workflow1,
      alt: "Struggling with ad results",
      features: ["No clear feedback", "Budget wasted on poor ads", "Manual, slow analysis"],
    },
    {
      stepNumber: "02",
      title: "After Adalyze AI: Data-Driven Clarity",
      image: workflow2,
      alt: "AI-enhanced ad analysis and insights",
      features: ["Instant AI score", "Clear creative tips", "Smart optimization"],
    },
  ]

  return (
    <section id="why-us" className="relative py-8 sm:py-10 mt-4 sm:mt-6 px-4 sm:px-6">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl" >
        {/* Section Title */}
        <motion.div
          initial={{ y: -100, opacity: 0 }} // start above
          whileInView={{ y: 0, opacity: 1 }} // slide down into place
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center py-4"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 px-2">
            From Guesswork to Growth <br />
            <span className="text-[#db4900]">AI-Powered Ad Clarity</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-xl sm:max-w-2xl mx-auto px-2">
            Stop wasting budget on ads that don’t perform. Get instant AI scoring, clear creative
            suggestions, and smart optimization tips — so every campaign delivers stronger results.
          </p>
        </motion.div>

        {/* Updated Steps Container */}
        <div className="relative mt-8 sm:mt-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="sticky top-0 gap-12 sm:gap-20 flex items-center justify-center"
              style={{ zIndex: index + 1 }}
            >
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mt-12 sm:mt-16 lg:mt-20 w-full max-w-5xl mx-auto h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col justify-end">
                {/* Full Background Image Container */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={step.image || "/placeholder.svg"}
                    alt={step.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </div>

                {/* Text Content Container - Positioned at bottom */}
                <div className="relative z-20 p-3 sm:p-4 lg:p-6 bg-[#121212] backdrop-blur-sm rounded-xl sm:rounded-2xl mx-3 sm:mx-6 mb-2 shadow-2xl border border-white/20">
                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text text-transparent leading-tight">
                    {step.title}
                  </h2>

                  {/* Feature highlights */}
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                    {step.features?.map((feature, i) => (
                      <div key={i} className="flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1">
                        <CheckCircle className="text-primary w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="text-gray-200 font-medium text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.4,
            type: "spring",
            stiffness: 80,
          }}
          viewport={{ once: true }}
          className="flex flex-col items-center mt-6 sm:mt-8 mb-8 sm:mb-10 px-4"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 mt-4">
              <Button
                onClick={() => router.push("/register")}
                className="flex items-center cursor-pointer gap-2 px-6 sm:px-8 py-4 sm:py-6 text-white text-base sm:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[160px]"
              >
                Analyze Now
              </Button>
            </div>
          </motion.div>
        </motion.div>

      </div>
      <motion.div
        className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-12 sm:mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
    </section>
  )
}

export default WorkflowSection
