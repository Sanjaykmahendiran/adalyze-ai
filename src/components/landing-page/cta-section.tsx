"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import PromoImg from "@/assets/Landing-page/above-cta.webp"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { trackEvent } from "@/lib/eventTracker"

export default function CTASection({ ButtonText }: { ButtonText: string }) {
  const router = useRouter()

  return (
    <div className="relative w-full  overflow-hidden text-white" id="promo-section">
      {/* ✨ Background Glow */}
      <div className="absolute inset-0 z-0 bg-[#0f0a07]">
        <div className="absolute -top-20 sm:-top-40 -left-20 sm:-left-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#db4900] opacity-30 rounded-full blur-[90px] sm:blur-[180px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-[#ffad82] opacity-20 rounded-full blur-[80px] sm:blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-[#ff6b00] opacity-25 rounded-full blur-[75px] sm:blur-[150px] pointer-events-none" />
      </div>

      {/* 🌟 Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-14 flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-12">
        {/* Left Content */}
        <motion.div
          className="w-full md:w-1/2 space-y-4 sm:space-y-6 text-center md:text-left"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div
            className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-full bg-[#db4900]/80 text-white font-medium text-xs sm:text-sm"
            role="note"
            aria-label="Exclusive Features"
          >
            For Modern Businesses 🚀
          </div>

          <div className="flex flex-col text-center sm:items-center md:items-start md:text-left space-y-4 sm:space-y-6">
            {/* 🔥 Animated Heading */}
            <motion.h1
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: false }} // ✅ repeats animation every time in view
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-snug sm:leading-tight text-white px-2"
            >
              Empower your business <br />
              with <span className="text-[#db4900]">Adalyze AI</span>
            </motion.h1>

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
              className="space-y-2 w-full max-w-md"
            >
              <Button
                onClick={() => {window.open("/register", "_blank", "noopener,noreferrer");
                  trackEvent("LP_CTA_button_clicked", window.location.href);
                }}
                className="py-4 sm:py-6 cursor-pointer w-full sm:w-auto min-w-[200px] text-sm sm:text-base"
              >
                {ButtonText} <ArrowRight className="ml-2" />
              </Button>
            </motion.div>

          </div>
        </motion.div>

        {/* Right Content – Image */}
        <div className="w-full md:w-1/2 overflow-visible">
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative w-[90%] max-w-2xl sm:max-w-lg md:max-w-xl translate-x-2 sm:translate-x-4 md:translate-x-12 lg:translate-x-16">
              <Image
                src={PromoImg || "/placeholder.svg"}
                alt="Adalye AI Assistant"
                className="rounded-lg object-contain w-full h-auto"
                width={800}
                height={500}
                sizes="(max-width: 768px) 90vw, 45vw"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
