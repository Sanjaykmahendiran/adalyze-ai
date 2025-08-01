"use client"

import { useState, useEffect } from "react"
import { Search, Download, Eye, Trash2, Facebook, Instagram, MessageCircle, FileImage, Upload, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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

function parsePlatforms(raw: string): string[] {
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
    const [selectedAds, setSelectedAds] = useState<number[]>([])
    const [ads, setAds] = useState<Ad[]>([])
    const [loading, setLoading] = useState(true)
    const [scoreFilter, setScoreFilter] = useState("all")

    // Fetch ads from API
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

    const filteredAds = ads.filter((ad) => {
        const matchesSearch = ad.ads_name.toLowerCase().includes(searchTerm.toLowerCase())
        const platformList = ad.platforms.split(',').map((p) => p.trim().toLowerCase())
        const matchesPlatform = selectedPlatform === "all" || platformList.includes(selectedPlatform)

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
                    matchesScore = ad.score < 70
                    break
            }
        }

        return matchesSearch && matchesPlatform && matchesScore
    })


    const toggleAdSelection = (adId: number) => {
        setSelectedAds((prev) => (prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]))
    }


    return (
        <UserLayout userDetails={userDetails}>
             {loading ? <MyAdsSkeleton /> : (
        <div className="w-full min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="">
                    <h1 className="text-3xl font-bold mb-2">My Ads</h1>
                    <p className="text-gray-400">Manage and analyze your creative assets ({ads.length} total)</p>
                </div>
                <div>
                    <Button
                        onClick={() => router.push("/upload")}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Ad
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className=" rounded-lg p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search ads by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#121212] border-[#2b2b2b] focus:border-primary outline-none text-white placeholder:text-gray-300"
                        />
                    </div>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="w-full bg-[#121212] sm:w-48 border-[#2b2b2b] text-white placeholder:text-gray-300">
                            <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Platforms</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="flyer">Flyer</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={scoreFilter} onValueChange={setScoreFilter}>
                        <SelectTrigger className="w-full bg-[#121212] sm:w-48 border-[#2b2b2b] text-white placeholder:text-gray-300">
                            <SelectValue placeholder="Score Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Scores</SelectItem>
                            <SelectItem value="90-100">90-100</SelectItem>
                            <SelectItem value="80-89">80-89</SelectItem>
                            <SelectItem value="70-79">70-79</SelectItem>
                            <SelectItem value="0-69">Below 70</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bulk Tools */}
            {selectedAds.length > 0 && (
                <div className=" rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                            {selectedAds.length} ad{selectedAds.length !== 1 ? "s" : ""} selected
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-[#2b2b2b] bg-transparent">
                                <Download className="w-4 h-4 mr-2" />
                                Export Reports
                            </Button>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Bulk Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* No ads message */}
            {filteredAds.length === 0 && !loading && (
                <div className="text-center py-12">
                    <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No ads found</h3>
                    <p className="text-gray-400 mb-4">
                        {ads.length === 0
                            ? "You haven't uploaded any ads yet."
                            : "Try adjusting your search or filter criteria."
                        }
                    </p>
                    {ads.length === 0 && (
                        <Button onClick={() => router.push("/upload")}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Your First Ad
                        </Button>
                    )}
                </div>
            )}

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAds.map((ad) => {
                    const platformList = parsePlatforms(ad.platforms)
                    const dateFormatted = formatDate(ad.uploaded_on)

                    return (
                        <div key={ad.ad_id} className="bg-black rounded-lg overflow-hidden hover:border-gray-600 group hover:scale-105 shadow-lg shadow-white/5 transition-all duration-300">
                            <div className="relative">
                                <img
                                    src={ad.image_path}
                                    alt={ad.ads_name}
                                    className="w-full aspect-square object-cover transform group-hover:scale-105 transition-all duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                                    }}
                                />
                                <div className="absolute top-2 left-2">
                                    <Checkbox
                                        checked={selectedAds.includes(ad.ad_id)}
                                        onCheckedChange={() => toggleAdSelection(ad.ad_id)}
                                        className="bg-black/50 border-gray-600"
                                    />
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Badge className={`${getScoreColor(ad.score)} text-white`}>{ad.score}</Badge>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-sm truncate" title={ad.ads_name}>{ad.ads_name}</h3>
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

                                <div className=" flex items-center justify-between">
                                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30 mb-4">
                                        {ad.industry}
                                    </Badge>
                                    <p className="text-xs text-gray-400 mb-1">{dateFormatted}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => router.push(`/results?ad_id=${ad.ad_id}`)}
                                        size="sm" variant="outline" className="flex-1 text-xs border-[#2b2b2b] bg-transparent">
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 text-xs border-[#2b2b2b] bg-transparent">
                                        <Download className="w-3 h-3 mr-1" />
                                        Report
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-[#2b2b2b] text-red-400 hover:text-red-300 bg-transparent"
                                        onClick={() => {
                                            toast.error('Delete functionality not implemented yet')
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                    )
                })}
            </div>

            {/* Pagination - You can implement this based on your needs */}
            {filteredAds.length > 0 && (
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