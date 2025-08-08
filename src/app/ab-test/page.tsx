"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import FileUploadCard from "./_components/file-uploader"
import { AnalyzingOverlay } from "../../components/analyzing-overlay"
import cookies from 'js-cookie'
import toast from "react-hot-toast"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"

export default function AdComparisonUpload() {
    const { userDetails } = useFetchUserDetails()
    const router = useRouter()
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [fileA, setFileA] = useState<File | null>(null)
    const [fileB, setFileB] = useState<File | null>(null)
    const [uploadedImagePathA, setUploadedImagePathA] = useState<string | null>(null)
    const [uploadedImagePathB, setUploadedImagePathB] = useState<string | null>(null)
    const [adName, setAdName] = useState("")
    const [platform, setPlatform] = useState("")
    const [industry, setIndustry] = useState("")
    const userId = cookies.get("userId") || "1"

    const uploadFile = async (fileToUpload: File, type: string) => {
        try {
            toast.loading(`Uploading file ${type}...`, { id: `upload-${type}` })

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
                if (type === "A") {
                    setUploadedImagePathA(result.fileUrl)
                } else {
                    setUploadedImagePathB(result.fileUrl)
                }
                toast.success(`File ${type} uploaded successfully!`, { id: `upload-${type}` })
            } else {
                throw new Error(result.message || 'Upload failed')
            }
        } catch (err) {
            console.error(`File ${type} upload error:`, err)
            toast.error(err instanceof Error ? err.message : `Failed to upload file ${type}`, { id: `upload-${type}` })
        }
    }

    const handleFileUpload = async (file: File | null, type: string) => {
        if (type === "A") {
            setFileA(file)
            if (file) {
                await uploadFile(file, "A")
                // Auto-fill ad name from filename if not already set
                if (!adName) {
                    setAdName(file.name.split(".")[0] + " A/B Test")
                }
            } else {
                setUploadedImagePathA(null)
            }
        } else {
            setFileB(file)
            if (file) {
                await uploadFile(file, "B")
                // Auto-fill ad name from filename if not already set
                if (!adName) {
                    setAdName(file.name.split(".")[0] + " A/B Test")
                }
            } else {
                setUploadedImagePathB(null)
            }
        }
    }

    const handleCompare = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!fileA || !fileB || !uploadedImagePathA || !uploadedImagePathB) {
            toast.error('Please upload both files first')
            return
        }

        setIsAnalyzing(true)

        try {
            toast.loading("Analyzing your ads...", { id: "analyze" })

            const analyzeData = {
                user_id: userId,
                ads_name: adName || "",
                industry: industry || "",
                platform: platform || "",
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
                // Store analysis results in localStorage or pass via router state
                if (typeof window !== 'undefined') {
                    localStorage.setItem('abAnalysisResults', JSON.stringify(result))
                }
                toast.success("A/B analysis completed successfully!", { id: "analyze" })
                // Navigate to A/B results page
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

    return (
        <UserLayout userDetails={userDetails}>
            <div className="min-h-screen  p-6">
                {isAnalyzing && <AnalyzingOverlay />}

                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Upload Your Ad Creatives</h1>
                        <p className="text-gray-300">Upload two ad variations and get AI-powered comparison insights</p>
                    </div>

                    <form onSubmit={handleCompare} className="space-y-6 mb-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FileUploadCard
                                title="Upload Ad A"
                                file={fileA}
                                onFileChange={(file) => handleFileUpload(file, "A")}
                                type="A"
                            />
                            <FileUploadCard
                                title="Upload Ad B"
                                file={fileB}
                                onFileChange={(file) => handleFileUpload(file, "B")}
                                type="B"
                            />
                        </div>

                        {/* Platform Selector */}
                        <Card className="bg-black border-none">
                            <CardContent className="p-6">
                                <div className="grid grid-rows-2 md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="adName" className="text-sm font-medium text-gray-300 mb-2">
                                            Ad Name (Optional)
                                        </Label>
                                        <Input
                                            id="adName"
                                            placeholder="Enter a name for your ad"
                                            value={adName}
                                            onChange={(e) => setAdName(e.target.value)}
                                            className="bg-[#121212] border-[#2b2b2b] focus:border-primary outline-none text-white placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-gray-300 mb-2">Target Platform</Label>
                                        <Select value={platform} onValueChange={setPlatform}>
                                            <SelectTrigger className="w-full bg-[#121212] border-[#2b2b2b] text-white placeholder:text-gray-300">
                                                <SelectValue placeholder="Select platform for optimization" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#121212] border-[#2b2b2b] text-white">
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

                                    <div className="space-y-3">
                                        <Label htmlFor="industry">Industry Category (Optional)</Label>
                                        <Select value={industry} onValueChange={setIndustry}>
                                            <SelectTrigger id="industry" className="w-full bg-[#121212] border-[#2b2b2b] text-white placeholder:text-gray-300">
                                                <SelectValue placeholder="Select industry" className="text-gray-300" />
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
                                </div>

                                {/* Compare Button */}
                                <div className="text-center">
                                    <Button
                                        type="submit"
                                        disabled={!fileA || !fileB || !uploadedImagePathA || !uploadedImagePathB || isAnalyzing}
                                        className="text-white px-12 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Compare Now
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </UserLayout>
    )
}