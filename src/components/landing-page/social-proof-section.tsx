'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import pic from "@/assets/phone-mockup.png"
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function SocialProofSection() {
  const countRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const router = useRouter()
  const [movieCount, setMovieCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [countryCount, setCountryCount] = useState(0)

  const animateCount = useCallback(
    (setFn: (val: number) => void, end: number, duration: number) => {
      const start = performance.now()

      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - start) / duration, 1)
        setFn(Math.floor(progress * end))
        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }

      requestAnimationFrame(step)
    },
    []
  )

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
      { threshold: 0.5 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current)
      }
    }
  }, [hasAnimated, animateCount])

  return (
    <div className="relative overflow-hidden text-white py-20 px-6 lg:px-24">
      <div className="mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left - Image */}
        <div className="w-full lg:w-1/2 flex justify-center bounce-slow">
          <Image
            src={pic}
            alt="Adalyze App Preview"
            className="rounded-lg"
          />
        </div>

        {/* Right - Text Content */}
        <div className="w-full lg:w-1/2 space-y-8" ref={countRef}>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Adalyze: Optimize Your Ads Instantly
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Adalyze uses AI to analyze performance, audience fit, and creative impact so you can stop guessing and start scaling. Get actionable insights in seconds.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-2xl font-bold text-white">{movieCount.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Ads Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userCount.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Marketers Helped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{suggestionCount.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Recommendations Delivered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{countryCount}+</div>
              <div className="text-sm text-gray-400">Markets Covered</div>
            </div>
          </div>

          {/* CTA Button */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center mt-8 px-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 mt-4">
                  <Button
                    onClick={() => router.push("/login")}
                    className="flex items-center gap-2 px-8 py-6 text-white text-lg font-semibold rounded-lg transition-colors"
                  >
                    Analyze Your Ad
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
