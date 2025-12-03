"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, Calendar } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { generateAdToken } from "@/lib/tokenUtils"

interface SimilarAd {
  ad_upload_id: number
  media_url: string
  metrics: {
    score_out_of_100: number
    go_no_go: string
    confidence_score: number
    cta_visibility: string
    scroll_stoppower: string
    estimated_ctr: string
    ad_fatigue_score: string
    created_date: string
  }
}

interface SimilarAdsPopupProps {
  isOpen: boolean
  onClose: () => void
  similarAds: SimilarAd[]
  userDetails: any
}

export default function SimilarAdsPopup({
  isOpen,
  onClose,
  similarAds,
  userDetails,
}: SimilarAdsPopupProps) {

  const router = useRouter()

  // Prevent background scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow style
      const originalOverflow = document.body.style.overflow
      // Prevent scrolling
      document.body.style.overflow = 'hidden'

      // Cleanup: restore original overflow when popup closes
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen || !similarAds || similarAds.length === 0) return null

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-400"
    if (score >= 50) return "text-[#F99244]"
    return "text-red-400"
  }

  const getEstimatedCtrColor = (ctr: string) => {
    const value = parseFloat(ctr?.replace('%', '') || '0')
    if (value >= 5) return "text-green-400"
    if (value >= 2) return "text-[#F99244]"
    return "text-red-400"
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />

          {/* Right Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[90vw] md:w-[90vw] lg:w-[80vw] xl:w-[50vw] bg-[#171717] z-1000 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Similar Ads ({similarAds.length})
              </h2>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-[#3d3d3d] rounded-full p-2 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-3 space-y-10">

              {similarAds.slice().reverse().map((ad) => (
                <div
                  key={ad.ad_upload_id}
                  className="bg-black p-4 rounded-3xl shadow-xl flex flex-col gap-2"
                >
                  {/* ROW */}
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch">

                    {/* 🔳 LEFT — SQUARE IMAGE */}
                    <div className="w-full lg:w-[25%] flex">
                      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#111]">
                        <Image
                          src={ad.media_url}
                          alt=""
                          width={700}
                          height={700}
                          className="object-cover w-full h-full rounded-2xl"
                          unoptimized
                        />
                      </div>
                    </div>

                    {/* 📊 RIGHT — METRICS (same height as image) */}
                    <div className="w-full lg:w-[75%] flex flex-col h-full">
                      <div className="grid grid-rows-2 gap-5 h-full">

                        {/* ROW 1 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-full">

                          {/* Box 1 */}
                          <div className="bg-[#171717] rounded-2xl p-4 h-full flex flex-col justify-between text-center">
                            <h3 className="text-white/80 text-sm mb-1">Go / No Go</h3>
                            <div
                              className={cn(
                                "text-xl font-bold",
                                ad.metrics.go_no_go === "Go" ? "text-green-400" : "text-red-400"
                              )}
                            >
                              {ad.metrics.go_no_go}
                            </div>
                          </div>

                          {/* Box 2 */}
                          <div className="bg-[#171717] rounded-2xl p-4 h-full flex flex-col justify-between text-center">
                            <h3 className="text-white/80 text-sm mb-1">Performance Score</h3>
                            <div
                              className={cn(
                                "text-xl font-bold",
                                getScoreColor(ad.metrics.score_out_of_100)
                              )}
                            >
                              {ad.metrics.score_out_of_100}%
                            </div>
                          </div>

                          {/* Box 3 */}
                          <div className="bg-[#171717] rounded-2xl p-4 h-full flex flex-col justify-between text-center">
                            <h3 className="text-white/80 text-sm mb-1">Confidence Score</h3>
                            <div
                              className={cn(
                                "text-xl font-bold",
                                getScoreColor(ad.metrics.confidence_score)
                              )}
                            >
                              {ad.metrics.confidence_score}%
                            </div>
                          </div>

                        </div>

                        {/* ROW 2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-full">

                          {/* Box 4 */}
                          <div className="bg-[#171717] rounded-2xl p-4 h-full flex flex-col justify-between text-center">
                            <h3 className="text-white/80 text-sm mb-1">CTA Visibility</h3>
                            <div
                              className={cn(
                                "text-xl font-bold",
                                getScoreColor(Number(ad.metrics.cta_visibility) || 0)
                              )}
                            >
                              {ad.metrics.cta_visibility}
                            </div>
                          </div>

                          {/* Box 5 */}
                          <div className="bg-[#171717] rounded-2xl p-4 h-full flex flex-col justify-between text-center">
                            <h3 className="text-white/80 text-sm mb-1">Estimated CTR</h3>
                            <p className={cn("text-xl font-bold", getEstimatedCtrColor(ad.metrics.estimated_ctr))}>
                              {ad.metrics.estimated_ctr}
                            </p>
                          </div>

                          {/* Box 6 */}
                          <div className="bg-[#171717] rounded-2xl p-4 h-full flex flex-col justify-between text-center">
                            <h3 className="text-white/80 text-sm mb-1">Ad Fatigue Score</h3>
                            <p className="text-xl font-bold text-[#F99244]">
                              {ad.metrics.ad_fatigue_score}
                            </p>
                          </div>

                        </div>

                      </div>
                    </div>

                  </div>

                  {/* CTA BUTTON */}
                  <div className="flex justify-between">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      <p className="text-white text-sm">
                        {new Date(ad.metrics.created_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                    </div>
                    <Button
                      onClick={() => {
                        onClose()
                        const token = generateAdToken(ad.ad_upload_id.toString(), userDetails?.user_id)
                        router.push(`/results?ad-token=${token}`)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-white hover:bg-primary/90 inline-flex items-center"
                    >
                      View Details
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                </div>
              ))}

            </div>
          </motion.div>

        </>
      )}
    </AnimatePresence>
  )
}
