"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CountrySelector } from "@/components/ui/country-selector"
import { X, Lock } from "lucide-react"
import { AnalyzingOverlay } from "../../components/analyzing-overlay"
import ABFileUploadCard from "./_components/file-uploader"
import AdNameInput from "./_components/AdNameInput"
import cookies from 'js-cookie'
import toast from "react-hot-toast"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import { trackEvent } from "@/lib/eventTracker"
import { Industry } from "../upload/type"
import { generateAdToken } from "@/lib/tokenUtils"
import Footer from "@/components/footer"

interface Country {
    id: string
    name: string
}

interface State {
    id: string
    name: string
    country_id: string
}

interface TargetInfo {
    platform: string
    industry: string
    age: string
    gender: string
    country: string[]
    countryName?: string
}

export default function AdComparisonUpload() {
    const { userDetails, loading } = useFetchUserDetails()
    const router = useRouter()

    // Core states
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [sidePanelOpen, setSidePanelOpen] = useState(false)
    const [targetInfo, setTargetInfo] = useState<TargetInfo | null>(null)

    // Form states - using simple state with memoized child component
    const [adName, setAdName] = useState("")
    const [platform, setPlatform] = useState("")
    const [industry, setIndustry] = useState("")
    const [age, setAge] = useState("")
    const [gender, setGender] = useState("")
    const [country, setCountry] = useState<string[]>([])
    const [minAge, setMinAge] = useState("")
    const [maxAge, setMaxAge] = useState("")
    const [industries, setIndustries] = useState<Industry[]>([])


    // File states
    const [fileA, setFileA] = useState<File | null>(null)
    const [fileB, setFileB] = useState<File | null>(null)
    const [uploadedImagePathA, setUploadedImagePathA] = useState<string | null>(null)
    const [uploadedImagePathB, setUploadedImagePathB] = useState<string | null>(null)

    // Upload progress states
    const [isUploadingA, setIsUploadingA] = useState(false)
    const [isUploadingB, setIsUploadingB] = useState(false)
    const [uploadProgressA, setUploadProgressA] = useState(0)
    const [uploadProgressB, setUploadProgressB] = useState(0)

    // Location states
    const [countries, setCountries] = useState<Country[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const [industrySearch, setIndustrySearch] = useState("")
    const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false)
    const industrySearchInputRef = useRef<HTMLInputElement>(null)


    const userId = cookies.get("userId") || ""

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

    // Filter industries based on search
    const filteredIndustries = industries.filter(industryItem =>
        industryItem.name.toLowerCase().includes(industrySearch.toLowerCase())
    )

    // Modal scroll lock
    useEffect(() => {
        if (sidePanelOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [sidePanelOpen])



    // Auto-focus industry search when dropdown opens
    useEffect(() => {
        if (industryDropdownOpen) {
            setTimeout(() => {
                industrySearchInputRef.current?.focus()
            }, 100)
        }
    }, [industryDropdownOpen])

    // Check if files are uploaded
    const hasUploadedFiles = useCallback(() => {
        return fileA && fileB && uploadedImagePathA && uploadedImagePathB
    }, [fileA, fileB, uploadedImagePathA, uploadedImagePathB])

    // Fetch industries on component mount
    useEffect(() => {
        fetchIndustries()
    }, [])

    // Handle country search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (countrySearch.length >= 2) {
                fetchCountries(countrySearch)
            } else if (countrySearch.length === 0) {
                fetchCountries()
            }
        }, 300) // 300ms debounce

        return () => clearTimeout(timeoutId)
    }, [countrySearch])


    // Filter countries based on search
    const filteredCountries = Array.isArray(countries) ? countries.filter(countryItem =>
        countryItem.name.toLowerCase().includes(countrySearch.toLowerCase())
    ) : []

    // Helper functions to convert between names and IDs
    const getCountryIdsFromNames = (names: string[]) => {
        return Array.isArray(countries) ? names.map(name => countries.find(c => c.name === name)?.id).filter(Boolean) as string[] : []
    }
    
    const getCountryNamesFromIds = (ids: string[]) => {
        return Array.isArray(countries) ? ids.map(id => countries.find(c => c.id === id)?.name).filter(Boolean) as string[] : []
    }

    // Prepare data for CountrySelector components
    const countryOptions = Array.isArray(countries) ? countries.map(country => ({
        value: country.name,
        label: country.name,
        id: country.id,
        type: 'country'
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


    const uploadFile = async (fileToUpload: File, type: string) => {
        const isTypeA = type === "A"
        const setIsUploading = isTypeA ? setIsUploadingA : setIsUploadingB
        const setUploadProgress = isTypeA ? setUploadProgressA : setUploadProgressB
        const toastId = `upload-${type}`

        try {
            setIsUploading(true)
            setUploadProgress(0)

            toast.dismiss(toastId)

            const formData = new FormData()
            formData.append('file', fileToUpload)
            formData.append('user_id', userId)

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
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
            setUploadProgress(100)

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const result = await response.json()

            if (result.status === "Ads Uploaded Successfully" && result.fileUrl) {
                if (type === "A") {
                    setUploadedImagePathA(result.fileUrl)
                } else {
                    setUploadedImagePathB(result.fileUrl)
                }
                toast.success(`File ${type} uploaded successfully!`, { id: toastId })
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (err) {
            console.error(`File ${type} upload error:`, err)
            toast.error(err instanceof Error ? err.message : `Failed to upload file ${type}`, { id: toastId })

            if (type === "A") {
                setFileA(null)
                setUploadedImagePathA(null)
            } else {
                setFileB(null)
                setUploadedImagePathB(null)
            }
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const handleFileUpload = async (file: File | null, type: string) => {
        if (type === "A") {
            setFileA(file)
            if (file) {
                await uploadFile(file, "A")
            } else {
                setUploadedImagePathA(null)
            }
        } else {
            setFileB(file)
            if (file) {
                await uploadFile(file, "B")
            } else {
                setUploadedImagePathB(null)
            }
        }
    }

    const handleCancelUpload = (type: string) => {
        if (type === "A") {
            setIsUploadingA(false)
            setUploadProgressA(0)
            setFileA(null)
            setUploadedImagePathA(null)
        } else {
            setIsUploadingB(false)
            setUploadProgressB(0)
            setFileB(null)
            setUploadedImagePathB(null)
        }
        toast.dismiss(`upload-${type}`)
    }

    const handleSaveTarget = async () => {
        const selectedCountries = Array.isArray(countries) ? countries.filter(c => country.includes(c.id)) : []

        setTargetInfo({
            platform,
            industry,
            age: `${minAge}-${maxAge}`,
            gender,
            country,
            countryName: selectedCountries.map(c => c.name).join(", ")
        })
        setSidePanelOpen(false)

        await handleCompare()
    }

    const handleCompare = async () => {
        if (!adName.trim()) {
            toast.error('Please enter an ad name to continue')
            return
        }

        if (!hasUploadedFiles()) {
            toast.error('Please upload files first')
            return
        }

        setIsAnalyzing(true)

        try {
            // Use targetInfo if available, otherwise use current form values
            
            const analyzeData = {
                user_id: userId,
                ads_name: adName,
                industry: targetInfo?.industry || industry,
                platform: targetInfo?.platform || platform,
                age: targetInfo?.age || (minAge && maxAge ? `${minAge}-${maxAge}` : ""),
                gender: targetInfo?.gender || gender,
                country: targetInfo?.countryName || "",
                imagePathA: uploadedImagePathA,
                imagePathB: uploadedImagePathB
            }

            const response = await fetch('https://adalyzeai.xyz/App/abanalyze.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analyzeData),
            })

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`)
            }

            const result = await response.json()

            if (result.success) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('abAnalysisResults', JSON.stringify(result))
                }
                toast.success("A/B analysis completed successfully!", { id: "analyze" })
                // Generate tokens for both ad IDs
                const tokenA = generateAdToken(result.ad_upload_id_a);
                const tokenB = generateAdToken(result.ad_upload_id_b);
                router.push(`/ab-results?ad-token-a=${tokenA}&ad-token-b=${tokenB}`)
                trackEvent("A/B_Ad_Analyzed_Completed", window.location.href, userDetails?.email?.toString())
            } else {
                throw new Error(result.message || 'A/B analysis failed')
            }
        } catch (err) {
            console.error('A/B Analysis error:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to analyze ads', { id: "analyze" })
            trackEvent("A/B_Ad_Analyzed_Failed", window.location.href, userDetails?.email?.toString())
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleContinueWithTarget = () => {
        if (!adName.trim()) {
            toast.error('Please enter an ad name to continue')
            return
        }

        if (!hasUploadedFiles()) {
            toast.error('Please upload files first')
            return
        }

        setSidePanelOpen(true)
        if (targetInfo) {
            setPlatform(targetInfo.platform)
            setIndustry(targetInfo.industry)
            setGender(targetInfo.gender)
            setCountry(targetInfo.country)
            
            // Parse age range from targetInfo.age (format: "min-max")
            if (targetInfo.age && targetInfo.age.includes('-')) {
                const [min, max] = targetInfo.age.split('-')
                setMinAge(min)
                setMaxAge(max)
            }
        }
    }

    const isFreeTrailUser = userDetails && (userDetails.fretra_status === 1 || (userDetails.ads_limit ?? 0) < 3);

    let overlayText = "Upgrade to Pro to unlock A/B testing.";
    let buttonText = "Upgrade";

    // If not a free trial user, but ads_limit is less than 3
    if (userDetails && (userDetails.ads_limit ?? 0) < 3 && userDetails.fretra_status !== 1) {
        overlayText = "You don't have sufficient credits. Upgrade to Pro to analyze more ads.";
        buttonText = "Add Credits";
    }


    // Handler for ad name change - memoized
    const handleAdNameChange = useCallback((value: string) => {
        setAdName(value)
    }, [])

    // Show skeleton loading while fetching user details
    if (loading) {
        return (
            <UserLayout userDetails={userDetails}>
                <div className="min-h-screen text-white">
                    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6 pb-20">
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-[#000000] border-none rounded-2xl sm:rounded-3xl shadow-2xl">
                                <div className="py-2 lg:py-8 px-4 sm:px-6 lg:px-8">
                                    {/* Ad Name Skeleton */}
                                    <div className="mb-6">
                                        <div className="h-4 w-24 bg-[#2b2b2b] rounded animate-pulse mb-2" />
                                        <div className="h-12 w-full bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg animate-pulse" />
                                    </div>

                                    {/* Upload Cards Skeleton */}
                                    <div className="mt-6 sm:mt-8">
                                        <div className="w-full max-w-4xl mx-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Card A Skeleton */}
                                                <div className="bg-[#0a0a0a] border border-[#2b2b2b] rounded-xl p-6 animate-pulse">
                                                    <div className="h-6 w-32 bg-[#2b2b2b] rounded mb-4" />
                                                    <div className="aspect-square bg-[#1a1a1a] rounded-lg mb-4" />
                                                </div>
                                                {/* Card B Skeleton */}
                                                <div className="bg-[#0a0a0a] border border-[#2b2b2b] rounded-xl p-6 animate-pulse">
                                                    <div className="h-6 w-32 bg-[#2b2b2b] rounded mb-4" />
                                                    <div className="aspect-square bg-[#1a1a1a] rounded-lg mb-4" />
                                                </div>
                                            </div>

                                            {/* Buttons Skeleton */}
                                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1 h-14 bg-[#2b2b2b] rounded-lg animate-pulse" />
                                                <div className="flex-1 h-14 bg-[#db4900]/50 rounded-lg animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </UserLayout>
        )
    }

    return (
        <UserLayout userDetails={userDetails}>
            <div className="relative">
                <div className={isFreeTrailUser ? "blur-sm pointer-events-none" : ""}>
                    <div className="min-h-screen text-white relative">
                        {isAnalyzing && <AnalyzingOverlay />}

                        {sidePanelOpen && (
                            <div
                                onClick={() => setSidePanelOpen(false)}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#171717] rounded-xl shadow-xl shadow-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                            <div className="space-y-2">
                                                <Label htmlFor="modal-ad-name" className="text-white/70 font-semibold">Ad Name *</Label>
                                                <Input
                                                    id="modal-ad-name"
                                                    placeholder="Enter ad name"
                                                    value={adName}
                                                    onChange={(e) => setAdName(e.target.value)}
                                                    className="bg-black border-[#3d3d3d] text-white"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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


                                                <div className="space-y-2">
                                                    <Label className="text-white/70 font-semibold">Gender</Label>
                                                    <Select value={gender} onValueChange={setGender}>
                                                        <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
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
                            <div className="max-w-6xl mx-auto">
                                <div className="bg-[#000000] border-none rounded-2xl sm:rounded-3xl shadow-2xl">
                                    <div className="py-2 lg:py-8 px-4 sm:px-6 lg:px-8">


                                        <AdNameInput
                                            value={adName}
                                            onChange={handleAdNameChange}
                                        />

                                        <div className="mt-6 sm:mt-8">
                                            <div className="w-full max-w-4xl mx-auto">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <ABFileUploadCard
                                                        title="Upload Ad A"
                                                        file={fileA}
                                                        onFileChange={(file) => handleFileUpload(file, "A")}
                                                        type="A"
                                                        imageUrl={uploadedImagePathA}
                                                        isUploading={isUploadingA}
                                                        uploadProgress={uploadProgressA}
                                                        onCancelUpload={() => handleCancelUpload("A")}
                                                    />
                                                    <ABFileUploadCard
                                                        title="Upload Ad B"
                                                        file={fileB}
                                                        onFileChange={(file) => handleFileUpload(file, "B")}
                                                        type="B"
                                                        imageUrl={uploadedImagePathB}
                                                        isUploading={isUploadingB}
                                                        uploadProgress={uploadProgressB}
                                                        onCancelUpload={() => handleCancelUpload("B")}
                                                    />
                                                </div>

                                                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                                    <Button
                                                        onClick={() => handleCompare()}
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                {isFreeTrailUser && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50">
                        <div className="text-center p-4">
                            <Lock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
                            <p className="text-white font-semibold mb-4 text-sm sm:text-base px-2">{overlayText}</p>
                            <Button
                                onClick={() => router.push("/pro")}
                                className="text-white rounded-lg text-sm sm:text-base px-4 py-2"
                            >
                                {buttonText}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </UserLayout>
    )
}