"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Upload, Cpu, RefreshCcw } from "lucide-react"
import workflow1 from "@/assets/Landing-page/step1.png"
import workflow2 from "@/assets/Landing-page/step2.png"
import workflow3 from "@/assets/Landing-page/step3.png"

const WorkflowSection = () => {
  const steps = [
    {
      stepNumber: "01",
      title: "Upload Ad Creative Instantly",
      description:
        "Easily submit your ad creative - whether it's an image, video, or copy—from any platform and get instant AI-powered evaluation.",
      image: workflow1,
      icon: Upload,
      alt: "Upload ad creative",
    },
    {
      stepNumber: "02",
      title: "AI Performance Analysis",
      description:
        "Adalyze assesses your ad against benchmarks, generates a performance score, and surfaces key weaknesses.",
      image: workflow2,
      icon: Cpu,
      alt: "AI analyzing ad performance",
    },
    {
      stepNumber: "03",
      title: "Optimize & Iterate Smarter",
      description:
        "Receive tailored recommendations, apply improvements, and re-run analysis to continuously boost effectiveness.",
      image: workflow3,
      icon: RefreshCcw,
      alt: "Ad optimization loop",
    },
  ]

  return (
    <section id="workflow" className="relative py-8 sm:py-10 mt-4 sm:mt-6 mb-8 sm:mb-10 ">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* Section Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center py-2 sm:py-3 "
        >
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2 px-1">
            How Adalyze Works
          </h2>
          <p className="text-white font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1">3 Simple Steps to Smarter Ads</p>
          <p className="text-sm sm:text-base text-white/80 max-w-xl sm:max-w-2xl mx-auto px-1">
            Adalyze AI guides you through a seamless process: upload ad, get instant AI-based analysis, receive actionable suggestions. Transform guesswork into measurable results.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative mt-8 sm:mt-10 ">
          {steps.map((step, index) => (
            <div
              key={index}
              className="sticky top-24 gap-6 sm:gap-10 flex items-center justify-center"
              style={{ zIndex: index + 1 }}
            >
              <div
                className={`relative rounded-xl sm:rounded-2xl overflow-visible  mt-8 sm:mt-10 bg-[#121212] border border-[#db4900]/50 p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-5xl mx-auto ${index === 1 ? "md:flex-row-reverse" : ""
                  }`}
              >
                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                  {/* Text Content */}
                  <motion.div
                    className={`flex-1 text-white ${index === 1 ? "md:pl-6 lg:pl-8" : "md:pr-6 lg:pr-8"}`}
                    initial={{ x: -100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: false }}
                  >
                    {/* Mobile Icon and Step Layout */}
                    <div className="flex items-center gap-4 md:hidden mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#db4900] to-[#b71c1c] rounded-lg flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-medium opacity-80">Step: {step.stepNumber}</h3>
                    </div>

                    {/* Desktop Step Layout */}
                    <h3 className="hidden md:block text-lg sm:text-xl font-medium opacity-80 mb-6 sm:mb-8">
                      Step: {step.stepNumber}
                    </h3>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text text-transparent leading-tight">
                      {step.title}
                    </h2>
                    <p className="text-base sm:text-lg opacity-90 leading-relaxed">{step.description}</p>
                  </motion.div>

                  {/* Image */}
                  <motion.div
                    className="flex-shrink-0 relative z-50 hidden md:block"
                    initial={{ x: 100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    viewport={{ once: false }}
                  >
                    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 overflow-visible">
                      <Image
                        src={step.image || "/placeholder.svg"}
                        alt={step.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
