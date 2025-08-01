"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  PenTool,
  GitCompareArrows,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import cokkies from "js-cookie"
import Spinner from "@/components/overlay"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import AbResultsLoadingSkeleton from "@/components/Skeleton-loading/ab-results-loading"
import ResultsPageLoadingSkeleton from "@/components/Skeleton-loading/results-loading"

// Interface for API response
interface AdCopy {
  platform: string
  tone: string
  copy_text: string
}

interface ApiResponse {
  ad_id: number
  title: string
  image: string
  uploaded_on: string
  industry: string
  score_out_of_100: number
  platform_suits: string[] | string
  platform_notsuits: string[] | string
  issues: string[]
  suggestions: string[]
  visual_clarity: string
  emotional_appeal: string
  text_visual_balance: string
  cta_visibility: string
  scroll_stoppower: string
  estimated_ctr: string
  conversion_probability: string
  match_score: string
  top_audience: string
  industry_audience: string
  mismatch_warnings: string[]
  ad_copies: AdCopy[]
}

export default function ResultsPage() {
  const { userDetails } = useFetchUserDetails()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTone, setSelectedTone] = useState("friendly")
  const [isProUser, setIsProUser] = useState(false)
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const paymentStatus = userDetails?.payment_status || ''
    setIsProUser(paymentStatus === 1)
  }, [])

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const adUploadId = searchParams.get('ad_id') || ''
        const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adUploadId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch ad details')
        }

        const data = await response.json()
        setApiData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAdDetails()
  }, [searchParams])

  // Helper function to parse platform suitability
  const getPlatformSuitability = () => {
    if (!apiData) return []

    const suitablePlatforms = Array.isArray(apiData.platform_suits)
      ? apiData.platform_suits.map(p => p.toLowerCase())
      : typeof apiData.platform_suits === 'string'
        ? apiData.platform_suits.split(',').map(p => p.trim().toLowerCase())
        : []

    const notSuitablePlatforms = Array.isArray(apiData.platform_notsuits)
      ? apiData.platform_notsuits.map(p => p.toLowerCase())
      : typeof apiData.platform_notsuits === 'string'
        ? apiData.platform_notsuits.split(',').map(p => p.trim().toLowerCase())
        : []

    const allPlatforms = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'Flyer']

    const suitabilityList = allPlatforms.flatMap(platform => {
      const platformLower = platform.toLowerCase()
      if (suitablePlatforms.includes(platformLower)) {
        return { platform, suitable: true, warning: false }
      } else if (notSuitablePlatforms.includes(platformLower)) {
        return { platform, suitable: false, warning: true }
      } else {
        return [] // exclude unknowns
      }
    })

    // Sort suitable platforms first
    return suitabilityList.sort((a, b) => {
      if (a.suitable && !b.suitable) return -1
      if (!a.suitable && b.suitable) return 1
      return 0
    })
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helper function to get filtered ad copies based on selected tone
  const getFilteredAdCopies = () => {
    if (!apiData?.ad_copies) return []

    if (!isProUser) {
      // Return only the first ad copy for free users
      return apiData.ad_copies.slice(0, 1)
    }

    // For pro users, filter by tone if a specific tone is selected
    if (selectedTone === "friendly") {
      return apiData.ad_copies
    }

    return apiData.ad_copies.filter(copy =>
      copy.tone.toLowerCase().includes(selectedTone.toLowerCase())
    )
  }

  const ProOverlay = ({ children, message }: { children: React.ReactNode; message: string }) => (
    <div className="relative">
      <div className={isProUser ? "" : "blur-sm pointer-events-none"}>{children}</div>
      {!isProUser && (
        <div className="absolute inset-0 bg-[#121212]/50 flex items-center justify-center rounded-2xl">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-white font-semibold">{message}</p>
          </div>
        </div>
      )}
    </div>
  )


  if (error || !apiData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-xl mb-4">Failed to load analysis results</p>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push('/upload')} className="bg-blue-600 hover:bg-blue-700">
            Go Back to Upload
          </Button>
        </div>
      </div>
    )
  }

  const platformSuitability = getPlatformSuitability()
  const filteredAdCopies = getFilteredAdCopies()

  return (
    <UserLayout userDetails={userDetails}>
       {loading ? <ResultsPageLoadingSkeleton /> : (
    <div className="min-h-screen text-white">
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Analysis Results</h1>
          <p className="text-gray-400">AI-powered insights for your ad creative</p>
        </div>

        <div className="w-full mx-auto space-y-8">
          {/* Ad Overview Card */}
          <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border-none">
            <div className="p-8">
              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Ad Preview Section */}
                <div className="lg:col-span-1">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#121212] border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                    <Image
                      src={apiData.image}
                      alt={apiData.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Basic Info and Score Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{apiData.title}</h2>
                    <p className="text-gray-400 mb-4">Uploaded on: {formatDate(apiData.uploaded_on)}</p>
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30">
                      Industry: {apiData.industry}
                    </Badge>
                  </div>

                  {/* Score Section */}
                  <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold">Performance Score</h3>
                      <div className="text-4xl font-bold text-green-400">{apiData.score_out_of_100}/100</div>
                    </div>

                    {/* Platform Suitability */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-300">Platform Suitability</h4>
                      <div className="flex flex-wrap gap-3">
                        {platformSuitability.map((platform) => (
                          <Badge
                            key={platform.platform}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ${platform.suitable
                              ? "bg-green-600/20 text-green-400 border-green-600/30"
                              : platform.warning
                                ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
                                : "bg-red-600/20 text-red-400 border-red-600/30"
                              }`}
                          >
                            {platform.suitable ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : platform.warning ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {platform.platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issues and Suggestions Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Issues Section */}
            <div className="bg-black border border-[#121212] rounded-2xl shadow-lg shadow-white/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="p-6">
                <h3 className="flex items-center text-xl font-semibold text-red-400 mb-4">
                  <Search className="mr-3 h-5 w-5" />
                  Issues Detected
                </h3>
                <ul className="space-y-3">
                  {apiData.issues.map((issue, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <span className="mr-3 text-red-400 text-lg">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="bg-black border border-[#121212] rounded-2xl shadow-lg shadow-white/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="p-6">
                <h3 className="flex items-center text-xl font-semibold text-blue-400 mb-4">
                  <Sparkles className="mr-3 h-5 w-5" />
                  Suggestions for Improvement
                </h3>
                <ol className="space-y-3">
                  {apiData.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <span className="mr-3 text-blue-400 font-semibold">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Combined Engagement + Audience Analysis Section */}
          <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#121212]">
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Sparkles className="mr-3 h-6 w-6 text-blue-400" />
                Ad Performance Insights
                {!isProUser && (
                  <Badge className="ml-3 bg-blue-600/20 text-blue-400 border-blue-600/30">Pro Feature</Badge>
                )}
              </h3>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Predictive Engagement Score */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Overall Score</span>
                    <span className="text-3xl font-bold text-blue-400">
                      {isProUser ? apiData.score_out_of_100 : 65}/100
                    </span>
                  </div>
                  <Progress value={isProUser ? apiData.score_out_of_100 : 65} className="h-3 mb-6 bg-gray-800" />

                  <ProOverlay message="🔐 Upgrade to Pro to see detailed engagement insights.">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300 mb-3">Key Drivers</h4>
                      <div className="space-y-3">
                        {[
                          { label: "Visual Clarity", value: parseInt(apiData.visual_clarity) },
                          { label: "Emotional Appeal", value: parseInt(apiData.emotional_appeal) },
                          { label: "Text-to-Visual Balance", value: parseInt(apiData.text_visual_balance) },
                          { label: "CTA Visibility", value: parseInt(apiData.cta_visibility) }
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">{item.label}</span>
                              <span className="font-semibold">{item.value}/100</span>
                            </div>
                            <Progress value={item.value} className="h-2 bg-gray-800" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300 mt-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">Traffic Prediction</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Scroll Stop Power</span>
                          <span className="font-bold text-green-400">{apiData.scroll_stoppower}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Estimated CTR</span>
                          <span className="font-bold text-green-400">{apiData.estimated_ctr}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Conversion Probability</span>
                          <span className="font-bold text-green-400">{apiData.conversion_probability}</span>
                        </div>
                      </div>
                    </div>
                  </ProOverlay>
                </div>

                {/* Target Audience Alignment */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Match Score</span>
                    <span className="text-3xl font-bold text-blue-400">
                      {isProUser ? apiData.match_score : 68}%
                    </span>
                  </div>
                  <Progress
                    value={isProUser ? parseInt(apiData.match_score) : 68}
                    className="h-3 mb-6 bg-gray-800"
                  />

                  <ProOverlay message="🔐 Unlock detailed audience analysis with Pro Plan">
                    <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">Target Audience</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Audience:</span>
                          <span className="text-white">{apiData.top_audience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Industry:</span>
                          <span className="text-white">{apiData.industry_audience}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">Mismatch Warnings</h4>
                      <div className="space-y-3">
                        {apiData.mismatch_warnings.map((warning, index) => (
                          <div
                            key={index}
                            className="flex items-start p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                          >
                            <AlertTriangle className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-amber-200 text-sm">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ProOverlay>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#121212]">
            <div className="p-8 space-y-8">
              {/* Top: Title and Tone Selector */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-2xl font-bold flex items-center">
                  <PenTool className="mr-3 h-6 w-6 text-primary" />
                  AI-Written Ad Copy Generator
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tone Selector {!isProUser && <span className="text-blue-400">(Pro Only)</span>}
                  </label>
                  <Select value={selectedTone} onValueChange={setSelectedTone} disabled={!isProUser}>
                    <SelectTrigger className="w-48 bg-[#121212] border-gray-700">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-gray-700">
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="excited">Excited</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bottom: Ad Copy Output (70%) & CTA Buttons (30%) */}
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Left: Ad Copy Output */}
                <div className="md:w-[70%] w-full space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-300">Generated Ad Copy</h4>

                    {/* Display filtered ad copies */}
                    <div className="space-y-4">
                      {filteredAdCopies.map((adCopy, index) => (
                        <div key={index} className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm text-gray-400">{adCopy.platform} | {adCopy.tone}</span>
                            <Sparkles className="w-4 h-4 text-green-400" />
                          </div>
                          <p className="text-white font-medium">{adCopy.copy_text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pro overlay for additional copies */}
                    {!isProUser && apiData.ad_copies.length > 1 && (
                      <ProOverlay message="🔐 Pro users see all ad copy variations.">
                        <div className="space-y-4">
                          {apiData.ad_copies.slice(1).map((adCopy, index) => (
                            <div key={index + 1} className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-sm text-gray-400">{adCopy.platform} | {adCopy.tone}</span>
                                <span className="text-orange-400">🔥</span>
                              </div>
                              <p className="text-white font-medium">{adCopy.copy_text}</p>
                            </div>
                          ))}
                        </div>
                      </ProOverlay>
                    )}

                    {/* Regenerate Button */}
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        className="bg-transparent border-green-600 text-green-400 hover:bg-green-600/20 w-full md:w-auto"
                        disabled={!isProUser}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right: CTA Section */}
                <div className="md:w-[30%] mt-10 w-full bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#222] rounded-2xl p-6 shadow-md flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center text-white mb-1">
                      <GitCompareArrows className="w-5 h-5 mr-2 text-primary" />
                      <h4 className="text-lg font-semibold">Ad Comparison</h4>
                    </div>
                    <p className="text-sm text-gray-400">
                      Want to compare ads side-by-side? Use our Ad Comparison tool to test different versions of your ad copy, evaluate tone and platform variations, and discover what resonates most with your audience — all in one place.
                    </p>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full text-white font-semibold rounded-xl py-2 transition duration-200"
                      disabled={!isProUser}
                      onClick={() => router.push("/ab-test")}
                    >
                      <GitCompareArrows className="w-4 h-4 mr-2" />
                      Compare Now
                    </Button>
                    {!isProUser && (
                      <p className="mt-2 text-xs text-gray-400 text-center">
                        Unlock with Pro to access ad comparison.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/pro")}
              className="rounded-3xl px-8 py-3 text-lg font-semibold transition-all duration-200"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF Report
            </Button>
            <Button
              onClick={() => router.push("/upload")}
              variant="outline"
              className="rounded-3xl px-8 py-3 text-lg font-semibold transition-all duration-200 bg-transparent"
            >
              Re-analyze
            </Button>
          </div>
        </div>
      </main>
    </div>
        )}
    </UserLayout>
  )
}