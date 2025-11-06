"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomSearchDropdown } from "@/components/ui/custom-search-dropdown"
import { CountrySelector } from "@/components/ui/country-selector"
import { X, Image, LayoutList, PlaySquare, Lock, TriangleAlert, ChevronDown, Search } from "lucide-react"
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
import { generateAdToken } from "@/lib/tokenUtils"
import Footer from "@/components/footer"
import AddBrandForm from "@/app/brands/_components/add-brand-form"
import UploadLoadingSkeleton from "@/components/Skeleton-loading/upload-loading"

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
                        <p className="text-white font-semibold mb-4 text-sm sm:text-base">{message}</p>
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
    const [industryModalOpen, setIndustryModalOpen] = useState(false)
    const [industrySearch, setIndustrySearch] = useState("")
    const [isMobile, setIsMobile] = useState(false)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [errorNotes, setErrorNotes] = useState("")
    const [targetInfo, setTargetInfo] = useState<TargetInfo | null>(null)
    const [singleAdName, setSingleAdName] = useState("")
    const [carouselAdName, setCarouselAdName] = useState("")
    const [videoAdName, setVideoAdName] = useState("")

    // Form states for side panel
    const [platform, setPlatform] = useState("")
    const [industry, setIndustry] = useState("")
    const [gender, setGender] = useState("")
    const [country, setCountry] = useState<string[]>([])
    const [minAge, setMinAge] = useState("")
    const [maxAge, setMaxAge] = useState("")
    const [language, setLanguage] = useState("")
    const [objective, setObjective] = useState("")
    const [funnelStage, setFunnelStage] = useState("")

    // Brand dropdown states
    const [brands, setBrands] = useState<any[]>([])
    const [selectedBrand, setSelectedBrand] = useState("")
    const [loadingBrands, setLoadingBrands] = useState(false)

    // Add brand form states
    const [showAddBrandForm, setShowAddBrandForm] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // Track API call states
    const [industriesLoaded, setIndustriesLoaded] = useState(false)
    const [brandsLoaded, setBrandsLoaded] = useState(false)
    const [userDetailsLoaded, setUserDetailsLoaded] = useState(false)

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
    const [industries, setIndustries] = useState<Industry[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")

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

    // Detect mobile viewport
    useEffect(() => {
        const updateIsMobile = () => {
            if (typeof window !== "undefined") {
                const small = window.innerWidth <= 640
                setIsMobile(small)
            }
        }
        updateIsMobile()
        window.addEventListener('resize', updateIsMobile)
        return () => window.removeEventListener('resize', updateIsMobile)
    }, [])


    // Check if files are uploaded
    const hasUploadedFiles = () => {
        if (activeTab === "single") return singleFile && singleImageUrl
        if (activeTab === "carousel") return carouselFiles.length >= 3 && carouselImageUrls.length >= 3
        if (activeTab === "video") return videoFile && isVideoUploaded && videoScreenshots.length > 0 && videoFilePath
        return false
    }

    // Track when userDetails are loaded
    useEffect(() => {
        if (userDetails) {
            setUserDetailsLoaded(true)
        }
    }, [userDetails])

    // Fetch industries on component mount
    useEffect(() => {
        fetchIndustries()
    }, [])

    // Fetch brands if user type is 2 (dropdown users)
    useEffect(() => {
        if (userDetails?.type?.toString() === "2") {
            fetchBrands()
        }
    }, [userDetails?.type])

    // Handle initial loading - only set to false when ALL API calls are complete
    useEffect(() => {
        // Check if all required API calls are complete
        const allApiCallsComplete = industriesLoaded && userDetailsLoaded &&
            (userDetails?.type?.toString() !== "2" || brandsLoaded)

        if (allApiCallsComplete) {
            setIsInitialLoading(false)
        }
    }, [industriesLoaded, userDetailsLoaded, brandsLoaded, userDetails?.type])

    // Handle brand form visibility after loading is complete
    useEffect(() => {
        if (!isInitialLoading && userDetails) {
            // Don't show form for free trial users - they will use brand_id: "0"
            if (isFreeTrailUser) {
                setShowAddBrandForm(false)
                return
            }

            // For user type 1: Check if brand_id exists
            if (userDetails.type?.toString() === "1" && userDetails.payment_status === 1) {
                const hasBrandId = userDetails.brand &&
                    typeof userDetails.brand === 'object' &&
                    userDetails.brand.brand_id?.toString()

                if (!hasBrandId) {
                    setShowAddBrandForm(true)
                }
            }

            // For user type 2: Check if brands array is empty
            if (userDetails.type?.toString() === "2" && userDetails.payment_status === 1) {
                if (brands.length === 0) {
                    setShowAddBrandForm(true)
                } else {
                    setShowAddBrandForm(false)
                }
            }
        }
    }, [isInitialLoading, userDetails, isFreeTrailUser, brands])


    // Handle industry search - no need for client-side filtering since we're fetching from API
    const handleIndustrySearch = (searchTerm: string) => {
        // Optional: You could implement debounced API search here if needed
        // For now, the dropdown will filter the already-loaded industries
    }

    // Helper functions to convert between names and IDs
    const getCountryIdsFromNames = (names: string[]) => {
        return Array.isArray(countries) ? names.map(name => countries.find(c => c.name === name)?.id).filter(Boolean) as string[] : []
    }

    const getCountryNamesFromIds = (ids: string[]) => {
        return Array.isArray(countries) ? ids.map(id => countries.find(c => c.id === id)?.name).filter(Boolean) as string[] : []
    }


    // Prepare data for CountrySelector components - use unique keys to avoid duplicates
    const countryOptions = Array.isArray(countries) ? countries.map(country => ({
        value: country.name,
        label: country.name,
        id: country.id,
        type: country.type || 'default'
    })) : []

    // Get currently selected country names that are still available in the options
    const availableSelectedNames = getCountryNamesFromIds(country)


    const fetchCountries = async (searchTerm: string = '') => {
        // Only fetch countries if search term has 2 or more characters
        if (searchTerm.length < 2) {
            return  // Don't clear countries, just return
        }

        setLoadingCountries(true)
        try {
            const response = await fetch(`https://techades.com/App/api.php?gofor=locationlist&search=${searchTerm}`)
            if (!response.ok) {
                throw new Error('Failed to fetch countries')
            }
            const data = await response.json()

            // Get currently selected country names to preserve them
            const selectedCountryNames = getCountryNamesFromIds(country)

            // Merge new data with existing selected countries to ensure they remain available
            const existingCountries = countries || []
            const selectedCountries = existingCountries.filter(c => selectedCountryNames.includes(c.name))
            const newCountries = data.filter((newCountry: any) =>
                !existingCountries.some(existing => existing.id === newCountry.id)
            )

            // Combine selected countries with new search results
            setCountries([...selectedCountries, ...newCountries])
        } catch (error) {
            console.error('Error fetching countries:', error)
            toast.error('Failed to load countries')
        } finally {
            setLoadingCountries(false)
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
            setIndustriesLoaded(true)
        }
    }

    const fetchBrands = async () => {
        setLoadingBrands(true)
        try {
            const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=brandslist&user_id=${userId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch brands')
            }
            const data = await response.json()
            setBrands(data)
        } catch (error) {
            console.error('Error fetching brands:', error)
            toast.error('Failed to load brands')
        } finally {
            setLoadingBrands(false)
            setBrandsLoaded(true)
        }
    }

    // Brand form handlers
    const handleBrandFormCancel = () => {
        setShowAddBrandForm(false)
    }

    const handleBrandAdded = () => {
        setShowAddBrandForm(false)
        // Refresh brands list for user type 2
        if (userDetails?.type?.toString() === "2") {
            fetchBrands()
        }
        // Refresh user details to get updated brand info
        window.location.reload()
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
        const selectedCountries = Array.isArray(countries) ? countries.filter(c => country.includes(c.id)) : []

        const newTargetInfo = {
            platform,
            industry,
            age: `${minAge}-${maxAge}`,
            gender,
            country: country,
            countryName: selectedCountries.map(c => c.name).join(", "),
            language,
            objective,
            funnelStage
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

        // Validate brand selection only for type 2 non-free-trial users
        if (userDetails?.type?.toString() === "2" && !isFreeTrailUser && !selectedBrand) {
            toast.error('Please select a brand to continue');
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
            // Determine brand_id based on user type
            let brandId = ""
            if (isFreeTrailUser) {
                // Free trial users: send brand_id as 0
                brandId = "0"
            } else if (userDetails?.type?.toString() === "2") {
                // User type 2: Use selected brand from dropdown
                brandId = selectedBrand
            } else if (userDetails?.type?.toString() === "1") {
                // User type 1: Use brand_id from userDetails (no dropdown)
                brandId = (userDetails?.brand && typeof userDetails.brand === 'object')
                    ? userDetails.brand.brand_id?.toString() || ""
                    : ""
            }

            let analyzeData: any = {
                user_id: userId,
                ads_name: currentAdName,
                industry: targetData?.industry || "",
                platform: targetData?.platform || "",
                age: targetData?.age || "",
                gender: targetData?.gender || "",
                country: targetData?.countryName || "",
                ad_type: activeTab === "single" ? "Single" : activeTab === "carousel" ? "Carousel" : "Video",
                brand_id: brandId,
                language: targetData?.language,
                objective: targetData?.objective,
                funnel_stage: targetData?.funnelStage,
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

            let result: any = null
            try {
                result = await response.json()
            } catch (e) {
                // ignore JSON parse error, will be handled below
            }

            // Handle error responses and show popup with error + notes when available
            if (!response.ok || (result && result.error && !result.success)) {
                const popupErrorMessage = result?.error || `Analysis failed: ${response.statusText}`
                const popupNotes = result?.brand_verification?.notes || ""
                setErrorMessage(popupErrorMessage)
                setErrorNotes(popupNotes)
                setErrorModalOpen(true)
                throw new Error(popupErrorMessage)
            }

            if (result && result.success) {
                localStorage.setItem('analysisResults', JSON.stringify(result))
                event("analyze");
                trackAdUpload(result.data.ad_upload_id.toString());
                const eventName = isFreeTrailUser ? `free_trail_user_${activeTab}_Ad_Analyzed` : `${activeTab}_Ad_Analyzed`
                trackEvent(eventName, window.location.href, userDetails?.email?.toString())
                // Generate token for the ad_id with user_id
                const token = generateAdToken(result.data.ad_upload_id, userDetails?.user_id);
                router.push(`/results?ad-token=${token}`)
            } else {
                const popupErrorMessage = result?.error || 'Analysis failed'
                const popupNotes = result?.brand_verification?.notes || ""
                setErrorMessage(popupErrorMessage)
                setErrorNotes(popupNotes)
                setErrorModalOpen(true)
                throw new Error(popupErrorMessage)
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

        // Validate brand selection only for type 2 non-free-trial users
        if (userDetails?.type?.toString() === "2" && !isFreeTrailUser && !selectedBrand) {
            toast.error('Please select a brand to continue');
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

                {errorModalOpen && (
                    <div
                        onClick={() => setErrorModalOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fadeIn"
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className="relative bg-[#171717] rounded-xl w-full max-w-md shadow-2xl border border-[#282828] max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 p-5 border-b border-[#282828] rounded-t-2xl">
                                <div className="bg-[#ff5555]/20 p-2 rounded-full">
                                    <TriangleAlert className="text-[#ff5555] w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-[#ff5555]">Ad Verification Failed</h2>
                                <button
                                    type="button"
                                    onClick={() => setErrorModalOpen(false)}
                                    className="ml-auto text-gray-400 hover:text-white p-2 rounded transition-colors focus:outline-none focus:bg-[#333333]"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Body */}
                            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                                <div>
                                    <div className="text-white">
                                        <span className="text-white/80 font-medium">{errorMessage}</span>
                                    </div>
                                </div>
                                {errorNotes && (
                                    <div>
                                        <Label className="text-white/80 font-semibold mb-1 block">Notes</Label>
                                        <div className="mt-1 text-white/80 whitespace-pre-line">
                                            {errorNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Overlay */}
                {sidePanelOpen && (
                    <div
                        onClick={(e) => {
                            // Don't close if clicking on Select dropdown elements
                            const target = e.target as HTMLElement;
                            const isSelectDropdown = target?.closest('[data-slot="select-content"]') ||
                                target?.closest('[data-radix-select-content]') ||
                                target?.closest('[role="listbox"]') ||
                                target?.closest('[role="option"]');

                            if (!isSelectDropdown) {
                                setSidePanelOpen(false);
                            }
                        }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Center Modal */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
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

                                    {/* Brand Dropdown in Modal - Only show for user type 2 */}
                                    {userDetails?.type?.toString() === "2" && userDetails?.payment_status === 1 && (
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Select Brand *</Label>
                                            <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={loadingBrands}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select a brand"} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black border-[#3d3d3d] text-white">
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.brand_id} value={brand.brand_id.toString()}>
                                                            {brand.brand_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

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
                                                    <SelectItem value="Meta(FB & IG)">Meta(FB & IG)</SelectItem>
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
                                            {isMobile ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIndustryModalOpen(true)}
                                                        className="w-full bg-black border-[#3d3d3d] text-white py-2 px-4 rounded-md text-left flex items-center justify-between"
                                                    >
                                                        <span className={industry ? "text-white text-sm" : "text-white/60 text-sm"}>
                                                            {industry || "Select industry"}
                                                        </span>
                                                        <ChevronDown className="w-4 h-4 text-white/60" />
                                                    </button>
                                                    {industryModalOpen && (
                                                        <div
                                                            className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
                                                            onClick={() => setIndustryModalOpen(false)}
                                                        >
                                                            <div
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="bg-black rounded-xl w-full max-w-md h-[50vh] flex flex-col"
                                                            >
                                                                <div className="p-4 border-b border-white/50">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h3 className="text-white font-semibold">Select Industry</h3>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setIndustryModalOpen(false)}
                                                                            className="text-white/80 hover:text-white"
                                                                            aria-label="Close"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                                                        <input
                                                                            type="text"
                                                                            value={industrySearch}
                                                                            onChange={(e) => setIndustrySearch(e.target.value)}
                                                                            placeholder="Search industries..."
                                                                            className="w-full pl-9 pr-3 py-3 text-sm bg-[#171717]  text-white rounded-md placeholder-white/70 focus:outline-none focus:border-orange-500 transition-colors"
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 overflow-y-auto p-2">
                                                                    {(industries || []).filter((it) => it.name.toLowerCase().includes(industrySearch.toLowerCase())).map((it) => (
                                                                        <button
                                                                            key={it.industry_id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setIndustry(it.name)
                                                                                setIndustryModalOpen(false)
                                                                                setIndustrySearch("")
                                                                            }}
                                                                            className={`w-full text-left p-3 rounded-lg transition-colors ${industry === it.name ? 'bg-orange-500/10 text-orange-500' : 'text-white hover:bg-[#2b2b2b]'}`}
                                                                        >
                                                                            {it.name}
                                                                        </button>
                                                                    ))}
                                                                    {industries && industries.length === 0 && (
                                                                        <div className="px-4 py-4 text-sm text-gray-400 text-center">No options available</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <CustomSearchDropdown
                                                    options={industries.map((industryItem) => ({
                                                        id: industryItem.industry_id.toString(),
                                                        name: industryItem.name,
                                                    }))}
                                                    value={industry}
                                                    onValueChange={setIndustry}
                                                    placeholder="Select industry"
                                                    searchPlaceholder="Search industries..."
                                                    onSearch={handleIndustrySearch}
                                                    className="w-full"
                                                    triggerClassName="w-full bg-black border-[#3d3d3d] text-white py-2"
                                                    containerClassName="bg-black border-[#3d3d3d]"
                                                />
                                            )}
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

                                        {/* Language */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Language</Label>
                                            <Select value={language} onValueChange={setLanguage}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b] max-h-[300px] overflow-y-auto">
                                                    {/* English */}
                                                    <SelectItem value="en-US">English (United States)</SelectItem>
                                                    <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                                                    <SelectItem value="en-IN">English (India)</SelectItem>

                                                    {/* Spanish */}
                                                    <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                                                    <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>

                                                    {/* French */}
                                                    <SelectItem value="fr-FR">French (France)</SelectItem>
                                                    <SelectItem value="fr-CA">French (Canada)</SelectItem>

                                                    {/* German / Italian */}
                                                    <SelectItem value="de-DE">German (Germany)</SelectItem>
                                                    <SelectItem value="it-IT">Italian (Italy)</SelectItem>

                                                    {/* Portuguese */}
                                                    <SelectItem value="pt-PT">Portuguese (Portugal)</SelectItem>
                                                    <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>

                                                    {/* Arabic */}
                                                    <SelectItem value="ar-SA">Arabic (Saudi Arabia)</SelectItem>
                                                    <SelectItem value="ar-EG">Arabic (Egypt)</SelectItem>

                                                    {/* Turkish / Russian */}
                                                    <SelectItem value="tr-TR">Turkish (Turkey)</SelectItem>
                                                    <SelectItem value="ru-RU">Russian (Russia)</SelectItem>

                                                    {/* Chinese / Japanese / Korean */}
                                                    <SelectItem value="zh-CN">Chinese (Simplified, China)</SelectItem>
                                                    <SelectItem value="zh-TW">Chinese (Traditional, Taiwan)</SelectItem>
                                                    <SelectItem value="ja-JP">Japanese</SelectItem>
                                                    <SelectItem value="ko-KR">Korean</SelectItem>

                                                    {/* Indian Regional */}
                                                    <SelectItem value="hi-IN">Hindi (India)</SelectItem>
                                                    <SelectItem value="ta-IN">Tamil (India)</SelectItem>
                                                    <SelectItem value="te-IN">Telugu (India)</SelectItem>
                                                    <SelectItem value="ml-IN">Malayalam (India)</SelectItem>
                                                    <SelectItem value="kn-IN">Kannada (India)</SelectItem>
                                                </SelectContent>

                                            </Select>
                                        </div>

                                        {/* Objective */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Objective</Label>
                                            <Select value={objective} onValueChange={setObjective}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder="Select objective" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                                    <SelectItem value="Awareness">Awareness</SelectItem>
                                                    <SelectItem value="Engagement">Engagement</SelectItem>
                                                    <SelectItem value="Traffic">Traffic</SelectItem>
                                                    <SelectItem value="Leads">Leads</SelectItem>
                                                    <SelectItem value="Sales">Sales</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Funnel Stage */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Funnel Stage</Label>
                                            <Select value={funnelStage} onValueChange={setFunnelStage}>
                                                <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                    <SelectValue placeholder="Select funnel stage" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                                    <SelectItem value="cold-audience">Cold Audience </SelectItem>
                                                    <SelectItem value="warm-audience">Warm Audience</SelectItem>
                                                    <SelectItem value="Retargeting / Hot">Retargeting / Hot</SelectItem>
                                                </SelectContent> 
                                            </Select>
                                        </div>

                                        {/* Cities and Countries */}
                                        <div className="space-y-2">
                                            <Label className="text-white/70 font-semibold">Cities and Countries to Advertise</Label>
                                            <CountrySelector
                                                options={countryOptions}
                                                selectedValues={availableSelectedNames}
                                                onValueChange={(selectedNames) => {
                                                    const selectedIds = getCountryIdsFromNames(selectedNames)
                                                    setCountry(selectedIds)
                                                }}
                                                placeholder="Select cities and countries..."
                                                className="bg-black border-[#3d3d3d] text-white"
                                                onSearchChange={(searchValue) => {
                                                    setCountrySearch(searchValue)
                                                    // Only fetch if we have a search term
                                                    if (searchValue.length >= 2) {
                                                        fetchCountries(searchValue)
                                                    }
                                                }}
                                                loading={loadingCountries}
                                            />
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
                    {/* Initial Loading State - Skeleton */}
                    {isInitialLoading && (
                        <UploadLoadingSkeleton />
                    )}

                    {/* Add Brand Form - Show when needed */}
                    {!isInitialLoading && showAddBrandForm && (
                        <div className="max-w-4xl mx-auto mb-6">
                            <AddBrandForm
                                onCancel={handleBrandFormCancel}
                                onAdded={handleBrandAdded}
                            />
                        </div>
                    )}

                    {/* Main Content */}
                    {!isInitialLoading && (
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
                                                ? Number(userDetails?.ads_limit) === 0
                                                : isFreeTrailUser || Number(userDetails?.ads_limit) < 3
                                        }
                                        message={
                                            activeTab === "single"
                                                ? "You don't have sufficient credits. Upgrade to Pro to analyze more ads."
                                                : isFreeTrailUser
                                                    ? "Upgrade to Pro to unlock this ad type."
                                                    : "You don't have sufficient credits. Upgrade to Pro to analyze more ads."
                                        }
                                        activeTab={activeTab}
                                        adsLimit={Number(userDetails?.ads_limit) || 0}
                                        isFreeTrailUser={isFreeTrailUser}
                                        onUpgradeClick={() => router.push("/pro")}
                                    >
                                        <div className="w-full max-w-4xl mx-auto">
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                                {/* Ad Name Input */}
                                                <div className="space-y-2 mb-0 sm:mb-6 w-full">
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
                                                        className="bg-[#171717] border-[#3d3d3d] text-white placeholder-gray-400 text-base py-3 w-full"
                                                        autoComplete="off"
                                                        spellCheck="false"
                                                    />
                                                </div>

                                                {/* Brand Dropdown - Only show for user type 2 */}
                                                {userDetails?.type?.toString() === "2" && userDetails?.payment_status === 1 && (
                                                    <div className="space-y-2 mb-6 w-full">
                                                        <Label className="text-white/70 font-semibold text-base">Select Brand</Label>
                                                        <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={loadingBrands}>
                                                            <SelectTrigger className="bg-[#171717] border-[#3d3d3d] text-white placeholder-gray-400 text-base py-3 w-full">
                                                                <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select a brand"} />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-[#171717] border-[#3d3d3d] text-white">
                                                                {brands.map((brand) => (
                                                                    <SelectItem key={brand.brand_id} value={brand.brand_id.toString()}>
                                                                        {brand.brand_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
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
                    )}
                </main>

            </div>
            <Footer />
        </UserLayout>
    )
}