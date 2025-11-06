"use client"
import Image from "next/image"
import BeforeAdalyze from "@/assets/Landing-page/old-way.webp"
import AfterAdalyze from "@/assets/Landing-page/New-way.webp"
import MobileBeforeAdalyze from "@/assets/Landing-page/old-way-mobile.webp"
import MobileAfterAdalyze from "@/assets/Landing-page/new-way-mobile.webp"
import { Button } from "../ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { trackEvent } from "@/lib/eventTracker"

const WorkflowSection = ({ ButtonText }: { ButtonText: string }) => {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const steps = [
    {
      stepNumber: "01",
      title: "Before Adalyze: Creative Guesswork",
      desktopImage: BeforeAdalyze,
      mobileImage: MobileBeforeAdalyze,
      alt: "Struggling with ad results",
      features: ["No clear feedback", "Budget wasted on poor ads", "Manual, slow analysis"],
    },
    {
      stepNumber: "02",
      title: "After Adalyze AI: Data-Driven Clarity",
      desktopImage: AfterAdalyze,
      mobileImage: MobileAfterAdalyze,
      alt: "AI-enhanced ad analysis and insights",
      features: ["Instant AI score", "Clear creative tips", "Smart optimization"],
    },
  ]

  return (
    <section id="why-us" className="relative py-4 sm:py-6 lg:py-8 mt-2 sm:mt-4 px-2 sm:px-4">
      <div className="container mx-auto px-1 sm:px-2 max-w-6xl">
        {/* Section Title - Optimized for small screens */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center py-2 sm:py-3 "
        >
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2 px-1">
            Guesswork to Growth
          </h2>
          <p className="text-white font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1">Data-driven clarity for better ads
          </p>
          <p className="text-sm sm:text-base text-white/80 max-w-xl sm:max-w-2xl mx-auto px-1">
            Stop wasting budget on ads that dont perform. With Adalyze AI, get instant AI scoring, clear creative suggestions, and smart optimization tips.
          </p>
        </motion.div>

        {/* Sticky Steps Container - Preserved animation with mobile optimization */}
        <div className="relative mt-4 sm:mt-6 lg:mt-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="sticky top-0"
              style={{
                zIndex: index + 1,
                // Reduce sticky container height on mobile for better fit
                height: isMobile ? "80vh" : "100vh",
                minHeight: isMobile ? "400px" : "500px",
                maxHeight: isMobile ? "600px" : "800px"
              }}
            >
              <div
                className="flex items-center justify-center h-full"
              >
                <div
                  className="relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden w-full max-w-4xl mx-auto flex flex-col justify-end"
                  style={{
                    // Optimize card height for mobile
                    height: isMobile ? "70vh" : "80vh",
                    minHeight: isMobile ? "350px" : "450px",
                    maxHeight: isMobile ? "500px" : "650px"
                  }}
                >
                  {/* Full Background Image Container */}
                  <div className="absolute inset-0 w-full h-full">
                    <Image
                      src={isMobile ? step.mobileImage : step.desktopImage}
                      alt={step.alt}
                      fill
                      className="object-contain rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden"
                      sizes="(max-width: 768px) 100vw, 1200px"
                      priority={index === 0}
                    />
                    {/* Enhanced gradient overlay for mobile readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  </div>

                  {/* Optimized Text Content Container */}
                  <div className="relative z-20 p-2 sm:p-3 lg:p-4 bg-[#171717]  rounded-lg sm:rounded-xl mx-2 sm:mx-4 mb-2 sm:mb-3 shadow-2xl">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-primary leading-tight">
                      {step.title}
                    </h3>

                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {step.features?.map((feature, i) => (
                        <div key={i} className="flex items-center gap-1 rounded-md px-2 py-0.5 sm:py-1">
                          <CheckCircle className="text-[#db4900] w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-gray-200 font-medium text-sm sm:text-base">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button - Positioned after sticky sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            type: "spring",
            stiffness: 100,
          }}
          viewport={{ once: true }}
          className="flex justify-center  mb-4 sm:mb-6 px-2"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Button
              onClick={() => {
                window.open("/register", "_blank", "noopener,noreferrer");
                trackEvent("LP_Old_Way_New_Way_RB", window.location.href);
              }}
              className="flex items-center cursor-pointer gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 lg:py-6 text-white text-sm sm:text-base md:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[180px] sm:min-w-[200px]"
            >
              {ButtonText}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom border */}
      <motion.div
        className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-6 sm:mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
    </section>
  )
}

export default WorkflowSection
