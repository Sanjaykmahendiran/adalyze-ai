"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Edit2, Settings } from "lucide-react"
import { AnalyzingOverlay } from "../../components/analyzing-overlay"
import { SingleFileUploader } from "./_components/single-file-uploader"
import { CarouselFileUploader } from "./_components/carousel-file-uploader"
import { VideoUploader } from "./_components/video-file-uploader"
import cookies from 'js-cookie'
import toast from "react-hot-toast"
import UserLayout from "@/components/layouts/user-layout"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UploadTarget from "@/assets/upload-target.png"
import { event } from "@/lib/gtm"

interface Country {
    id: string
    name: string
    iso3: string
    numeric_code: string
    iso2: string
    phonecode: string
    region_id: string
    subregion_id: string
    created_at: string
    updated_at: string
    flag: string
}

interface State {
    id: string
    name: string
    country_id: string
    country_code: string
    fips_code: string
    iso2: string
    type: string
    latitude: string
    longitude: string
    created_at: string
    updated_at: string
    flag: string
    wikiDataId: string
}

interface TargetInfo {
    platform: string
    industry: string
    age: string
    gender: string
    country: string
    state: string
    countryName?: string
    stateName?: string
}

export default function UploadPage() {
    const { userDetails } = useFetchUserDetails()
    const router = useRouter()

    // Common form states
    const [activeTab, setActiveTab] = useState("single")
    const [adName, setAdName] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [sidePanelOpen, setSidePanelOpen] = useState(false)
    const [targetInfo, setTargetInfo] = useState<TargetInfo | null>(null)
    const [showTargetPopup, setShowTargetPopup] = useState(false)

    // Form states for side panel
    const [platform, setPlatform] = useState("")
    const [industry, setIndustry] = useState("")
    const [age, setAge] = useState("")
    const [gender, setGender] = useState("")
    const [country, setCountry] = useState("")
    const [state, setState] = useState("")

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

    // Video ad states
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoScreenshots, setVideoScreenshots] = useState<string[]>([])
    const [videoFilePath, setVideoFilePath] = useState<File | null>(null)
    const [isVideoUploaded, setIsVideoUploaded] = useState(false)
    const [isVideoUploading, setIsVideoUploading] = useState(false)
    const [videoUploadProgress, setVideoUploadProgress] = useState(0)

    // Location states
    const [countries, setCountries] = useState<Country[]>([])
    const [states, setStates] = useState<State[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingStates, setLoadingStates] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const [stateSearch, setStateSearch] = useState("")

    const userId = cookies.get("userId") || ""

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

    // Check if files are uploaded
    const hasUploadedFiles = () => {
        if (activeTab === "single") return singleFile && singleImageUrl
        if (activeTab === "carousel") return carouselFiles.length >= 3 && carouselImageUrls.length >= 3
        if (activeTab === "video") return videoFile && isVideoUploaded && videoScreenshots.length > 0 && videoFilePath
        return false
    }

    // Check if target info is properly filled
    const hasTargetInfo = () => {
        return targetInfo && targetInfo.platform && targetInfo.industry
    }

    // Fetch countries on component mount
    useEffect(() => {
        fetchCountries()
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

    // Single file handlers
    const handleSingleFileChange = async (uploadedFile: File | null) => {
        setSingleFile(uploadedFile)
        if (uploadedFile) {
            if (!adName) {
                setAdName(uploadedFile.name.split(".")[0])
            }
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

            // Simulate progress for demo (replace with actual XMLHttpRequest for real progress)
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
                setSingleImageUrl(result.fileUrl)
                // Don't show toast here, let the component handle it
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (err) {
            console.error('File upload error:', err)
            setSingleFile(null)
            setSingleImageUrl(null)
            // Don't show toast here, let the component handle it
            throw err // Re-throw to let component handle
        } finally {
            setIsSingleUploading(false)
            setSingleUploadProgress(0)
        }
    }

    // Carousel file handlers
    const handleCarouselFilesChange = async (uploadedFiles: File[]) => {
        setCarouselFiles(uploadedFiles)
        if (uploadedFiles.length > 0) {
            if (!adName && uploadedFiles[0]) {
                setAdName(uploadedFiles[0].name.split(".")[0])
            }
            try {
                await uploadCarouselFiles(uploadedFiles)
            } catch (error) {
                // Error already handled in uploadCarouselFiles and component
            }
        } else {
            setCarouselImageUrls([])
        }
    }

    const uploadCarouselFiles = async (filesToUpload: File[]) => {
        setIsCarouselUploading(true)
        setCarouselUploadProgress(0)

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

            const uploadPromises = filesToUpload.map(async (file) => {
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
                    return result.fileUrl
                } else {
                    throw new Error(result.message || 'Upload failed')
                }
            })

            const uploadedUrls = await Promise.all(uploadPromises)
            clearInterval(progressInterval)
            setCarouselUploadProgress(100)
            setCarouselImageUrls(uploadedUrls)
            // Don't show toast here, let the component handle it
        } catch (err) {
            console.error('Carousel upload error:', err)
            setCarouselFiles([])
            setCarouselImageUrls([])
            // Don't show toast here, let the component handle it
            throw err // Re-throw to let component handle
        } finally {
            setIsCarouselUploading(false)
            setCarouselUploadProgress(0)
        }
    }

    // Video file handlers
    const handleVideoFileChange = async (uploadedFile: File | null) => {
        setVideoFile(uploadedFile)
        if (uploadedFile) {
            if (!adName) {
                setAdName(uploadedFile.name.split(".")[0])
            }
            try {
                await uploadVideoFile(uploadedFile)
            } catch (error) {
                // Error already handled in uploadVideoFile and component
            }
        } else {
            setVideoScreenshots([])
            setIsVideoUploaded(false)
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

            if (result.status === "success" && result.screenshots && result.screenshots.length > 0) {
                setVideoScreenshots(result.screenshots)
                setVideoFilePath(result.video)
                setIsVideoUploaded(true)
                // Don't show toast here, let the component handle it
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (err) {
            console.error('Video upload error:', err)
            setVideoFile(null)
            setVideoScreenshots([])
            setVideoFilePath(null)
            setIsVideoUploaded(false)
            // Don't show toast here, let the component handle it
            throw err // Re-throw to let component handle
        } finally {
            setIsVideoUploading(false)
            setVideoUploadProgress(0)
        }
    }

    const handleSetTarget = () => {
        setSidePanelOpen(true)
        // Pre-fill form with existing target info if available
        if (targetInfo) {
            setPlatform(targetInfo.platform)
            setIndustry(targetInfo.industry)
            setAge(targetInfo.age)
            setGender(targetInfo.gender)
            setCountry(targetInfo.country)
            setState(targetInfo.state)
        }
    }

    const handleSaveTarget = () => {
        const selectedCountry = countries.find(c => c.id === country)
        const selectedState = states.find(s => s.id === state)

        setTargetInfo({
            platform,
            industry,
            age,
            gender,
            country,
            state,
            countryName: selectedCountry?.name || "",
            stateName: selectedState?.name || ""
        })
        setSidePanelOpen(false)
    }

    const handleAnalyze = async (skipTargetCheck = false) => {
        // First check if files are uploaded
        if (!hasUploadedFiles()) {
            toast.error('Please upload files first')
            return
        }

        // Then check if target info is set (unless we're skipping this check)
        if (!skipTargetCheck && !hasTargetInfo()) {
            setShowTargetPopup(true)
            return
        }

        setIsAnalyzing(true)

        try {
            let analyzeData: any = {
                user_id: userId,
                ads_name: adName || "Untitled Ad",
                industry: targetInfo?.industry || "",
                platform: targetInfo?.platform || "",
                age: targetInfo?.age || "",
                gender: targetInfo?.gender || "",
                country: targetInfo?.countryName || "",
                state: targetInfo?.stateName || "",
                ad_type: activeTab === "single" ? "Single" : activeTab === "carousel" ? "Carousel" : "Video"
            }

            // Add media
            if (activeTab === "single") analyzeData.images = [singleImageUrl]
            if (activeTab === "carousel") analyzeData.images = carouselImageUrls
            if (activeTab === "video") analyzeData.screenshots = videoScreenshots
            if (activeTab === "video") analyzeData.video = videoFilePath

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

                toast.success("Analysis completed successfully!")
                router.push(`/results?ad_id=${result.data.ad_upload_id}`)
            } else {
                throw new Error(result.message || 'Analysis failed')
            }
        } catch (err) {
            console.error('Analysis error:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to analyze ad')
        } finally {
            setIsAnalyzing(false)
        }
    }


    // Information Card Component
    const InformationCard = () => (
        <div className="bg-[#121212] border-none rounded-2xl sm:rounded-3xl shadow-2xl h-full">
            <div className="p-5 flex flex-col h-full">


                {/* Content based on state */}
                {!hasUploadedFiles() ? (

                    <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                        <div className="w-34 h-34  flex items-center justify-center mb-3 overflow-hidden ">
                            <img
                                src={UploadTarget.src}
                                alt="Upload Target"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <p className="text-gray-300 text-lg mb-1">Upload your ad creative first</p>
                        <p className="text-gray-400 text-sm">Then set your target audience</p>
                    </div>
                ) : !targetInfo ? (
                    <div className="flex-1">
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-3">
                            <Settings className="w-5 h-5 text-[#db4900]" />
                            <h3 className="text-base font-semibold text-white">Ad Information</h3>
                        </div>
                        {/* Show ad name even without target info */}
                        {adName && (
                            <div className="mb-4">
                                <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                    <p className="text-xs text-primary">Ad Name</p>
                                    <p className="text-white text-sm font-medium truncate overflow-hidden break-words">{adName}</p>
                                </div>
                            </div>
                        )}

                        {/* Call to action for setting target */}
                        <div className="flex flex-col items-center justify-center text-center py-4">

                            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 overflow-hidden ">
                                <img
                                    src={UploadTarget.src}
                                    alt="Upload Target"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-white text-sm mb-1">Ready to set target!</p>
                            <p className="text-gray-400 text-xs">Configure your audience settings</p>

                        </div>
                        <div className="flex flex-col items-center justify-center text-center py-4">
                            <Button
                                variant="outline"
                                onClick={handleSetTarget}
                                className=" border-[#db4900] text-[#db4900] hover:bg-[#db4900] hover:text-white"
                            >
                                Set Target
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 space-y-4">
                        {/* Ad Details */}
                        {(adName || targetInfo?.platform || targetInfo?.industry) && (
                            <div>
                                <div className="mb-4">

                                    {/* Title */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Settings className="w-5 h-5 text-[#db4900]" />
                                        <h3 className="text-base font-semibold text-white">Ad Details</h3>
                                    </div>
                                    {adName && (
                                        <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                            <p className="text-xs text-primary">Ad Name</p>
                                            <p className="text-white text-sm font-medium truncate overflow-hidden break-words">
                                                {adName}
                                            </p>
                                        </div>

                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">

                                    {targetInfo?.platform && (
                                        <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                            <p className="text-xs text-primary">Platform</p>
                                            <p className="text-white text-sm font-medium capitalize">
                                                {targetInfo.platform}
                                            </p>
                                        </div>
                                    )}
                                    {targetInfo?.industry && (
                                        <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                            <p className="text-xs text-primary">Industry</p>
                                            <p className="text-white text-sm font-medium capitalize">
                                                {targetInfo.industry}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Demographics */}
                        {(targetInfo?.age || targetInfo?.gender) && (
                            <div>
                                <p className="text-sm font-semibold text-gray-200 mb-1">Demographics</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {targetInfo?.age && (
                                        <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                            <p className="text-xs text-primary">Age</p>
                                            <p className="text-white text-sm font-medium">{targetInfo.age}</p>
                                        </div>
                                    )}
                                    {targetInfo?.gender && (
                                        <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                            <p className="text-xs text-primary">Gender</p>
                                            <p className="text-white text-sm font-medium capitalize">
                                                {targetInfo.gender}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        {(targetInfo?.countryName || targetInfo?.stateName) && (
                            <div>
                                <p className="text-sm font-semibold text-gray-200 mb-1">Location</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {targetInfo?.countryName && (
                                        <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                            <p className="text-xs text-primary">Country</p>
                                            <p className="text-white text-sm font-medium">{targetInfo.countryName}</p>
                                        </div>
                                    )}
                                    {targetInfo?.stateName && (
                                        <div className="bg-[#2b2b2b] p-2 rounded-xl">
                                            <p className="text-xs text-primary">State</p>
                                            <p className="text-white text-sm font-medium">{targetInfo.stateName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Buttons - Only show Set Target button, remove Analyze button */}
                <div className="mt-4">
                    {targetInfo ? (
                        <Button
                            onClick={handleSetTarget}
                            variant="outline"
                            className="w-full"
                        >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit Target
                        </Button>
                    ) : (
                        <></>
                    )}
                </div>

            </div>
        </div>
    )

    return (
        <UserLayout userDetails={userDetails}>
            <div className="min-h-screen text-white relative">
                {isAnalyzing && <AnalyzingOverlay />}

                {/* Side Panel Overlay */}
                {sidePanelOpen && (
                    <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-50" onClick={() => setSidePanelOpen(false)} />
                )}

                {/* Target Info Required Popup */}
                {showTargetPopup && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                        <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
                            <div className="p-6">
                                {/* Icon and Title */}
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-16 h-16 bg-[#db4900]/20 rounded-full flex items-center justify-center mb-4">
                                        <Settings className="w-8 h-8 text-[#db4900]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Want Better Insights?</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Adding your target audience helps us personalize the analysis.
                                        You can also skip this step and continue right away.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowTargetPopup(false);
                                            handleAnalyze(true); // Pass true to skip target check
                                        }}
                                        className="flex-1 border-[#2b2b2b] text-gray-300 hover:bg-[#2b2b2b] hover:text-white"
                                    >
                                        Continue Without
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setShowTargetPopup(false);
                                            handleSetTarget();
                                        }}
                                        className="flex-1 bg-[#db4900] hover:bg-[#c44000] text-white"
                                    >
                                        Set Target
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}


                {/* Side Panel */}
                <div
                    className={`fixed right-0 top-16 h-full w-100 bg-[#0a0a0a] rounded-l-xl 
              shadow-xl shadow-white/40 transform transition-transform duration-300 ease-in-out z-50 
              ${sidePanelOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}
                >

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Set Target</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidePanelOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4 ">
                            {/* Ad Name */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-semibold">Ad Name *</Label>
                                <Input
                                    placeholder="Enter ad name"
                                    value={adName}
                                    onChange={(e) => setAdName(e.target.value)}
                                    className="bg-[#121212] border-[#2b2b2b] text-white"
                                />
                            </div>

                            {/* Platform */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-semibold">Platform Target</Label>
                                <Select value={platform} onValueChange={setPlatform}>
                                    <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b] text-white">
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="twitter">Twitter</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                        <SelectItem value="pinterest">Pinterest</SelectItem>
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Industry */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-semibold">Industry Category</Label>
                                <Select value={industry} onValueChange={setIndustry}>
                                    <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b] text-white ">
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                        <SelectItem value="retail">Retail & E-commerce</SelectItem>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="finance">Finance & Banking</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                        <SelectItem value="travel">Travel & Hospitality</SelectItem>
                                        <SelectItem value="food">Food & Beverage</SelectItem>
                                        <SelectItem value="entertainment">Entertainment & Media</SelectItem>
                                        <SelectItem value="automotive">Automotive</SelectItem>
                                        <SelectItem value="real-estate">Real Estate</SelectItem>
                                        <SelectItem value="service">Service & Cleaning</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Age Group */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-semibold">Age Group</Label>
                                <Select value={age} onValueChange={setAge}>
                                    <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b] text-white">
                                        <SelectValue placeholder="Select age group" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                        <SelectItem value="13-17">13-17 years</SelectItem>
                                        <SelectItem value="18-24">18-24 years</SelectItem>
                                        <SelectItem value="25-34">25-34 years</SelectItem>
                                        <SelectItem value="35-44">35-44 years</SelectItem>
                                        <SelectItem value="45-54">45-54 years</SelectItem>
                                        <SelectItem value="55-64">55-64 years</SelectItem>
                                        <SelectItem value="65+">65+ years</SelectItem>
                                        <SelectItem value="all">All Ages</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-semibold">Gender</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger className=" w-full bg-[#121212] border-[#2b2b2b] text-white">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="non-binary">Non-binary</SelectItem>
                                        <SelectItem value="all">All Genders</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Country */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 font-semibold">Country</Label>
                                <Select value={country} onValueChange={setCountry} disabled={loadingCountries}>
                                    <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b] text-white">
                                        <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"} />
                                    </SelectTrigger>
                                    <SelectContent className=" w-full bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                        <div className="p-2">
                                            <Input
                                                placeholder="Search countries..."
                                                value={countrySearch}
                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 h-8"
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
                                <Label className="text-gray-300 font-semibold">State/Province</Label>
                                <Select value={state} onValueChange={setState} disabled={!country || loadingStates}>
                                    <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b] text-white">
                                        <SelectValue placeholder={
                                            !country ? "Select country first" :
                                                loadingStates ? "Loading..." : "Select state"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent className=" w-full bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                        {states.length > 0 && (
                                            <div className="p-2">
                                                <Input
                                                    placeholder="Search states..."
                                                    value={stateSearch}
                                                    onChange={(e) => setStateSearch(e.target.value)}
                                                    className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 h-8"
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

                            {/* Save Button */}
                            <div className="pt-4">
                                <Button
                                    onClick={handleSaveTarget}
                                    className="w-full bg-[#db4900] hover:bg-[#c44000] text-white"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6 pb-20">
                    {/* Main Content */}
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-[#000000] border-none rounded-2xl sm:rounded-3xl shadow-2xl">
                            <div className="px-4 sm:px-6 lg:px-8 sm:pb-2 pt-2 sm:pt-4">
                                <div className="text-xl font-bold text-white">Upload Your Ads</div>
                                <div className="text-gray-300">Please select the type of ad you want to analyze.</div>
                            </div>
                            <div className="p-2 lg:p-4">
                                {/* Radio Button Selection */}
                                <div className="w-full mb-2 sm:mb-">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Single Image Ad */}
                                        <label
                                            className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all 
                                                        ${activeTab === "single"
                                                    ? "border-[#db4900] bg-[#db4900]/10"
                                                    : "border-[#2b2b2b] hover:border-[#db4900]/50"}`}
                                        >
                                            <input
                                                type="radio"
                                                name="adType"
                                                value="single"
                                                checked={activeTab === "single"}
                                                onChange={() => setActiveTab("single")}
                                                className="appearance-none w-4 h-4 rounded-full border-2 border-gray-500 bg-[#2b2b2b] 
                                                            checked:bg-[#db4900] checked:border-[#db4900] transition-colors"
                                            />
                                            <span className="text-white font-medium">Single Image Ad</span>
                                        </label>

                                        {/* Carousel */}
                                        <label
                                            className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all 
                                                        ${activeTab === "carousel"
                                                    ? "border-[#db4900] bg-[#db4900]/10"
                                                    : "border-[#2b2b2b] hover:border-[#db4900]/50"}`}
                                        >
                                            <input
                                                type="radio"
                                                name="adType"
                                                value="carousel"
                                                checked={activeTab === "carousel"}
                                                onChange={() => setActiveTab("carousel")}
                                                className="appearance-none w-4 h-4 rounded-full border-2 border-gray-500 bg-[#2b2b2b] 
                                                                checked:bg-[#db4900] checked:border-[#db4900] transition-colors"
                                            />
                                            <span className="text-white font-medium">Carousel</span>
                                        </label>

                                        {/* Video Ad */}
                                        <label
                                            className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all 
                                                                ${activeTab === "video"
                                                    ? "border-[#db4900] bg-[#db4900]/10"
                                                    : "border-[#2b2b2b] hover:border-[#db4900]/50"}`}
                                        >
                                            <input
                                                type="radio"
                                                name="adType"
                                                value="video"
                                                checked={activeTab === "video"}
                                                onChange={() => setActiveTab("video")}
                                                className="appearance-none w-4 h-4 rounded-full border-2 border-gray-500 bg-[#2b2b2b] 
                                                            checked:bg-[#db4900] checked:border-[#db4900] transition-colors"
                                            />
                                            <span className="text-white font-medium">Video Ad</span>
                                        </label>

                                    </div>
                                </div>

                                {/* Conditional Content Rendering */}
                                {activeTab === "single" && (
                                    <div className="mt-6 sm:mt-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                            {/* File Uploader - 60% width (3/5) */}
                                            <div className="lg:col-span-3">
                                                <SingleFileUploader
                                                    file={singleFile}
                                                    onFileChange={handleSingleFileChange}
                                                    imageUrl={singleImageUrl}
                                                    isUploading={isSingleUploading}
                                                    uploadProgress={singleUploadProgress}
                                                />
                                                {/* Analyze Button below file uploader */}
                                                <div className="mt-4">
                                                    <Button
                                                        onClick={() => handleAnalyze()}
                                                        disabled={isAnalyzing || !hasUploadedFiles()}
                                                        className="w-full text-lg bg-[#db4900] hover:bg-[#c44000] text-white py-6"
                                                    >
                                                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* Information Card - 40% width (2/5) */}
                                            <div className="lg:col-span-2">
                                                <InformationCard />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "carousel" && (
                                    <div className="mt-6 sm:mt-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                            {/* File Uploader - 60% width (3/5) */}
                                            <div className="lg:col-span-3">
                                                <CarouselFileUploader
                                                    files={carouselFiles}
                                                    onFilesChange={handleCarouselFilesChange}
                                                    imageUrls={carouselImageUrls}
                                                    isUploading={isCarouselUploading}
                                                    uploadProgress={carouselUploadProgress}
                                                />
                                                {/* Analyze Button below file uploader */}
                                                <div className="mt-4">
                                                    <Button
                                                        onClick={() => handleAnalyze()}
                                                        disabled={isAnalyzing || !hasUploadedFiles()}
                                                        className="w-full text-lg bg-[#db4900] hover:bg-[#c44000] text-white py-6"
                                                    >
                                                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* Information Card - 40% width (2/5) */}
                                            <div className="lg:col-span-2">
                                                <InformationCard />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "video" && (
                                    <div className="mt-6 sm:mt-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                            {/* File Uploader - 60% width (3/5) */}
                                            <div className="lg:col-span-3">
                                                <VideoUploader
                                                    file={videoFile}
                                                    onFileChange={handleVideoFileChange}
                                                    screenshots={videoScreenshots}
                                                    isUploaded={isVideoUploaded}
                                                    isUploading={isVideoUploading}
                                                    uploadProgress={videoUploadProgress}
                                                />
                                                {/* Analyze Button below file uploader */}
                                                <div className="mt-4">
                                                    <Button
                                                        onClick={() => handleAnalyze()}
                                                        disabled={isAnalyzing || !hasUploadedFiles()}
                                                        className="w-full text-lg bg-[#db4900] hover:bg-[#c44000] text-white py-6"
                                                    >
                                                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* Information Card - 40% width (2/5) */}
                                            <div className="lg:col-span-2">
                                                <InformationCard />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </UserLayout>
    )
}