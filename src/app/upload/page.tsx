"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Image, LayoutList, PlaySquare, Lock } from "lucide-react"
import { AnalyzingOverlay } from "../../components/analyzing-overlay"
import { SingleFileUploader } from "./_components/single-file-uploader"
import { CarouselFileUploader } from "./_components/carousel-file-uploader"
import { VideoUploader } from "./_components/video-file-uploader"
import cookies from 'js-cookie'
import toast from "react-hot-toast"
import UserLayout from "@/components/layouts/user-layout"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import { event, trackAdUpload } from "@/lib/gtm"
import { Country, State, TargetInfo, Industry } from "./type"
import { trackEvent } from "@/lib/eventTracker"

// Move FreeTrailOverlay outside to prevent re-creation on every render
const FreeTrailOverlay = ({
    children,
    message,
    showOverlay,
    activeTab,
    adsLimit,
    isFreeTrailUser,
    onUpgradeClick
}: {
    children: React.ReactNode
    message: string
    showOverlay: boolean
    activeTab: string
    adsLimit: number
    isFreeTrailUser: boolean
    onUpgradeClick: () => void
}) => {
    // Determine button text based on ad_limit / active tab
    let buttonText = "Upgrade to Pro";

    if (activeTab === "single" && adsLimit === 0) {
        buttonText = "Add Credits";
    } else if ((activeTab === "carousel" || activeTab === "video") && (isFreeTrailUser || adsLimit < 3)) {
        buttonText = "Add Credits";
    }

    return (
        <div className="relative">
            <div className={showOverlay ? "blur-xs pointer-events-none select-none" : ""}>{children}</div>
            {showOverlay && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl z-10">
                    <div className="text-center p-4">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-[#db4900]" />
                        <p className="text-white font-semibold mb-4 text-sm sm:text-base px-2">{message}</p>
                        <Button
                            onClick={onUpgradeClick}
                            className="bg-[#db4900] hover:bg-[#c44000] text-white rounded-lg text-sm sm:text-base px-4 py-2"
                        >
                            {buttonText}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function UploadPage() {
    const { userDetails } = useFetchUserDetails()
    const router = useRouter()

    // Common form states
    const [activeTab, setActiveTab] = useState("single")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [sidePanelOpen, setSidePanelOpen] = useState(false)
    const [targetInfo, setTargetInfo] = useState<TargetInfo | null>(null)
    const [singleAdName, setSingleAdName] = useState("")
    const [carouselAdName, setCarouselAdName] = useState("")
    const [videoAdName, setVideoAdName] = useState("")

    // Form states for side panel
    const [platform, setPlatform] = useState("")
    const [industry, setIndustry] = useState("")
    const [gender, setGender] = useState("")
    const [country, setCountry] = useState("")
    const [state, setState] = useState("")
    const [minAge, setMinAge] = useState("")
    const [maxAge, setMaxAge] = useState("")

    // Single ad states
    const [singleFile, setSingleFile] = useState<File | null>(null)
    const [singleImageUrl, setSingleImageUrl] = useState<string | null>(null)
    const [isSingleUploading, setIsSingleUploading] = useState(false)
    const [singleUploadProgress, setSingleUploadProgress] = useState(0)

    // Carousel ad states
    const [carouselFiles, setCarouselFiles] = useState<File[]>([])
    const [carouselImageUrls, setCarouselImageUrls] = useState<string[]>([])
    const [isCarouselUploading, setIsCarouselUploading] = useState(false)
    const [carouselUploadProgress, setCarouselUploadProgress] = useState(0)
    // Track mapping between files and their uploaded URLs
    const carouselFileUrlMapRef = useRef<Map<File, string>>(new Map())

    // Video ad states
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoScreenshots, setVideoScreenshots] = useState<string[]>([])
    const [videoFilePath, setVideoFilePath] = useState<File | null>(null)
    const [videoTranscript, setVideoTranscript] = useState<string>("")
    const [videoDuration, setVideoDuration] = useState<number>(0)
    const [isVideoUploaded, setIsVideoUploaded] = useState(false)
    const [isVideoUploading, setIsVideoUploading] = useState(false)
    const [videoUploadProgress, setVideoUploadProgress] = useState(0)

    // Location states
    const [countries, setCountries] = useState<Country[]>([])
    const [states, setStates] = useState<State[]>([])
    const [industries, setIndustries] = useState<Industry[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingStates, setLoadingStates] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const [stateSearch, setStateSearch] = useState("")
    const [industrySearch, setIndustrySearch] = useState("")
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
    const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false)
    const countrySearchInputRef = useRef<HTMLInputElement>(null)
    const stateSearchInputRef = useRef<HTMLInputElement>(null)
    const industrySearchInputRef = useRef<HTMLInputElement>(null)

    const userId = cookies.get("userId") || ""
    const isFreeTrailUser = userDetails?.fretra_status === 1

    useEffect(() => {
        if (sidePanelOpen) {
            document.body.style.overflow = "hidden"; // disable scrolling
        } else {
            document.body.style.overflow = ""; // reset back to normal
        }

        return () => {
            document.body.style.overflow = ""; // cleanup when component unmounts
        };
    }, [sidePanelOpen]);

    // Auto-focus country search when dropdown opens
    useEffect(() => {
        if (countryDropdownOpen) {
            setTimeout(() => {
                countrySearchInputRef.current?.focus()
            }, 100)
        }
    }, [countryDropdownOpen])

    // Auto-focus state search when dropdown opens
    useEffect(() => {
        if (stateDropdownOpen) {
            setTimeout(() => {
                stateSearchInputRef.current?.focus()
            }, 100)
        }
    }, [stateDropdownOpen])

    // Auto-focus industry search when dropdown opens
    useEffect(() => {
        if (industryDropdownOpen) {
            setTimeout(() => {
                industrySearchInputRef.current?.focus()
            }, 100)
        }
    }, [industryDropdownOpen])

    // Check if files are uploaded
    const hasUploadedFiles = () => {
        if (activeTab === "single") return singleFile && singleImageUrl
        if (activeTab === "carousel") return carouselFiles.length >= 3 && carouselImageUrls.length >= 3
        if (activeTab === "video") return videoFile && isVideoUploaded && videoScreenshots.length > 0 && videoFilePath
        return false
    }

    // Fetch countries on component mount
    useEffect(() => {
        fetchCountries()
        fetchIndustries()
    }, [])

    // Fetch states when country changes
    useEffect(() => {
        if (country) {
            fetchStates(country)
            setState("")
            setStateSearch("")
        } else {
            setStates([])
            setState("")
            setStateSearch("")
        }
    }, [country])

    // Filter countries based on search
    const filteredCountries = countries.filter(countryItem =>
        countryItem.name.toLowerCase().includes(countrySearch.toLowerCase())
    )

    // Filter states based on search
    const filteredStates = states.filter(stateItem =>
        stateItem.name.toLowerCase().includes(stateSearch.toLowerCase())
    )

    // Filter industries based on search
    const filteredIndustries = industries.filter(industryItem =>
        industryItem.name.toLowerCase().includes(industrySearch.toLowerCase())
    )

    const fetchCountries = async () => {
        setLoadingCountries(true)
        try {
            const response = await fetch('https://techades.com/App/api.php?gofor=countrieslist')
            if (!response.ok) {
                throw new Error('Failed to fetch countries')
            }
            const data: Country[] = await response.json()
            setCountries(data)
        } catch (error) {
            console.error('Error fetching countries:', error)
            toast.error('Failed to load countries')
        } finally {
            setLoadingCountries(false)
        }
    }

    const fetchStates = async (countryId: string) => {
        setLoadingStates(true)
        try {
            const response = await fetch(`https://techades.com/App/api.php?gofor=stateslist&country_id=${countryId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch states')
            }
            const data: State[] = await response.json()
            setStates(data)
        } catch (error) {
            console.error('Error fetching states:', error)
            toast.error('Failed to load states')
        } finally {
            setLoadingStates(false)
        }
    }

    const fetchIndustries = async () => {
        try {
            const response = await fetch('https://adalyzeai.xyz/App/api.php?gofor=industrylist')
            if (!response.ok) {
                throw new Error('Failed to fetch industries')
            }
            const data: Industry[] = await response.json()
            setIndustries(data)
        } catch (error) {
            console.error('Error fetching industries:', error)
            toast.error('Failed to load industries')
        } finally {
        }
    }

    // Single file handlers
    const handleSingleFileChange = async (uploadedFile: File | null) => {
        setSingleFile(uploadedFile)
        if (uploadedFile) {
            try {
                await uploadSingleFile(uploadedFile)
            } catch (error) {
                // Error already handled in uploadSingleFile and component
            }
        } else {
            setSingleImageUrl(null)
        }
    }

    const uploadSingleFile = async (fileToUpload: File) => {
        setIsSingleUploading(true)
        setSingleUploadProgress(0)

        try {
            const formData = new FormData()
            formData.append('file', fileToUpload)
            formData.append('user_id', userId)

            const progressInterval = setInterval(() => {
                setSingleUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            const response = await fetch('https://adalyzeai.xyz/App/adupl.php', {
                method: 'POST',
                body: formData,
            })

            clearInterval(progressInterval)
            setSingleUploadProgress(100)

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const result = await response.json()
            if (result.status === "Ads Uploaded Successfully" && result.fileUrl) {
                toast.success('File uploaded successfully!')
                setSingleImageUrl(result.fileUrl)
                trackEvent("Single_File_Uploaded", window.location.href, userDetails?.email?.toString())
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (err) {
            console.error('File upload error:', err)
            setSingleFile(null)
            setSingleImageUrl(null)
            trackEvent("Single_File_Upload_Failed", window.location.href, userDetails?.email?.toString())
            throw err
        } finally {
            setIsSingleUploading(false)
            setSingleUploadProgress(0)
        }
    }

    // Carousel file handlers
    const handleCarouselFilesChange = async (uploadedFiles: File[]) => {
        const fileUrlMap = carouselFileUrlMapRef.current
        
        // Check if this is a reorder (same files, different order) or new files
        const isReorder = 
            uploadedFiles.length === carouselFiles.length &&
            uploadedFiles.every(file => carouselFiles.includes(file)) &&
            uploadedFiles.length > 0 &&
            fileUrlMap.size === uploadedFiles.length
        
        setCarouselFiles(uploadedFiles)
        
        if (uploadedFiles.length === 0) {
            // Clear everything
            setCarouselImageUrls([])
            fileUrlMap.clear()
            return
        }
        
        if (isReorder) {
            // Just reorder the URLs to match the new file order - instant, no re-upload
            const reorderedUrls = uploadedFiles.map(file => fileUrlMap.get(file)!).filter(Boolean)
            setCarouselImageUrls(reorderedUrls)
        } else {
            // Remove files that are no longer in the list from the map
            const currentFileSet = new Set(uploadedFiles)
            for (const file of fileUrlMap.keys()) {
                if (!currentFileSet.has(file)) {
                    fileUrlMap.delete(file)
                }
            }
            
            // New files or removed files - need to upload new ones
            try {
                await uploadCarouselFiles(uploadedFiles)
            } catch (error) {
                // Error already handled in uploadCarouselFiles and component
            }
        }
    }

    const uploadCarouselFiles = async (filesToUpload: File[]) => {
        setIsCarouselUploading(true)
        setCarouselUploadProgress(0)

        const fileUrlMap = carouselFileUrlMapRef.current

        try {
            const progressInterval = setInterval(() => {
                setCarouselUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 300)

            // Check which files need uploading
            const filesToActuallyUpload = filesToUpload.filter(file => !fileUrlMap.has(file))
            
            // If all files are already uploaded, just reorder
            if (filesToActuallyUpload.length === 0) {
                const existingUrls = filesToUpload.map(file => fileUrlMap.get(file)!).filter(Boolean)
                clearInterval(progressInterval)
                setCarouselUploadProgress(100)
                setCarouselImageUrls(existingUrls)
                setIsCarouselUploading(false)
                setCarouselUploadProgress(0)
                return
            }

            // Upload only new files sequentially to maintain order
            for (const file of filesToActuallyUpload) {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('user_id', userId)

                const response = await fetch('https://adalyzeai.xyz/App/adupl.php', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`)
                }

                const result = await response.json()
                if (result.status === "Ads Uploaded Successfully" && result.fileUrl) {
                    // Store the mapping
                    fileUrlMap.set(file, result.fileUrl)
                } else {
                    throw new Error(result.message || 'Upload failed')
                }
            }

            // Build the complete URL array in the order of filesToUpload
            const uploadedUrls = filesToUpload.map(file => fileUrlMap.get(file)!).filter(Boolean)

            clearInterval(progressInterval)
            setCarouselUploadProgress(100)
            setCarouselImageUrls(uploadedUrls)
            
            // Show single success toast with total count
            toast.success(`${filesToActuallyUpload.length} image${filesToActuallyUpload.length > 1 ? 's' : ''} uploaded successfully!`)
            trackEvent("Carousel_Files_Uploaded", window.location.href, userDetails?.email?.toString())
        } catch (err) {
            console.error('Carousel upload error:', err)
            setCarouselFiles([])
            setCarouselImageUrls([])
            fileUrlMap.clear()
            trackEvent("Carousel_Files_Upload_Failed", window.location.href, userDetails?.email?.toString())
            throw err
        } finally {
            setIsCarouselUploading(false)
            setCarouselUploadProgress(0)
        }
    }

    // Video file handlers
    // Add this in handleVideoFileChange
    const handleVideoFileChange = async (uploadedFile: File | null) => {
        console.log('Video file changed:', uploadedFile?.name)
        setVideoFile(uploadedFile)
        if (uploadedFile) {
            try {
                await uploadVideoFile(uploadedFile)
                console.log('Upload completed. State:', {
                    isVideoUploaded,
                    screenshots: videoScreenshots.length,
                    filePath: videoFilePath
                })
            } catch (error) {
                console.error('Upload failed:', error)
            }
        } else {
            setVideoScreenshots([])
            setIsVideoUploaded(false)
            setVideoFilePath(null)
        }
    }


    const uploadVideoFile = async (fileToUpload: File) => {
        setIsVideoUploading(true)
        setVideoUploadProgress(0)

        try {
            const progressInterval = setInterval(() => {
                setVideoUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 5
                })
            }, 500)

            const formData = new FormData()
            formData.append('user_id', userId)
            formData.append('file', fileToUpload)

            const response = await fetch('https://adalyzeai.xyz/App/vidadupl.php', {
                method: 'POST',
                body: formData,
            })

            clearInterval(progressInterval)
            setVideoUploadProgress(100)

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const result = await response.json()

            if (result.thumbnails && result.thumbnails.length > 0) {
                toast.success('File uploaded successfully!')
                setVideoScreenshots(result.thumbnails)
                setVideoFilePath(result.video_url)
                setVideoTranscript(result.transcript)
                setVideoDuration(result.meta.duration)
                setIsVideoUploaded(true)
                trackEvent("Video_File_Uploaded", window.location.href, userDetails?.email?.toString())
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (err) {
            console.error('Video upload error:', err)
            setVideoFile(null)
            setVideoScreenshots([])
            setVideoFilePath(null)
            setIsVideoUploaded(false)
            trackEvent("Video_File_Upload_Failed", window.location.href, userDetails?.email?.toString())
            throw err
        } finally {
            setIsVideoUploading(false)
            setVideoUploadProgress(0)
        }
    }

    const handleSaveTarget = async () => {
        const selectedCountry = countries.find(c => c.id === country)
        const selectedState = states.find(s => s.id === state)

        const newTargetInfo = {
            platform,
            industry,
            age: `${minAge}-${maxAge}`,
            gender,
            country,
            state,
            countryName: selectedCountry?.name || "",
            stateName: selectedState?.name || ""
        }

        setTargetInfo(newTargetInfo)
        setSidePanelOpen(false)

        // Proceed with analysis after setting target, pass the target info directly
        await handleAnalyze(newTargetInfo)
    }

    const handleAnalyze = async (passedTargetInfo?: TargetInfo) => {
        // Get current ad name based on active tab
        const currentAdName = activeTab === "single" ? singleAdName :
            activeTab === "carousel" ? carouselAdName :
                videoAdName;

        // Validate ad name first
        if (!currentAdName.trim()) {
            toast.error('Please enter an ad name to continue');
            return;
        }

        // Check if files are uploaded
        if (!hasUploadedFiles()) {
            toast.error('Please upload files first');
            return;
        }

        setIsAnalyzing(true);

        // Use passed target info if available, otherwise use state
        const targetData = passedTargetInfo || targetInfo;

        try {
            let analyzeData: any = {
                user_id: userId,
                ads_name: currentAdName,
                industry: targetData?.industry || "",
                platform: targetData?.platform || "",
                age: targetData?.age || "",
                gender: targetData?.gender || "",
                country: targetData?.countryName || "",
                state: targetData?.stateName || "",
                ad_type: activeTab === "single" ? "Single" : activeTab === "carousel" ? "Carousel" : "Video"
            }

            // Add media
            if (activeTab === "single") analyzeData.images = [singleImageUrl]
            if (activeTab === "carousel") analyzeData.images = carouselImageUrls
            if (activeTab === "video") analyzeData.screenshots = videoScreenshots
            if (activeTab === "video") analyzeData.video = videoFilePath
            if (activeTab === "video") analyzeData.duration = videoDuration
            if (activeTab === "video") analyzeData.transcript = videoTranscript

            const response = await fetch('https://adalyzeai.xyz/App/analyze.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analyzeData),
            })

            if (!response.ok) throw new Error(`Analysis failed: ${response.statusText}`)

            const result = await response.json()
            if (result.success) {
                localStorage.setItem('analysisResults', JSON.stringify(result))
                event("analyze");
                trackAdUpload(result.data.ad_upload_id.toString());
                const eventName = isFreeTrailUser ? `free_trail_user_${activeTab}_Ad_Analyzed` : `${activeTab}_Ad_Analyzed`
                trackEvent(eventName, window.location.href, userDetails?.email?.toString())
                router.push(`/results?ad_id=${result.data.ad_upload_id}`)
            } else {
                throw new Error(result.error || 'Analysis failed')
            }
        } catch (err) {
            console.error('Analysis error:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to analyze ad')
            trackEvent(`${activeTab}_Ad_Analyze_Failed`, window.location.href, userDetails?.email?.toString())
        } finally {
            setIsAnalyzing(false)
        }
    }


    const handleContinueWithTarget = () => {
        // Get current ad name based on active tab
        const currentAdName = activeTab === "single" ? singleAdName :
            activeTab === "carousel" ? carouselAdName :
                videoAdName;

        // Validate ad name first
        if (!currentAdName.trim()) {
            toast.error('Please enter an ad name to continue');
            return;
        }

        // Check if files are uploaded
        if (!hasUploadedFiles()) {
            toast.error('Please upload files first');
            return;
        }

        setSidePanelOpen(true);
    }



    return (
        <UserLayout userDetails={userDetails}>
            <div className="min-h-screen text-white relative">
                {isAnalyzing && <AnalyzingOverlay />}

                {/* Modal Overlay */}
                {sidePanelOpen && (
                    <div
                        onClick={() => setSidePanelOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Center Modal */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#171717] rounded-xl shadow-xl shadow-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white/80">Set Target</h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSidePanelOpen(false)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {/* Ad Name (full width) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="modal-ad-name" className="text-white/70 font-semibold">Ad Name *</Label>
                                        <Input
                                            id="modal-ad-name"
                                            placeholder="Enter ad name"
                                            value={activeTab === "single" ? singleAdName :
                                                activeTab === "carousel" ? carouselAdName :
                                                    videoAdName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (activeTab === "single") setSingleAdName(value);
                                                else if (activeTab === "carousel") setCarouselAdName(value);
                                                else setVideoAdName(value);
                                            }}
                                            className="bg-black border-[#3d3d3d] text-white"
                                            autoComplete="off"
                                            spellCheck="false"
                                        />
                                    </div>

                                    {/* Two-column layout starts here */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Platform */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Platform Target</Label>
                                            <Select value={platform} onValueChange={setPlatform}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black border-[#3d3d3d]">
                                                    <SelectItem value="Instagram">Instagram</SelectItem>
                                                    <SelectItem value="Facebook">Facebook</SelectItem>
                                                    <SelectItem value="Twitter">Twitter</SelectItem>
                                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                                    <SelectItem value="TikTok">TikTok</SelectItem>
                                                    <SelectItem value="Pinterest">Pinterest</SelectItem>
                                                    <SelectItem value="YouTube">YouTube</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Industry */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Industry Category</Label>
                                            <Select value={industry} onValueChange={setIndustry} onOpenChange={setIndustryDropdownOpen}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder="Select industry" />
                                                </SelectTrigger>
                                                <SelectContent className="w-full bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                                    <div className="p-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                                        <Input
                                                            ref={industrySearchInputRef}
                                                            placeholder="Search industries..."
                                                            value={industrySearch}
                                                            onChange={(e) => setIndustrySearch(e.target.value)}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            className="bg-black border-[#3d3d3d] text-white placeholder-gray-500 h-8"
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {filteredIndustries.map((industryItem: Industry) => (
                                                            <SelectItem key={industryItem.industry_id} value={industryItem.name}>
                                                                {industryItem.name}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Age Group */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-white/70 font-semibold" htmlFor="min-age">
                                                    Min Age
                                                </Label>
                                                <Input
                                                    id="min-age"
                                                    type="number"
                                                    placeholder="Min Age"
                                                    value={minAge}
                                                    onChange={(e) => setMinAge(e.target.value)}
                                                    className="bg-black border-[#3d3d3d] text-white"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-white/70 font-semibold" htmlFor="max-age">
                                                    Max Age
                                                </Label>
                                                <Input
                                                    id="max-age"
                                                    type="number"
                                                    placeholder="Max Age"
                                                    value={maxAge}
                                                    onChange={(e) => setMaxAge(e.target.value)}
                                                    className="bg-black border-[#3d3d3d] text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Gender</Label>
                                            <Select value={gender} onValueChange={setGender}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                                                    <SelectItem value="All Genders">All Genders</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Country */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Country</Label>
                                            <Select value={country} onValueChange={setCountry} disabled={loadingCountries} onOpenChange={setCountryDropdownOpen}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"} />
                                                </SelectTrigger>
                                                <SelectContent className="w-full bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                                    <div className="p-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                                        <Input
                                                            ref={countrySearchInputRef}
                                                            placeholder="Search countries..."
                                                            value={countrySearch}
                                                            onChange={(e) => setCountrySearch(e.target.value)}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                            className="bg-black border-[#3d3d3d] text-white placeholder-gray-500 h-8"
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {filteredCountries.map((countryItem) => (
                                                            <SelectItem key={countryItem.id} value={countryItem.id}>
                                                                {countryItem.name}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* State */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">State/Province</Label>
                                            <Select value={state} onValueChange={setState} disabled={!country || loadingStates} onOpenChange={setStateDropdownOpen}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue
                                                        placeholder={
                                                            !country
                                                                ? "Select country first"
                                                                : loadingStates
                                                                    ? "Loading..."
                                                                    : "Select state"
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent className="w-full bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                                    {states.length > 0 && (
                                                        <div className="p-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                                            <Input
                                                                ref={stateSearchInputRef}
                                                                placeholder="Search states..."
                                                                value={stateSearch}
                                                                onChange={(e) => setStateSearch(e.target.value)}
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                                className="bg-black border-[#3d3d3d] text-white placeholder-gray-500 h-8"
                                                                autoComplete="off"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {filteredStates.map((stateItem) => (
                                                            <SelectItem key={stateItem.id} value={stateItem.id}>
                                                                {stateItem.name}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={() => setSidePanelOpen(false)}
                                            variant="outline"
                                            className="flex-1 border-[#2b2b2b] text-gray-300 hover:bg-[#2b2b2b] hover:text-white"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveTarget}
                                            className="flex-1 bg-[#db4900] hover:bg-[#c44000] text-white"
                                        >
                                            Save & Analyze
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6 pb-20">
                    {/* Main Content */}
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-[#000000] border-none rounded-2xl sm:rounded-3xl shadow-2xl">
                            <div className="py-2 lg:py-8 px-4 sm:px-6 lg:px-8">
                                {/* Radio Button Selection */}
                                <div className="max-w-4xl mx-auto mb-2 sm:mb-4">
                                    {/* Mobile: Dropdown */}
                                    <div className="block sm:hidden mt-6 mb-4">
                                        <Select value={activeTab} onValueChange={setActiveTab}>
                                            <SelectTrigger className="w-full bg-[#171717] border-[#3d3d3d] py-6 text-gray-200 focus:border-[#db4900] focus:ring-0">
                                                <SelectValue placeholder="Select Ad Type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#171717] border-[#3d3d3d] text-gray-200">
                                                <SelectItem value="single">
                                                    <div className="flex items-center gap-2 text-base">
                                                        <Image className="w-4 h-4 text-[#db4900]" />
                                                        <span>Single Image (1 credit)</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="carousel">
                                                    <div className="flex items-center gap-2 text-base">
                                                        <LayoutList className="w-4 h-4 text-[#db4900]" />
                                                        <span>Carousel (3 credits)</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="video">
                                                    <div className="flex items-center gap-2 text-base">
                                                        <PlaySquare className="w-4 h-4 text-[#db4900]" />
                                                        <span>Video Ad (3 credits)</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Desktop: Button Grid */}
                                    <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:flex lg:items-center lg:justify-center lg:gap-6">
                                        {/* Single Image */}
                                        <button
                                            onClick={() => setActiveTab("single")}
                                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left
                                                                ${activeTab === "single"
                                                    ? "bg-[#db4900]/10 border-[#db4900] text-[#db4900]"
                                                    : "border-[#2b2b2b] text-gray-300 hover:text-white hover:border-[#db4900]/50"
                                                }`}
                                        >
                                            <Image className="w-6 h-6 flex-shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-md">Single Image (1 credit)</span>
                                                <span className="text-sm text-white/80">Best for simple promos</span>
                                            </div>
                                        </button>

                                        {/* Carousel */}
                                        <button
                                            onClick={() => setActiveTab("carousel")}
                                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left
                                                            ${activeTab === "carousel"
                                                    ? "bg-[#db4900]/10 border-[#db4900] text-[#db4900]"
                                                    : "border-[#2b2b2b] text-gray-300 hover:text-white hover:border-[#db4900]/50"
                                                }`}
                                        >
                                            <LayoutList className="w-6 h-6 flex-shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-md">Carousel (3 credits)</span>
                                                <span className="text-sm text-white/80">Swipe multiple images</span>
                                            </div>
                                        </button>

                                        {/* Video */}
                                        <button
                                            onClick={() => setActiveTab("video")}
                                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left
                                                        ${activeTab === "video"
                                                    ? "bg-[#db4900]/10 border-[#db4900] text-[#db4900]"
                                                    : "border-[#2b2b2b] text-gray-300 hover:text-white hover:border-[#db4900]/50"
                                                }`}
                                        >
                                            <PlaySquare className="w-6 h-6 flex-shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-md">Video Ad (3 credits)</span>
                                                <span className="text-sm text-white/80">Engage with motion</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Entire Ad Creation Section wrapped inside overlay */}
                                <FreeTrailOverlay
                                    showOverlay={
                                        activeTab === "single"
                                            ? userDetails?.ads_limit === 0
                                            : isFreeTrailUser || userDetails?.ads_limit! < 3
                                    }
                                    message={
                                        activeTab === "single"
                                            ? "You don't have sufficient credits. Upgrade to Pro to analyze more ads."
                                            : isFreeTrailUser
                                                ? "Upgrade to Pro to unlock this ad type."
                                                : "You don't have sufficient credits. Upgrade to Pro to analyze more ads."
                                    }
                                    activeTab={activeTab}
                                    adsLimit={userDetails?.ads_limit || 0}
                                    isFreeTrailUser={isFreeTrailUser}
                                    onUpgradeClick={() => router.push("/pro")}
                                >
                                    <div className="w-full max-w-4xl mx-auto">
                                        {/* Ad Name Input */}
                                        <div className="space-y-2 mb-6">
                                            <Label className="text-white/70 font-semibold text-base">Ad Name</Label>
                                            <Input
                                                placeholder="Enter ad name"
                                                value={
                                                    activeTab === "single" ? singleAdName :
                                                        activeTab === "carousel" ? carouselAdName :
                                                            videoAdName
                                                }
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (activeTab === "single") setSingleAdName(value);
                                                    else if (activeTab === "carousel") setCarouselAdName(value);
                                                    else setVideoAdName(value);
                                                }}
                                                className="bg-[#171717] border-[#3d3d3d] text-white placeholder-gray-400 text-base py-3"
                                                autoComplete="off"
                                                spellCheck="false"
                                            />
                                        </div>

                                        {/* Conditional Uploaders */}
                                        <div className="mt-6 sm:mt-8">
                                            {activeTab === "single" && (
                                                <SingleFileUploader
                                                    file={singleFile}
                                                    onFileChange={handleSingleFileChange}
                                                    imageUrl={singleImageUrl}
                                                    isUploading={isSingleUploading}
                                                    uploadProgress={singleUploadProgress}
                                                />
                                            )}

                                            {activeTab === "carousel" && (
                                                <CarouselFileUploader
                                                    files={carouselFiles}
                                                    onFilesChange={handleCarouselFilesChange}
                                                    imageUrls={carouselImageUrls}
                                                    isUploading={isCarouselUploading}
                                                    uploadProgress={carouselUploadProgress}
                                                />
                                            )}

                                            {activeTab === "video" && (
                                                <VideoUploader
                                                    file={videoFile}
                                                    onFileChange={handleVideoFileChange}
                                                    screenshots={videoScreenshots}
                                                    isUploaded={isVideoUploaded}
                                                    isUploading={isVideoUploading}
                                                    uploadProgress={videoUploadProgress}
                                                />
                                            )}
                                        </div>

                                        {/* Buttons - included inside overlay */}
                                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={() => handleAnalyze()}
                                                disabled={isAnalyzing || !hasUploadedFiles()}
                                                variant="outline"
                                                className="flex-1 text-lg py-6 border-[#2b2b2b] text-gray-300 hover:bg-[#2b2b2b] hover:text-white"
                                            >
                                                {isAnalyzing ? "Analyzing..." : "Continue Without Target"}
                                            </Button>
                                            <Button
                                                onClick={handleContinueWithTarget}
                                                disabled={!hasUploadedFiles()}
                                                className="flex-1 text-lg bg-[#db4900] hover:bg-[#c44000] text-white py-6"
                                            >
                                                Continue With Target
                                            </Button>
                                        </div>
                                    </div>
                                </FreeTrailOverlay>
                            </div>
                        </div>
                    </div>
                </main>

            </div>
        </UserLayout>
    )
}