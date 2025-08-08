"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"
// Type definitions
interface DashboardData {
  AdAnalysed?: number
  AverageScore?: number
  TopPlatform?: string
  'A/BTested'?: number
  AccountType?: string
  TotalSuggestions?: number
  CommonIssue?: number
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import Spinner from "@/components/overlay"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import DashboardLoadingSkeleton from "@/components/Skeleton-loading/dashboard-loading"

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  flyer: FileImage,
} as const;

// Map platform names that might come from API
const platformMapping: Record<string, string> = {
  facebook: "facebook",
  instagram: "instagram",
  whatsapp: "whatsapp",
  flyer: "flyer",
  fb: "facebook",
  insta: "instagram",
  "whats app": "whatsapp",
  "what’sapp": "whatsapp",
};

function parsePlatforms(raw: string | undefined): string[] {
  if (!raw) return [];
  let list: string[] = [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      list = parsed.map((p) => String(p).trim().toLowerCase());
    } else if (typeof parsed === "string") {
      list = parsed.split(",").map((p) => p.trim().toLowerCase());
    }
  } catch {
    // fallback if not valid JSON
    list = raw.split(",").map((p) => p.trim().toLowerCase());
  }

  // map aliases/canonicalize and dedupe
  return Array.from(
    new Set(
      list
        .map((p) => platformMapping[p] || p) // canonicalize if known
        .filter(Boolean)
    )
  );
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


const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return '1 day ago'
  return `${diffInDays} days ago`
}

export default function Dashboard() {
  const { userDetails } = useFetchUserDetails()
  const userId = Cookies.get("userId")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recentAds, setRecentAds] = useState<RecentAd[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch dashboard data
        const dashboardResponse = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=dashboard&user_id=${userId}`)
        const dashboardResult = await dashboardResponse.json()
        setDashboardData(dashboardResult)

        // Fetch recent ads
        const adsResponse = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=recentads&user_id=${userId}`)
        const adsResult = await adsResponse.json()
        setRecentAds(adsResult.slice(0, 4))

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  return (
    <UserLayout userDetails={userDetails}>
       {loading ? <DashboardLoadingSkeleton /> : (
    <div className="min-h-screen  text-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#db4900]">Dashboard</h1>
            <p className="text-gray-300 mt-1">Monitor and optimize your advertising performance</p>
          </div>
          <Button
            onClick={() => router.push('/upload')}
            className="bg-[#db4900] hover:bg-[#db4900]/80 text-white font-semibold">
            <Upload className="w-4 h-4 mr-2" />
            Upload New Ad
          </Button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-300">Total Ads Analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#db4900]">
                {dashboardData?.AdAnalysed || 0}
              </div>
              <div className="flex items-center text-sm text-green-400 mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                Active tracking
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-300">Average Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#db4900]">
                {dashboardData?.AverageScore ? `${dashboardData.AverageScore}%` : '0%'}
              </div>
              <div className="flex items-center text-sm text-green-400 mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                Performance metric
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-300">Best Performing Platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#db4900] flex items-center">
                {dashboardData?.TopPlatform === 'Facebook' && <Facebook className="w-6 h-6 mr-2 text-blue-400" />}
                {dashboardData?.TopPlatform === 'Instagram' && <Instagram className="w-6 h-6 mr-2 text-pink-400" />}
                {dashboardData?.TopPlatform === 'YouTube' && <Youtube className="w-6 h-6 mr-2 text-red-400" />}
                {dashboardData?.TopPlatform === 'Twitter' && <Twitter className="w-6 h-6 mr-2 text-sky-400" />}
                {!dashboardData?.TopPlatform || !['Facebook', 'Instagram', 'YouTube', 'Twitter'].includes(dashboardData.TopPlatform) ? <Target className="w-6 h-6 mr-2 text-purple-400" /> : null}
                {dashboardData?.TopPlatform || 'N/A'}
              </div>
              <div className="text-sm text-gray-300 mt-2">Top performer</div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-300">A/B Tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#db4900]">
                {dashboardData?.['A/BTested'] || 0}
              </div>
              <div className="text-sm text-gray-300 mt-2">Tests completed</div>
            </CardContent>
          </Card>

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
                {dashboardData?.AccountType === 'Pro' ? 'Premium features' : 'Basic features'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-300">Total Suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#db4900]">
                {dashboardData?.TotalSuggestions || 0}
              </div>
              <div className="text-sm text-gray-300 mt-2">Suggestions made</div>

            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-300">Common Issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#db4900]">
                {dashboardData?.CommonIssue || 0}
              </div>
              <div className="text-sm text-gray-300 mt-2">Issues identified</div>

            </CardContent>
          </Card>

          <Card className="bg-[#121212] border-[#121212] shadow-lg group hover:scale-105 shadow-white/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-300">Last Analysed On</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#db4900]">
                {dashboardData?.LastAnalysedOn &&
                  new Date(dashboardData.LastAnalysedOn).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }).replace(/ /g, ' ')}
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
              onClick={() => router.push('/my-ads')}
              className="px-4 py-1 text-sm text-white bg-[#db4900] rounded-md hover:bg-[#bf3f00]">
              View All
            </Button>

          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentAds.map((ad) => {
                const platformList = parsePlatforms(ad.platforms)

                return (
                  <div
                    key={ad.ad_id}
                    onClick={() => router.push(`/results?ad_id=${ad.ad_id}`)}
                    className="bg-[#1a1a1a] rounded-2xl space-y-3 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={ad.image_path || "/placeholder.svg"}
                        alt={ad.ads_name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[#db4900] font-bold text-lg">Score: {ad.score}</span>
                        <div className="flex gap-1">
                          {platformList.map((platform, idx) => {
                            const Icon =
                              platformIcons[platform as keyof typeof platformIcons] || FileImage;
                            return (
                              <Icon
                                key={idx}
                                className="w-4 h-4 text-primary"
                                aria-label={platform}

                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 truncate">{ad.ads_name}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{getTimeAgo(ad.uploaded_on)}</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-[#db4900] border-[#db4900] hover:bg-[#db4900] hover:text-white">
                        View Report
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {recentAds.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => router.push('/my-ads')}
                  variant="outline" className="text-[#db4900] border-[#db4900] hover:bg-[#db4900] hover:text-white">
                  View All Ads
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {recentAds.length === 0 && (
              <div className="text-center py-8 text-gray-400">
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
                    {dashboardData?.AccountType === 'Pro' ? 'Pro Features Active' : 'Unlock Full Potential'}
                  </h3>
                  <p className="text-gray-300 mt-1">
                    {dashboardData?.AccountType === 'Pro'
                      ? 'You have access to all premium features and unlimited uploads'
                      : 'Get unlimited uploads, advanced analytics, and A/B testing with Pro'
                    }
                  </p>
                </div>
              </div>
              {dashboardData?.AccountType !== 'Pro' && (
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
    </UserLayout>
  )
}