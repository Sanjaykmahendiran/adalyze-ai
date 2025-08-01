"use client"

import type React from "react"
import { useState } from "react"
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

export default function UploadPage() {
    const { userDetails } = useFetchUserDetails()
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [adName, setAdName] = useState("")
    const [platform, setPlatform] = useState("")
    const [industry, setIndustry] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null)
    const userId = cookies.get("userId") || ""
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
            toast.loading("Analyzing your ad...", { id: "analyze" })

            const analyzeData = {
                imagePath: uploadedImagePath,
                user_id: userId,
                ads_name: adName || file.name.split(".")[0],
                industry: industry || "",
                platform: platform || ""
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
                                            Ad Name (Optional)
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
                                                Industry Category (Optional)
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
                                                Platform Target (Optional)
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