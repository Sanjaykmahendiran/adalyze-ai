"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import pic from "@/assets/phone-mockup.webp"
import MobilePic from "@/assets/phone-mockup-mobile.webp"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function SocialProofSection() {
  const countRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const router = useRouter()

  const [movieCount, setMovieCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [countryCount, setCountryCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize() // initial value
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const animateCount = useCallback((setFn: (val: number) => void, end: number, duration: number) => {
    const start = performance.now()
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      setFn(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateCount(setMovieCount, 10000, 2000)
          animateCount(setUserCount, 5000, 2000)
          animateCount(setSuggestionCount, 4200, 2000)
          animateCount(setCountryCount, 12, 2000)
        }
      },
      { threshold: 0.5 },
    )

    if (countRef.current) observer.observe(countRef.current)
    return () => observer.disconnect()
  }, [hasAnimated, animateCount])

  return (
    <div className="relative overflow-hidden text-white px-4 sm:px-6 lg:px-24">
      <div className="mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12 max-w-7xl">
        {/* Left - Image */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.4 }} // 👈 triggers every time in view
          className="w-full lg:w-1/2 flex justify-center bounce-slow"
        >
          <Image
            src={isMobile ? MobilePic : pic}
            alt="Adalyze App Preview"
            className="rounded-lg max-w-full h-auto" />
        </motion.div>

        {/* Right - Text Content */}
        <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8" ref={countRef}>
          {/* Heading */}
          <motion.h1
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount: 0.4 }} // 👈 replays on re-enter
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 px-2 text-center lg:text-left"
          >
            Adalyze: <span className="text-[#db4900]"> Optimize Your Ads Instantly </span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false, amount: 0.4 }}
            className="text-base sm:text-lg text-gray-300 leading-relaxed px-2 text-center lg:text-left"
          >
            Adalyze uses AI to analyze performance, audience fit, and creative impact so you can stop guessing and start
            scaling. Get actionable insights in seconds.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false, amount: 0.4 }}
            className="grid grid-cols-2 gap-4 sm:gap-6 px-2"
          >
            <div className="text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-bold text-white">{movieCount.toLocaleString()}+</div>
              <div className="text-xs sm:text-sm text-gray-300">Ads Reviewed</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-bold text-white">{userCount.toLocaleString()}+</div>
              <div className="text-xs sm:text-sm text-gray-300">Marketers Helped</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-bold text-white">{suggestionCount.toLocaleString()}+</div>
              <div className="text-xs sm:text-sm text-gray-300">Recommendations Delivered</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-bold text-white">{countryCount}+</div>
              <div className="text-xs sm:text-sm text-gray-300">Markets Covered</div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              type: "spring",
              stiffness: 80,
            }}
            viewport={{ once: false, amount: 0.4 }}
            className="flex flex-col items-center lg:items-start mt-6 sm:mt-8 px-2 sm:px-4"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button
                onClick={() => window.open("/register", "_blank", "noopener,noreferrer")}
                className="flex items-center cursor-pointer gap-2 px-6 sm:px-8 py-4 sm:py-6 text-white text-base sm:text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto max-w-[200px]"
              >
                Start Free Trial
              </Button>
            </motion.div>
          </motion.div>

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
