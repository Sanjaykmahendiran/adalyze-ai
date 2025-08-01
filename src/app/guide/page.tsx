"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  Target,
  Palette,
  Type,
  Facebook,
  Instagram,
  MessageCircle,
  FileImage,
  Play,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import GuideLoadingSkeleton from "@/components/Skeleton-loading/guideloading"

// Type definitions
interface AnatomyData {
  anatomy_id: string
  title: string
  description: string
  tips: string
  icon?: string
  display_order: number
}

interface PlatformTip {
  tip_id: string
  platform: string
  headline: string
  content: string
  icon?: string
  display_order: number
}

interface Example {
  example_id: string
  image_url_good: string
  image_url_bad: string
  reason_good: string
  reason_bad: string
  display_order: number
}

const scoreBreakdown = [
  { category: "Visual Appeal", weight: 25, description: "Color harmony, composition, and overall aesthetics" },
  { category: "Text Readability", weight: 20, description: "Font choice, size, contrast, and hierarchy" },
  { category: "CTA Effectiveness", weight: 20, description: "Clarity, placement, and urgency of call-to-action" },
  { category: "Platform Fit", weight: 15, description: "Adherence to platform-specific best practices" },
  { category: "Emotional Impact", weight: 10, description: "Ability to evoke desired emotional response" },
  { category: "Brand Consistency", weight: 10, description: "Alignment with brand guidelines and identity" },
]

// Icon mapping for anatomy cards
const iconMap: Record<string, React.ComponentType<any>> = {
  Target,
  Palette,
  Eye,
  Type,
}

export default function GuidePage() {
      const { userDetails } = useFetchUserDetails()
  const [activeTab, setActiveTab] = useState("facebook")
  const [anatomyData, setAnatomyData] = useState<AnatomyData[]>([])
  const [platformTips, setPlatformTips] = useState<PlatformTip[]>([])
  const [examples, setExamples] = useState<Example[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [anatomyResponse, platformResponse, examplesResponse] = await Promise.all([
          fetch('https://adalyzeai.xyz/App/api.php?gofor=anatomylist'),
          fetch('https://adalyzeai.xyz/App/api.php?gofor=platformtipslist'),
          fetch('https://adalyzeai.xyz/App/api.php?gofor=exampleslist')
        ])

        const anatomyData = await anatomyResponse.json() as AnatomyData[]
        const platformData = await platformResponse.json() as PlatformTip[]
        const examplesData = await examplesResponse.json() as Example[]

        setAnatomyData(anatomyData.sort((a, b) => a.display_order - b.display_order))
        setPlatformTips(platformData.sort((a, b) => a.display_order - b.display_order))
        setExamples(examplesData.sort((a, b) => a.display_order - b.display_order))

      } catch (err) {
        setError('Failed to load data. Please try again later.')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const cleanedName = iconName.replace(/\s+/g, '')
    const IconComponent = iconMap[cleanedName] || Target
    return IconComponent
  }

  // Group platform tips by platform
  const groupedPlatformTips = platformTips.reduce((acc: Record<string, PlatformTip[]>, tip) => {
    const platform = tip.platform.toLowerCase()
    if (!acc[platform]) {
      acc[platform] = []
    }
    acc[platform].push(tip)
    return acc
  }, {})

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
            <p className="text-gray-400">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00] text-white rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserLayout userDetails={userDetails}>
       {loading ? <GuideLoadingSkeleton /> : (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ad Creation Guide</h1>
        <p className="text-gray-400">Learn best practices and understand how our AI scoring works</p>
      </div>

      {/* Ad Anatomy 101 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Ad Anatomy 101</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {anatomyData.map((card) => {
            const IconComponent = getIconComponent(card.title)
            return (
              <div key={card.anatomy_id} className="bg-black rounded-lg p-6 shadow-lg shadow-white/5 border border-[#121212] hover:scale-[1.01] transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00] rounded-lg flex items-center justify-center mb-4">
                  {card.icon ? (
                    <span className="text-xl">{card.icon}</span>
                  ) : (
                    <IconComponent className="w-6 h-6 text-white" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{card.description}</p>
                <ul className="space-y-1">
                  {card.tips.split('. ').filter(tip => tip.trim()).map((tip, tipIndex) => (
                    <li key={tipIndex} className="text-xs text-gray-400 flex items-start gap-2">
                      <div className="w-1 h-1 bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00] rounded-full mt-2 flex-shrink-0"></div>
                      {tip.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* Platform Tips */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Platform-Specific Tips</h2>
        <div className="bg-black rounded-lg p-6">
          <div className="grid w-full grid-cols-4 bg-[#121212] rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab("facebook")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "facebook" ? "bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00]" : ""
                }`}
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>

            <button
              onClick={() => setActiveTab("instagram")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "instagram" ? "bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00]" : ""
                }`}
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </button>

            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "whatsapp" ? "bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00]" : ""
                }`}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>

            <button
              onClick={() => setActiveTab("flyers")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${activeTab === "flyers" ? "bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00]" : ""
                }`}
            >
              <FileImage className="w-4 h-4" />
              Flyers
            </button>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedPlatformTips[activeTab]?.map((tip) => (
                <div key={tip.tip_id} className="flex items-start gap-3 p-4 bg-[#121212] rounded-lg shadow-lg shadow-white/5 border border-[#121212] hover:scale-[1.01] transition-all duration-300">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tip.icon && <span className="text-lg">{tip.icon}</span>}
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{tip.headline}</h4>
                    <span className="text-sm text-gray-300">{tip.content}</span>
                  </div>
                </div>
              )) || (
                  <div className="col-span-2 text-center text-gray-400 py-8">
                    No tips available for this platform yet.
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Scoring Explained */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">How Our AI Scoring Works</h2>
        <div className="bg-black rounded-lg p-6 mb-6">
          <p className="text-gray-400 mb-6">
            Our AI analyzes your ads across multiple dimensions to provide a comprehensive score out of 100. Here's how
            each category contributes to your final score:
          </p>
          <div className="space-y-4">
            {scoreBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#121212] rounded-lg shadow-lg shadow-white/5 border border-[#121212] hover:scale-[1.01] transition-all duration-300">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.category}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <span className="ml-4 px-3 py-1 border border-gray-600 rounded-full text-sm">
                  {item.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Ads Comparison */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Good vs Bad Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Good Example */}
          {examples.length > 0 && (
            <div className="bg-black rounded-lg p-6 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">High-Performing Ad</h3>
                <span className="bg-green-600 px-3 py-1 rounded-full text-sm">Score: 92</span>
              </div>

              <div className="w-40 mx-auto">
                <img
                  src={examples[0].image_url_good}
                  alt="High-Performing Ad"
                  className="aspect-square object-cover rounded-lg mb-4 transform group-hover:scale-105 transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/160x160/22c55e/ffffff?text=Good+Ad"
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{examples[0].reason_good}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">High contrast text</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Balanced composition</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Platform-appropriate sizing</span>
                </div>
              </div>
            </div>
          )}

          {/* Bad Example */}
          {examples.length > 0 && (
            <div className="bg-black rounded-lg p-6 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Low-Performing Ad</h3>
                <span className="bg-red-600 px-3 py-1 rounded-full text-sm">Score: 34</span>
              </div>

              <div className="w-40 mx-auto">
                <img
                  src={examples[0].image_url_bad}
                  alt="Low-Performing Ad"
                  className="aspect-square object-cover rounded-lg mb-4 transform group-hover:scale-105 transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/160x160/ef4444/ffffff?text=Bad+Ad"
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{examples[0].reason_bad}</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Poor text contrast</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Weak or missing CTA</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Inconsistent branding</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
      )}
    </UserLayout>
  )
}