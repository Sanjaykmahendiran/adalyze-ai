"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Trash2, Facebook, Instagram, MessageCircle, FileImage, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import NoDataFoundImage from "@/assets/no-data-found.webp";
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import MyAdsSkeleton from "@/components/Skeleton-loading/myads-loading"

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
} as const;

// Map platform names that might come from API
const platformMapping: Record<string, string> = {
    facebook: "facebook",
    instagram: "instagram",
    whatsapp: "whatsapp",
    flyer: "flyer",
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
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPlatform, setSelectedPlatform] = useState("all")
    const [ads, setAds] = useState<Ad[]>([])
    const [abAds, setAbAds] = useState<ABAdPair[]>([])
    const [loading, setLoading] = useState(true)
    const [abLoading, setAbLoading] = useState(false)
    const [scoreFilter, setScoreFilter] = useState("all")
    const [activeTab, setActiveTab] = useState<"ads" | "ab-ads">("ads")

    // Delete functionality states
    const [deleteLoading, setDeleteLoading] = useState<number[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [adToDelete, setAdToDelete] = useState<number | null>(null)
    const [abDeleteLoading, setAbDeleteLoading] = useState<number[]>([])
    const [abDeleteDialogOpen, setAbDeleteDialogOpen] = useState(false)
    const [abAdToDelete, setAbAdToDelete] = useState<{ adA: number, adB: number } | null>(null)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Fetch regular ads from API
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const userId = Cookies.get('userId')

                if (!userId) {
                    toast.error('Please login to view your ads')
                    router.push('/login')
                    return
                }

                const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=adslist&user_id=${userId}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch ads')
                }

                const apiAds: Ad[] = await response.json()
                setAds(apiAds)

            } catch (error) {
                console.error('Error fetching ads:', error)
                toast.error('Failed to load ads. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchAds()
    }, [router])

    // Fetch A/B ads from API
    const fetchAbAds = async () => {
        if (abAds.length > 0) return // Already loaded

        setAbLoading(true)
        try {
            const userId = Cookies.get('userId')

            if (!userId) {
                toast.error('Please login to view your A/B ads')
                return
            }

            const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=abadslist&user_id=${userId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch A/B ads')
            }

            const apiAbAds: ABAdPair[] = await response.json()
            setAbAds(apiAbAds)

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

    // Single ad delete function
    const handleDeleteAd = async (adId: number) => {
        setDeleteLoading(prev => [...prev, adId])

        try {
            const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=deletead&ad_upload_id=${adId}`)

            if (!response.ok) {
                throw new Error('Failed to delete ad')
            }

            const result = await response.json()

            if (result.response === "Ad Deleted") {
                toast.success("Ad deleted successfully")
                setAds(prev => prev.filter(ad => ad.ad_id !== adId))
            } else {
                throw new Error('Unexpected response from server')
            }
        } catch (error) {
            console.error('Error deleting ad:', error)
            toast.error('Failed to delete ad. Please try again.')
        } finally {
            setDeleteLoading(prev => prev.filter(id => id !== adId))
            setDeleteDialogOpen(false)
            setAdToDelete(null)
        }
    }

    const handleDeleteAbAd = async (adAId: number, adBId: number) => {
        setAbDeleteLoading(prev => [...prev, adAId, adBId])

        try {
            const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=deleteabad&ad_upload_id_a=${adAId}&ad_upload_id_b=${adBId}`)
            if (!response.ok) throw new Error("Failed to delete A/B ad")

            const result = await response.json()
            if (result.response === "A/B Ad Deleted") {
                toast.success("A/B ad deleted successfully")
                setAbAds(prev => prev.filter(pair => pair.ad_a.ad_id !== adAId && pair.ad_b.ad_id !== adBId))
            } else {
                throw new Error("Unexpected server response")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete A/B ad. Please try again.")
        } finally {
            setAbDeleteLoading(prev => prev.filter(id => id !== adAId && id !== adBId))
            setAbDeleteDialogOpen(false)
            setAbAdToDelete(null)
        }
    }


    // Fixed filtering logic for regular ads
    const filteredAds = ads.filter((ad) => {
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

        return matchesSearch && matchesPlatform && matchesScore
    })

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
                className="bg-black border border-[#3d3d3d] rounded-lg overflow-hidden hover:border-[#db4900]/50 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
            >
                <div className="relative">
                    <img
                        src={ad.image_path}
                        alt={ad.ads_name}
                        className="w-full aspect-square object-cover transform group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                    />
                    {ad.score > 0 && (
                        <div className="absolute top-2 right-2">
                            <Badge className="bg-white text-lg font-semibold text-primary shadow-xl shadow-[#db4900]/20">
                                {ad.score}
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3
                            className="font-medium text-sm truncate text-white"
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
                                        className="w-4 h-4 text-[#db4900]"
                                        aria-label={platform}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30">
                            {ad.ads_type}
                        </Badge>

                        <p className="text-xs text-gray-300">{dateFormatted}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div className="flex-1 min-w-0">
                            <Button
                                onClick={() => router.push(`/results?ad_id=${ad.ad_id}`)}
                                size="sm"
                                variant="outline"
                                className="w-full text-[#db4900] border-[#db4900] hover:bg-[#db4900] hover:text-white transition-colors"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                View Report
                            </Button>
                        </div>
                        <div className="flex-shrink-0">
                            <AlertDialog open={deleteDialogOpen && adToDelete === ad.ad_id} onOpenChange={(open) => {
                                if (!open) {
                                    setDeleteDialogOpen(false)
                                    setAdToDelete(null)
                                }
                            }}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        aria-label="Delete ad"
                                        className="border-[#3d3d3d] text-red-400 hover:text-red-300 hover:border-red-400 bg-transparent transition-colors"
                                        onClick={() => {
                                            setAdToDelete(ad.ad_id)
                                            setDeleteDialogOpen(true)
                                        }}
                                        disabled={deleteLoading.includes(ad.ad_id)}
                                    >
                                        {deleteLoading.includes(ad.ad_id) ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3 h-3" />
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#1a1a1a] border-[#3d3d3d]">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete Ad</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-300">
                                            Are you sure you want to delete "{ad.ads_name}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-transparent border-[#3d3d3d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white">
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteAd(ad.ad_id)}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={deleteLoading.includes(ad.ad_id)}
                                        >
                                            {deleteLoading.includes(ad.ad_id) ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                'Delete'
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderAbAdCard = (abAdPair: ABAdPair, index: number) => {
        if (!abAdPair || !abAdPair.ad_a || !abAdPair.ad_b) return null
        return (
            <div
                key={index}
                className="bg-black rounded-lg overflow-hidden group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
            >
                <div className="p-4">
                    <h3 className="font-medium text-white mb-4 text-center">A/B Test Pair</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Ad A */}
                        <div className="space-y-2">
                            <div className="relative">
                                <img
                                    src={abAdPair.ad_a.image_path}
                                    alt={abAdPair.ad_a.ads_name}
                                    className="w-full aspect-square object-cover rounded-md group-hover:scale-105 transition-all duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                />
                                <div className="absolute top-1 left-1">
                                    <Badge className="bg-blue-600 text-white text-xs">A</Badge>
                                </div>
                                {abAdPair.ad_a.score > 0 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-white text-sm font-semibold text-primary shadow-xl shadow-[#db4900]/20">
                                            {abAdPair.ad_a.score}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-300 truncate" title={abAdPair.ad_a.ads_name}>
                                {abAdPair.ad_a.ads_name}
                            </p>
                        </div>

                        {/* Ad B */}
                        <div className="space-y-2">
                            <div className="relative">
                                <img
                                    src={abAdPair.ad_b.image_path}
                                    alt={abAdPair.ad_b.ads_name}
                                    className="w-full aspect-square object-cover rounded-md group-hover:scale-105 transition-all duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                />
                                <div className="absolute top-1 left-1">
                                    <Badge className="bg-green-600 text-white text-xs">B</Badge>
                                </div>
                                {abAdPair.ad_b.score > 0 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-white text-sm font-semibold text-primary shadow-xl shadow-[#db4900]/20">
                                            {abAdPair.ad_b.score}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-300 truncate" title={abAdPair.ad_b.ads_name}>
                                {abAdPair.ad_b.ads_name}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#3d3d3d]">
                        <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                {abAdPair.ad_a.industry ? abAdPair.ad_a.industry : "General"}
                            </Badge>
                            <p className="text-xs text-gray-300">{formatDate(abAdPair.ad_a.uploaded_on)}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    router.push(
                                        `/ab-results?ad_id_a=${abAdPair.ad_a.ad_id}&ad_id_b=${abAdPair.ad_b.ad_id}`
                                    )
                                }
                                size="sm"
                                variant="outline"
                                className="flex-1 text-[#db4900] border-[#db4900] hover:bg-[#db4900] hover:text-white transition-colors"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                View A/B Report
                            </Button>

                            {/* Delete A/B Ad */}
                            <div className="flex-shrink-0">
                                <AlertDialog
                                    open={abDeleteDialogOpen && abAdToDelete?.adA === abAdPair.ad_a.ad_id}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setAbDeleteDialogOpen(false)
                                            setAbAdToDelete(null)
                                        }
                                    }}
                                >
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            aria-label="Delete A/B test"
                                            className="border-[#3d3d3d] text-red-400 hover:text-red-300 hover:border-red-400 bg-transparent transition-colors"
                                            onClick={() => {
                                                setAbAdToDelete({ adA: abAdPair.ad_a.ad_id, adB: abAdPair.ad_b.ad_id })
                                                setAbDeleteDialogOpen(true)
                                            }}
                                            disabled={abDeleteLoading.includes(abAdPair.ad_a.ad_id)}
                                        >
                                            {abDeleteLoading.includes(abAdPair.ad_a.ad_id) ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3 h-3" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-[#1a1a1a] border-[#3d3d3d]">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Delete A/B Test</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-300">
                                                Are you sure you want to delete this A/B test? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-transparent border-[#3d3d3d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() =>
                                                    abAdToDelete &&
                                                    handleDeleteAbAd(abAdToDelete.adA, abAdToDelete.adB)
                                                }
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                disabled={abDeleteLoading.includes(abAdPair.ad_a.ad_id)}
                                            >
                                                {abDeleteLoading.includes(abAdPair.ad_a.ad_id) ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete'
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const totalPages = (items: any[]) => Math.ceil(items.length / itemsPerPage);

    const paginatedAds = filteredAds.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const paginatedAbAds = filteredAbAds.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedPlatform, scoreFilter, activeTab]);


    return (
        <UserLayout userDetails={userDetails}>
            {loading ? <MyAdsSkeleton /> : (
                <div className="w-full min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
                    <div className="mb-8">
                        <div>
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold mb-4">My Ads</h1>
                                <Button
                                    onClick={() => router.push(activeTab === "ads" ? "/upload" : "/ab-test")}
                                    className="bg-[#db4900] hover:bg-[#db4900]/90 flex items-center justify-center"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">
                                        {activeTab === "ads" ? "Upload New Ad" : "Upload New A/B Ad"}
                                    </span>
                                </Button>

                            </div>
                            <p className="text-gray-300 text-sm">
                                Manage and analyze your creative assets here
                            </p>
                        </div>
                        <div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-black rounded-lg p-6 mb-8 border border-[#3d3d3d]">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                                <div className="grid grid-cols-2 sm:grid-cols-1 md:flex gap-4 w-full md:w-auto">
                                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                        <SelectTrigger className="w-full bg-[#171717] border-[#3d3d3d] text-white">
                                            <SelectValue placeholder="Platform" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-[#3d3d3d]">
                                            <SelectItem value="all">All Platforms</SelectItem>
                                            <SelectItem value="facebook">Facebook</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
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
                                </div>
                            )}
                        </div>

                        {/* Filter summary */}
                        {(searchTerm ||
                            (activeTab === "ads" &&
                                (selectedPlatform !== "all" || scoreFilter !== "all"))) && (
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedPlatform("all");
                                            setScoreFilter("all");
                                        }}
                                        className="text-xs h-6 px-2 text-gray-300 hover:text-white"
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-6 bg-[#171717] p-1 rounded-lg border border-[#3d3d3d]">
                        <button
                            onClick={() => setActiveTab("ads")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === "ads"
                                ? "bg-[#db4900] text-white"
                                : "text-gray-300 hover:text-white hover:bg-[#3d3d3d]"
                                }`}
                        >
                            Ads ({ads.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("ab-ads")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === "ab-ads"
                                ? "bg-[#db4900] text-white"
                                : "text-gray-300 hover:text-white hover:bg-[#3d3d3d]"
                                }`}
                        >
                            A/B Ads ({abAds.length})
                        </button>
                    </div>

                    {/* Ads Tab */}
                    {activeTab === "ads" && (
                        <>
                            {/* No ads message */}
                            {filteredAds.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <div className="w-42 h-42 mb-4 mx-auto flex items-center justify-center">
                                        <img
                                            src={NoDataFoundImage.src}
                                            alt="Empty state"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                                        {ads.length === 0 ? "No ads found" : "No ads match your filters"}
                                    </h3>
                                    <p className="text-gray-300 mb-4">
                                        {ads.length === 0
                                            ? "You haven't uploaded any ads yet."
                                            : "Try adjusting your search or filter criteria."}
                                    </p>
                                    {ads.length === 0 ? (
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
                                            }}
                                            className="border-[#3d3d3d] bg-transparent hover:bg-[#3d3d3d]"
                                        >
                                            Clear All Filters
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Ads Grid */}
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {paginatedAds.map(renderAdCard)}
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
                                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                {paginatedAbAds.map(renderAbAdCard)}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Pagination - placeholder for future implementation */}
                    {((activeTab === "ads" && filteredAds.length > 12) ||
                        (activeTab === "ab-ads" && filteredAbAds.length > 12)) && (
                            <div className="flex justify-center mt-8 gap-2">
                                <Button
                                    variant="outline"
                                    className="border-[#3d3d3d] bg-transparent"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </Button>

                                {Array.from({ length: totalPages(activeTab === "ads" ? filteredAds : filteredAbAds) }, (_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        className={`border-[#3d3d3d] ${currentPage === i + 1 ? "bg-[#db4900] text-white" : "bg-transparent"}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}

                                <Button
                                    variant="outline"
                                    className="border-[#3d3d3d] bg-transparent"
                                    disabled={currentPage === totalPages(activeTab === "ads" ? filteredAds : filteredAbAds)}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>

                        )}
                </div>
            )}
        </UserLayout>
    )

}