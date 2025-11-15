"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload, Crown, MessageCircle, User, Facebook, Instagram, FileImage, X, GitCompareArrows, Calendar, User2Icon, CalendarIcon, ClockIcon, ArrowRightIcon,
  MessageSquare,
  LayoutPanelLeft,
  Eye,
  Linkedin,
  Share,
} from "lucide-react"
import { useRouter } from "next/navigation"
import UserLayout from "@/components/layouts/user-layout"
import DashboardLoadingSkeleton from "@/components/Skeleton-loading/dashboard-loading"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import { useAdNavigation } from "@/hooks/useAdNavigation"

import TotalAdsAnalyzed from "@/assets/dashboard/total-analyze.png"
import AverageScore from "@/assets/dashboard/average-score.png"
import TotalSuggestions from "@/assets/dashboard/total-suggestion.png"
import BestPlatform from "@/assets/dashboard/best-platform.png"
import TotalAb from "@/assets/dashboard/total-ab.png"
import LastAnalyzed from "@/assets/dashboard/last-analyzed.png"
import CtaAverage from "@/assets/dashboard/cta-average.png"
import Impression from "@/assets/dashboard/impression.png"
import ConvertionRate from "@/assets/dashboard/conversion-rate.png"
import IncreaseROI from "@/assets/dashboard/increase-roi.png"
import TalkToExpert from "@/assets/dashboard/talk-to-expert.png"
import Image from "next/image"
import toast from "react-hot-toast"
import { CaseStudy, Dashboard2Data, DashboardData, Top10Ad, TrendingAd, TrendingAdsResponse } from "./types"
import AdCard from "./_components/ad-card"
import LimitReached from "@/assets/limit-reached.webp"
import ExpertConsultationPopup from "@/components/expert-form"
import { Badge } from "@/components/ui/badge"
import AddBrandForm from "@/app/brands/_components/add-brand-form"
import { MainStatCard } from "./_components/main-status-card"
import { axiosInstance } from "@/configs/axios"

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  flyer: FileImage,
  linkedin: Linkedin,
} as const;

// Helper function to parse platforms
const parsePlatforms = (platformsString: string | undefined): string[] => {
  if (!platformsString) return []
  
  try {
    // Try to parse as JSON first (for array format)
    const parsed = JSON.parse(platformsString)
    // If it's already an array, return it
    if (Array.isArray(parsed)) {
      return parsed
    }
    // If it's a string, return as single item array
    if (typeof parsed === 'string') {
      return [parsed]
    }
    return []
  } catch {
    // If JSON.parse fails, treat it as a plain string
    return [platformsString]
  }
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '05 Sep 2025'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '05 Sep 2025'

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '05 Sep 2025'
  }
}


export default function Dashboard() {
  const { userDetails } = useFetchUserDetails()
  const userId = Cookies.get("userId")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dashboard2Data, setDashboard2Data] = useState<Dashboard2Data | null>(null)
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [top10Ads, setTop10Ads] = useState<Top10Ad[]>([])
  const [trendingAds, setTrendingAds] = useState<TrendingAd[]>([])
  const [trendingTimeFrame, setTrendingTimeFrame] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [showLimitPopup, setShowLimitPopup] = useState(false)
  const [showExpertPopup, setShowExpertPopup] = useState(false)
  const [showAllGlobalInsightsPopup, setShowAllGlobalInsightsPopup] = useState(false)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [upgradedFeatures, setUpgradedFeatures] = useState<string[]>([])
  const [showAddBrandPopup, setShowAddBrandPopup] = useState(false)
  // Remove userBrands state as brand info comes from userDetails.brand
  const [brandsLoading, setBrandsLoading] = useState(false)
  // Client brands for type "2"
  const [clientBrands, setClientBrands] = useState<Array<{ brand_id: number; brand_name: string }>>([])
  const [clientBrandsLoading, setClientBrandsLoading] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const handleBrandChange = useCallback((val: string) => {
    setSelectedBrandId(val)
  }, [])

  // Use the new ad navigation hook
  const { navigateToAdResults, navigateToTop10AdResults } = useAdNavigation()

  // Memoized navigation handlers
  const handleUploadClick = useCallback(() => router.push('/upload'), [router])
  const handleMyAdsClick = useCallback(() => router.push('/my-ads'), [router])
  const handleViewIdea = useCallback(() => router.push('/guide'), [router])
  const handleViewReport = useCallback((adId: string) => {
    navigateToAdResults(adId, userDetails?.user_id)
  }, [navigateToAdResults, userDetails?.user_id])
  const handleTop10AdViewReport = useCallback((adId: string, aduserId: string) => {
    navigateToTop10AdResults(adId, aduserId)
  }, [navigateToTop10AdResults])

  // API fetch functions (keeping original implementations)
  const fetchDashboardData = async (userId: string, brandId?: string) => {
    try {
      const brandParam = brandId && brandId.length > 0 && brandId !== "All Clients" ? `&brand_id=${encodeURIComponent(brandId)}` : ""
      const response = await axiosInstance.get(`?gofor=dashboard1&user_id=${userId}${brandParam}`)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  const fetchDashboard2Data = async (userId: string, brandId?: string) => {
    try {
      const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()
      const brandParam = brandId && brandId.length > 0 && brandId !== "All Clients" ? `&brand_id=${encodeURIComponent(brandId)}` : ""
      const response = await axiosInstance.get(`?gofor=dashboard2&user_id=${userId}&month=${currentMonth}${brandParam}`)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard2 data:', error)
      throw error
    }
  }

  const fetchCaseStudies = async () => {
    try {
      const response = await axiosInstance.get(`?gofor=recentcslist`)
      return response.data
    } catch (error) {
      console.error('Error fetching case studies:', error)
      throw error
    }
  }

  const submitExpertRequest = async (formData: any) => {
    try {
      const payload = {
        gofor: "exptalkrequest",
        user_id: parseInt(userId || ""),
        prefdate: formData.prefdate,
        preftime: formData.preftime,
        comments: formData.comments
      }

      const response = await axiosInstance.post('', payload)
      const result = response.data

      toast.success(result);

      return result
    } catch (error) {
      console.error('Error submitting expert request:', error)
      throw error
    }
  }

  const fetchTop10Ads = async () => {
    try {
      const response = await axiosInstance.get(`?gofor=top10ads`)
      return response.data
    } catch (error) {
      console.error('Error fetching top 10 ads:', error)
      throw error
    }
  }

  const fetchTrendingAds = async () => {
    try {
      const response = await axiosInstance.get(`?gofor=trendingads`)
      return response.data
    } catch (error) {
      console.error('Error fetching trending ads:', error)
      throw error
    }
  }

  // Top 10 Ads card renderer
  const renderAdCard = (ad: Top10Ad, index: number) => {
    const platformList = parsePlatforms(ad.platforms);
    const dateFormatted = formatDate(ad.uploaded_on);

    return (
      <div
        key={ad.ad_id}
        className="bg-black border border-[#3d3d3d] rounded-lg overflow-hidden hover:shadow-xl hover:shadow-[#db4900]/10 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
      >
        <div className="relative">
          <img
            src={ad.image_path}
            alt={ad.ads_name || "Ad"}
            className="w-full aspect-square object-contain transform group-hover:scale-105 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />

          {/* Position Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-[#db4900] text-white text-sm font-bold px-2 py-1 rounded ">
              #{index + 1}
            </Badge>
          </div>

          {/* Weighed Rank Badge */}
          {ad.weighted_rank > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-white text-lg font-semibold text-primary shadow-xl shadow-[#db4900]/20">
                {ad.weighted_rank}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <h3
              className="font-medium text-sm truncate text-white"
              title={ad.ads_name || "Untitled Ad"}
              style={{ maxWidth: "70%" }}
            >
              {ad.ads_name || "Untitled Ad"}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              {platformList.map((platform, idx) => {
                const platformKey = platform.toLowerCase();
                const Icon =
                  platformIcons[platformKey as keyof typeof platformIcons] ||
                  FileImage;
                return (
                  <Icon
                    key={idx}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-[#db4900]"
                    aria-label={platform}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30 text-xs">
              {ad.ads_type}
            </Badge>
            <p className="text-xs text-gray-300">{dateFormatted}</p>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex-1 min-w-0">
              <Button
                onClick={() => handleTop10AdViewReport(String(ad.ad_id), String(ad.user_id))}
                size="sm"
                variant="outline"
                className="w-full text-[#db4900] border-[#db4900] hover:bg-[#db4900] hover:text-white transition-colors text-xs sm:text-sm"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Report
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // Fetch client brands when user is an agency (type "2")
  useEffect(() => {
    const shouldFetch = userId && userDetails?.type === "2"
    if (!shouldFetch) return

    const fetchBrands = async () => {
      try {
        setClientBrandsLoading(true)
        const response = await axiosInstance.get(`?gofor=brandslist&user_id=${userId}`)
        const data = response.data
        const normalized = Array.isArray(data)
          ? data.map((b: any) => ({ brand_id: Number(b.brand_id), brand_name: String(b.brand_name || 'Unnamed') }))
          : []
        setClientBrands(normalized)
      } catch (e) {
        console.error('Error fetching brands list:', e)
      } finally {
        setClientBrandsLoading(false)
      }
    }

    fetchBrands()
  }, [userId, userDetails?.type])

  // Fetch data effect
  useEffect(() => {
    if (!userId) {
      setError('User ID not found')
      setLoading(false)
      return
    }

    const fetchAllData = async () => {
      try {
        setLoading(true)

        const [dashboard1, dashboard2, cases, topAds, trendingAdsData] = await Promise.all([
          fetchDashboardData(userId, selectedBrandId || undefined),
          fetchDashboard2Data(userId, selectedBrandId || undefined),
          fetchCaseStudies(),
          fetchTop10Ads(),
          fetchTrendingAds()
        ])

        setDashboardData(dashboard1)
        setDashboard2Data(dashboard2)
        setCaseStudies(cases.slice(0, 2))
        setTop10Ads(topAds.slice(0, 4))
        setTrendingAds(trendingAdsData.trending_ads?.slice(0, 4) || [])
        setTrendingTimeFrame(trendingAdsData.time_frame || "")

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [userId, selectedBrandId])

  const accountType = useMemo(
    () => dashboardData?.AccountType || "Trial",
    [dashboardData?.AccountType]
  )


  const isPlanExpired = (dateString: string): boolean => {
    try {
      const inputDate = new Date(dateString)
      const today = new Date()

      // Set time to midnight for accurate date comparison
      inputDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)

      // Returns true if plan expired (valid_till is today or in the past)
      return inputDate <= today
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (userDetails && (Number(userDetails.ads_limit) === 0 || (userDetails.valid_till && isPlanExpired(userDetails.valid_till)))) {
      setShowLimitPopup(true)
    }
  }, [userDetails])

  // Check for package upgrade and show congratulations popup
  useEffect(() => {
    if (userDetails && userId && userDetails.package_id) {
      const previousPackageKey = `previous_package_${userId}`
      const previousPackage = localStorage.getItem(previousPackageKey)

      const currentPackage = userDetails.package_id

      // Store current package for future comparison
      if (previousPackage === null) {
        localStorage.setItem(previousPackageKey, String(currentPackage))
        return
      }

      const prevPkg = parseInt(previousPackage)

      // Check if user has upgraded (previous package was lower than current)
      if (prevPkg < currentPackage) {
        // Use a specific key for this upgrade path
        const storageKey = `package_upgrade_${prevPkg}_to_${currentPackage}_shown_${userId}`
        const upgradeShown = localStorage.getItem(storageKey)

        if (!upgradeShown) {
          const features: string[] = []

          // Determine which features were unlocked
          if (prevPkg === 1 && currentPackage >= 2) {
            features.push('top10ads')
          }
          if (prevPkg <= 2 && currentPackage === 3) {
            features.push('top10trendingads')
          }

          if (features.length > 0) {
            setUpgradedFeatures(features)
            setShowUpgradePopup(true)
            localStorage.setItem(storageKey, 'true')
          }
        }

        // Update stored package
        localStorage.setItem(previousPackageKey, String(currentPackage))
      } else if (prevPkg !== currentPackage) {
        // Update if package changed but not an upgrade
        localStorage.setItem(previousPackageKey, String(currentPackage))
      }
    }
  }, [userDetails, userId])

  // Check if brand popup should be shown
  useEffect(() => {
    if (userDetails) {
      // For type 1: show brand popup if brand is false
      if (userDetails.payment_status === 1 && userDetails.type === "1" && userDetails.brand === false) {
        setShowAddBrandPopup(true)
      }

      // For type 2: route to myaccount if agency is false
      if (userDetails.payment_status === 1 && userDetails.type === "2" && userDetails.agency === false) {
        router.push('/myaccount?action=add-agency')
      }
    }
  }, [userDetails, brandsLoading, router])

  const handleUpgradeToPro = useCallback(() => {
    setShowLimitPopup(false)
    router.push('/pro')
  }, [router])

  const LimitExceededPopup = () => {
    const isAdsLimitZero = Number(userDetails?.ads_limit) === 0
    const isPlanExpiredStatus = userDetails?.valid_till && isPlanExpired(userDetails.valid_till)

    // Prioritize plan expiry message if plan is expired
    const showExpiredMessage = isPlanExpiredStatus
    const showLimitMessage = isAdsLimitZero && !isPlanExpiredStatus

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#171717] rounded-2xl max-w-2xl w-full p-4 sm:p-6 relative flex flex-col sm:flex-row gap-4 sm:gap-6 mx-4">
          {/* Close button */}
          <button
            onClick={() => setShowLimitPopup(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side Image */}
          <div className="flex-shrink-0 w-full sm:w-1/3 flex items-center justify-center">
            <img
              src={LimitReached.src}
              alt="Limit Exceeded"
              className="rounded-xl object-contain max-h-32 sm:max-h-48"
            />
          </div>

          {/* Right Side Content */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#db4900]">
                  {showExpiredMessage ? "Plan Expired" : "Ads Limit Reached"}
                </h3>
                <p className="text-sm text-gray-300">
                  {showExpiredMessage ? "Your subscription has ended" : "No more ads remaining"}
                </p>
              </div>
            </div>

            <p className="text-gray-200 leading-relaxed text-sm sm:text-base">
              {showExpiredMessage
                ? "Your current plan has expired. Renew your subscription to continue using premium features and analyzing your ads."
                : "You've reached your ads limit for the current plan. Upgrade to Pro to continue analyzing your ads and unlock premium features."
              }
            </p>

            <ul className="text-sm text-gray-300 space-y-1 sm:space-y-2 list-disc list-inside">
              <li>Unlimited ad uploads</li>
              <li>Advanced analytics</li>
              <li>A/B testing features</li>
              <li>Priority support</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowLimitPopup(false)}
                variant="outline"
                className="text-gray-300 hover:text-white hover:border-white transition-all duration-300"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleUpgradeToPro}
                className="bg-[#db4900] hover:bg-[#ff5722] text-white font-semibold flex-1 transition-all duration-300 hover:shadow-lg hover:shadow-[#db4900]/30"
              >
                <Crown className="w-4 h-4 mr-2" />
                {showExpiredMessage ? "Renew Subscription" : "Add Credits"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const AllGlobalInsightsPopup = () => {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#171717] rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden p-4 sm:p-6 relative mx-4">
          {/* Close button */}
          <button
            onClick={() => setShowAllGlobalInsightsPopup(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#db4900] mb-2">
              All Global Insights
            </h3>
            <p className="text-sm text-gray-300">
              Complete global insights for your ads
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-150px)] space-y-3 sm:space-y-4 pr-2">
            {dashboard2Data?.global_insights && dashboard2Data.global_insights.length > 0 ? (
              dashboard2Data.global_insights.map((insight, index) => {
                return (
                  <div
                    key={insight.id}
                    className="border-l-4 border-[#db4900] bg-black pl-4 pr-3 py-3 rounded-md space-y-2 transition-all duration-300 hover:bg-[#1f1f1f] hover:border-[#ff5722] hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm flex-1">{insight.content}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/50 text-xs">
                        {insight.source}
                      </p>
                      <p className="text-white/50 text-xs">
                        Global Insight #{insight.id}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/80">
                <MessageSquare className="w-16 h-16 text-primary mb-4" />
                <p className="text-lg mb-4 text-center">No global insights available</p>
                <p className="text-sm text-white/60 text-center mb-4">
                  Upload your first ad to get global insights
                </p>
                <Button
                  onClick={() => {
                    setShowAllGlobalInsightsPopup(false)
                    handleUploadClick()
                  }}
                  className="bg-[#db4900] hover:bg-[#ff5722] text-white px-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#db4900]/30 hover:scale-105"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Ad
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const UpgradeCongratulationsPopup = () => {
    const packageName = userDetails?.package_id === 1 ? "Basic" : userDetails?.package_id === 2 ? "Starter" : "Growth"
    const hasTop10Ads = upgradedFeatures.includes('top10ads')
    const hasTrendingAds = upgradedFeatures.includes('top10trendingads')

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <div className="bg-black rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative border-2 border-[#db4900]/40 shadow-2xl shadow-[#db4900]/30 mx-4">
          {/* Confetti/Celebration Background Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#db4900]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#ff5722]/20 rounded-full blur-3xl animate-pulse delay-150"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#db4900]/10 rounded-full blur-3xl"></div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowUpgradePopup(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10">

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-[#db4900] via-[#ff5722] to-[#db4900] bg-clip-text text-transparent animate-gradient">
                Congratulations!
              </h2>
              <p className="text-lg sm:text-xl text-white/90 font-semibold">
                You've upgraded to {packageName} Plan
              </p>
            </div>

            {/* Features Unlocked Section */}
            <div className="bg-black/40 rounded-2xl p-4 sm:p-6 mb-6 border border-[#db4900]/30">
              <h3 className="text-lg sm:text-xl font-bold text-[#db4900] mb-4 text-center">
                🔓 New Features Unlocked
              </h3>

              <div className="space-y-4">
                {hasTop10Ads && (
                  <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] rounded-xl p-4 border-l-4 border-[#db4900] transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#db4900]/20 rounded-full flex items-center justify-center mt-1">
                        <Eye className="w-5 h-5 text-[#db4900]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-base sm:text-lg mb-1">
                          Top 10 Ads Access
                        </h4>
                        <p className="text-gray-300 text-sm">
                          View the highest performing ads on adalyze AI. Learn from the best and get inspired for your campaigns.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {hasTrendingAds && (
                  <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] rounded-xl p-4 border-l-4 border-[#ff5722] transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#ff5722]/20 rounded-full flex items-center justify-center mt-1">
                        <MessageSquare className="w-5 h-5 text-[#ff5722]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-base sm:text-lg mb-1">
                          Top 10 Trending Ads Access
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Stay ahead with real-time trending advertisements. Track viral campaigns and market trends.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-3">
              <p className="text-gray-300 text-sm">
                Start exploring your new features now!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {hasTop10Ads && (
                  <Button
                    onClick={() => {
                      setShowUpgradePopup(false);
                      router.push('/top10ads');
                    }}
                    className="bg-[#db4900] hover:bg-[#ff5722] text-white font-semibold px-6 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#db4900]/30 hover:scale-105"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Top 10 Ads
                  </Button>
                )}

                {hasTrendingAds && (
                  <Button
                    onClick={() => {
                      setShowUpgradePopup(false);
                      router.push('/top10trendingads');
                    }}
                    className="bg-[#ff5722] hover:bg-[#db4900] text-white font-semibold px-6 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff5722]/30 hover:scale-105"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    View Trending Ads
                  </Button>
                )}

                <Button
                  onClick={() => setShowUpgradePopup(false)}
                  variant="outline"
                >
                  I'll explore later
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <UserLayout userDetails={userDetails}>
        <div className="min-h-screen text-white flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#db4900] hover:bg-[#ff5722] transition-colors duration-300">
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
        <div className="min-h-screen max-w-7xl mx-auto text-white pb-20 sm:pb-5">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex flex-col items-start gap-4">
                {/* Greeting */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white/80">
                  Hello,{" "}
                  <span className="text-white">
                    {userDetails?.name || "User"}
                  </span>
                </h1>

                {/* Account Info + Brand Select */}
                {(accountType || userDetails?.fretra_status === 1) && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">

                    {/* Account Badge + Upgrade Link */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center bg-primary border-2 border-primary px-3 py-1 rounded-full hover:bg-[#db4900]/10 transition-all duration-300 group">
                        <Crown className="w-4 h-4 text-white mr-2 group-hover:text-[#ff5722] transition-colors duration-300" />
                        <span className="text-white text-sm font-medium group-hover:text-[#ff5722] transition-colors duration-300">
                          {accountType === "Pro"
                            ? "Pro Account"
                            : userDetails?.fretra_status === 1
                              ? "Trial Account"
                              : ""}
                        </span>
                      </div>

                      {(
                        (userDetails?.fretra_status === 1 && accountType !== "Pro") ||
                        Number(userDetails?.ads_limit) === 0
                      ) && (
                          <span
                            onClick={handleUpgradeToPro}
                            className="text-[#db4900] text-sm font-medium underline cursor-pointer hover:text-[#ff5722] transition-colors duration-300"
                          >
                            {Number(userDetails?.ads_limit) === 0
                              ? "Add Credits"
                              : "Upgrade to Pro"}
                          </span>
                        )}
                    </div>

                    {/* Brand Select (visible on mobile only for type 2 users) */}
                    {userDetails?.type === "2" && (
                      <div className="md:hidden w-full sm:w-auto">
                        <Select
                          value={selectedBrandId}
                          onValueChange={handleBrandChange}
                          disabled={clientBrandsLoading}
                        >
                          <SelectTrigger className="w-full sm:w-[180px] bg-black text-white border border-[#171717] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#db4900]">
                            <SelectValue
                              placeholder={
                                clientBrandsLoading
                                  ? "Loading..."
                                  : clientBrands.length === 0
                                    ? "Select Client"
                                    : "Select Client"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All Clients">All Clients</SelectItem>
                            {clientBrandsLoading && (
                              <SelectItem value="__loading" disabled>
                                Loading...
                              </SelectItem>
                            )}
                            {!clientBrandsLoading && clientBrands.length === 0 && (
                              <SelectItem value="__no_clients" disabled>
                                No clients
                              </SelectItem>
                            )}
                            {!clientBrandsLoading &&
                              clientBrands.map((b) => (
                                <SelectItem key={b.brand_id} value={String(b.brand_id)}>
                                  {b.brand_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>


              <div className="hidden md:flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                <Button
                  onClick={handleUploadClick}
                  className="bg-[#db4900] hover:bg-[#ff5722] text-white px-4 sm:px-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#db4900]/30 hover:scale-105"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Ad
                </Button>
                {userDetails?.fretra_status !== 1 && (
                  <Button
                    variant="outline"
                    className="bg-white/90 hover:bg-primary text-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => router.push("/ab-test")}
                  >
                    <GitCompareArrows className="w-4 h-4 mr-2" />
                    Run AB Test
                  </Button>
                )}
                {userDetails?.type === "2" && (
                  <div>
                    <Select
                      value={selectedBrandId}
                      onValueChange={handleBrandChange}
                      disabled={clientBrandsLoading}
                    >
                      <SelectTrigger className="min-w-[220px] bg-black text-white border border-[#171717] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#db4900]">
                        <SelectValue placeholder={clientBrandsLoading ? "Loading..." : (clientBrands.length === 0 ? "No clients" : "Select client")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Clients">All Clients</SelectItem>
                        {clientBrandsLoading && (
                          <SelectItem value="__loading" disabled>Loading...</SelectItem>
                        )}
                        {!clientBrandsLoading && clientBrands.length === 0 && (
                          <SelectItem value="__no_clients" disabled>No clients</SelectItem>
                        )}
                        {!clientBrandsLoading && clientBrands.map((b) => (
                          <SelectItem key={b.brand_id} value={String(b.brand_id)}>
                            {b.brand_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Row 1 - Top 3 Stat Cards */}
              <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MainStatCard
                  title="Total Ads Analyzed"
                  value={String(dashboardData?.AdAnalysed || 0).toString().padStart(2, "0")}
                  subtitle={`${userDetails?.ads_limit || 0} Ad credits available`}
                  imageSrc={TotalAdsAnalyzed.src}
                />

                <MainStatCard
                  title="Average Score"
                  value={String(dashboardData?.AverageScore || 0).toString().padStart(2, "0")}
                  subtitle={`Out of ${dashboardData?.AdAnalysed || 0} Ads`}
                  imageSrc={AverageScore.src}
                />

                <MainStatCard
                  title="Total Go's"
                  value={String(dashboardData?.TotalGos || 0).toString().padStart(2, "0")}
                  subtitle={`Analyzed ${dashboardData?.AdAnalysed || 0} Ads`}
                  imageSrc={TotalSuggestions.src}
                />
              </div>

              {/* Row 2 - Recent Ads + Sidebar Cards */}
              <div className="col-span-full grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Sidebar Cards (Mobile: Grid 3, Desktop: Single Column) */}
                <div className="order-1 lg:order-2 grid sm:grid-cols-3 grid-cols-1 gap-2 sm:gap-4 lg:block lg:space-y-6">
                  {/* Best Platform */}
                  <div className="bg-black rounded-2xl px-3 py-4 flex items-center lg:h-[calc((100%-3rem)/3)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db4900]/20  group">
                    <div className="flex items-center gap-3 h-full">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <img src={BestPlatform.src} alt={dashboardData?.TopPlatform || "Platform"} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm lg:text-lg group-hover:text-white/80 transition-colors duration-300">Best Platform</p>
                        <p className="text-primary font-semibold text-sm lg:text-lg group-hover:text-[#ff5722] transition-colors duration-300">{dashboardData?.TopPlatform || "Instagram"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Total A/B Tests */}
                  <div className="bg-black rounded-2xl px-3 py-4 flex items-center lg:h-[calc((100%-3rem)/3)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db4900]/20  group">
                    <div className="flex items-center gap-3 h-full">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform duration-300">
                        <img src={TotalAb.src} alt="A/B Tests" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm lg:text-lg group-hover:text-white/80 transition-colors duration-300">Total A/B Tests</p>
                        <p className="text-primary font-bold text-lg lg:text-2xl group-hover:text-[#ff5722] transition-colors duration-300">{String(dashboardData?.["A/BTested"] || "0").padStart(2, "0")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Last Analyzed On */}
                  <div className="bg-black rounded-2xl px-3 py-4 flex items-center lg:h-[calc((100%-3rem)/3)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db4900]/20  group">
                    <div className="flex items-center gap-3 h-full">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform duration-300">
                        <img src={LastAnalyzed.src} alt="Calendar" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm lg:text-lg group-hover:text-white/80 transition-colors duration-300">Last Analyzed On</p>
                        <p className="text-primary font-bold text-sm lg:text-lg group-hover:text-[#ff5722] transition-colors duration-300">
                          {dashboardData?.LastAnalysedOn && dashboardData.LastAnalysedOn !== "-"
                            ? new Date(dashboardData.LastAnalysedOn).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Ads Section */}
                <div className="order-2 lg:order-1 lg:col-span-3">
                  <div className="bg-black rounded-2xl p-4 sm:p-6 h-full flex flex-col transition-all duration-300">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between ">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-1">Recent Ads</h2>
                        <Button
                          onClick={handleMyAdsClick}
                          variant="ghost"
                          className="self-start sm:self-auto text-[#db4900] hover:bg-[#db4900]/20 hover:text-[#ff5722] transition-all duration-300 text-sm"
                        >
                          View All
                        </Button>
                      </div>
                      <p className="text-white/50 text-sm">Latest campaigns in adalyze AI</p>
                    </div>



                    {/* Ads Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
                      {dashboardData?.recentads && dashboardData.recentads.length > 0 ? (
                        <>
                          {dashboardData.recentads.slice(0, 4).map((ad) => (
                            <AdCard key={ad.ad_id} ad={ad} onViewReport={handleViewReport} />
                          ))}

                          {/* Fill empty slots for desktop only */}
                          {dashboardData.recentads.length < 4 &&
                            Array(4 - dashboardData.recentads.length)
                              .fill(null)
                              .map((_, idx) => (
                                <div
                                  key={`empty-${idx}`}
                                  className="hidden sm:block  rounded-xl h-40 sm:h-48"
                                />
                              ))}
                        </>
                      ) : (
                        <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-8 sm:py-10 text-white/80">
                          <LayoutPanelLeft className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-primary" />
                          <p className="text-base sm:text-lg mb-4">No recent ads found</p>
                          <Button
                            onClick={handleUploadClick}
                            className="bg-[#db4900] hover:bg-[#ff5722] text-white px-4 sm:px-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#db4900]/30 hover:scale-105"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Ad
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3 - Global Insights, CTR/Impression, and Conversion Rate */}
              <div className="col-span-full grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* Global Insights - takes 2 columns */}
                <div className="lg:col-span-2 h-full">
                  <div className="bg-black rounded-2xl p-4 sm:p-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-[#db4900]/10 group">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold text-lg sm:text-xl transition-colors duration-300">
                        Global Insights
                      </h3>
                      {dashboard2Data?.global_insights && dashboard2Data.global_insights.length > 0 && (
                        <Button
                          onClick={() => setShowAllGlobalInsightsPopup(true)}
                          variant="ghost"
                          className="self-start sm:self-auto text-[#db4900] hover:bg-[#db4900]/20 hover:text-[#ff5722] transition-all duration-300 text-sm"
                        >
                          View All
                        </Button>
                      )}
                    </div>

                    <p className="text-white/50 text-sm mb-4 transition-colors duration-300">
                      Latest global insights for your ads
                    </p>

                    {/* Global Insights Items */}
                    <div className="space-y-3 sm:space-y-4 flex-1">
                      {dashboard2Data?.global_insights && dashboard2Data.global_insights.length > 0 ? (
                        dashboard2Data.global_insights.slice(0, 2).map((insight, index) => {
                          return (
                            <div
                              key={insight.id}
                              className="border-l-4 border-[#db4900] bg-[#171717] px-2 py-2 rounded-md space-y-2 transition-all duration-300 hover:bg-[#1f1f1f] hover:border-[#ff5722] hover:scale-[1.02] "
                            >
                              <p className="text-white text-sm">{insight.content}</p>
                              <p className="text-white/50 text-xs">{insight.source}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-white/80">
                          <MessageSquare className="w-14 h-14 sm:w-18 sm:h-18 text-primary mb-4" />
                          <p className="text-base sm:text-lg mb-4 text-center">Upload your 1st AD for Global Insights</p>
                          <Button
                            onClick={handleUploadClick}
                            className="bg-[#db4900] hover:bg-[#ff5722] text-white px-4 sm:px-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#db4900]/30 hover:scale-105"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Ad
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTR & Impression - takes 2 columns */}
                <div className="lg:col-span-2 h-full">
                  <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
                    {/* CTR Average */}
                    <div className="bg-black px-3 py-3 sm:px-4 sm:py-4 rounded-2xl flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db4900]/20  group">
                      <h3 className="text-white font-semibold text-lg sm:text-xl mb-1 transition-colors duration-300">
                        CTR Average
                      </h3>
                      <p className="text-white/50 text-sm mb-3 sm:mb-4 transition-colors duration-300">
                        Shows how often users click ads.
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#db4900] px-2 sm:px-4 transition-colors duration-300 group-hover:text-[#ff5722]">
                          {dashboard2Data?.estimated_ctr || 0}%
                        </div>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-26 lg:h-26 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                          <img
                            src={CtaAverage.src}
                            alt="Mouse Pointer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Impression */}
                    <div className="bg-black px-3 py-3 sm:px-4 sm:py-4 rounded-2xl flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db4900]/20  group">
                      <h3 className="text-white font-semibold text-lg sm:text-xl mb-1 sm:mb-2 transition-colors duration-300 group-hover:text-primary">
                        Impression
                      </h3>
                      <p className="text-white/50 text-sm mb-3 sm:mb-4 transition-colors duration-300 group-hover:text-white/70">
                        Number of times ads are shown to users.
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#db4900] transition-colors duration-300 group-hover:text-[#ff5722]">
                          {dashboard2Data?.predicted_reach
                            ? `${(dashboard2Data.predicted_reach / 1000).toFixed(1)}K`
                            : "00"}
                        </div>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-26 lg:h-26 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                          <img
                            src={Impression.src}
                            alt="Bar Chart"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* /* Conversion Rate - takes 2 columns */}
                <div className="lg:col-span-2 h-full">
                  <div className="bg-gradient-to-br from-orange-500/80 to-orange-600 rounded-2xl p-4 sm:p-6 h-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30  group">
                    {/* Header */}
                    <h3 className="text-white font-semibold text-lg sm:text-xl mb-2 transition-colors duration-300">
                      Conversion Rate
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-sm mb-4 leading-relaxed transition-colors duration-300">
                      Percentage of users converting after ads.
                    </p>

                    {/* Main Metric */}
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight transition-transform duration-300 group-hover:scale-110 origin-left">
                      {dashboard2Data?.conversion_probability || 0}%
                    </div>

                    {/* Chart Area - Below text, not overlapping */}
                    <div className="mt-auto w-full h-24 sm:h-28 md:h-32 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={ConvertionRate.src}
                        alt="Conversion Rate Chart"
                        className="w-full h-full object-contain object-bottom"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4 - Adalyze Impacts + ROI/Expert Section */}
              <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Adalyze Impacts */}
                <div className="lg:col-span-2 h-full">
                  <div className="bg-black rounded-2xl p-4 sm:p-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-[#db4900]/10 group">
                    <div className="mb-4 sm:mb-6  ">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-semibold text-white group-hover:text-white transition-colors duration-300">Adalyze AI Impacts</h2>
                        <Button
                          variant="ghost"
                          onClick={() => router.push("/case-study?type=dashboard")}
                          className="text-[#db4900] hover:bg-[#db4900]/20 hover:text-[#ff5722] text-sm transition-all duration-300">
                          View All
                        </Button>
                      </div>
                      <p className="text-white/50 text-sm mt-1 group-hover:text-white/70 transition-colors duration-300">
                        Know the recent success stories of Adalyze AI
                      </p>
                    </div>

                    <div className="space-y-6 sm:space-y-8 flex-1">
                      {caseStudies.length > 0 ? (
                        caseStudies.map((caseStudy, index) => (
                          <div
                            key={caseStudy.cs_id}
                            onClick={() => router.push(`/case-study-detail?cs_id=${caseStudy.cs_id}&type=dashboard`)}
                            className="bg-[#171717] rounded-xl sm:rounded-2xl px-3 py-4 sm:px-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 cursor-pointer transition-all duration-300 hover:bg-[#1f1f1f] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#db4900]/20 group/case"
                          >
                            {/* Icon/Visual Section */}
                            <div className="flex-shrink-0 w-full sm:w-auto">
                              <div className="relative w-full h-32 sm:w-40 sm:h-24 lg:w-54 lg:h-38 rounded-lg sm:rounded-2xl border-4 border-[#3d3d3d] flex items-center justify-center transition-colors duration-300 overflow-hidden">
                                <Image
                                  src={caseStudy.banner_image_url}
                                  alt="Case study"
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            </div>
                            {/* Content Section */}
                            <div className="flex-grow">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="text-xs bg-[#db4900] text-white px-2 sm:px-3 py-1 mb-2 rounded-full group-hover/case:bg-[#ff5722] transition-colors duration-300">
                                  {caseStudy.industry}
                                </div>
                              </div>
                              <h3 className="font-bold text-base sm:text-lg text-white mb-1 group-hover/case:text-[#db4900] transition-colors duration-300">
                                {caseStudy.title.length > 50 ? `${caseStudy.title.substring(0, 50)}...` : caseStudy.title}
                              </h3>
                              <p className="text-sm text-gray-300 mb-3 sm:mb-4 group-hover/case:text-white/80 transition-colors duration-300">
                                {caseStudy.outcome.length > 100 ? `${caseStudy.outcome.substring(0, 100)}...` : caseStudy.outcome}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#3e3e3e] rounded-full flex items-center justify-center transition-colors duration-300">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-white">{caseStudy.testimonial_name}</p>
                                    <p className="text-xs text-white/50">{caseStudy.testimonial_role}</p>
                                  </div>
                                </div>
                                <div className="flex items-center text-white/50 gap-2 justify-start sm:justify-end">
                                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                                  <div className="text-left">
                                    <p className="text-xs text-white">{formatDate(caseStudy.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p>No case studies available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ROI and Expert Section */}
                <div className="lg:col-span-1 h-full flex-1">
                  <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
                    {/* Increase ROI */}
                    <div className="bg-black rounded-2xl p-3 sm:p-4 text-left flex-1 flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db4900]/20  group">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-30 lg:h-30 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={IncreaseROI.src}
                          alt="Lightbulb"
                          className="w-full h-full"
                        />
                      </div>
                      <h3 className="text-[#db4900] font-bold text-xl sm:text-2xl group-hover:text-[#ff5722] transition-colors duration-300">Increase ROI</h3>
                      <p className="text-white/50 text-sm sm:text-md mb-1 flex-1 group-hover:text-white/70 transition-colors duration-300">
                        Know how to use Adalyze AI & increase your ROI
                      </p>
                      <Button
                        onClick={handleViewIdea}
                        className="bg-primary text-sm sm:text-md text-white font-medium mt-auto w-fit self-start transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        View Ideas
                      </Button>
                    </div>

                    {/* Talk to Expert */}
                    <div className="bg-[#ffe7d9] rounded-2xl p-3 sm:p-4 text-left flex-1 flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-400/30  group">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-30 lg:h-30 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={TalkToExpert.src}
                          alt="Message Circle"
                          className="w-full h-full"
                        />
                      </div>
                      <h3 className="text-gray-800 font-bold text-xl sm:text-2xl group-hover:text-[#db4900] transition-colors duration-300">Talk to Expert</h3>
                      <p className="text-[#3d3d3d] text-sm sm:text-md mb-2 flex-1 group-hover:text-gray-700 transition-colors duration-300">
                        Get Advise from an AD expert & improve results
                      </p>
                      <Button
                        className="bg-[#db4900] text-sm sm:text-md text-white hover:bg-[#ff5722] font-medium mt-auto w-fit self-start transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db4900]/30"
                        onClick={() => setShowExpertPopup(true)}
                      >
                        Let's Talk
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5 - Top 10 Ads */}
              {(userDetails?.package_id === 2 || userDetails?.package_id === 3 || userDetails?.package_id === 4) && (
                <div className="col-span-full">
                  <div className="bg-black rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#db4900]/10">
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-semibold text-white transition-colors duration-300">
                          Top 10 Ads
                        </h2>
                        <Button
                          variant="ghost"
                          onClick={() => router.push("/top10ads")}
                          className="text-[#db4900] hover:bg-[#db4900]/20 hover:text-[#ff5722] text-sm transition-all duration-300"
                        >
                          View All Ads
                        </Button>
                      </div>
                      <p className="text-white/50 text-sm mt-1 transition-colors duration-300">
                        Discover the highest performing ads on adalyze AI
                      </p>
                    </div>


                    {/* Top 10 Ads Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {top10Ads.length > 0 ? (
                        top10Ads.map((ad, index) => renderAdCard(ad, index))
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-400">
                          <p>No top ads available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Row 6 - Top 10 Trending Ads */}
              {userDetails?.package_id === 3 || userDetails?.package_id === 4 && (
                <div className="col-span-full pb-12 sm:pb-18">
                  <div className="bg-black rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#db4900]/10">
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-white transition-colors duration-300">
                            Top 10 Trending Ads
                          </h2>
                          {trendingTimeFrame && (
                            <p className="text-white/40 text-xs mt-0.5">
                              {trendingTimeFrame}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => router.push("/top10trendingads")}
                          className="text-[#db4900] hover:bg-[#db4900]/20 hover:text-[#ff5722] text-sm transition-all duration-300"
                        >
                          View All Ads
                        </Button>
                      </div>
                      <p className="text-white/50 text-sm mt-1 transition-colors duration-300">
                        Discover the most trending ads on adalyze AI
                      </p>
                    </div>


                    {/* Top 10 Trending Ads Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {trendingAds.length > 0 ? (
                        trendingAds.map((ad, index) => renderAdCard(ad, index))
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-400">
                          <p>No trending ads available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 right-6 z-50 md:hidden">
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-[#db4900]/40 text-white  shadow-lg hover:bg-[#db4900]/30 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-[#db4900]/30"
        >
          <Upload className="w-4 h-4 font-bold" />
          <span className="text-sm font-semibold">Upload Ad</span>
        </button>
      </div>

      {showLimitPopup && <LimitExceededPopup />}

      {showExpertPopup && (
        <ExpertConsultationPopup
          isOpen={showExpertPopup}
          onClose={() => setShowExpertPopup(false)}
          onSubmit={submitExpertRequest}
        />
      )}

      {showAllGlobalInsightsPopup && <AllGlobalInsightsPopup />}

      {showUpgradePopup && <UpgradeCongratulationsPopup />}

      {showAddBrandPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddBrandPopup(false)}
          />
          {/* Popup Content */}
          <AddBrandForm
            onCancel={() => setShowAddBrandPopup(false)}
            onAdded={async () => {
              setShowAddBrandPopup(false)
              router.push("/upload")
            }}
            userDetails={userDetails}
          />
        </div>
      )}
    </UserLayout>
  )
}
