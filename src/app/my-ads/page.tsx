"use client"

import { useState, useEffect } from "react"
import { Search, Download, Eye, Trash2, Facebook, Instagram, MessageCircle, FileImage, Upload, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import Spinner from "@/components/overlay"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import MyAdsSkeleton from "@/components/Skeleton-loading/myads-loading"

// Define the Ad interface based on API response
interface Ad {
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

function getScoreColor(score: number) {
    if (score >= 90) return "bg-green-600"
    if (score >= 80) return "bg-blue-600"
    if (score >= 70) return "bg-yellow-600"
    return "bg-red-600"
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
                className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg overflow-hidden hover:border-[#db4900]/50 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300"
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
                            <Badge className={`${getScoreColor(ad.score)} text-white font-semibold`}>
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
                            {ad.industry}
                        </Badge>
                        <p className="text-xs text-gray-400">{dateFormatted}</p>
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
                                        className="border-[#2b2b2b] text-red-400 hover:text-red-300 hover:border-red-400 bg-transparent transition-colors"
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
                                <AlertDialogContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete Ad</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                            Are you sure you want to delete "{ad.ads_name}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-transparent border-[#2b2b2b] text-gray-400 hover:bg-[#2b2b2b] hover:text-white">
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
        return (
            <div
                key={index}
                className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg overflow-hidden hover:border-[#db4900]/50 group shadow-lg shadow-white/5 transition-all duration-300"
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
                                    className="w-full aspect-square object-cover rounded-md"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                />
                                <div className="absolute top-1 left-1">
                                    <Badge className="bg-blue-600 text-white text-xs">A</Badge>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 truncate" title={abAdPair.ad_a.ads_name}>
                                {abAdPair.ad_a.ads_name}
                            </p>
                        </div>

                        {/* Ad B */}
                        <div className="space-y-2">
                            <div className="relative">
                                <img
                                    src={abAdPair.ad_b.image_path}
                                    alt={abAdPair.ad_b.ads_name}
                                    className="w-full aspect-square object-cover rounded-md"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                />
                                <div className="absolute top-1 left-1">
                                    <Badge className="bg-green-600 text-white text-xs">B</Badge>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 truncate" title={abAdPair.ad_b.ads_name}>
                                {abAdPair.ad_b.ads_name}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#2b2b2b]">
                        <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                {abAdPair.ad_a.industry}
                            </Badge>
                            <p className="text-xs text-gray-400">{formatDate(abAdPair.ad_a.uploaded_on)}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.push(`/ab-results?ad_id_a=${abAdPair.ad_a.ad_id}&ad_id_b=${abAdPair.ad_b.ad_id}`)}
                                size="sm"
                                variant="outline"
                                className="flex-1 text-[#db4900] border-[#db4900] hover:bg-[#db4900] hover:text-white transition-colors"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                View A/B Report
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                aria-label="Delete A/B test"
                                className="border-[#2b2b2b] text-red-400 hover:text-red-300 hover:border-red-400 bg-transparent transition-colors"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this A/B test?')) {
                                        toast.error("Delete functionality not implemented yet");
                                    }
                                }}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <UserLayout userDetails={userDetails}>
            {loading ? <MyAdsSkeleton /> : (
                <div className="w-full min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="">
                            <h1 className="text-3xl font-bold mb-2">My Ads</h1>
                            <p className="text-gray-400">
                                Manage and analyze your creative assets here
                            </p>
                        </div>
                        <div>
                            <Button
                                onClick={() => router.push("/upload")}
                                className="bg-[#db4900] hover:bg-[#db4900]/90"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload New Ad
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-[#1a1a1a] rounded-lg p-6 mb-8 border border-[#2b2b2b]">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search ads by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-[#121212] border-[#2b2b2b] focus:border-[#db4900] outline-none text-white placeholder:text-gray-400"
                                />
                            </div>
                            {activeTab === "ads" && (
                                <>
                                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                        <SelectTrigger className="w-full bg-[#121212] sm:w-48 border-[#2b2b2b] text-white">
                                            <SelectValue placeholder="Platform" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                            <SelectItem value="all">All Platforms</SelectItem>
                                            <SelectItem value="facebook">Facebook</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            <SelectItem value="flyer">Flyer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={scoreFilter} onValueChange={setScoreFilter}>
                                        <SelectTrigger className="w-full bg-[#121212] sm:w-48 border-[#2b2b2b] text-white">
                                            <SelectValue placeholder="Score Range" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                            <SelectItem value="all">All Scores</SelectItem>
                                            <SelectItem value="90-100">90-100 (Excellent)</SelectItem>
                                            <SelectItem value="80-89">80-89 (Good)</SelectItem>
                                            <SelectItem value="70-79">70-79 (Fair)</SelectItem>
                                            <SelectItem value="0-69">Below 70 (Needs Improvement)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>

                        {/* Filter summary */}
                        {(searchTerm || (activeTab === "ads" && (selectedPlatform !== "all" || scoreFilter !== "all"))) && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#2b2b2b]">
                                <span className="text-sm text-gray-400">Active filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="bg-[#2b2b2b] text-gray-300">
                                        Search: "{searchTerm}"
                                    </Badge>
                                )}
                                {activeTab === "ads" && selectedPlatform !== "all" && (
                                    <Badge variant="secondary" className="bg-[#2b2b2b] text-gray-300">
                                        Platform: {selectedPlatform}
                                    </Badge>
                                )}
                                {activeTab === "ads" && scoreFilter !== "all" && (
                                    <Badge variant="secondary" className="bg-[#2b2b2b] text-gray-300">
                                        Score: {scoreFilter}
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSelectedPlatform("all")
                                        setScoreFilter("all")
                                    }}
                                    className="text-xs h-6 px-2 text-gray-400 hover:text-white"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-6 bg-[#1a1a1a] p-1 rounded-lg border border-[#2b2b2b]">
                        <button
                            onClick={() => setActiveTab("ads")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === "ads"
                                    ? "bg-[#db4900] text-white"
                                    : "text-gray-400 hover:text-white hover:bg-[#2b2b2b]"
                                }`}
                        >
                            Ads ({ads.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("ab-ads")}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === "ab-ads"
                                    ? "bg-[#db4900] text-white"
                                    : "text-gray-400 hover:text-white hover:bg-[#2b2b2b]"
                                }`}
                        >
                            A/B Ads ({abAds.length})
                        </button>
                    </div>

                    {/* No ads message */}
                    {((activeTab === "ads" && filteredAds.length === 0) ||
                        (activeTab === "ab-ads" && filteredAbAds.length === 0 && !abLoading)) && !loading && (
                            <div className="text-center py-12">
                                <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-300 mb-2">
                                    {activeTab === "ads"
                                        ? (ads.length === 0 ? "No ads found" : "No ads match your filters")
                                        : (abAds.length === 0 ? "No A/B ads found" : "No A/B ads match your filters")
                                    }
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    {activeTab === "ads"
                                        ? (ads.length === 0
                                            ? "You haven't uploaded any ads yet."
                                            : "Try adjusting your search or filter criteria."
                                        )
                                        : (abAds.length === 0
                                            ? "You haven't created any A/B tests yet."
                                            : "Try adjusting your search criteria."
                                        )
                                    }
                                </p>
                                {((activeTab === "ads" && ads.length === 0) || (activeTab === "ab-ads" && abAds.length === 0)) ? (
                                    <Button
                                        onClick={() => router.push("/upload")}
                                        className="bg-[#db4900] hover:bg-[#db4900]/90"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {activeTab === "ads" ? "Upload Your First Ad" : "Create Your First A/B Test"}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm("")
                                            if (activeTab === "ads") {
                                                setSelectedPlatform("all")
                                                setScoreFilter("all")
                                            }
                                        }}
                                        className="border-[#2b2b2b] bg-transparent hover:bg-[#2b2b2b]"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        )}

                    {/* Loading state for A/B ads */}
                    {activeTab === "ab-ads" && abLoading && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#db4900]" />
                        </div>
                    )}

                    {/* Ads Grid */}
                    <div className={`grid gap-6 ${activeTab === "ads"
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        }`}>
                        {activeTab === "ads"
                            ? filteredAds.map(renderAdCard)
                            : filteredAbAds.map(renderAbAdCard)
                        }
                    </div>

                    {/* Results summary */}
                    {((activeTab === "ads" && filteredAds.length > 0) ||
                        (activeTab === "ab-ads" && filteredAbAds.length > 0)) && (
                            <div className="flex justify-center mt-8">
                                <p className="text-sm text-gray-400">
                                    Showing {activeTab === "ads" ? filteredAds.length : filteredAbAds.length} of {activeTab === "ads" ? ads.length : abAds.length} {activeTab === "ads" ? "ads" : "A/B tests"}
                                </p>
                            </div>
                        )}

                    {/* Pagination - placeholder for future implementation */}
                    {((activeTab === "ads" && filteredAds.length > 12) ||
                        (activeTab === "ab-ads" && filteredAbAds.length > 12)) && (
                            <div className="flex justify-center mt-8">
                                <div className="flex gap-2">
                                    <Button variant="outline" className="border-[#2b2b2b] bg-transparent" disabled>
                                        Previous
                                    </Button>
                                    <Button variant="outline" className="border-[#2b2b2b] bg-[#121212]">
                                        1
                                    </Button>
                                    <Button variant="outline" className="border-[#2b2b2b] bg-transparent" disabled>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                </div>
            )}
        </UserLayout>
    )
}