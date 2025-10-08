"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Trophy, ArrowLeft, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface AdData {
  ad_id: number
  ads_name: string
  ads_type: string
  image_path: string
  industry: string
  score: number
  confidence: number
  match_score: string
  uniqueness: string
  platforms: string
  uploaded_on: string
  weighted_rank: number
}

export default function Top10AdsWall() {
  const router = useRouter()
  const [adsData, setAdsData] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleBack = () => router.back()

  useEffect(() => {
    const fetchAdsData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          "https://adalyzeai.xyz/App/api.php?gofor=top10ads"
        )

        if (!response.ok) {
          throw new Error("Failed to fetch ads data")
        }

        const data: AdData[] = await response.json()
        setAdsData(data.slice(0, 10))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAdsData()
  }, [])

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      ; (e.target as HTMLImageElement).src = "/api/placeholder/300/200"
    },
    []
  )

  const getProgressColor = (score: number) => {
    if (score < 50) return "#ef4444"
    if (score < 75) return "#facc15"
    return "#22c55e"
  }

  const getTrailColor = (score: number) => {
    if (score < 50) return "#fca5a5"
    if (score < 75) return "#fef08a"
    return "#bbf7d0"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white py-10">
        <div className="w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center gap-8">
          <div className="w-full flex items-center gap-3 sm:gap-4 mb-8 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[#171717]" />
            <div className="flex flex-col gap-2">
              <div className="w-32 sm:w-40 h-5 bg-[#171717] rounded" />
              <div className="w-44 sm:w-60 h-4 bg-[#171717] rounded" />
            </div>
          </div>

          <div className="flex items-end justify-center gap-4 sm:gap-8 animate-pulse">
            {[2, 1, 3].map((pos) => (
              <div key={pos} className="flex flex-col items-center text-center">
                <div
                  className={`${pos === 1
                      ? "w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
                      : "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
                    } mb-4 rounded-xl bg-[#171717]`}
                />
                <div className="w-20 sm:w-24 h-4 bg-[#171717] rounded mb-2" />
                <div className="w-14 sm:w-16 h-3 bg-[#171717] rounded mb-2" />
                <div className="w-10 sm:w-12 h-3 bg-[#171717] rounded" />
              </div>
            ))}
          </div>

          <div className="w-full grid grid-cols-1 gap-3 sm:gap-4 animate-pulse px-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="bg-[#171717] rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
              >
                <div className="w-6 sm:w-8 h-6 bg-[#2a2a2a] rounded" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2a2a2a] rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="w-16 sm:w-20 h-4 bg-[#2a2a2a] rounded" />
                  <div className="w-28 sm:w-36 h-5 bg-[#2a2a2a] rounded" />
                  <div className="w-24 sm:w-28 h-4 bg-[#2a2a2a] rounded" />
                  <div className="w-20 sm:w-24 h-3 bg-[#2a2a2a] rounded" />
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2a2a2a] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    )
  }

  const topThree = adsData.slice(0, 3)
  const remainingAds = adsData.slice(3)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-black py-10">
      <div className="w-full max-w-5xl px-4 sm:px-6 flex flex-col items-center">
        {/* Header */}
        <header className="w-full flex items-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2.5 sm:p-3 rounded-full bg-[#171717] hover:bg-[#121212] transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
              Top 10 Ads Wall
            </h1>
            <p className="text-sm sm:text-base text-white/80">
              Discover the highest performing advertisements
            </p>
          </div>
        </header>

        {/* Podium (Top 3) */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 lg:gap-8">
          {[2, 1, 3].map((position) => {
            const adIndex = position - 1
            const ad = topThree[adIndex]
            const isFirst = position === 1

            // Responsive avatar sizing (no layout change, just scale)
            const avatarSize = isFirst
              ? "w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
              : "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"

            // Responsive podium height
            const podiumHeight = isFirst
              ? "h-20 sm:h-24 lg:h-28"
              : position === 2
                ? "h-16 sm:h-20 lg:h-24"
                : "h-12 sm:h-16 lg:h-20"

            // Responsive podium width
            const podiumWidth = isFirst
              ? "w-20 sm:w-24"
              : "w-16 sm:w-20"

            const podiumBg = isFirst
              ? "bg-[#db4900]"
              : position === 2
                ? "bg-[#e5621a]"
                : "bg-[#a83500]"

            if (!ad) return null

            return (
              <div
                key={position}
                onClick={() => router.push(`/results?ad_id=${ad.ad_id}`)}
                className="flex flex-col items-center text-center"
              >
                {isFirst && (
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#db4900] mb-2 sm:mb-3" />
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`${avatarSize} mb-3 sm:mb-4 rounded-xl overflow-hidden ${isFirst ? "ring-4 ring-[#db4900]" : "ring-2 ring-[#e5621a]"
                    } cursor-pointer shadow-xl`}
                >
                  <img
                    src={ad.image_path || "/api/placeholder/300/300"}
                    alt={ad.ads_name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    loading="lazy"
                  />
                </motion.div>

                <p className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 truncate max-w-28 sm:max-w-32">
                  {ad.ads_name.length > 15
                    ? ad.ads_name.slice(0, 15) + "..."
                    : ad.ads_name}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-300 mb-0.5">
                  Score: {ad.score}
                </p>
                <p className="text-[11px] sm:text-xs text-[#db4900] mb-2 sm:mb-3">
                  {ad.ads_type}
                </p>

                <div
                  className={`${podiumBg} rounded-t-xl ${podiumWidth} ${podiumHeight} flex items-center justify-center shadow-lg`}
                >
                  <span
                    className={`${isFirst ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                      } font-bold text-white`}
                  >
                    {position}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rankings 4–10 */}
        <div className="w-full grid grid-cols-1 gap-3 sm:gap-4 ">
          {remainingAds.map((ad, index) => {
            const rankNumber = index + 4
            const score = ad.score ?? 75

            return (
              <motion.div
                key={ad.ad_id}
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push(`/results?ad_id=${ad.ad_id}`)}
                className="bg-[#171717] rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#db4900]/10 group cursor-pointer"
              >
                {/* Rank Number */}
                <span className="text-base sm:text-xl lg:text-2xl font-bold text-[#db4900] w-6 sm:w-8 text-center flex-shrink-0">
                  {rankNumber}
                </span>

                {/* Left Image */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 aspect-square overflow-hidden flex-shrink-0">
                  <img
                    src={ad.image_path || "/api/placeholder/300/200"}
                    alt={ad.ads_name}
                    className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>

                {/* Middle Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
                  <p className="text-[11px] sm:text-sm lg:text-md text-[#db4900]">
                    {ad.ads_type || "Unknown Type"}
                  </p>
                  <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1">
                    {ad.ads_name.length > 15
                      ? ad.ads_name.slice(0, 15) + "..."
                      : ad.ads_name}
                  </h3>
                  <div className="flex gap-1 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                    {(ad.platforms ? JSON.parse(ad.platforms) : []).map(
                      (platform: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-[#3d3d3d] text-gray-300 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                        >
                          {platform}
                        </span>
                      )
                    )}
                  </div>
                  {ad.industry && (
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Industry: {ad.industry}
                    </p>
                  )}
                </div>

                {/* Right Score Section */}
                <div className="flex flex-col items-center justify-center w-18 sm:w-24 lg:w-28 py-2 sm:py-4 flex-shrink-0">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                    <CircularProgressbar
                      value={score}
                      text={`${score}%`}
                      strokeWidth={6}
                      styles={buildStyles({
                        pathColor: getProgressColor(score),
                        textColor: getProgressColor(score),
                        trailColor: getTrailColor(score),
                        textSize: "24px",
                      })}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      <div className="w-full flex justify-center mt-6 pb-10">
      <Button
        onClick={() => router.push("/upload")}
        className="bg-[#db4900] hover:bg-[#ff5722] text-lg text-white px-4 sm:px-6 py-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#db4900]/30 hover:scale-105"
      >
        <Upload className="w-6 h-6 mr-2" />
        Upload Ad
      </Button>
      </div>
    </div>
  )
}
