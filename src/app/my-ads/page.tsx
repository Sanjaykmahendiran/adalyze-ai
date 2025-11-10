"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Eye, Facebook, Instagram, MessageCircle, FileImage, Upload, Loader2, Linkedin, TrendingUp, TrendingDown, Share, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import NoDataFoundImage from "@/assets/no-data-found.webp";
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import MyAdsSkeleton from "@/components/Skeleton-loading/myads-loading"
import { useAdNavigation } from "@/hooks/useAdNavigation"
import Cookies from "js-cookie";


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

// Define the A/B Ad interface
interface ABAdPair {
    ad_a: Ad
    ad_b: Ad
}

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
    const userId = Cookies.get('userId')
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPlatform, setSelectedPlatform] = useState("all")
    const [ads, setAds] = useState<Ad[]>([])
    const [allAds, setAllAds] = useState<Ad[]>([]) // Store all ads for filtering
    const [abAds, setAbAds] = useState<ABAdPair[]>([])
    const [loading, setLoading] = useState(true)
    const [abLoading, setAbLoading] = useState(false)
    const [scoreFilter, setScoreFilter] = useState("all")
    const [adTypeFilter, setAdTypeFilter] = useState("all")
    const [clientBrands, setClientBrands] = useState<Array<{ brand_id: number; brand_name: string }>>([])
    const [clientBrandsLoading, setClientBrandsLoading] = useState(false)
    const [selectedBrandId, setSelectedBrandId] = useState<string>("")
    const handleBrandChange = useCallback((val: string) => {
        setSelectedBrandId(val)
    }, [])

    // Initialize with default safe values
    const [activeTab, setActiveTab] = useState<"ads" | "ab-ads">("ads");
    const [currentPage, setCurrentPage] = useState(1);

    // Hydrate from sessionStorage after mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Restore tab
            const savedTab = sessionStorage.getItem('my-ads-active-tab');
            if (savedTab === "ab-ads" || savedTab === "ads") {
                setActiveTab(savedTab);
            }
            // Restore page for the tab
            const storageKey = savedTab === 'ab-ads' ? 'my-ads-page-ab' : 'my-ads-page-ads';
            const savedPage = sessionStorage.getItem(storageKey);
            if (savedPage) setCurrentPage(parseInt(savedPage, 10));
        }
    }, []);

    // Use the new ad navigation hook
    const { navigateToAdResults, navigateToABResults } = useAdNavigation()

    // Function to handle tab switching with session storage
    const handleTabChange = (tab: "ads" | "ab-ads") => {
        if (typeof window !== 'undefined') {
            const currentStorageKey = activeTab === 'ab-ads' ? 'my-ads-page-ab' : 'my-ads-page-ads';
            sessionStorage.setItem(currentStorageKey, currentPage.toString());

            sessionStorage.setItem('my-ads-active-tab', tab);
            const newStorageKey = tab === 'ab-ads' ? 'my-ads-page-ab' : 'my-ads-page-ads';
            const savedPage = sessionStorage.getItem(newStorageKey);
            const pageToRestore = savedPage ? parseInt(savedPage, 10) : 1;

            setActiveTab(tab);
            setCurrentPage(pageToRestore);
        } else {
            setActiveTab(tab);
            setCurrentPage(1);
        }
    };

    // Pagination states - initialize from sessionStorage to preserve page when navigating back
    const itemsPerPage = 12;
    const [totalAds, setTotalAds] = useState(0);
    const [totalAbAds, setTotalAbAds] = useState(0);

    // On mount, fetch abAds count so it shows early in the tab
    useEffect(() => {
        const fetchAbAdsCount = async () => {
            try {
                if (!userId) return;
                const response = await fetch(`/api/abadslist?user_id=${userId}`);
                if (!response.ok) return;
                const rawAbAds = await response.json();
                setTotalAbAds(Array.isArray(rawAbAds) ? rawAbAds.length : 0);
            } catch (e) {
                setTotalAbAds(0);
            }
        };
        fetchAbAdsCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    useEffect(() => {
        const shouldFetch = userId && userDetails?.type === "2"
        if (!shouldFetch) return

        const fetchBrands = async () => {
            try {
                setClientBrandsLoading(true)
                const resp = await fetch(`/api/brandslist?user_id=${userDetails?.user_id}`)
                if (!resp.ok) throw new Error('Failed to fetch brands list')
                const data = await resp.json()
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

    // Helper function to build API URL with filters
    // Only sends filter parameters to API when a specific filter is selected (not "all" or empty)
    const buildAdsListUrl = (offset: number, limit: number) => {
        if (!userId) return ''

        const baseUrl = `/api/adslist?user_id=${userId}&offset=${offset}&limit=${limit}`
        const params: string[] = []

        // Only add brand_id parameter if a specific brand is selected (not empty and not "All Brands")
        if (selectedBrandId && selectedBrandId.trim() !== "" && selectedBrandId !== "All Brands") {
            params.push(`brand_id=${encodeURIComponent(selectedBrandId)}`)
        }

        // Only add platform parameter if a specific platform is selected (not "all")
        if (selectedPlatform && selectedPlatform.trim() !== "" && selectedPlatform !== "all") {
            params.push(`platform=${encodeURIComponent(selectedPlatform)}`)
        }

        // Only add score parameter if a specific score range is selected (not "all")
        if (scoreFilter && scoreFilter.trim() !== "" && scoreFilter !== "all") {
            params.push(`score=${encodeURIComponent(scoreFilter)}`)
        }

        // Only add ad_type parameter if a specific ad type is selected (not "all")
        if (adTypeFilter && adTypeFilter.trim() !== "" && adTypeFilter !== "all") {
            params.push(`ad_type=${encodeURIComponent(adTypeFilter)}`)
        }

        // Only append filter parameters if any filters are selected
        return params.length > 0 ? `${baseUrl}&${params.join('&')}` : baseUrl
    }

    // Fetch all ads for filtering (no pagination)
    const fetchAllAds = async () => {
        try {
            if (!userId) return

            // Fetch all user's ads with a high limit (replace 1000 with larger value if needed)
            const url = buildAdsListUrl(0, 1000)
            if (!url) return

            const response = await fetch(url)

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

    // Fetch regular ads from API with pagination
    const fetchAds = async () => {
        setLoading(true)
        try {

            if (!userId) {
                toast.error('Please login to view your ads')
                router.push('/login')
                return
            }

            const offset = (currentPage - 1) * itemsPerPage
            const url = buildAdsListUrl(offset, itemsPerPage)
            if (!url) {
                setLoading(false)
                return
            }

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Failed to fetch ads')
            }

            const data: AdsApiResponse = await response.json()
            setAds(data.ads)
            setTotalAds(data.total)
            // Removed fetchAllAds() from here to prevent double API call
        } catch (error) {
            console.error('Error fetching ads:', error)
            toast.error('Failed to load ads. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Fetch ads when page loads, pagination changes, or filters change
    useEffect(() => {
        if (activeTab === "ads") {
            fetchAds();
            // Only fetch all ads for client filtering if a filter or search is active, and we haven't fetched them yet
            if (hasActiveFilters && allAds.length === 0) {
                fetchAllAds();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, selectedPlatform, scoreFilter, adTypeFilter, selectedBrandId, activeTab]);

    // Fetch A/B ads from API
    const fetchAbAds = async () => {
        if (abAds.length > 0) return // Already loaded

        setAbLoading(true)
        try {
            if (!userId) {
                toast.error('Please login to view your A/B ads')
                return
            }

            const response = await fetch(`/api/abadslist?user_id=${userId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch A/B ads')
            }

            const rawAbAds: any = await response.json()
            const normalizedAbAds: ABAdPair[] = (rawAbAds || []).map((pair: any) => {
                const adA = pair?.ad_a || {}
                const adB = pair?.ad_b || {}
                return {
                    ad_a: {
                        ...adA,
                        go_nogo: adA.go_nogo ?? adA.go_nogoA ?? "",
                    },
                    ad_b: {
                        ...adB,
                        go_nogo: adB.go_nogo ?? adB.go_nogoB ?? "",
                    },
                }
            })

            setAbAds(normalizedAbAds)
            setTotalAbAds(normalizedAbAds.length)

        } catch (error) {
            console.error('Error fetching A/B ads:', error)
            toast.error('Failed to load A/B ads. Please try again.')
        } finally {
            setAbLoading(false)
        }
    }

    // Load A/B ads when tab is switched
    useEffect(() => {
        if (activeTab === "ab-ads") {
            fetchAbAds()
        }
    }, [activeTab])

    // Check if any filters are active
    const hasActiveFilters = searchTerm !== "" || selectedPlatform !== "all" ||
        scoreFilter !== "all" || adTypeFilter !== "all"

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

    // Filter A/B ads based on search term
    const filteredAbAds = abAds.filter((abAdPair) => {
        if (searchTerm === "") return true

        return abAdPair.ad_a.ads_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            abAdPair.ad_b.ads_name.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const renderAdCard = (ad: Ad) => {
        const platformList = parsePlatforms(ad.platforms)
        const dateFormatted = formatDate(ad.uploaded_on)

        return (
            <div
                key={ad.ad_id}
                className="bg-black border border-[#3d3d3d] rounded-lg overflow-hidden hover:border-[#db4900]/50 group md:hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
            >
                <div
                    onClick={() => navigateToAdResults(ad.ad_id.toString(), userDetails?.user_id)}
                    className="relative cursor-pointer">
                    <img
                        src={ad.image_path}
                        alt={ad.ads_name}
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-square object-cover transform group-hover:scale-105 transition-all duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />

                </div>

                <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 min-w-0">
                        <h3
                            className="font-medium text-xs sm:text-sm truncate text-white max-w-[70%]"
                            title={ad.ads_name}
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

    const renderAbAdCard = (abAdPair: ABAdPair, index: number) => {
        if (!abAdPair || !abAdPair.ad_a || !abAdPair.ad_b) return null

        const platformListA = parsePlatforms(abAdPair.ad_a.platforms)
        const platformListB = parsePlatforms(abAdPair.ad_b.platforms)
        const dateFormatted = formatDate(abAdPair.ad_a.uploaded_on)

        return (
            <div
                key={index}
                className="bg-black border border-[#3d3d3d] rounded-lg overflow-hidden hover:border-[#db4900]/50 group md:hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
            >
                <div className="p-3 sm:p-4">
                    <h3 className="font-medium text-white mb-3 sm:mb-4 text-center text-sm sm:text-base">A/B Test Pair</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Ad A */}
                        <div className="space-y-2">
                            <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                    navigateToABResults(
                                        abAdPair.ad_a.ad_id.toString(),
                                        abAdPair.ad_b.ad_id.toString(),
                                        userDetails?.user_id
                                    )
                                }
                            >
                                <img
                                    src={abAdPair.ad_a.image_path}
                                    alt={abAdPair.ad_a.ads_name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full aspect-square object-cover rounded-md transform group-hover:scale-105 transition-all duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                                />

                                <div className="absolute top-1 left-1">
                                    <Badge className="bg-blue-600 text-white text-xs">A</Badge>
                                </div>
                            </div>

                            {/* Ad A Details */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between min-w-0">
                                    <p
                                        className="text-xs text-gray-300 truncate flex-1 max-w-[70%]"
                                        title={abAdPair.ad_a.ads_name}
                                    >
                                        {abAdPair.ad_a.ads_name}
                                    </p>
                                    <div className="flex gap-1 flex-shrink-0">
                                        {platformListA.map((platform, idx) => {
                                            const Icon = platformIcons[platform as keyof typeof platformIcons] || FileImage;
                                            return (
                                                <Icon
                                                    key={idx}
                                                    className="w-2 h-2 sm:w-3 sm:h-3 text-[#db4900]"
                                                    aria-label={platform}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    {abAdPair.ad_a.score > 0 ? (
                                        <div className="text-xs text-gray-300">
                                            Score: <span className="text-primary font-semibold">{abAdPair.ad_a.score}</span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500">Score: <span className="text-gray-400">N/A</span></div>
                                    )}
                                </div>

                                <div className={`w-full px-1 sm:px-2 py-1 rounded-md flex items-center justify-center gap-1 text-xs font-semibold ${abAdPair.ad_a.go_nogo === "Go"
                                    ? "bg-green-600/20 text-green-400 border border-green-600"
                                    : abAdPair.ad_a.go_nogo === "No-Go"
                                        ? "bg-red-600/20 text-red-400 border border-red-600"
                                        : "bg-gray-600/20 text-gray-400 border border-gray-600"
                                    }`}>
                                    {abAdPair.ad_a.go_nogo === "Go" && <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />}
                                    {abAdPair.ad_a.go_nogo === "No-Go" && <TrendingDown className="w-2 h-2 sm:w-3 sm:h-3" />}
                                    <span>{abAdPair.ad_a.go_nogo || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Ad B */}
                        <div className="space-y-2">
                            <div
                                className="relative cursor-pointer"
                                onClick={() =>
                                    navigateToABResults(
                                        abAdPair.ad_a.ad_id.toString(),
                                        abAdPair.ad_b.ad_id.toString(),
                                        userDetails?.user_id
                                    )
                                }
                            >
                                <img
                                    src={abAdPair.ad_b.image_path}
                                    alt={abAdPair.ad_b.ads_name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full aspect-square object-cover rounded-md transform group-hover:scale-105 transition-all duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                                />

                                <div className="absolute top-1 left-1">
                                    <Badge className="bg-green-600 text-white text-xs">B</Badge>
                                </div>
                            </div>

                            {/* Ad B Details */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between min-w-0">
                                    <p
                                        className="text-xs text-gray-300 truncate flex-1 max-w-[70%]"
                                        title={abAdPair.ad_b.ads_name}
                                    >
                                        {abAdPair.ad_b.ads_name}
                                    </p>
                                    <div className="flex gap-1 flex-shrink-0">
                                        {platformListB.map((platform, idx) => {
                                            const Icon = platformIcons[platform as keyof typeof platformIcons] || FileImage;
                                            return (
                                                <Icon
                                                    key={idx}
                                                    className="w-2 h-2 sm:w-3 sm:h-3 text-[#db4900]"
                                                    aria-label={platform}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    {abAdPair.ad_b.score > 0 ? (
                                        <div className="text-xs text-gray-300">
                                            Score: <span className="text-primary font-semibold">{abAdPair.ad_b.score}</span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500">Score: <span className="text-gray-400">N/A</span></div>
                                    )}
                                </div>

                                <div className={`w-full px-1 sm:px-2 py-1 rounded-md flex items-center justify-center gap-1 text-xs font-semibold ${abAdPair.ad_b.go_nogo === "Go"
                                    ? "bg-green-600/20 text-green-400 border border-green-600"
                                    : abAdPair.ad_b.go_nogo === "No-Go"
                                        ? "bg-red-600/20 text-red-400 border border-red-600"
                                        : "bg-gray-600/20 text-gray-400 border border-gray-600"
                                    }`}>
                                    {abAdPair.ad_b.go_nogo === "Go" && <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />}
                                    {abAdPair.ad_b.go_nogo === "No-Go" && <TrendingDown className="w-2 h-2 sm:w-3 sm:h-3" />}
                                    <span>{abAdPair.ad_b.go_nogo || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#3d3d3d]">
                        <div className="flex items-center justify-between mb-3 min-w-0">
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                {abAdPair.ad_a.industry ? abAdPair.ad_a.industry : "General"}
                            </Badge>
                            <p className="text-xs text-gray-400">{dateFormatted}</p>
                        </div>

                        <Button
                            onClick={() =>
                                navigateToABResults(
                                    abAdPair.ad_a.ad_id.toString(),
                                    abAdPair.ad_b.ad_id.toString(),
                                    userDetails?.user_id
                                )
                            }
                            size="sm"
                            variant="outline"
                            className="w-full text-white bg-[#db4900] border-[#db4900] hover:bg-white hover:text-[#db4900] transition-colors text-xs sm:text-sm"
                        >
                            <Eye className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">View A/B Report</span>
                            <span className="sm:hidden">View Report</span>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Calculate total pages based on total count from API or filtered results
    const totalPagesForAds = hasActiveFilters
        ? Math.ceil(filteredAds.length / itemsPerPage)
        : Math.ceil(totalAds / itemsPerPage)

    const totalPagesForAbAds = searchTerm !== ""
        ? Math.ceil(filteredAbAds.length / itemsPerPage)
        : Math.ceil(totalAbAds / itemsPerPage)

    // When filters are active, use client-side pagination on filtered results
    // Otherwise, display the ads directly from API (already paginated)
    const displayAds = hasActiveFilters
        ? filteredAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : ads

    const displayAbAds = searchTerm !== ""
        ? filteredAbAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : abAds

    // Save current page to sessionStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storageKey = activeTab === 'ab-ads' ? 'my-ads-page-ab' : 'my-ads-page-ads'
            sessionStorage.setItem(storageKey, currentPage.toString())
        }
    }, [currentPage, activeTab])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
        // Save the reset to sessionStorage
        if (typeof window !== 'undefined') {
            const storageKey = activeTab === 'ab-ads' ? 'my-ads-page-ab' : 'my-ads-page-ads'
            sessionStorage.setItem(storageKey, '1')
        }
    }, [searchTerm, selectedPlatform, scoreFilter, adTypeFilter, activeTab]);


    return (
        <UserLayout userDetails={userDetails}>
            {loading ? <MyAdsSkeleton /> : (
                <div className="w-full min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-28  pt-4">
                    <div className="mb-6 sm:mb-8">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">My Ads</h1>
                                    <p className="text-gray-300 text-sm">
                                        Manage and analyze your creative assets here
                                    </p>
                                </div>
                                <Button
                                    onClick={() => router.push(activeTab === "ads" ? "/upload" : "/ab-test")}
                                    className="bg-[#db4900] hover:bg-[#db4900]/90 flex items-center justify-center w-full sm:w-auto"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span className="ml-2">
                                        {activeTab === "ads" ? "Upload New Ad" : "Upload New A/B Ad"}
                                    </span>
                                </Button>
                            </div>
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
                            {activeTab === "ads" && (
                                <>
                                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${userDetails?.type === "2" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3 sm:gap-4`}>
                                        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                            <SelectTrigger className="w-full bg-[#171717] border-[#3d3d3d] text-white">
                                                <SelectValue placeholder="Platform" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1a1a] border-[#3d3d3d] max-h-60 overflow-auto">
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
                                            <SelectContent className="bg-[#171717] border-[#3d3d3d] max-h-60 overflow-auto">
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
                                            <SelectContent className="bg-[#171717] border-[#3d3d3d] max-h-60 overflow-auto">
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="single">Single</SelectItem>
                                                <SelectItem value="carousel">Carousel</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {userDetails?.type === "2" && (
                                            <Select
                                                value={selectedBrandId}
                                                onValueChange={handleBrandChange}
                                                disabled={clientBrandsLoading}
                                            >
                                                <SelectTrigger className="w-full bg-[#171717] border-[#3d3d3d] text-white">
                                                    <SelectValue
                                                        placeholder={
                                                            clientBrandsLoading
                                                                ? "Loading..."
                                                                : clientBrands.length === 0
                                                                    ? "No Brands"
                                                                    : "Select Brand"
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#171717] border-[#3d3d3d] max-h-60 overflow-auto">
                                                    <SelectItem value="All Brands">All Brands</SelectItem>
                                                    {clientBrandsLoading && (
                                                        <SelectItem value="__loading" disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    )}
                                                    {!clientBrandsLoading && clientBrands.length === 0 && (
                                                        <SelectItem value="__no_brands" disabled>
                                                            No brands
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
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Filter summary */}
                        {(searchTerm ||
                            (activeTab === "ads" &&
                                (selectedPlatform !== "all" || scoreFilter !== "all" || adTypeFilter !== "all" ||
                                    (selectedBrandId && selectedBrandId !== "" && selectedBrandId !== "All Brands")))) && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#3d3d3d]">
                                    <span className="text-sm text-gray-300">Active filters:</span>
                                    {searchTerm && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Search: "{searchTerm}"
                                        </Badge>
                                    )}
                                    {activeTab === "ads" && selectedPlatform !== "all" && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Platform: {selectedPlatform}
                                        </Badge>
                                    )}
                                    {activeTab === "ads" && scoreFilter !== "all" && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Score: {scoreFilter}
                                        </Badge>
                                    )}
                                    {activeTab === "ads" && adTypeFilter !== "all" && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Type: {adTypeFilter}
                                        </Badge>
                                    )}
                                    {activeTab === "ads" && selectedBrandId && selectedBrandId !== "" && selectedBrandId !== "All Brands" && (
                                        <Badge variant="secondary" className="bg-[#3d3d3d] text-gray-300">
                                            Brand: {clientBrands.find(b => String(b.brand_id) === selectedBrandId)?.brand_name || selectedBrandId}
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
                                            setSelectedBrandId("");
                                        }}
                                        className="text-xs h-6 px-2 text-gray-300 hover:text-white"
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-6 bg-[#171717] p-1 rounded-lg border border-[#3d3d3d] overflow-x-auto">
                        <button
                            onClick={() => handleTabChange("ads")}
                            className={`flex-1 shrink-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === "ads"
                                ? "bg-[#db4900] text-white"
                                : "text-gray-300 hover:text-white hover:bg-[#3d3d3d]"
                                }`}
                        >
                            <span className="hidden sm:inline">Ads ({totalAds})</span>
                            <span className="sm:hidden">Ads</span>
                        </button>
                        <button
                            onClick={() => handleTabChange("ab-ads")}
                            className={`flex-1 shrink-0 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === "ab-ads"
                                ? "bg-[#db4900] text-white"
                                : "text-gray-300 hover:text-white hover:bg-[#3d3d3d]"
                                }`}
                        >
                            <span className="hidden sm:inline">A/B Ads ({totalAbAds})</span>
                            <span className="sm:hidden">A/B</span>
                        </button>
                    </div>

                    {/* Ads Tab */}
                    {activeTab === "ads" && (
                        <>
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
                            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-24">
                                {displayAds.map(renderAdCard)}
                            </div>
                        </>
                    )}

                    {/* A/B Ads Tab */}
                    {activeTab === "ab-ads" && (
                        <>
                            {userDetails?.fretra_status === 1 ? (
                                // Upgrade Prompt for Free Users
                                <div className="text-center py-16 bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg">
                                    <h2 className="text-2xl font-bold text-white mb-4">Upgrade to Pro</h2>
                                    <p className="text-gray-300 mb-6">
                                        A/B Testing is available only for{" "}
                                        <span className="text-[#db4900] font-semibold">Pro users</span>.
                                        Upgrade now to unlock powerful insights for your ads.
                                    </p>
                                    <Button
                                        onClick={() => router.push("/pricing")}
                                        className="bg-[#db4900] hover:bg-[#db4900]/90"
                                    >
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Loading state for A/B ads */}
                                    {abLoading ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-[#db4900]" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* No A/B ads message */}
                                            {filteredAbAds.length === 0 && !abLoading && (
                                                <div className="text-center py-12">
                                                    <div className="w-42 h-42 mb-4 mx-auto flex items-center justify-center">
                                                        <img
                                                            src={NoDataFoundImage.src}
                                                            alt="Empty state"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                                                        {abAds.length === 0 ? "No A/B ads found" : "No A/B ads match your filters"}
                                                    </h3>
                                                    <p className="text-gray-300 mb-4">
                                                        {abAds.length === 0
                                                            ? "You haven't created any A/B tests yet."
                                                            : "Try adjusting your search criteria."}
                                                    </p>
                                                    {abAds.length === 0 ? (
                                                        <Button
                                                            onClick={() => router.push("/ab-test")}
                                                            className="bg-[#db4900] hover:bg-[#db4900]/90"
                                                        >
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Create Your First A/B Test
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setSearchTerm("")}
                                                            className="border-[#3d3d3d] bg-transparent hover:bg-[#3d3d3d]"
                                                        >
                                                            Clear All Filters
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            {/* A/B Ads Grid */}
                                            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-24">
                                                {displayAbAds.map(renderAbAdCard)}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Pagination */}
                    {((activeTab === "ads" && totalPagesForAds > 1) ||
                        (activeTab === "ab-ads" && totalPagesForAbAds > 1)) && (
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
                                    {Array.from({ length: activeTab === "ads" ? totalPagesForAds : totalPagesForAbAds }, (_, i) => (
                                        <Button
                                            key={i}
                                            variant={currentPage === i + 1 ? "default" : "outline"}
                                            className={`border-[#3d3d3d] min-w-[36px] sm:min-w-[40px] ${currentPage === i + 1 ? "bg-[#db4900] text-white" : "bg-transparent hover:bg-[#3d3d3d] text-white"}`}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    className="border-[#3d3d3d] bg-transparent hover:bg-[#3d3d3d] text-white w-full sm:w-auto"
                                    disabled={currentPage === (activeTab === "ads" ? totalPagesForAds : totalPagesForAbAds)}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <span className="sm:hidden">Next →</span>
                                </Button>
                            </div>

                        )}

                    {/* Floating Action Button - Desktop Only */}
                    <div className="hidden md:flex fixed bottom-8 right-8 group">
                        <button
                            onClick={() => router.push("/upload")}
                            className="w-12 h-12 rounded-full bg-primary hover:bg-[#db4900]/90 text-white shadow-lg shadow-black/50 z-50 items-center justify-center transition-all duration-300 hover:scale-110 flex"
                        >
                            <Plus className="w-6 h-6" />
                        </button>

                        {/* Tooltip */}
                        <span className="absolute right-14 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100
                                bg-black text-white text-xs px-3 py-1 rounded-lg shadow-lg border border-[#2a2a2a]
                            transition-all duration-300 whitespace-nowrap">
                            Upload
                        </span>
                    </div>




                </div>
            )}
        </UserLayout>
    )

}