"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, TrendingUp, Clock, Target, DollarSign } from "lucide-react"
import { trackEvent } from "@/lib/eventTracker"
import { axiosInstance1 } from "@/configs/axios"



interface CaseStudyApiResponse {
  case_id: number
  agency_name: string
  tagline: string
  key_point1: string
  key_point2: string
  key_point3: string
  overview: string
  challenges: string
  solutions: string
  results: string
  logo_url: string
  cover_image: string
  status: number
}

interface CaseStudy {
  id: number
  clientName: string
  industry: string
  imageUrl: string
  points: string[]
  highlight: string
  roi: string
  overview: string
  challenges: string[]
  solutions: string[]
  results: string[]
}

// Fetched dynamically from API

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 18, duration: 0.7 },
  },
  hover: { scale: 1.03 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 }
  }
}

const sliderVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export default function AgencySuccessStories() {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null)
  const [activeSlider, setActiveSlider] = useState<'challenges' | 'solutions' | 'results'>('challenges')
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const fetchCases = async () => {
      try {
        setIsLoading(true)
        setIsError(false)
        const response = await axiosInstance1.get("?gofor=agusecaselist")
        const data: CaseStudyApiResponse[] = response.data
        if (!Array.isArray(data)) throw new Error("Invalid response")

        const normalizeList = (text: string): string[] => {
          if (!text) return []
          return text
            .split(/\.|\n|\r|\u2022|\-|•/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        }

        const mapped: CaseStudy[] = data
          .filter((d) => d.status === 1)
          .map((d) => ({
            id: d.case_id,
            clientName: d.agency_name,
            industry: d.tagline || "",
            imageUrl: d.cover_image,
            points: [d.key_point1, d.key_point2, d.key_point3].filter(Boolean),
            highlight: d.key_point1 || "Results",
            roi: "",
            overview: d.overview,
            challenges: normalizeList(d.challenges),
            solutions: normalizeList(d.solutions),
            results: normalizeList(d.results),
          }))

        if (isMounted) setCaseStudies(mapped)
      } catch (e) {
        if (isMounted) setIsError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchCases()
    return () => {
      isMounted = false
    }
  }, [])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (selectedCase) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [selectedCase])

  const openModal = (caseStudy: CaseStudy) => {
    setSelectedCase(caseStudy)
    setActiveSlider('challenges')
    trackEvent("Agency_Success_Story_Modal_Opened", caseStudy.clientName)
  }

  const closeModal = () => {
    setSelectedCase(null)
    trackEvent("Agency_Success_Story_Modal_Closed", selectedCase?.clientName || "")
  }

  const getSliderContent = () => {
    if (!selectedCase) return []

    switch (activeSlider) {
      case 'challenges':
        return selectedCase.challenges
      case 'solutions':
        return selectedCase.solutions
      case 'results':
        return selectedCase.results
      default:
        return []
    }
  }

  const getSliderTitle = () => {
    switch (activeSlider) {
      case 'challenges':
        return 'Challenges'
      case 'solutions':
        return 'Solutions'
      case 'results':
        return 'Results'
      default:
        return ''
    }
  }

  return (
    <section className="py-14 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Section Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center py-4 sm:py-6 mb-8"
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2
            }}
            viewport={{ once: true }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="block"
            >
              Proven Results in Every Campaign
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-white font-semibold text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.8
            }}
            viewport={{ once: true }}
          >
            Real data. Real performance growth.
          </motion.p>
          <motion.p
            className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 1.0
            }}
            viewport={{ once: true }}
          >
            Agencies using Adalyze AI report higher CTRs, faster approvals, and up to 40% improvement in campaign efficiency — powered by smarter creative decisions.
          </motion.p>
        </motion.div>

        {/* Grid Section */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {isLoading && (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="relative overflow-hidden rounded-2xl bg-black shadow-md border border-zinc-800 animate-pulse"
              >
                <div className="w-full h-58 bg-zinc-800" />
                <div className="p-6">
                  <div className="h-6 w-2/3 bg-[#121212] rounded mb-4" />
                  <div className="h-4 w-full bg-[#121212] rounded mb-2" />
                  <div className="h-4 w-5/6 bg-[#121212] rounded mb-4" />
                  <div className="h-10 w-full bg-[#121212] rounded" />
                </div>
              </div>
            ))
          )}
          {!isLoading && caseStudies.map((caseStudy) => (
            <motion.div
              key={caseStudy.id}
              className="group relative overflow-hidden rounded-2xl bg-black shadow-md border border-zinc-800 hover:border-orange-500/40 transition-all duration-300 cursor-pointer"
              variants={cardVariants}
              whileHover="hover"
              onClick={() => openModal(caseStudy)}
            >
              {/* Image */}
              <div className="relative w-full h-58 overflow-hidden">
                <Image
                  src={caseStudy.imageUrl}
                  alt={caseStudy.clientName}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  unoptimized
                />
              </div>

              {/* Content */}
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold text-primary mb-3">
                  {caseStudy.clientName}
                </h3>

                {/* Description */}
                <p className="text-sm text-white/90 leading-snug mb-4">
                  {caseStudy.overview.length > 180
                    ? `${caseStudy.overview.slice(0, 180)}...`
                    : caseStudy.overview}
                </p>

                {/* Highlight */}
                <div className="bg-primary/20 rounded-lg px-4 py-3 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-bold text-primary text-lg">
                        {caseStudy.highlight}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Footer */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 14,
              delay: 0.3,
            }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.06, rotate: 1 }}
            whileTap={{ scale: 0.96 }}
            className="inline-block"
          >
            <Button
              onClick={() => {
                window.open("/register", "_blank", "noopener,noreferrer");
                trackEvent("Agency_Success_Stories_CTA_clicked", window.location.href);
              }}
              className="text-white cursor-pointer text-base sm:text-lg px-4 sm:px-6 py-5 sm:py-6"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative w-full max-w-4xl max-h-[85vh] top-8 overflow-y-auto bg-black rounded-2xl border border-zinc-800"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-[#171717] hover:bg-[#171717]/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Client Overview Banner */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={selectedCase.imageUrl}
                  alt={selectedCase.clientName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
                <div className="relative z-10 flex items-center gap-4 p-8 h-full">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Image
                      src={selectedCase.imageUrl}
                      alt={selectedCase.clientName}
                      fill
                      className="object-contain rounded-full"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedCase.clientName}
                    </h2>
                    <p className="text-white/80 text-lg">
                      {selectedCase.industry}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-primary font-bold text-xl">
                        {selectedCase.roi ? `ROI Increased by ${selectedCase.roi}` : selectedCase.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Overview */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Client Overview</h3>
                  <p className="text-white/80 leading-relaxed">
                    {selectedCase.overview}
                  </p>
                </div>

                {/* 3 Slider Sections */}
                <div className="mb-8">
                  {/* Slider Tabs */}
                  <div className="flex gap-2 mb-6">
                    {(['challenges', 'solutions', 'results'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveSlider(tab)}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeSlider === tab
                          ? 'bg-primary text-white'
                          : 'bg-zinc-800 text-white/80 hover:bg-zinc-700'
                          }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Slider Content */}
                  <motion.div
                    key={activeSlider}
                    variants={sliderVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="max-h-[200px]"
                  >
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      {activeSlider === 'challenges' && <Target className="w-5 h-5 text-red-400" />}
                      {activeSlider === 'solutions' && <Clock className="w-5 h-5 text-blue-400" />}
                      {activeSlider === 'results' && <DollarSign className="w-5 h-5 text-green-400" />}
                      {getSliderTitle()}
                    </h4>
                    <ul className="space-y-3">
                      {getSliderContent().map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-white/80">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activeSlider === 'challenges' ? 'bg-red-400' :
                            activeSlider === 'solutions' ? 'bg-blue-400' : 'bg-green-400'
                            }`} />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* CTA */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      window.open("/register", "_blank", "noopener,noreferrer");
                      trackEvent("Agency_Success_Story_Modal_CTA_clicked", selectedCase.clientName);
                    }}
                    className="px-8 py-3 text-white"
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
