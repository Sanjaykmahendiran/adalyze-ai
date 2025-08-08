"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Trophy, RefreshCw, Sparkles, Crown, Download, Search, AlertTriangle, PenTool, GitCompareArrows, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import cokkies from "js-cookie"
import { Progress } from "@/components/ui/progress"
import Spinner from "@/components/overlay"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import AbResultsLoadingSkeleton from "@/components/Skeleton-loading/ab-results-loading"

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

export default function ABTestResults() {
    const { userDetails } = useFetchUserDetails()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<"A" | "B">("A")
    const [selectedTone, setSelectedTone] = useState("friendly")
    const [adDataA, setAdDataA] = useState<ApiResponse | null>(null)
    const [adDataB, setAdDataB] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Check if user is pro
    const isProUser = userDetails?.payment_status === 1

    useEffect(() => {
        const fetchAdDetails = async () => {
            try {
                const adIdA = searchParams.get('ad_id_a') || ''
                const adIdB = searchParams.get('ad_id_b') || ''

                if (!adIdA || !adIdB) {
                    throw new Error('Missing ad IDs for comparison')
                }

                // Fetch both ads in parallel
                const [responseA, responseB] = await Promise.all([
                    fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adIdA}`),
                    fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adIdB}`)
                ])

                if (!responseA.ok || !responseB.ok) {
                    throw new Error('Failed to fetch ad details')
                }

                const [dataA, dataB] = await Promise.all([
                    responseA.json(),
                    responseB.json()
                ])

                setAdDataA(dataA)
                setAdDataB(dataB)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchAdDetails()
    }, [searchParams])

    // Helper function to parse platform suitability
    const getPlatformSuitability = (apiData: ApiResponse) => {
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

        return allPlatforms.map(platform => {
            const platformLower = platform.toLowerCase()
            if (suitablePlatforms.includes(platformLower)) {
                return { platform, suitable: true, warning: false }
            } else if (notSuitablePlatforms.includes(platformLower)) {
                return { platform, suitable: false, warning: true }
            } else {
                return { platform, suitable: false, warning: false }
            }
        }).filter(item => item.suitable || item.warning)
    }


    // Helper function to get filtered ad copies based on selected tone
    const getFilteredAdCopies = (apiData: ApiResponse) => {
        if (!apiData?.ad_copies) return []

        if (!isProUser) {
            return apiData.ad_copies.slice(0, 1)
        }

        if (selectedTone === "friendly") {
            return apiData.ad_copies
        }

        return apiData.ad_copies.filter(copy =>
            copy.tone.toLowerCase().includes(selectedTone.toLowerCase())
        )
    }

    // Determine winner based on scores
    const getWinner = () => {
        if (!adDataA || !adDataB) return null
        return adDataA.score_out_of_100 > adDataB.score_out_of_100 ? 'A' : 'B'
    }

    // Generate key differences
    const getKeyDifferences = () => {
        if (!adDataA || !adDataB) return []

        const differences = []
        const scoreDiff = Math.abs(adDataA.score_out_of_100 - adDataB.score_out_of_100)
        const winner = getWinner()

        differences.push(`Ad ${winner} has a ${scoreDiff} point advantage in overall performance score`)

        const ctaDiffA = parseInt(adDataA.cta_visibility)
        const ctaDiffB = parseInt(adDataB.cta_visibility)
        if (Math.abs(ctaDiffA - ctaDiffB) > 10) {
            const ctaWinner = ctaDiffA > ctaDiffB ? 'A' : 'B'
            differences.push(`Ad ${ctaWinner} has significantly better CTA visibility (${Math.max(ctaDiffA, ctaDiffB)} vs ${Math.min(ctaDiffA, ctaDiffB)})`)
        }

        const emotionalDiffA = parseInt(adDataA.emotional_appeal)
        const emotionalDiffB = parseInt(adDataB.emotional_appeal)
        if (Math.abs(emotionalDiffA - emotionalDiffB) > 10) {
            const emotionalWinner = emotionalDiffA > emotionalDiffB ? 'A' : 'B'
            differences.push(`Ad ${emotionalWinner} creates stronger emotional connection with the audience`)
        }

        return differences
    }

    // Generate AI commentary
    const getAICommentary = () => {
        if (!adDataA || !adDataB) return ""

        const winner = getWinner()
        const winnerData = winner === 'A' ? adDataA : adDataB
        const loserData = winner === 'A' ? adDataB : adDataA

        return `Ad ${winner} performs better with a score of ${winnerData.score_out_of_100}/100 compared to Ad ${winner === 'A' ? 'B' : 'A'}'s ${loserData.score_out_of_100}/100. Key success factors include better ${parseInt(winnerData.cta_visibility) > parseInt(loserData.cta_visibility) ? 'CTA visibility' : 'visual clarity'} and stronger audience alignment. Consider applying Ad ${winner}'s design principles to future campaigns for improved performance.`
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

    const handleReplace = (type: "A" | "B") => {
        router.push("/ad-test")
    }

    const handleReanalyze = () => {
        router.push("/ad-test")
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-xl mb-4">Failed to load comparison results</p>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button onClick={() => router.push('/ab-test')} className="bg-blue-600 hover:bg-blue-700">
                        Go Back to AB Test
                    </Button>
                </div>
            </div>
        )
    }

    const currentAd = activeTab === "A" ? adDataA : adDataB
    const winner = getWinner()
    const keyDifferences = getKeyDifferences()
    const aiCommentary = getAICommentary()
    const filteredAdCopies = getFilteredAdCopies(currentAd)

    return (
        <UserLayout userDetails={userDetails}>
            {loading ? <AbResultsLoadingSkeleton /> : !adDataA || !adDataB ? (
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-xl mb-4">No data available</p>
                        <p className="text-gray-400 mb-6">Unable to load analysis results</p>
                        <Button onClick={() => router.push('/upload')} className="bg-blue-600 hover:bg-blue-700">
                            Go Back to Upload
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Ad Comparison Results</h1>
                            <p className="text-gray-300">Detailed analysis and insights for your ad creatives</p>
                        </div>

                        {/* Comparison Results Header */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Ad A Results */}
                            <div className={`bg-black rounded-3xl shadow-lg shadow-white/5 border hover:scale-[1.01] transition-all duration-300 ${winner === 'A' ? 'border-2 border-yellow-400 shadow-[0_0_15px_#facc15]' : 'border-[#121212]'}`}>
                                <div className="p-6 relative">
                                    {winner === 'A' && (
                                        <Badge className="absolute -top-3 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Trophy className="w-4 h-4" />
                                            Winner
                                        </Badge>
                                    )}

                                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                                        <Image
                                            src={adDataA.image}
                                            alt="Ad A"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Score Section */}
                                    <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-white">Ad A - {adDataA.title}</h3>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-2xl font-semibold">Performance Score</h3>
                                            <div className={`text-4xl font-bold ${winner === 'A' ? 'text-green-400' : 'text-orange-400'}`}>
                                                {adDataA.score_out_of_100}/100
                                            </div>
                                        </div>

                                        {/* Platform Suitability */}
                                        <div>
                                            <h4 className="text-lg font-semibold mb-3 text-gray-300">Platform Suitability</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {getPlatformSuitability(adDataA).map((platform) => (
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

                            {/* Ad B Results */}
                            <div className={`bg-black rounded-3xl shadow-lg shadow-white/5 border hover:scale-[1.01] transition-all duration-300 ${winner === 'B' ? 'border-2 border-yellow-400 shadow-[0_0_15px_#facc15]' : 'border-[#121212]'}`}>
                                <div className="p-6 relative">
                                    {winner === 'B' && (
                                        <Badge className="absolute -top-3 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Trophy className="w-4 h-4" />
                                            Winner
                                        </Badge>
                                    )}

                                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                                        <Image
                                            src={adDataB.image}
                                            alt="Ad B"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>


                                    {/* Score Section */}
                                    <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-semibold text-white">Ad B - {adDataB.title}</h3>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-2xl font-semibold">Performance Score</h3>
                                            <div className={`text-4xl font-bold ${winner === 'B' ? 'text-green-400' : 'text-orange-400'}`}>
                                                {adDataB.score_out_of_100}/100
                                            </div>
                                        </div>

                                        {/* Platform Suitability */}
                                        <div>
                                            <h4 className="text-lg font-semibold mb-3 text-gray-300">Platform Suitability</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {getPlatformSuitability(adDataB).map((platform) => (
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

                        {/* Tab Navigation */}
                        <div className="bg-black rounded-2xl p-2 mb-8 border border-[#121212] inline-flex">
                            <button
                                onClick={() => setActiveTab("A")}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "A"
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Ad A Details
                            </button>
                            <button
                                onClick={() => setActiveTab("B")}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "B"
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Ad B Details
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-6">
                            {/* Issues and Suggestions Grid */}
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Issues Section */}
                                <div className="bg-black border border-[#121212] rounded-2xl shadow-lg shadow-white/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                                    <div className="p-6">
                                        <h3 className="flex items-center text-xl font-semibold text-red-400 mb-4">
                                            <Search className="mr-3 h-5 w-5" />
                                            Issues Detected - Ad {activeTab}
                                        </h3>
                                        <ul className="space-y-3">
                                            {currentAd.issues.map((issue, index) => (
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
                                            Suggestions for Ad {activeTab}
                                        </h3>
                                        <ol className="space-y-3">
                                            {currentAd.suggestions.map((suggestion, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-3 text-blue-400 font-semibold">{index + 1}.</span>
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
                                        Ad {activeTab} Performance Insights
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
                                                    {isProUser ? currentAd.score_out_of_100 : 65}/100
                                                </span>
                                            </div>
                                            <Progress value={isProUser ? currentAd.score_out_of_100 : 65} className="h-3 mb-6 bg-gray-800" />

                                            <ProOverlay message="🔐 Upgrade to Pro to see detailed engagement insights.">
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold text-gray-300 mb-3">Key Drivers</h4>
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: "Visual Clarity", value: parseInt(currentAd.visual_clarity) },
                                                            { label: "Emotional Appeal", value: parseInt(currentAd.emotional_appeal) },
                                                            { label: "Text-to-Visual Balance", value: parseInt(currentAd.text_visual_balance) },
                                                            { label: "CTA Visibility", value: parseInt(currentAd.cta_visibility) }
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
                                                            <span className="font-bold text-green-400">{currentAd.scroll_stoppower}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Estimated CTR</span>
                                                            <span className="font-bold text-green-400">{currentAd.estimated_ctr}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Conversion Probability</span>
                                                            <span className="font-bold text-green-400">{currentAd.conversion_probability}</span>
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
                                                    {isProUser ? currentAd.match_score : 68}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={isProUser ? parseInt(currentAd.match_score) : 68}
                                                className="h-3 mb-6 bg-gray-800"
                                            />

                                            <ProOverlay message="🔐 Unlock detailed audience analysis with Pro Plan">
                                                <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                                                    <h4 className="text-lg font-semibold mb-4 text-gray-300">Target Audience</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">Audience:</span>
                                                            <span className="text-white">{currentAd.top_audience}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">Industry:</span>
                                                            <span className="text-white">{currentAd.industry_audience}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <h4 className="text-lg font-semibold mb-4 text-gray-300">Mismatch Warnings</h4>
                                                    <div className="space-y-3">
                                                        {currentAd.mismatch_warnings.map((warning, index) => (
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

                            {/* AI-Written Ad Copy Generator */}
                            <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#121212]">
                                <div className="p-8 space-y-8">
                                    {/* Top: Title and Tone Selector */}
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <h3 className="text-2xl font-bold flex items-center">
                                            <PenTool className="mr-3 h-6 w-6 text-primary" />
                                            AI-Written Ad Copy for Ad {activeTab}
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
                                                {!isProUser && currentAd.ad_copies.length > 1 && (
                                                    <ProOverlay message="🔐 Pro users see all ad copy variations.">
                                                        <div className="space-y-4">
                                                            {currentAd.ad_copies.slice(1).map((adCopy, index) => (
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
                                                    <h4 className="text-lg font-semibold">Platform Analysis</h4>
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    See which platforms work best for Ad {activeTab} and get platform-specific recommendations for optimal performance.
                                                </p>

                                                {/* Platform Suitability for Current Ad */}
                                                <div className="space-y-2">
                                                    {getPlatformSuitability(currentAd).slice(0, 3).map((platform) => (
                                                        <div key={platform.platform} className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-400">{platform.platform}</span>
                                                            {platform.suitable ? (
                                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <Button
                                                    className="w-full text-white font-semibold rounded-xl py-2 transition duration-200"
                                                    disabled={!isProUser}
                                                    onClick={() => router.push("/upload")}
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Test Another Ad
                                                </Button>
                                                {!isProUser && (
                                                    <p className="mt-2 text-xs text-gray-400 text-center">
                                                        Unlock with Pro for detailed platform insights.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Differences */}
                            <Card className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#121212] hover:scale-[1.01] transition-all duration-300">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2 text-primary" />
                                        Key Differences
                                    </h3>
                                    <ul className="space-y-3">
                                        {keyDifferences.map((difference, index) => (
                                            <li key={index} className="flex items-start text-gray-300">
                                                <span className="text-cyan-400 mr-3 mt-1">•</span>
                                                {difference}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* AI Commentary */}
                            <Card className="bg-gradient-to-r from-[#db4900]/20 to-[#db4900]/20 border border-[#db4900]/40 hover:scale-[1.01] transition-all duration-300">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2 text-primary" />
                                        AI Commentary
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">{aiCommentary}</p>
                                </CardContent>
                            </Card>

                            {/* Re-upload Options */}
                            <div className="flex justify-center gap-4 flex-wrap">
                                <Button
                                    variant="outline"
                                    onClick={() => handleReplace("A")}
                                    className="border-[#2b2b2b] text-gray-300 hover:bg-gray-800"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Replace Ad A
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleReplace("B")}
                                    className="border-[#2b2b2b] text-gray-300 hover:bg-gray-800"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Replace Ad B
                                </Button>
                                {/* <Button
                                    onClick={() => router.push("/pro")}
                                    className=" text-white font-semibold ">
                                    <Download className="h-5 w-5 mr-2" />
                                    Download PDF Report
                                </Button> */}
                                <Button
                                    onClick={handleReanalyze}
                                    className=" text-white font-semibold "
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reanalyze
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    )
}