"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Lock } from "lucide-react"
import { AnalyzingOverlay } from "../../components/analyzing-overlay"
import ABFileUploadCard from "./_components/file-uploader"
import AdNameInput from "./_components/AdNameInput"
import cookies from 'js-cookie'
import toast from "react-hot-toast"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"

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
    country: string
    state: string
    countryName?: string
    stateName?: string
}

export default function AdComparisonUpload() {
    const { userDetails } = useFetchUserDetails()
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
    const [country, setCountry] = useState("")
    const [state, setState] = useState("")
    const [minAge, setMinAge] = useState("")
    const [maxAge, setMaxAge] = useState("")


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
    const [states, setStates] = useState<State[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingStates, setLoadingStates] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const [stateSearch, setStateSearch] = useState("")

    const userId = cookies.get("userId") || ""

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

    // Check if files are uploaded
    const hasUploadedFiles = useCallback(() => {
        return fileA && fileB && uploadedImagePathA && uploadedImagePathB
    }, [fileA, fileB, uploadedImagePathA, uploadedImagePathB])

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

    // Filter countries and states based on search
    const filteredCountries = countries.filter(countryItem =>
        countryItem.name.toLowerCase().includes(countrySearch.toLowerCase())
    )

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
        const selectedCountry = countries.find(c => c.id === country)
        const selectedState = states.find(s => s.id === state)

        setTargetInfo({
            platform,
            industry,
            age: `${minAge}-${maxAge}`,
            gender,
            country,
            state,
            countryName: selectedCountry?.name || "",
            stateName: selectedState?.name || ""
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
            const analyzeData = {
                user_id: userId,
                ads_name: adName,
                industry: targetInfo?.industry || "",
                platform: targetInfo?.platform || "",
                age: targetInfo?.age || "",
                gender: targetInfo?.gender || "",
                country: targetInfo?.countryName || "",
                state: targetInfo?.stateName || "",
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
                router.push(`/ab-results?ad_id_a=${result.ad_upload_id_a}&ad_id_b=${result.ad_upload_id_b}`)
            } else {
                throw new Error(result.message || 'A/B analysis failed')
            }
        } catch (err) {
            console.error('A/B Analysis error:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to analyze ads', { id: "analyze" })
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
            setAge(targetInfo.age)
            setGender(targetInfo.gender)
            setCountry(targetInfo.country)
            setState(targetInfo.state)
        }
    }

    const isFreeTrailUser = userDetails?.fretra_status === 1 || (userDetails?.ads_limit ?? 0) < 3;

    let overlayText = "Upgrade to Pro to unlock A/B testing.";

    // If not a free trial user, but ads_limit is less than 3
    if ((userDetails?.ads_limit ?? 0) < 3 && userDetails?.fretra_status !== 1) {
        overlayText = "You don’t have sufficient credits. Upgrade to Pro to analyze more ads.";
    }


    // Handler for ad name change - memoized
    const handleAdNameChange = useCallback((value: string) => {
        setAdName(value)
    }, [])

    return (
        <UserLayout userDetails={userDetails}>
            <div className="relative">
                <div className={isFreeTrailUser ? "blur-sm" : ""}>
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

                                                <div className="space-y-2">
                                                    <Label className="text-white/70 font-semibold">Industry Category</Label>
                                                    <Select value={industry} onValueChange={setIndustry}>
                                                        <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
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
                                                    <Label className="text-white/70 font-semibold">Country</Label>
                                                    <Select value={country} onValueChange={setCountry} disabled={loadingCountries}>
                                                        <SelectTrigger className="w-full bg-black border-[#3d3d3d] text-white">
                                                            <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"} />
                                                        </SelectTrigger>
                                                        <SelectContent className="w-full bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                                            <div className="p-2" onClick={(e) => e.stopPropagation()}>
                                                                <Input
                                                                    placeholder="Search countries..."
                                                                    value={countrySearch}
                                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                                    className="bg-black border-[#3d3d3d] text-white placeholder-gray-500 h-8"
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

                                                <div className="space-y-2">
                                                    <Label className="text-white/70 font-semibold">State/Province</Label>
                                                    <Select value={state} onValueChange={setState} disabled={!country || loadingStates}>
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
                                                                <div className="p-2" onClick={(e) => e.stopPropagation()}>
                                                                    <Input
                                                                        placeholder="Search states..."
                                                                        value={stateSearch}
                                                                        onChange={(e) => setStateSearch(e.target.value)}
                                                                        className="bg-black border-[#3d3d3d] text-white placeholder-gray-500 h-8"
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
                    <div className="absolute inset-0 bg-black/70  flex flex-col items-center justify-center rounded-2xl z-50">
                        <div className="text-center p-4">
                            <Lock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
                            <p className="text-white font-semibold mb-4 text-sm sm:text-base px-2">{overlayText}</p>
                            <Button
                                onClick={() => router.push("/pro")}
                                className="text-white rounded-lg text-sm sm:text-base px-4 py-2"
                            >
                                Upgrade
                            </Button>
                        </div>
                    </div>
                )}
            </div>

        </UserLayout>
    )
}