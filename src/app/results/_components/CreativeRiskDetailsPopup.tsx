"use client"

import React, { useEffect, useState } from "react"
import { X, Loader2, Facebook, Linkedin, Globe, Copy, Check } from "lucide-react"
import { SiGoogle, SiTiktok } from "react-icons/si"
import toast from "react-hot-toast"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { Button } from "@/components/ui/button"
import StaticImage from "@/assets/checklist/lp-banner.webp"

interface CreativeRiskDetailsPopupProps {
    isOpen: boolean
    onClose: () => void
    adUploadId: number
}

interface PlatformData {
    verdict: string
    score: number
    issues: string[]
}

interface ParsedResponse {
    verdict: string
    risk_score: number
    confidence: number
    summary_text: string
    platforms: {
        meta?: PlatformData
        google?: PlatformData
        tiktok?: PlatformData
        linkedin?: PlatformData
        taboola?: PlatformData
    }
    overall_issues: string[]
    recommended_actions: string[]
    audit: {
        checked_at: string
        model: string
    }
}

interface CreativeRiskResponse {
    success: boolean
    ad_upload_id: number
    compliance_id: string
    verdict: string
    risk_score: number
    confidence: number
    summary_text: string
    raw_response_preview: string
}

export default function CreativeRiskDetailsPopup({
    isOpen,
    onClose,
    adUploadId,
}: CreativeRiskDetailsPopupProps) {
    const [landingPage, setLandingPage] = useState("")
    const [showInput, setShowInput] = useState(true)
    const [loading, setLoading] = useState(false)
    const [riskData, setRiskData] = useState<CreativeRiskResponse | null>(null)
    const [parsedData, setParsedData] = useState<ParsedResponse | null>(null)
    const [copiedPlatformIndex, setCopiedPlatformIndex] = useState<number | null>(null)

    // Prevent background scroll
    useEffect(() => {
        if (isOpen) {
            const original = document.body.style.overflow
            document.body.style.overflow = "hidden"
            return () => {
                document.body.style.overflow = original
            }
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!landingPage.trim()) {
            toast.error("Please enter a landing page URL")
            return
        }

        try {
            new URL(landingPage)
        } catch {
            toast.error("Please enter a valid URL")
            return
        }

        setLoading(true)
        try {
            const response = await fetch("https://adalyzeai.xyz/App/compliance.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ad_upload_id: adUploadId,
                    landing_page: landingPage,
                }),
            })

            const result: CreativeRiskResponse = await response.json()
            if (!result.success) {
                toast.error("Failed to fetch risk details")
                return
            }

            setRiskData(result)

            // Clean & parse JSON
            let jsonString = result.raw_response_preview
            jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "")
            const parsed = JSON.parse(jsonString.trim()) as ParsedResponse
            setParsedData(parsed)

            setShowInput(false)
            toast.success("Risk analysis completed")
        } catch (err) {
            console.error(err)
            toast.error("Unexpected error fetching details")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setShowInput(true)
        setLandingPage("")
        setRiskData(null)
        setParsedData(null)
        setCopiedPlatformIndex(null)
        onClose()
    }

    const handleCopyIssues = async (issues: string[], platformIndex: number) => {
        try {
            await navigator.clipboard.writeText(issues.join("\n"))
            setCopiedPlatformIndex(platformIndex)
            setTimeout(() => {
                setCopiedPlatformIndex(null)
            }, 2000)
        } catch (error) {
            console.error("Failed to copy:", error)
        }
    }

    const getRiskBg = (risk: string) => {
        const r = risk.toLowerCase()
        if (r.includes("high")) return "bg-red-500/10 border-red-500/30"
        if (r.includes("medium")) return "bg-[#F99244]/10 border-[#F99244]/30"
        if (r.includes("low")) return "bg-green-500/10 border-green-500/30"
        return "bg-black/10 border-white/10"
    }

    const getRiskText = (risk: string) => {
        const r = risk.toLowerCase()
        if (r.includes("high")) return "text-red-400"
        if (r.includes("medium")) return "text-[#F99244]"
        if (r.includes("low")) return "text-green-400"
        return "text-white/80"
    }

    const getPlatformName = (key: string): string => {
        const names: Record<string, string> = {
            meta: "Meta",
            google: "Google",
            tiktok: "TikTok",
            linkedin: "LinkedIn",
            taboola: "Taboola",
        }
        return names[key] || key.toUpperCase()
    }

    const getPlatformIcon = (key: string) => {
        const iconMap: Record<string, React.ComponentType<any>> = {
            meta: Facebook,
            google: SiGoogle,
            tiktok: SiTiktok,
            linkedin: Linkedin,
            taboola: Globe,
        }
        const IconComponent = iconMap[key] || Globe
        return <IconComponent className="w-5 h-5 opacity-90" />
    }

    const getProgressColor = (score: number) => {
        if (score < 50) return "#22c55e" // green
        if (score < 75) return "#F99244" // yellow
        return "#ef4444" // red
    }

    const getTrailColor = (score: number) => {
        if (score < 50) return "#bbf7d0" // light green
        if (score < 75) return "#fef08a" // light yellow
        return "#fca5a5" // light red
    }

    if (!isOpen) return null

    return (
        <div id="panel" className="fixed inset-0 z-999">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>

            <aside className="absolute right-0 top-0 h-full w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 bg-[#171717] p-4 sm:p-6 overflow-y-auto">

                {/* HEADER */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-primary">Creative Risk Details</h2>
                        {parsedData && (
                            <p className="text-sm text-white/80 mt-1">
                                {parsedData.overall_issues.length} issues detected across{" "}
                                {Object.keys(parsedData.platforms || {})
                                    .map(getPlatformName)
                                    .join(", ")}
                            </p>
                        )}
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* INPUT UI */}
                {showInput && (
                    <div className="mt-6 bg-black border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-5">

                        {/* Static Image */}
                        <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden border border-white/10">
                            <img
                                src={StaticImage.src}
                                alt="Adalyze Static Creative"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Small Description */}
                        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                            Analyze your creative's landing page to detect compliance and policy risks
                            across major ad platforms like Meta, Google, TikTok, LinkedIn, and Taboola.
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="block text-sm sm:text-base text-white">
                                    Landing Page URL
                                </label>

                                <input
                                    type="url"
                                    value={landingPage}
                                    onChange={(e) => setLandingPage(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#171717] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-0"
                                    placeholder="https://example.com"
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex items-center justify-end">
                                <Button
                                    type="submit"
                                    disabled={loading || !landingPage.trim()}
                                    className="bg-primary text-white py-2 text-sm sm:text-base px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Analyze Risk"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}


                {/* RESULTS */}
                {!showInput && parsedData && (
                    <>
                        {/* TOP CARD */}
                        <div className="mt-6 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/40">
                            <div className="flex items-center justify-between">
                                <div>
                                    {/* Title + Verdict */}
                                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
                                        Overall Verdict:

                                        <span
                                            className={`
                                                    inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-sm sm:text-base
                                                    text-sm font-semibold border leading-none shadow 
                                                    ${parsedData.verdict?.toLowerCase().includes("high")
                                                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                                                    : parsedData.verdict?.toLowerCase().includes("medium")
                                                        ? "bg-[#F99244]/10 border-[#F99244]/30 text-[#F99244]"
                                                        : parsedData.verdict?.toLowerCase().includes("low") ||
                                                            parsedData.verdict?.toLowerCase().includes("safe")
                                                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                                                            : "bg-black/10 border-white/10 text-white/80"
                                                }
                                                    `}
                                        >
                                            {parsedData.verdict}
                                        </span>
                                    </h3>

                                    {/* Confidence pill */}
                                    <div className="flex items-center gap-2 bg-[#1d1d1d] border border-white/5 rounded-full px-4 py-1 mt-3 w-fit">
                                        <p className="text-white text-sm  font-medium">Confidence:</p>
                                        <p
                                            className={`
                                                        text-sm font-semibold
                                                        ${parsedData.confidence >= 80
                                                    ? "text-green-400"
                                                    : parsedData.confidence >= 50
                                                        ? "text-[#F99244]"
                                                        : "text-red-400"
                                                }
                                                `}
                                        >
                                            {parsedData.confidence}%
                                        </p>

                                    </div>
                                </div>


                                {/* SCORE RING */}
                                <div className="w-20 h-20 ">
                                    <CircularProgressbar
                                        value={parsedData.risk_score}
                                        text={`${parsedData.risk_score}%`}
                                        strokeWidth={7}
                                        styles={buildStyles({
                                            pathColor: getProgressColor(parsedData.risk_score),
                                            textColor: getProgressColor(parsedData.risk_score),
                                            trailColor: getTrailColor(parsedData.risk_score),
                                            textSize: "24px",
                                        })}
                                    />
                                </div>
                            </div>

                            {/* SUMMARY */}
                            <div className="mt-5 bg-[#171717] border border-white/5 rounded-2xl p-4">
                                <p className="text-white/80 text-sm leading-relaxed">
                                    {parsedData.summary_text}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* OVERALL ISSUES */}
                                {parsedData.overall_issues.length > 0 && (
                                    <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
                                        <h4 className="text-sm font-semibold text-white">Detected Issues</h4>
                                        <ul className="mt-2 text-xs sm:text-sm space-y-1">
                                            {parsedData.overall_issues.map((issue, i) => (
                                                <li key={i}>• {issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}


                                {/* RECOMMENDED ACTION */}
                                {parsedData.recommended_actions.length > 0 && (
                                    <div className="mt-4 bg-green-300/10 border border-green-400/30 rounded-xl p-4 text-green-400">
                                        <h4 className="text-sm font-semibold text-white">Recommended Fix</h4>
                                        <ul className="mt-2 text-xs sm:text-sm space-y-1">
                                            {parsedData.recommended_actions.map((a, i) => (
                                                <li key={i}>• {a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PLATFORM PANELS */}
                        <div className="mt-6 space-y-4">
                            {Object.entries(parsedData.platforms).map(([key, platform], i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl bg-black border border-white/10 shadow-lg hover:shadow-primary/20 overflow-hidden"
                                >
                                    <div
                                        className={`w-1 h-full float-left ${platform.verdict.includes("High")
                                            ? "bg-red-500"
                                            : platform.verdict.includes("Medium")
                                                ? "bg-[#F99244]"
                                                : "bg-green-400"
                                            }`}
                                    ></div>

                                    <div className="p-5 ml-2">
                                        <div className="flex justify-between items-center">

                                            {/* Left: Icon + Platform Name */}
                                            <div className="flex items-center gap-3 text-primary">
                                                <span className="flex items-center justify-center">
                                                    {getPlatformIcon(key)}
                                                </span>

                                                <h3 className="text-base sm:text-lg font-semibold">
                                                    {getPlatformName(key)}
                                                </h3>
                                            </div>

                                            {/* Right: Risk Score Badge */}
                                            <div
                                                className={`
                                                    px-3 py-1 rounded-full border 
                                                    flex items-center
                                                    ${getRiskBg(platform.verdict)}
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        text-xs sm:text-sm font-semibold
                                                        ${getRiskText(platform.verdict)}
                                                    `}
                                                >
                                                    {platform.score} / 100
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            {/* Issues */}
                                            {platform.issues.length > 0 && (
                                                <ul className="mt-3 text-xs sm:text-sm space-y-1 text-white">
                                                    {platform.issues.map((issue, ii) => (
                                                        <li key={ii}>• {issue}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            <div>
                                                <button
                                                    className="text-primary text-sm cursor-pointer hover:text-primary/80 transition-colors"
                                                    onClick={() => handleCopyIssues(platform.issues, i)}
                                                >
                                                    {copiedPlatformIndex === i ? (
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </aside>
        </div>
    )
}
