"use client"

import { useState, useEffect } from "react"
import { Loader2, Brain } from "lucide-react"

// Fun facts and tips about advertising
const funFacts = [
  "The average person is exposed to between 6,000 to 10,000 ads every single day.",
  "Color increases brand recognition by up to 80%.",
  "Ads with emotional content perform twice as well as those with rational content.",
  "The first banner ad had a click-through rate of 44%. Today's average is around 0.05%.",
  "Video ads have an average click-through rate 1.84%, the highest of any digital format.",
  "The human brain processes images 60,000 times faster than text.",
  "Ads with prices ending in 9 tend to outperform those with rounded prices.",
  "The average attention span is now just 8 seconds, down from 12 seconds in 2000.",
  "Ads featuring animals typically have higher engagement rates.",
  "The most expensive Super Bowl ad cost $7 million for just 30 seconds in 2023.",
  "People are 85% more likely to buy a product after watching a video about it.",
  "Tuesday is generally considered the best day to send marketing emails.",
  "Personalized ads can increase engagement by up to 50%.",
  "Mobile ads get higher engagement when they appear in apps rather than browsers.",
  "The average ROI for email marketing is $42 for every $1 spent.",
]

export function AnalyzingOverlay() {
  const [factIndex, setFactIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prevIndex) => (prevIndex + 1) % funFacts.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-2xl mx-auto px-6">
        {/* Loading Animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#db4900]/20 animate-ping"></div>
          <div className="relative bg-[#000000] rounded-full p-6 border border-gray-800">
            <Brain className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Main Text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">Analyzing your creative...</h2>
          <p className="text-xl text-gray-300">
            Our AI is examining your ad for design elements, messaging, and performance factors.
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-gray-300">Processing...</span>
        </div>

        {/* Fun Fact Card */}
        <div className="bg-[#121212] rounded-2xl border border-gray-800 p-6 shadow-2xl max-w-lg">
          <h3 className="mb-3 text-sm font-semibold text-primary uppercase tracking-wide">Did you know?</h3>
          <p className="text-gray-300 leading-relaxed">{funFacts[factIndex]}</p>
        </div>
      </div>
    </div>
  )
}
