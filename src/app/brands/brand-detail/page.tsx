"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Facebook, Instagram, MessageCircle, FileImage, Upload, Linkedin, TrendingUp, TrendingDown, ArrowLeft, AlertTriangle, X, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import NoDataFoundImage from "@/assets/no-data-found.webp";
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import BrandDetailSkeleton from "@/components/Skeleton-loading/brand-detail-loading"
import { useAdNavigation } from "@/hooks/useAdNavigation"
import { MainStatCard } from "@/app/dashboard/_components/main-status-card"
import TotalAdsAnalyzed from "@/assets/dashboard/total-analyze.png"
import AverageScore from "@/assets/dashboard/average-score.png"
import TotalSuggestions from "@/assets/dashboard/total-suggestion.png"
import UserLayout from "@/components/layouts/user-layout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define the API response interface
interface AdsApiResponse {
    total: number
    limit: number
    offset: number
    ads: Ad[]
}

// Define the Ad interface based on API response
interface Ad {
    ads_type: string
    ad_id: number
    ads_name: string
    image_path: string
    industry: string
    score: number
    platforms: string
    uploaded_on: string
    go_nogo?: string
}

// Brand stats interface from brandslist API (used in @page.tsx)
interface BrandStats {
    brand_id: number
    user_id: number
    brand_name: string
    website: string
    email: string
    mobile: string
    logo_url: string
    verified: number
    created_date: string
    upload_count: number
    average_score: number
    latest_score: number
    last_analysis_date: string
    go_count: number
    no_go_count: number
}

// Define the A/B Ad interface

const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    whatsapp: MessageCircle,
    flyer: FileImage,
    linkedin: Linkedin,
} as const;

// Map platform names that might come from API
const platformMapping: Record<string, string> = {
    facebook: "facebook",
    instagram: "instagram",
    whatsapp: "whatsapp",
    flyer: "flyer",
    linkedin: "linkedin",
    fb: "facebook",
    insta: "instagram",
};

function parsePlatforms(raw: string): string[] {
    if (!raw) return [];
    let list: string[] = [];

    try {
        // First try to parse as JSON
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            list = parsed.map((p) => String(p).trim().toLowerCase());
        } else if (typeof parsed === "string") {
            list = parsed.split(",").map((p) => p.trim().toLowerCase());
        }
    } catch {
        // Fallback: split by comma and clean up
        list = raw.split(",").map((p) => p.trim().toLowerCase());
    }

    // Map aliases and remove duplicates
    return Array.from(
        new Set(
            list
                .map((p) => platformMapping[p] || p)
                .filter(Boolean)
        )
    );
}



// Function to format date
function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export default function MyAdsPage() {
    const { userDetails } = useFetchUserDetails()
    const router = useRouter()
    const searchParams = useSearchParams()
    const brandId = searchParams.get('brand-token')
    const brandName = searchParams.get('brand_name')
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPlatform, setSelectedPlatform] = useState("all")
    const [ads, setAds] = useState<Ad[]>([])
    const [allAds, setAllAds] = useState<Ad[]>([]) // Store all ads for filtering
    const [loading, setLoading] = useState(true)
    const [scoreFilter, setScoreFilter] = useState("all")
    const [adTypeFilter, setAdTypeFilter] = useState("all")
    const [brandStats, setBrandStats] = useState<BrandStats | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Use the new ad navigation hook
    const { navigateToAdResults } = useAdNavigation()

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [totalAds, setTotalAds] = useState(0);

    // Fetch all ads for filtering (no pagination)
    const fetchAllAds = async () => {
        try {
            const userId = Cookies.get('userId')
            if (!userId) return

            const response = await fetch(
                `https://adalyzeai.xyz/App/tapi.php?gofor=adslist&user_id=${userId}&brand_id=${brandId}&offset=0&limit=12`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch all ads')
            }

            const data: AdsApiResponse = await response.json()
            setAllAds(data.ads)
            setTotalAds(data.total)
        } catch (error) {
            console.error('Error fetching all ads:', error)
        }
    }

    // Fetch brand stats for this client from brandslist (same API used in @page.tsx)
    const fetchBrandStats = async () => {
        try {
            const userId = Cookies.get('userId')
            if (!userId || !brandId) return

            const response = await fetch(
                `https://adalyzeai.xyz/App/tapi.php?gofor=brandslist&user_id=${userId}`
            )
            if (!response.ok) throw new Error('Failed to fetch brand stats')
            const data: BrandStats[] = await response.json()
            const current = Array.isArray(data)
                ? data.find((b) => String(b.brand_id) === String(brandId))
                : null
            if (current) setBrandStats(current)
        } catch (error) {
            console.error('Error fetching brand stats:', error)
        }
    }

    // Fetch regular ads from API with pagination
    const fetchAds = async () => {
        setLoading(true)
        try {
            const userId = Cookies.get('userId')

            if (!userId) {
                toast.error('Please login to view your ads')
                // Ensure skeleton stops showing before redirect
                setLoading(false)
                router.push('/login')
                return
            }

            const offset = (currentPage - 1) * itemsPerPage
            const response = await fetch(
                `https://adalyzeai.xyz/App/tapi.php?gofor=adslist&user_id=${userId}&brand_id=${brandId}&offset=${offset}&limit=${itemsPerPage}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch ads')
            }

            const data: AdsApiResponse = await response.json()
            setAds(data.ads)
            setTotalAds(data.total)
            // Removed fetchAllAds call from here to avoid duplicate request

        } catch (error) {
            console.error('Error fetching ads:', error)
            toast.error('Failed to load ads. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Fetch ads when page loads or pagination changes
    useEffect(() => {
        fetchAds()
        fetchBrandStats()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])

    // Check if any filters are active
    const hasActiveFilters = searchTerm !== "" || selectedPlatform !== "all" ||
        scoreFilter !== "all" || adTypeFilter !== "all"

    // Only fetch allAds when filtering is triggered, allAds is empty, and not loading
    useEffect(() => {
        if (hasActiveFilters && allAds.length === 0 && !loading) {
            fetchAllAds();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasActiveFilters]);

    // A/B ads removed

    // Fixed filtering logic for regular ads (only used when filters are active)
    // Use allAds for filtering to include all results, not just current page
    const filteredAds = hasActiveFilters ? allAds.filter((ad) => {
        // Search filter - check if search term matches ad name (case insensitive)
        const matchesSearch = searchTerm === "" ||
            ad.ads_name.toLowerCase().includes(searchTerm.toLowerCase())

        // Platform filter - properly parse platforms and check
        let matchesPlatform = true
        if (selectedPlatform !== "all") {
            const platformList = parsePlatforms(ad.platforms)
            matchesPlatform = platformList.includes(selectedPlatform)
        }

        // Score filter - check score ranges
        let matchesScore = true
        if (scoreFilter !== "all") {
            switch (scoreFilter) {
                case "90-100":
                    matchesScore = ad.score >= 90 && ad.score <= 100
                    break
                case "80-89":
                    matchesScore = ad.score >= 80 && ad.score < 90
                    break
                case "70-79":
                    matchesScore = ad.score >= 70 && ad.score < 80
                    break
                case "0-69":
                    matchesScore = ad.score >= 0 && ad.score < 70
                    break
                default:
                    matchesScore = true
            }
        }

        // Ad Type filter
        let matchesAdType = true
        if (adTypeFilter !== "all") {
            matchesAdType = ad.ads_type.toLowerCase() === adTypeFilter.toLowerCase()
        }

        return matchesSearch && matchesPlatform && matchesScore && matchesAdType
    }) : []

    // A/B ads removed

    const renderAdCard = (ad: Ad) => {
        const platformList = parsePlatforms(ad.platforms)
        const dateFormatted = formatDate(ad.uploaded_on)

        return (
            <div
                key={ad.ad_id}
                className="bg-black border border-[#3d3d3d] rounded-lg overflow-hidden hover:border-[#db4900]/50 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
            >
                <div
                    onClick={() => navigateToAdResults(ad.ad_id.toString(), userDetails?.user_id)}
                    className="relative cursor-pointer">
                    <img
                        src={ad.image_path}
                        alt={ad.ads_name}
                        className="w-full aspect-square object-cover transform group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                    />
                </div>

                <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3
                            className="font-medium text-xs sm:text-sm truncate text-white"
                            title={ad.ads_name}
                            style={{ maxWidth: "70%" }}
                        >
                            {ad.ads_name}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                            {platformList.map((platform, idx) => {
                                const Icon =
                                    platformIcons[platform as keyof typeof platformIcons] ||
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

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                        {/* Left side - Ad Score (conditionally rendered) */}
                        <div className="flex items-center">
                            {ad.score > 0 ? (
                                <div className="text-sm sm:text-base text-gray-300">
                                    Ad Score: <span className="text-primary font-semibold">{ad.score}</span>
                                </div>
                            ) : (
                                <div className="text-sm sm:text-base text-gray-500">Ad Score: <span className="text-gray-400">N/A</span></div>
                            )}
                        </div>

                        {/* Right side - Date */}
                        <p className="text-xs text-gray-400">{dateFormatted}</p>
                    </div>


                    <div className="flex gap-2 items-center">
                        <div className="flex-1 min-w-0">
                            <div className={`w-full px-2 sm:px-3 py-1 rounded-md flex items-center justify-center gap-1 text-sm sm:text-lg font-semibold ${ad.go_nogo === "Go"
                                ? "bg-green-600/20 text-green-400 border border-green-600"
                                : ad.go_nogo === "No-Go"
                                    ? "bg-red-600/20 text-red-400 border border-red-600"
                                    : "bg-gray-600/20 text-gray-400 border border-gray-600"
                                }`}>
                                {ad.go_nogo === "Go" && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {ad.go_nogo === "No-Go" && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                                <span>{ad.go_nogo || "N/A"}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                            <Button
                                onClick={() => navigateToAdResults(ad.ad_id.toString(), userDetails?.user_id)}
                                size="sm"
                                variant="outline"
                                className="text-white bg-[#db4900] border-[#db4900] hover:bg-white hover:text-[#db4900] transition-colors sm:w-auto sm:h-auto sm:px-3 py-2"
                            >
                                <Eye className="w-3 h-3" />
                                <span className=" sm:inline ml-1">View</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Calculate total pages based on total count from API or filtered results
    const totalPagesForAds = hasActiveFilters
        ? Math.ceil(filteredAds.length / itemsPerPage)
        : Math.ceil(totalAds / itemsPerPage)

    // When filters are active, use client-side pagination on filtered results
    // Otherwise, display the ads directly from API (already paginated)
    const displayAds = hasActiveFilters
        ? filteredAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : ads

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedPlatform, scoreFilter, adTypeFilter]);


    return (
        <UserLayout userDetails={userDetails}>
            {loading ? <BrandDetailSkeleton /> : (
                <div className="w-full min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-28 pt-4">
                    <div className="mb-6 sm:mb-8">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                {/* Left Section - Title + Mobile Menu */}
                                <div className="flex items-center justify-between w-full sm:w-auto">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="bg-black p-2 rounded-full cursor-pointer flex-shrink-0"
                                            onClick={() => router.back()}
                                        >
                                            <ArrowLeft className="cursor-pointer" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{brandName}</h1>
                                            <p className="text-gray-300 text-sm">
                                                Manage and analyze {brandName}'s creative assets here
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mobile 3-dot menu */}
                                    <div className="sm:hidden">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <MoreVertical className="w-6 h-6 text-white" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-[#171717] border border-[#3d3d3d] text-white p-2 space-y-2">
                                                <DropdownMenuItem
                                                    onClick={() => setShowDeleteModal(true)}
                                                    className="text-red-400 border border-red-500/40 bg-red-500/10"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Brand
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push("/upload")}
                                                    className="text-white border border-[#db4900]/40 bg-[#db4900]"
                                                >
                                                    <Upload className="w-4 h-4 mr-2" /> Upload New Ad
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Desktop Buttons */}
                                <div className="hidden sm:flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowDeleteModal(true)}
                                        className="flex items-center border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="ml-2">Delete Brand</span>
                                    </Button>

                                    <Button
                                        onClick={() => router.push("/upload")}
                                        className="bg-[#db4900] hover:bg-[#db4900]/90 flex items-center"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span className="ml-2">Upload New Ad</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mb-6 sm:mb-8">
                        {/* Row 1 - Top 3 Stat Cards */}
                        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            <MainStatCard
                                title="Uploads"
                                value={String((brandStats?.upload_count ?? totalAds) || 0).padStart(2, "0")}
                                subtitle="total uploads for this brand"
                                imageSrc={TotalAdsAnalyzed.src}
                            />

                            <MainStatCard
                                title="Average Score"
                                value={(brandStats?.average_score ?? 0).toFixed(1)}
                                subtitle="average score for this brand"
                                imageSrc={AverageScore.src}
                            />

                            <MainStatCard
                                title="Latest Score"
                                value={String(Math.floor(brandStats?.latest_score ?? 0)).padStart(2, "0")}
                                subtitle="last analyzed score for this brand"
                                imageSrc={TotalSuggestions.src}
                            />
                        </div>
                        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                            <MainStatCard
                                title="Total Go Ads"
                                value={String(brandStats?.go_count || 0).padStart(2, "0")}
                                subtitle="total go ads for this brand"
                                imageSrc={TotalAdsAnalyzed.src}
                            />

                            <MainStatCard
                                title="Total No-Go Ads"
                                value={String(brandStats?.no_go_count || 0).padStart(2, "0")}
                                subtitle="total no-go ads for this brand"
                                imageSrc={AverageScore.src}
                            />

                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-black rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-[#3d3d3d]">
                        <div className="flex flex-col gap-4 mb-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                                <Input
                                    placeholder="Search ads by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-[#171717] border-[#3d3d3d] focus:border-[#db4900] outline-none text-white placeholder:text-gray-300"
                                />
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                    <SelectTrigger className="w-full bg-[#171717] border-[#3d3d3d] text-white">
                                        <SelectValue placeholder="Platform" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[#3d3d3d]">
                                        <SelectItem value="all">All Platforms</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="flyer">Flyer</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                                    <SelectTrigger className="w-full bg-[#171717] border-[#3d3d3d] text-white">
                                        <SelectValue placeholder="Score Range" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#171717] border-[#3d3d3d]">
                                        <SelectItem value="all">All Scores</SelectItem>
                                        <SelectItem value="90-100">90-100 (Excellent)</SelectItem>
                                        <SelectItem value="80-89">80-89 (Good)</SelectItem>
                                        <SelectItem value="70-79">70-79 (Fair)</SelectItem>
                                        <SelectItem value="0-69">Below 70 (Needs Improvement)</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={adTypeFilter} onValueChange={setAdTypeFilter}>
                                    <SelectTrigger className="w-full bg-[#171717] border-[#3d3d3d] text-white">
                                        <SelectValue placeholder="Ad Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#171717] border-[#3d3d3d]">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="carousel">Carousel</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Filter summary */}
                        {(searchTerm ||
                            (selectedPlatform !== "all" || scoreFilter !== "all" || adTypeFilter !== "all")) && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#3d3d3d]">
                                    <span className="text-sm text-gray-300">Active filters:</span>
                                    {searchTerm && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Search: "{searchTerm}"
                                        </Badge>
                                    )}
                                    {selectedPlatform !== "all" && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Platform: {selectedPlatform}
                                        </Badge>
                                    )}
                                    {scoreFilter !== "all" && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Score: {scoreFilter}
                                        </Badge>
                                    )}
                                    {adTypeFilter !== "all" && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Type: {adTypeFilter}
                                        </Badge>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedPlatform("all");
                                            setScoreFilter("all");
                                            setAdTypeFilter("all");
                                        }}
                                        className="text-xs h-6 px-2 text-gray-300 hover:text-white"
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}
                    </div>

                    {/* A/B ads removed */}

                    {/* Ads */}
                    {/* No ads message */}
                    {(hasActiveFilters ? filteredAds.length === 0 : ads.length === 0) && !loading && (
                        <div className="text-center py-12">
                            <div className="w-42 h-42 mb-4 mx-auto flex items-center justify-center">
                                <img
                                    src={NoDataFoundImage.src}
                                    alt="Empty state"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">
                                {totalAds === 0 ? "No ads found" : "No ads match your filters"}
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {totalAds === 0
                                    ? "You haven't uploaded any ads yet."
                                    : "Try adjusting your search or filter criteria."}
                            </p>
                            {totalAds === 0 ? (
                                <Button
                                    onClick={() => router.push("/upload")}
                                    className="bg-[#db4900] hover:bg-[#db4900]/90"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Your First Ad
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedPlatform("all");
                                        setScoreFilter("all");
                                        setAdTypeFilter("all");
                                    }}
                                    className="border-[#3d3d3d] bg-transparent hover:bg-[#3d3d3d]"
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Ads Grid */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayAds.map(renderAdCard)}
                    </div>


                    {/* Pagination */}
                    {(totalPagesForAds > 1) && (
                        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 gap-2 sm:gap-2">
                            <Button
                                variant="outline"
                                className="border-[#3d3d3d] bg-transparent hover:bg-[#3d3d3d] text-white w-full sm:w-auto"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                <span className="hidden sm:inline">Previous</span>
                                <span className="sm:hidden">← Prev</span>
                            </Button>

                            <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-full">
                                {Array.from({ length: totalPagesForAds }, (_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        className={`border-[#3d3d3d] min-w-[40px] ${currentPage === i + 1 ? "bg-[#db4900] text-white" : "bg-transparent hover:bg-[#3d3d3d] text-white"}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                className="border-[#3d3d3d] bg-transparent hover:bg-[#3d3d3d] text-white w-full sm:w-auto"
                                disabled={currentPage === totalPagesForAds}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                <span className="hidden sm:inline">Next</span>
                                <span className="sm:hidden">Next →</span>
                            </Button>
                        </div>

                    )}

                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowDeleteModal(false)}
                            />
                            <div className="relative z-10 w-full max-w-md mx-4">
                                <div className="rounded-lg bg-[#171717] p-6 shadow-xl">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <AlertTriangle className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-2">Delete Brand</h3>
                                            <p className="text-white/80 text-sm">
                                                Are you sure you want to delete {""}
                                                <span className="font-medium text-white">
                                                    "{brandName}"
                                                </span>
                                                ? This cannot be undone.
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDeleteModal(false)}
                                            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowDeleteModal(false)}
                                            className="border-white/20 text-white hover:bg-white/10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={async () => {
                                                if (!brandId) return
                                                setIsDeleting(true)
                                                try {
                                                    const response = await fetch(
                                                        `https://adalyzeai.xyz/App/tapi.php?gofor=deletebrand&brand_id=${brandId}`,
                                                        { method: "DELETE" }
                                                    )
                                                    const result = await response.json()
                                                    if (result?.response === "Brand deleted successfully") {
                                                        toast.success("Brand deleted successfully!")
                                                        setShowDeleteModal(false)
                                                        router.push("/brands")
                                                    } else {
                                                        toast.error("Failed to delete brand")
                                                    }
                                                } catch {
                                                    toast.error("Error deleting brand")
                                                } finally {
                                                    setIsDeleting(false)
                                                }
                                            }}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete Brand"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </UserLayout>
    )

}