"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Cookies from "js-cookie"

// Type definitions
interface DashboardData {
  AdAnalysed?: number
  AverageScore?: number
  TopPlatform?: string
  'A/BTested'?: number
  AccountType?: string
  TotalSuggestions?: number
  CommonIssue?: number | string
  LastAnalysedOn?: string
}

interface RecentAd {
  ad_id: string
  ads_name: string
  image_path?: string
  score: number
  platforms?: string
  uploaded_on: string
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  TrendingUp,
  Target,
  Upload,
  CreditCard,
  Eye,
  Lightbulb,
  ArrowRight,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Crown,
  Zap,
  Loader2,
  MessageCircle,
  FileImage,
  User,
  AlertTriangle,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import UserLayout from "@/components/layouts/user-layout"
import DashboardLoadingSkeleton from "@/components/Skeleton-loading/dashboard-loading"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"

// Constants
const API_BASE_URL = "https://adalyzeai.xyz/App/api.php"
const RECENT_ADS_LIMIT = 4

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  flyer: FileImage,
} as const

// Map platform names that might come from API
const platformMapping: Record<string, string> = {
  facebook: "facebook",
  instagram: "instagram",
  whatsapp: "whatsapp",
  flyer: "flyer",
  fb: "facebook",
  insta: "instagram",
  "whats app": "whatsapp",
  "what'sapp": "whatsapp",
}

const aiTips = [
  {
    icon: Eye,
    title: "Improve CTA visibility",
    description: "Your call-to-action button could be more prominent. Try using contrasting colors.",
  },
  {
    icon: Zap,
    title: "Use brighter colors",
    description: "Ads with vibrant colors perform 23% better in your target demographic.",
  },
  {
    icon: Target,
    title: "Shorten headline",
    description: "Headlines under 25 characters have 31% higher engagement rates.",
  },
  {
    icon: TrendingUp,
    title: "Optimize for mobile",
    description: "73% of your audience views ads on mobile. Consider mobile-first design.",
  },
]

// Utility functions
const parsePlatforms = (raw: string | undefined): string[] => {
  if (!raw) return []

  let list: string[] = []

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      list = parsed.map((p) => String(p).trim().toLowerCase())
    } else if (typeof parsed === "string") {
      list = parsed.split(",").map((p) => p.trim().toLowerCase())
    }
  } catch {
    // fallback if not valid JSON
    list = raw.split(",").map((p) => p.trim().toLowerCase())
  }

  // map aliases/canonicalize and dedupe
  return Array.from(
    new Set(
      list
        .map((p) => platformMapping[p] || p) // canonicalize if known
        .filter(Boolean)
    )
  )
}

const getTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Unknown'

    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  } catch {
    return 'Unknown'
  }
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// API functions
const fetchDashboardData = async (userId: string): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE_URL}?gofor=dashboard&user_id=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Dashboard API error: ${response.status}`)
  }

  return response.json()
}

const fetchRecentAds = async (userId: string): Promise<RecentAd[]> => {
  const response = await fetch(`${API_BASE_URL}?gofor=recentads&user_id=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Recent ads API error: ${response.status}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data.slice(0, RECENT_ADS_LIMIT) : []
}

// Component definitions
const StatCard = ({ title, value, subtitle, icon: Icon, iconColor }: {
  title: string
  value: string | number
  subtitle: string
  icon?: any
  iconColor?: string
}) => (
  <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
    <CardHeader className="pb-3">
      <CardDescription className="text-gray-300">{title}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-[#db4900] flex items-center">
        {Icon && <Icon className={`w-6 h-6 mr-2 ${iconColor}`} />}
        {value}
      </div>
      <div className="flex items-center text-sm text-green-400 mt-2">
        <TrendingUp className="w-4 h-4 mr-1" />
        {subtitle}
      </div>
    </CardContent>
  </Card>
)

const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconMap = {
    'Facebook': { Icon: Facebook, color: 'text-blue-400' },
    'Instagram': { Icon: Instagram, color: 'text-pink-400' },
    'YouTube': { Icon: Youtube, color: 'text-red-400' },
    'Twitter': { Icon: Twitter, color: 'text-sky-400' },
  }

  const config = iconMap[platform as keyof typeof iconMap]
  if (config) {
    const { Icon, color } = config
    return <Icon className={`w-6 h-6 mr-2 ${color}`} />
  }

  return <Target className="w-6 h-6 mr-2 text-purple-400" />
}

const AdCard = ({ ad, onViewReport }: { ad: RecentAd; onViewReport: (adId: string) => void }) => {
  const platformList = useMemo(() => parsePlatforms(ad.platforms), [ad.platforms])

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = ""
  }, [])

  return (
    <div
      onClick={() => onViewReport(ad.ad_id)}
      className="bg-[#1a1a1a] rounded-2xl space-y-3 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-square rounded-lg overflow-hidden">
        <img
          src={ad.image_path || ""}
          alt={ad.ads_name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-300"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[#db4900] font-bold text-lg">Score: {ad.score}</span>
          <div className="flex gap-1">
            {platformList.map((platform, idx) => {
              const Icon = platformIcons[platform as keyof typeof platformIcons] || FileImage
              return (
                <Icon
                  key={`${platform}-${idx}`}
                  className="w-4 h-4 text-primary"
                  aria-label={platform}
                />
              )
            })}
          </div>
        </div>
        <div className="text-sm text-gray-300 truncate">{ad.ads_name}</div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{getTimeAgo(ad.uploaded_on)}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-[#db4900] cursor-pointer border-[#db4900] hover:bg-[#db4900] hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            onViewReport(ad.ad_id)
          }}
        >
          View Report
        </Button>
      </div>
    </div>
  )
}



export default function Dashboard() {
  const { userDetails } = useFetchUserDetails()
  const userId = Cookies.get("userId")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recentAds, setRecentAds] = useState<RecentAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [showLimitPopup, setShowLimitPopup] = useState(false)

  // Memoized navigation handlers
  const handleUploadClick = useCallback(() => router.push('/upload'), [router])
  const handleMyAdsClick = useCallback(() => router.push('/my-ads'), [router])
  const handleViewReport = useCallback((adId: string) => {
    router.push(`/results?ad_id=${adId}`)
  }, [router])

  // Fetch data effect
  useEffect(() => {
    if (!userId) {
      setError('User ID not found')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [dashboardResult, adsResult] = await Promise.allSettled([
          fetchDashboardData(userId),
          fetchRecentAds(userId)
        ])

        if (dashboardResult.status === 'fulfilled') {
          setDashboardData(dashboardResult.value)
        } else {
          console.error('Dashboard data fetch failed:', dashboardResult.reason)
        }

        if (adsResult.status === 'fulfilled') {
          setRecentAds(adsResult.value)
        } else {
          console.error('Recent ads fetch failed:', adsResult.reason)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  // Memoized computed values
  const formattedLastAnalyzed = useMemo(() =>
    formatDate(dashboardData?.LastAnalysedOn),
    [dashboardData?.LastAnalysedOn]
  )

  const isProAccount = useMemo(() =>
    dashboardData?.AccountType === 'Pro',
    [dashboardData?.AccountType]
  )

  const isToday = (dateString: string): boolean => {
    try {
      const inputDate = new Date(dateString)
      const today = new Date()

      return (
        inputDate.getFullYear() === today.getFullYear() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getDate() === today.getDate()
      )
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (userDetails && (userDetails.ads_limit === 0 || (userDetails.valid_till && isToday(userDetails.valid_till)))) {
      setShowLimitPopup(true)
    }
  }, [userDetails])

  const handleUpgradeToPro = useCallback(() => {
    setShowLimitPopup(false)
    router.push('/pro')
  }, [router])

  const LimitExceededPopup = () => {
    const isAdsLimitZero = userDetails?.ads_limit === 0
    const isPlanExpired = userDetails?.valid_till && isToday(userDetails.valid_till)

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a1a] border border-[#db4900]/30 rounded-2xl max-w-md w-full p-6 space-y-4 relative">
          <button
            onClick={() => setShowLimitPopup(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="bg-[#db4900]/20 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-[#db4900]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#db4900]">
                {isAdsLimitZero ? "Ads Limit Reached" : "Plan Expired"}
              </h3>
              <p className="text-sm text-gray-300">
                {isAdsLimitZero ? "No more ads remaining" : "Your subscription has ended"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-200 leading-relaxed">
              {isAdsLimitZero
                ? "You've reached your ads limit for the current plan. Upgrade to Pro to continue analyzing your ads and unlock premium features."
                : "Your current plan has expired today. Renew your subscription to continue using premium features and analyzing your ads."
              }
            </p>

            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li>Unlimited ad uploads</li>
              <li>Advanced analytics</li>
              <li>A/B testing features</li>
              <li>Priority support</li>
            </ul>
          </div>


          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowLimitPopup(false)}
              variant="outline"
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgradeToPro}
              className="bg-[#db4900] hover:bg-[#db4900]/80 text-white font-semibold flex-1"
            >
              <Crown className="w-4 h-4 mr-2" />
              {isAdsLimitZero ? "Upgrade to Pro" : "Renew Subscription"}
            </Button>

          </div>
        </div>
      </div>
    )
  }


  // Error state
  if (error) {
    return (
      <UserLayout userDetails={userDetails}>
        <div className="min-h-screen text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#db4900] hover:bg-[#db4900]/80">
              Retry
            </Button>
          </div>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout userDetails={userDetails}>
      {loading ? <DashboardLoadingSkeleton /> : (
        <div className="min-h-screen text-white">
          <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-1 w-full ">
              {/* H1 and Button on the same line */}
              <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#db4900]">Dashboard</h1>
                <Button
                  onClick={handleUploadClick}
                  className="bg-[#db4900] cursor-pointer hover:bg-[#db4900]/80 text-white font-semibold flex items-center justify-center py-2 whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload<span className="hidden sm:inline"> New Ad</span>
                </Button>

              </div>

              {/* Paragraph below H1 */}
              <p className="text-gray-300 text-sm sm:text-base mt-1">
                Monitor and optimize your advertising performance
              </p>
            </div>



            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard
                title="Total Ads Analyzed"
                value={dashboardData?.AdAnalysed || 0}
                subtitle="Active tracking"
              />

              <StatCard
                title="Average Score"
                value={dashboardData?.AverageScore ? `${dashboardData.AverageScore}%` : '0%'}
                subtitle="Performance metric"
              />

              <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-300">Best Performing Platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#db4900] flex items-center">
                    <PlatformIcon platform={dashboardData?.TopPlatform || ''} />
                    {dashboardData?.TopPlatform || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-300 mt-2">Top performer</div>
                </CardContent>
              </Card>

              <StatCard
                title="A/B Tests"
                value={dashboardData?.['A/BTested'] || 0}
                subtitle="Tests completed"
              />

              <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-300">Account Type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-[#db4900] flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    {dashboardData?.AccountType || 'Free'}
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    {isProAccount ? 'Premium features' : 'Basic features'}
                  </div>
                </CardContent>
              </Card>

              <StatCard
                title="Total Suggestions"
                value={dashboardData?.TotalSuggestions || 0}
                subtitle="Suggestions made"
              />

              <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-300">Common Issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`font-bold text-[#db4900] ${String(dashboardData?.CommonIssue || '').trim().split(" ").length > 1
                      ? "text-lg"
                      : "text-3xl"
                      }`}
                  >
                    {dashboardData?.CommonIssue || 0}
                  </div>
                  <div className="flex items-center text-sm text-green-400 mt-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Issues identified in {dashboardData?.AdAnalysed || 0} Ads
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-300">Last Analysed On</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#db4900]">
                    {formattedLastAnalyzed}
                  </div>
                  <div className="text-sm text-gray-300 mt-2">Date of last analysis</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Ads Section */}
            <Card className="bg-[#121212] border-[#121212] shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white text-xl">Recent Ads</CardTitle>
                  <CardDescription className="text-gray-300">Your latest analyzed advertisements</CardDescription>
                </div>
                <Button
                  onClick={handleMyAdsClick}
                  className="px-4 py-1 text-sm text-white cursor-pointer bg-[#db4900] rounded-md hover:bg-[#bf3f00]">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recentAds.map((ad) => (
                    <AdCard
                      key={ad.ad_id}
                      ad={ad}
                      onViewReport={handleViewReport}
                    />
                  ))}
                </div>

                {recentAds.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleMyAdsClick}
                      variant="outline"
                      className="text-[#db4900] border-[#db4900] hover:bg-[#db4900] hover:text-white">
                      View All Ads
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {recentAds.length === 0 && (
                  <div className="text-center py-8 text-gray-300">
                    No recent ads found. Upload your first ad to get started!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Tips / Insights */}
            <Card className="bg-[#121212] border-[#121212] shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-xl">
                  <Lightbulb className="w-6 h-6 mr-2 text-[#db4900]" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Personalized recommendations to improve your ads
                  {dashboardData?.CommonIssue && (
                    <span className="block mt-1 text-[#db4900]">
                      Common issue detected: {dashboardData.CommonIssue}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiTips.map((tip, index) => (
                    <div key={index} className="bg-[#1a1a1a] rounded-2xl p-6 space-y-3 hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#db4900]/20 p-2 rounded-lg">
                          <tip.icon className="w-5 h-5 text-[#db4900]" />
                        </div>
                        <h3 className="font-semibold text-[#db4900]">{tip.title}</h3>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Free Plan CTA Banner */}
            <Card className="bg-gradient-to-r from-[#db4900]/20 to-[#db4900]/20 border-[#db4900]/30">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#1a1a1a] p-3 rounded-full">
                      <Crown className="w-8 h-8 text-[#db4900]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#db4900]">
                        {isProAccount ? 'Pro Features Active' : 'Unlock Full Potential'}
                      </h3>
                      <p className="text-gray-300 mt-1">
                        {isProAccount
                          ? 'You have access to all premium features and unlimited uploads'
                          : 'Get unlimited uploads, advanced analytics, and A/B testing with Pro'
                        }
                      </p>
                    </div>
                  </div>
                  {!isProAccount && (
                    <Button size="lg" className="bg-[#db4900] hover:bg-[#db4900]/80 text-white font-bold px-8">
                      Upgrade to Pro
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {showLimitPopup && <LimitExceededPopup />}
    </UserLayout>
  )
}