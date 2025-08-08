"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyzingOverlay } from "../../components/analyzing-overlay"
import { FileUploader } from "./_components/file-uploader"
import cookies from 'js-cookie'
import toast from "react-hot-toast"
import UserLayout from "@/components/layouts/user-layout"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"

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

export default function UploadPage() {
    const { userDetails } = useFetchUserDetails()
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [adName, setAdName] = useState("")
    const [platform, setPlatform] = useState("")
    const [industry, setIndustry] = useState("")
    const [age, setAge] = useState("")
    const [gender, setGender] = useState("")
    const [country, setCountry] = useState("")
    const [state, setState] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null)
    const [countries, setCountries] = useState<Country[]>([])
    const [states, setStates] = useState<State[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingStates, setLoadingStates] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const [stateSearch, setStateSearch] = useState("")
    const userId = cookies.get("userId") || ""

    // Fetch countries on component mount
    useEffect(() => {
        fetchCountries()
    }, [])

    // Fetch states when country changes
    useEffect(() => {
        if (country) {
            fetchStates(country)
            setState("") // Reset state when country changes
            setStateSearch("") // Reset state search when country changes
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

    const handleFileChange = async (uploadedFile: File | null) => {
        setFile(uploadedFile)

        if (uploadedFile) {
            // Auto-fill ad name from filename if not already set
            if (!adName) {
                setAdName(uploadedFile.name.split(".")[0])
            }

            // Upload file immediately when selected
            await uploadFile(uploadedFile)
        } else {
            setUploadedImagePath(null)
        }
    }

    const uploadFile = async (fileToUpload: File) => {
        try {
            toast.loading("Uploading file...", { id: "upload" })

            const formData = new FormData()
            formData.append('file', fileToUpload)
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
                setUploadedImagePath(result.fileUrl)
                toast.success("File uploaded successfully!", { id: "upload" })
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (err) {
            console.error('File upload error:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to upload file', { id: "upload" })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !uploadedImagePath) {
            toast.error('Please upload a file first')
            return
        }

        setIsAnalyzing(true)

        try {
            // Get country and state names from their IDs
            const selectedCountry = countries.find(c => c.id === country)
            const selectedState = states.find(s => s.id === state)

            const analyzeData = {
                imagePath: uploadedImagePath,
                user_id: userId,
                ads_name: adName || file.name.split(".")[0],
                industry: industry || "",
                platform: platform || "",
                age: age || "",
                gender: gender || "",
                country: selectedCountry?.name || "",
                state: selectedState?.name || ""
            }

            const response = await fetch('https://adalyzeai.xyz/App/analyze.php', {
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
                // Store analysis results in localStorage or pass via router state
                if (typeof window !== 'undefined') {
                    localStorage.setItem('analysisResults', JSON.stringify(result))
                }
                toast.success("Analysis completed successfully!", { id: "analyze" })
                router.push(`/results?ad_id=${result.data.ad_upload_id}`)
            } else {
                throw new Error(result.message || 'Analysis failed')
            }
        } catch (err) {
            console.error('Analysis error:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to analyze ad', { id: "analyze" })
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <UserLayout userDetails={userDetails}>
            <div className="min-h-screen text-white">
                {isAnalyzing && <AnalyzingOverlay />}

                <main className="container mx-auto px-6 py-12">
                    {/* Header Section */}
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight">Upload Ad Creative</h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Upload your ad creative for AI-powered analysis and get actionable insights to improve your ad performance.
                        </p>
                    </div>

                    {/* Main Upload Card */}
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-[#000000] border-none rounded-3xl shadow-2xl">
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* File Uploader */}
                                    <FileUploader file={file} onFileChange={handleFileChange} />

                                    {/* Form Fields */}
                                    <div className="space-y-3">
                                        <Label htmlFor="adName" className="text-gray-300 font-semibold">
                                            Ad Name
                                        </Label>
                                        <Input
                                            id="adName"
                                            placeholder="Enter a name for your ad"
                                            value={adName}
                                            onChange={(e) => setAdName(e.target.value)}
                                            className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 rounded-2xl h-12 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="industry" className="text-gray-300 font-semibold">
                                                Industry Category
                                            </Label>
                                            <Select value={industry} onValueChange={setIndustry}>
                                                <SelectTrigger
                                                    id="industry"
                                                    className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    <SelectValue placeholder="Select industry" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                                    <SelectItem value="retail" className="text-white hover:bg-gray-800">
                                                        Retail & E-commerce
                                                    </SelectItem>
                                                    <SelectItem value="technology" className="text-white hover:bg-gray-800">
                                                        Technology
                                                    </SelectItem>
                                                    <SelectItem value="finance" className="text-white hover:bg-gray-800">
                                                        Finance & Banking
                                                    </SelectItem>
                                                    <SelectItem value="healthcare" className="text-white hover:bg-gray-800">
                                                        Healthcare
                                                    </SelectItem>
                                                    <SelectItem value="education" className="text-white hover:bg-gray-800">
                                                        Education
                                                    </SelectItem>
                                                    <SelectItem value="travel" className="text-white hover:bg-gray-800">
                                                        Travel & Hospitality
                                                    </SelectItem>
                                                    <SelectItem value="food" className="text-white hover:bg-gray-800">
                                                        Food & Beverage
                                                    </SelectItem>
                                                    <SelectItem value="entertainment" className="text-white hover:bg-gray-800">
                                                        Entertainment & Media
                                                    </SelectItem>
                                                    <SelectItem value="automotive" className="text-white hover:bg-gray-800">
                                                        Automotive
                                                    </SelectItem>
                                                    <SelectItem value="real-estate" className="text-white hover:bg-gray-800">
                                                        Real Estate
                                                    </SelectItem>
                                                    <SelectItem value="service" className="text-white hover:bg-gray-800">
                                                        Service & Cleaning
                                                    </SelectItem>
                                                    <SelectItem value="other" className="text-white hover:bg-gray-800">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="platform" className="text-gray-300 font-semibold">
                                                Platform Target
                                            </Label>
                                            <Select value={platform} onValueChange={setPlatform}>
                                                <SelectTrigger
                                                    id="platform"
                                                    className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                                    <SelectItem value="instagram" className="text-white hover:bg-gray-800">
                                                        Instagram
                                                    </SelectItem>
                                                    <SelectItem value="facebook" className="text-white hover:bg-gray-800">
                                                        Facebook
                                                    </SelectItem>
                                                    <SelectItem value="twitter" className="text-white hover:bg-gray-800">
                                                        Twitter
                                                    </SelectItem>
                                                    <SelectItem value="linkedin" className="text-white hover:bg-gray-800">
                                                        LinkedIn
                                                    </SelectItem>
                                                    <SelectItem value="tiktok" className="text-white hover:bg-gray-800">
                                                        TikTok
                                                    </SelectItem>
                                                    <SelectItem value="pinterest" className="text-white hover:bg-gray-800">
                                                        Pinterest
                                                    </SelectItem>
                                                    <SelectItem value="youtube" className="text-white hover:bg-gray-800">
                                                        YouTube
                                                    </SelectItem>
                                                    <SelectItem value="other" className="text-white hover:bg-gray-800">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Demographics Section */}
                                    <div className="space-y-6">
                                        <div className="border-t border-[#2b2b2b] pt-6">
                                            <h3 className="text-lg font-semibold text-gray-300 mb-4">Target Demographics</h3>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="age" className="text-gray-300 font-semibold">
                                                    Age Group
                                                </Label>
                                                <Select value={age} onValueChange={setAge}>
                                                    <SelectTrigger
                                                        id="age"
                                                        className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                                                    >
                                                        <SelectValue placeholder="Select age group" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                                        <SelectItem value="13-17" className="text-white hover:bg-gray-800">
                                                            13-17 years
                                                        </SelectItem>
                                                        <SelectItem value="18-24" className="text-white hover:bg-gray-800">
                                                            18-24 years
                                                        </SelectItem>
                                                        <SelectItem value="25-34" className="text-white hover:bg-gray-800">
                                                            25-34 years
                                                        </SelectItem>
                                                        <SelectItem value="35-44" className="text-white hover:bg-gray-800">
                                                            35-44 years
                                                        </SelectItem>
                                                        <SelectItem value="45-54" className="text-white hover:bg-gray-800">
                                                            45-54 years
                                                        </SelectItem>
                                                        <SelectItem value="55-64" className="text-white hover:bg-gray-800">
                                                            55-64 years
                                                        </SelectItem>
                                                        <SelectItem value="65+" className="text-white hover:bg-gray-800">
                                                            65+ years
                                                        </SelectItem>
                                                        <SelectItem value="all" className="text-white hover:bg-gray-800">
                                                            All Ages
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="gender" className="text-gray-300 font-semibold">
                                                    Gender
                                                </Label>
                                                <Select value={gender} onValueChange={setGender}>
                                                    <SelectTrigger
                                                        id="gender"
                                                        className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                                                    >
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b]">
                                                        <SelectItem value="male" className="text-white hover:bg-gray-800">
                                                            Male
                                                        </SelectItem>
                                                        <SelectItem value="female" className="text-white hover:bg-gray-800">
                                                            Female
                                                        </SelectItem>
                                                        <SelectItem value="non-binary" className="text-white hover:bg-gray-800">
                                                            Non-binary
                                                        </SelectItem>
                                                        <SelectItem value="all" className="text-white hover:bg-gray-800">
                                                            All Genders
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="country" className="text-gray-300 font-semibold">
                                                    Country
                                                </Label>
                                                <Select value={country} onValueChange={setCountry} disabled={loadingCountries}>
                                                    <SelectTrigger
                                                        id="country"
                                                        className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                                                    >
                                                        <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select country"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                                        <div className="p-2">
                                                            <Input
                                                                placeholder="Search countries..."
                                                                value={countrySearch}
                                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                                className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {filteredCountries.length > 0 ? (
                                                                filteredCountries.map((countryItem) => (
                                                                    <SelectItem
                                                                        key={countryItem.id}
                                                                        value={countryItem.id}
                                                                        className="text-white hover:bg-gray-800"
                                                                    >
                                                                        {countryItem.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-2 text-gray-400 text-sm">No countries found</div>
                                                            )}
                                                        </div>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="state" className="text-gray-300 font-semibold">
                                                    State/Province
                                                </Label>
                                                <Select value={state} onValueChange={setState} disabled={!country || loadingStates}>
                                                    <SelectTrigger
                                                        id="state"
                                                        className="w-full bg-[#121212] border-[#2b2b2b] text-white rounded-2xl py-6 focus:border-blue-500 focus:ring-blue-500"
                                                    >
                                                        <SelectValue placeholder={
                                                            !country ? "Select country first" :
                                                                loadingStates ? "Loading states..." :
                                                                    "Select state"
                                                        } />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-[#2b2b2b] max-h-60">
                                                        {states.length > 0 && (
                                                            <div className="p-2">
                                                                <Input
                                                                    placeholder="Search states..."
                                                                    value={stateSearch}
                                                                    onChange={(e) => setStateSearch(e.target.value)}
                                                                    className="bg-[#121212] border-[#2b2b2b] text-white placeholder-gray-500 h-8 text-sm"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {filteredStates.length > 0 ? (
                                                                filteredStates.map((stateItem) => (
                                                                    <SelectItem
                                                                        key={stateItem.id}
                                                                        value={stateItem.id}
                                                                        className="text-white hover:bg-gray-800"
                                                                    >
                                                                        {stateItem.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : states.length > 0 ? (
                                                                <div className="p-2 text-gray-400 text-sm">No states found</div>
                                                            ) : null}
                                                        </div>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-center justify-center mt-8">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="text-white px-12 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                            disabled={!file || !uploadedImagePath || isAnalyzing}
                                        >
                                            {isAnalyzing ? "Analyzing..." : "Analyze Now"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </UserLayout>
    )
}