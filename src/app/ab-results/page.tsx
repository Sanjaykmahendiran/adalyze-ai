"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Lock, Trophy, RefreshCw, Sparkles, Search, AlertTriangle, PenTool, GitCompareArrows,
    CheckCircle, XCircle, Eye, Heart, FileText, Target, Palette, Award, ImageIcon, TrendingUp,
    ChevronLeft, ChevronRight, Zap, Shield, Activity, BarChart3, Camera, Type, Layout, DollarSign,
    Users,
    ArrowLeft,
    Info,
    TrendingDown,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import useFetchUserDetails from "@/hooks/useFetchUserDetails";
import AbResultsLoadingSkeleton from "@/components/Skeleton-loading/ab-results-loading";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import logo from "@/assets/ad-icon-logo.png"
import { ABTestResult, ApiResponse } from "./type";

// Array helper
const safeArray = (arr: any): any[] => Array.isArray(arr) ? arr : arr ? [arr] : [];



export default function ABTestResults() {
    const { userDetails } = useFetchUserDetails();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"A" | "B">("A");
    const [adDataA, setAdDataA] = useState<ApiResponse | null>(null);
    const [adDataB, setAdDataB] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndexA, setCurrentImageIndexA] = useState(0);
    const [currentImageIndexB, setCurrentImageIndexB] = useState(0);
    const [abTestResult, setAbTestResult] = useState<ABTestResult | null>(null);
    const [fetchingWinner, setFetchingWinner] = useState(false);

    const isProUser = userDetails?.payment_status === 1;

    useEffect(() => {
        const fetchAdDetails = async () => {
            try {
                const adIdA = searchParams.get("ad_id_a") || "";
                const adIdB = searchParams.get("ad_id_b") || "";
                if (!adIdA || !adIdB) throw new Error("Missing ad IDs for comparison");
                const [responseA, responseB] = await Promise.all([
                    fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adIdA}`),
                    fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adIdB}`),
                ]);
                if (!responseA.ok || !responseB.ok) throw new Error("Failed to fetch ad details");
                const [resultA, resultB] = await Promise.all([responseA.json(), responseB.json()]);
                setAdDataA(resultA.data || resultA);
                setAdDataB(resultB.data || resultB);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchAdDetails();
    }, [searchParams]);

    // Suitability calculations
    const getPlatformSuitability = (apiData: ApiResponse) => {
        if (!apiData) return [];
        const suitablePlatforms = safeArray(apiData.platform_suits).map((p) => String(p).toLowerCase());
        const notSuitablePlatforms = safeArray(apiData.platform_notsuits).map((p) => String(p).toLowerCase());
        const allPlatforms = ["Facebook", "Instagram", "LinkedIn", "Twitter", "Flyer"];
        return allPlatforms
            .map((platform) => {
                const platformLower = platform.toLowerCase();
                if (suitablePlatforms.includes(platformLower)) {
                    return { platform, suitable: true, warning: false };
                } else if (notSuitablePlatforms.includes(platformLower)) {
                    return { platform, suitable: false, warning: true };
                } else {
                    return null;
                }
            })
            .filter((item) => item && (item.suitable || item.warning)) as { platform: string; suitable: boolean; warning: boolean }[];
    };

    const fetchABTestWinner = async () => {
        try {
            setFetchingWinner(true);

            const adIdA = searchParams.get("ad_id_a") || "";
            const adIdB = searchParams.get("ad_id_b") || "";

            if (!adIdA || !adIdB) {
                console.log("Missing ad IDs for A/B test comparison");
                return;
            }

            const response = await fetch(
                `https://adalyzeai.xyz/App/api.php?gofor=abaddetail&ad_upload_id1=${adIdA}&ad_upload_id2=${adIdB}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setAbTestResult(result);

            // Log the winner for checking
            console.log("A/B Test Winner:", result.recommended_ad);
            console.log("Winner Reason:", result.reason);

        } catch (err) {
            console.error("A/B test fetch error:", err);
        } finally {
            setFetchingWinner(false);
        }
    };

    // Add this useEffect after your existing fetchAdDetails useEffect
    useEffect(() => {
        if (adDataA && adDataB && !fetchingWinner && !abTestResult) {
            fetchABTestWinner();
        }
    }, [adDataA, adDataB, searchParams]);

    // Ad copy filtering
    const getFilteredAdCopies = (apiData: ApiResponse) => {
        const adCopies = safeArray(apiData?.ad_copies);
        if (!isProUser) return adCopies.slice(0, 1);
        return adCopies; // CHANGED: removed tone filtering
    };

    // Image navigation
    const nextImageA = () => {
        if (adDataA?.images) setCurrentImageIndexA((prev) => (prev + 1) % safeArray(adDataA.images).length);
    };
    const prevImageA = () => {
        if (adDataA?.images) setCurrentImageIndexA((prev) => (prev - 1 + safeArray(adDataA.images).length) % safeArray(adDataA.images).length);
    };
    const nextImageB = () => {
        if (adDataB?.images) setCurrentImageIndexB((prev) => (prev + 1) % safeArray(adDataB.images).length);
    };
    const prevImageB = () => {
        if (adDataB?.images) setCurrentImageIndexB((prev) => (prev - 1 + safeArray(adDataB.images).length) % safeArray(adDataB.images).length);
    };

    // Winner calculation
    const getWinner = () => {
        if (abTestResult) {
            return abTestResult.recommended_ad; // This will be "A" or "B" from API
        }
        // Fallback to existing logic
        if (!adDataA || !adDataB) return null;
        return Number(adDataA.score_out_of_100) > Number(adDataB.score_out_of_100) ? "A" : "B";
    };

    const getAICommentary = () => {
        if (abTestResult) {
            return abTestResult.reason; // Use the detailed reason from API
        }
        // Fallback to existing logic
        if (!adDataA || !adDataB) return "";
        const winner = getWinner();
        const winnerData = winner === "A" ? adDataA : adDataB;
        const loserData = winner === "A" ? adDataB : adDataA;
        return `Ad ${winner} performs better with a score of ${winnerData.score_out_of_100}/100 compared to Ad ${winner === "A" ? "B" : "A"}'s ${loserData.score_out_of_100}/100. Key success factors include better ${Number(winnerData.cta_visibility) > Number(loserData.cta_visibility) ? "CTA visibility, " : ""}visual clarity, and stronger audience alignment.`;
    };

    const ProOverlay = ({ children, message }: { children: React.ReactNode; message: string }) => (
        <div className="relative">
            <div className={isProUser ? "" : "blur-sm pointer-events-none"}>{children}</div>
            {!isProUser && (
                <div className="absolute inset-0 bg-[#121212]/50 flex items-center justify-center rounded-2xl">
                    <div className="text-center p-4">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <p className="text-white font-semibold">{message}</p>
                    </div>
                </div>
            )}
        </div>
    );

    const handleReplace = (type: "A" | "B") => {
        router.push("/ad-test");
    };

    const handleReanalyze = () => {
        router.push("/ad-test");
    };

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-xl mb-4">Failed to load comparison results</p>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <Button onClick={() => router.push("/ab-test")} className="bg-blue-600 hover:bg-blue-700">
                        Go Back to AB Test
                    </Button>
                </div>
            </div>
        );
    }

    const currentAd = activeTab === "A" ? adDataA : adDataB;
    const winner = getWinner();
    const filteredAdCopies = currentAd ? getFilteredAdCopies(currentAd) : [];

    // Render Ad Preview (unchanged from your file, expanded if needed)
    const renderAdPreview = (adData: ApiResponse, isWinner: boolean, adType: "A" | "B") => {
        const images = safeArray(adData.images);
        const currentIndex = adType === "A" ? currentImageIndexA : currentImageIndexB;
        const nextImage = adType === "A" ? nextImageA : nextImageB;
        const prevImage = adType === "A" ? prevImageA : nextImageB;

        return (
            <div className={`bg-black rounded-3xl shadow-lg shadow-white/5 border hover:scale-[1.01] transition-all duration-300 ${isWinner ? "border-2 border-yellow-400 shadow-[0_0_15px_#facc15]" : "border-[#121212]"}`}>
                <div className="p-6 relative">
                    {isWinner && (
                        <Badge className="absolute -top-3 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            Winner
                        </Badge>
                    )}
                    {/* Ad Preview with Image Slider or Video */}
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#121212] border border-[#121212] mb-4">
                        {adData.ad_type === "video" && adData.video ? (
                            <video
                                src={adData.video}
                                controls
                                className="w-full h-full object-contain"
                                poster={images && images[0] ? images[0] : undefined}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            images && images.length > 0 && (
                                <>
                                    <Image
                                        src={images[currentIndex]}
                                        alt={adData.title}
                                        fill
                                        className="object-contain"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                                            ><ChevronLeft className="w-4 h-4" /></button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                                            ><ChevronRight className="w-4 h-4" /></button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                                {images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => adType === "A" ? setCurrentImageIndexA(index) : setCurrentImageIndexB(index)}
                                                        className={cn(
                                                            "w-2 h-2 rounded-full transition-all",
                                                            index === currentIndex
                                                                ? "bg-white"
                                                                : "bg-white/50 hover:bg-white/75"
                                                        )} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )
                        )}
                    </div>
                    {/* Counter / Label */}
                    {adData.ad_type === "video" && adData.video ? (
                        <div className="text-center mb-4 text-sm text-gray-400">Video Ad</div>
                    ) : (
                        images.length > 1 && (
                            <div className="text-center mb-4 text-sm text-gray-400">
                                {currentIndex + 1} of {images.length}
                            </div>
                        )
                    )}

                    {/* Score Section */}
                    <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Ad {adType} - {adData.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30">{adData.industry}</Badge>
                            <Badge className="bg-purple-600/20 text-purple-400 border border-purple-600/30">{adData.ad_type}</Badge>
                            {getPlatformSuitability(adData).map((platform) => (
                                <Badge
                                    key={platform.platform}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ${platform.suitable
                                        ? "bg-green-600/20 text-green-400 border-green-600/30"
                                        : platform.warning
                                            ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
                                            : "bg-red-600/20 text-red-400 border-red-600/30"
                                        }`}
                                >
                                    {platform.suitable ? <CheckCircle className="w-4 h-4" /> :
                                        platform.warning ? <AlertTriangle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {platform.platform}
                                </Badge>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div
                                className="text-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-lg hover:scale-[1.01] transition-all duration-300"
                                style={{
                                    transition: "all 0.3s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                }}
                            >
                                <h4 className="text-base font-medium text-gray-300 mb-2">Performance Score</h4>
                                <div className={`text-3xl font-bold ${adData.score_out_of_100 < 50
                                    ? "text-red-400"
                                    : adData.score_out_of_100 < 75
                                        ? "text-yellow-400"
                                        : "text-[#22C55E]"
                                    }`}>
                                    {adData.score_out_of_100}/100
                                </div>
                            </div>

                            <div
                                className="text-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-lg hover:scale-[1.01] transition-all duration-300"
                                style={{
                                    transition: "all 0.3s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                }}
                            >
                                <h4 className="text-base font-medium text-gray-300 mb-2">Confidence Score</h4>
                                <div className={`text-3xl font-bold ${adData.confidence_score < 50
                                    ? "text-red-400"
                                    : adData.confidence_score < 75
                                        ? "text-yellow-400"
                                        : "text-[#22C55E]"
                                    }`}>
                                    {adData.confidence_score || 0}/100
                                </div>
                            </div>

                            <div
                                className="text-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-lg hover:scale-[1.01] transition-all duration-300"
                                style={{
                                    transition: "all 0.3s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                }}
                            >
                                <h4 className="text-base font-medium text-gray-300 mb-2">Match Score</h4>
                                <div className={`text-3xl font-bold ${adData.match_score < 50
                                    ? "text-red-400"
                                    : adData.match_score < 75
                                        ? "text-yellow-400"
                                        : "text-[#22C55E]"
                                    }`}>
                                    {adData.match_score || 0}/100
                                </div>
                            </div>

                            <div
                                className="text-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-lg hover:scale-[1.01] transition-all duration-300"
                                style={{
                                    transition: "all 0.3s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                }}
                            >
                                <h4 className="text-base font-medium text-gray-300 mb-2">Issues Detected</h4>
                                <div className={`text-3xl font-bold ${adData.issues.length < 8 ? "text-[#22C55E]" : "text-red-400"
                                    }`}>
                                    {String(adData.issues.length).padStart(2, "0")}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    // Tab main return
    return (
        <TooltipProvider>
            {loading ? (
                <AbResultsLoadingSkeleton />
            ) : !adDataA || !adDataB ? (
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-xl mb-4">No data available</p>
                        <p className="text-gray-300 mb-6">Unable to load analysis results</p>
                        <Button onClick={() => router.push("/upload")} className="bg-blue-600 hover:bg-blue-700">
                            Go Back to Upload
                        </Button>
                    </div>
                </div>
            ) : error ? (
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-xl mb-4">Failed to load comparison results</p>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <Button onClick={() => router.push("/ab-test")} className="bg-blue-600 hover:bg-blue-700">
                            Go Back to AB Test
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen text-white max-w-7xl mx-auto" id="ab-test-results">
                    <main className="container mx-auto px-6 py-12">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            {/* Left: Back + Title + Subtitle */}
                            <div className="flex items-center gap-4">
                                {/* Back Button */}
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center bg-[#121212] text-gray-300 hover:text-white hover:bg-[#2b2b2b] rounded-full p-2 transition-all cursor-pointer no-print skip-block flex-shrink-0"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>

                                {/* Title + Subtitle */}
                                <div className="text-left">
                                    <h1 className="text-4xl font-bold mb-1">A/B Test Comparison</h1>
                                    <p className="text-gray-300">Side-by-side analysis of your ad creatives</p>
                                </div>
                            </div>

                            {/* Right: Logo */}
                            <div>
                                <Image src={logo} alt="Logo" className="h-14 w-auto" />
                            </div>
                        </div>

                        <div className="w-full mx-auto space-y-8">
                            {/* Ad Comparison Preview Cards */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {renderAdPreview(adDataA, winner === "A", "A")}
                                {renderAdPreview(adDataB, winner === "B", "B")}
                            </div>

                            {/* Enhanced AI Commentary Section */}
                            <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#2b2b2b] mb-4">
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-4 mb-2">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                        <div>
                                            <h2 className="text-xl font-bold text-primary">AI Analysis & Commentary</h2>

                                        </div>
                                    </div>

                                    {/* Main Commentary */}
                                    <p className="text-gray-300 leading-relaxed text-base">
                                        {getAICommentary()}
                                    </p>
                                </div>
                            </div>


                            {/* Tab Navigation */}
                            <div className="bg-black rounded-2xl p-2 mb-8 border border-[#2b2b2b] inline-flex">
                                <button
                                    onClick={() => setActiveTab("A")}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "A"
                                        ? "bg-primary text-white shadow-lg"
                                        : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    Ad A Details
                                </button>
                                <button
                                    onClick={() => setActiveTab("B")}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "B"
                                        ? "bg-primary text-white shadow-lg"
                                        : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    Ad B Details
                                </button>
                            </div>

                            {/* Key Metrics Overview - Ad Specific */}
                            {/* Key Metrics Overview - Ad Specific */}
                            <div className="col-span-4 grid grid-cols-1 lg:grid-cols-6 gap-6 auto-rows-fr">
                                {/* Go/No-Go Only - takes 2 columns */}
                                <div className="lg:col-span-2 h-full">
                                    <div
                                        className="relative bg-black rounded-2xl p-6 h-full flex flex-col overflow-hidden hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}
                                    >
                                        {/* Header - top aligned */}
                                        <div className="flex flex-col w-full mb-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-white font-semibold text-xl">Go / No Go</h3>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                        <p>AI assessment determining if your ad meets quality standards and is ready for deployment. "Go" means the ad is optimized for performance, while "No Go" indicates areas needing improvement before launch.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <p className="text-white/50 text-sm">Indicates if your ad is ready to run or needs improvement</p>
                                        </div>

                                        {/* Decision Text - center */}
                                        <div className="flex-1 flex justify-center items-center">
                                            <p
                                                className={`text-8xl font-bold z-10 ${safeArray(currentAd?.go_no_go)[0] === "Go"
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {safeArray(currentAd?.go_no_go)[0] || ""}
                                            </p>
                                        </div>

                                        {/* Icon from bottom - full width */}
                                        {safeArray(currentAd?.go_no_go)[0] === "Go" ? (
                                            <TrendingUp className="left-1 w-full h-40 text-green-500" />
                                        ) : (
                                            <TrendingDown className="left-1 w-full h-40 text-red-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Readability & Uniqueness - takes 2 columns */}
                                <div className="lg:col-span-2 h-full">
                                    <div className="space-y-6 h-full flex flex-col">
                                        {/* Readability */}
                                        <div
                                            className="bg-black px-4 py-4 rounded-2xl flex-1 hover:scale-[1.01] transition-all duration-300"
                                            style={{ transition: "all 0.3s" }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-white font-semibold text-xl">Readability</h3>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                        <p>Measures how easily your audience can read and understand your ad content. Factors include text size, contrast, font choice, and visual hierarchy. Higher scores indicate better user comprehension.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <p className="text-white/50 text-sm mb-4">Clarity of your ad content.</p>
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`text-6xl font-bold ${(currentAd?.readability_clarity_meter || 0) >= 70
                                                        ? "text-green-400"
                                                        : (currentAd?.readability_clarity_meter || 0) >= 50
                                                            ? "text-yellow-400"
                                                            : "text-red-400"
                                                        }`}
                                                >
                                                    {currentAd?.readability_clarity_meter || 0}/100
                                                </div>
                                                <div className="w-16 h-16 flex items-center justify-center">
                                                    <FileText className="w-full h-full text-primary" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Uniqueness */}
                                        <div
                                            className="bg-black px-4 py-4 rounded-2xl flex-1 hover:scale-[1.01] transition-all duration-300"
                                            style={{ transition: "all 0.3s" }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-white font-semibold text-xl">Uniqueness</h3>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                        <p>Analyzes how distinctive your ad is compared to competitor content. Evaluates visual elements, messaging, and creative approach to ensure your ad stands out in the market.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <p className="text-white/50 text-sm mb-4">How different your ad is.</p>
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`text-6xl font-bold ${(currentAd?.competitor_uniqueness_meter || 0) >= 70
                                                        ? "text-green-400"
                                                        : (currentAd?.competitor_uniqueness_meter || 0) >= 50
                                                            ? "text-yellow-400"
                                                            : "text-red-400"
                                                        }`}
                                                >
                                                    {currentAd?.competitor_uniqueness_meter || 0}/100
                                                </div>
                                                <div className="w-16 h-16 flex items-center justify-center">
                                                    <Sparkles className="w-full h-full text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Best Days & Time + Ad Fatigue - takes 2 columns */}
                                <div className="lg:col-span-2 h-full">
                                    <div className="space-y-6 h-full flex flex-col">
                                        {/* Best Days & Time */}
                                        <div
                                            className="bg-black px-4 py-4 rounded-2xl flex-1 hover:scale-[1.01] transition-all duration-300"
                                            style={{ transition: "all 0.3s" }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-white font-semibold text-xl">Best Posting Time</h3>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                        <p>AI-powered analysis of optimal posting schedules based on your target audience behavior, platform algorithms, and industry trends. Maximizes visibility and engagement potential.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <p className="text-white/50 text-sm mb-4">Recommended days and times for posting your ads to maximize reach.</p>

                                            <div className="flex items-center gap-x-4">
                                                {/* Best Days */}
                                                <div>
                                                    <h4 className="text-white text-sm mb-2 font-medium">Days</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {safeArray(currentAd?.best_day_time_to_post).map((item, index) => {
                                                            const isDays = item.toLowerCase().includes('weekday') ||
                                                                item.toLowerCase().includes('weekend') ||
                                                                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].some(day =>
                                                                    item.toLowerCase().includes(day)
                                                                );

                                                            if (isDays) {
                                                                return (
                                                                    <Badge
                                                                        key={index}
                                                                        className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs"
                                                                    >
                                                                        {item}
                                                                    </Badge>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Best Times */}
                                                <div>
                                                    <h4 className="text-white text-sm mb-2 font-medium">Times</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {safeArray(currentAd?.best_day_time_to_post).map((item, index) => {
                                                            const isTime = item.toLowerCase().includes('am') ||
                                                                item.toLowerCase().includes('pm') ||
                                                                /\d+:\d+/.test(item) ||
                                                                item.toLowerCase().includes('morning') ||
                                                                item.toLowerCase().includes('afternoon') ||
                                                                item.toLowerCase().includes('evening');

                                                            if (isTime) {
                                                                return (
                                                                    <Badge
                                                                        key={index}
                                                                        className="bg-green-600/20 text-green-400 border-green-600/30 text-xs"
                                                                    >
                                                                        {item}
                                                                    </Badge>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ad Fatigue */}
                                        <div
                                            className="bg-black px-4 py-4 rounded-2xl flex-1 hover:scale-[1.01] transition-all duration-300"
                                            style={{ transition: "all 0.3s" }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-white font-semibold text-xl">Ad Fatigue</h3>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                        <p>Predicts how quickly your audience will become tired of seeing your ad. Lower scores indicate longer-lasting appeal, while higher scores suggest the need for creative refreshes to maintain engagement.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <p className="text-white/50 text-sm mb-4">Estimates how quickly your audience may get tired of seeing your ad.</p>
                                            <div className="flex items-center justify-center">
                                                <div className="text-4xl font-bold text-amber-400">
                                                    {safeArray(currentAd?.ad_fatigue_score)[0] || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Engagement Insights - Pro Overlay */}
                            <ProOverlay message=" Upgrade to Pro to see detailed engagement insights.">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {/* Traffic Prediction */}
                                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}>
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h4 className="text-base sm:text-lg font-semibold text-primary">Traffic Prediction</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Predicted user engagement metrics including scroll-stopping ability, click-through rates, and conversion likelihood.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Scroll Stop Power</span>
                                                <span className="font-bold text-green-400 text-sm sm:text-base">{currentAd?.scroll_stoppower || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Estimated CTR</span>
                                                <span className="font-bold text-green-400 text-sm sm:text-base">{currentAd?.estimated_ctr || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Conversion Probability</span>
                                                <span className="font-bold text-green-400 text-sm sm:text-base">{currentAd?.conversion_probability || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Predicted Reach</span>
                                                <span className="font-bold text-blue-400 text-sm sm:text-base">{currentAd?.predicted_reach?.toLocaleString() || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Budget & ROI */}
                                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}>
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h4 className="text-base sm:text-lg font-semibold text-primary">Budget & ROI Insights</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Financial optimization insights including recommended budget levels, expected costs, and return on investment projections.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Budget Level</span>
                                                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs sm:text-sm">
                                                    {currentAd?.budget_level || 'N/A'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Expected CPM</span>
                                                <span className="font-bold text-yellow-400 text-sm sm:text-base">{currentAd?.expected_cpm || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">ROI Range</span>
                                                <span className="font-bold text-green-400 text-sm sm:text-base">
                                                    {currentAd?.roi_min || 0}x - {currentAd?.roi_max || 0}x
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Spend Efficiency</span>
                                                <span className="font-bold text-purple-400 text-sm sm:text-base">{currentAd?.spend_efficiency || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audience */}
                                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}>
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h4 className="text-base sm:text-lg font-semibold text-primary">Target Audience & Colors</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b] space-y-2">
                                                    <p>AI-identified primary audience segments and demographic targeting recommendations for maximum ad effectiveness.</p>
                                                    <p>The primary colors detected in your ad that influence brand perception and emotional response.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="space-y-4 sm:space-y-5">
                                            {/* Primary Audience */}
                                            <div>
                                                <span className="block text-gray-300 text-xs sm:text-sm mb-2">Primary Audience:</span>
                                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                                    {safeArray(currentAd?.top_audience).map((audience, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            className="bg-green-600/20 text-green-400 border-green-600/30 text-xs"
                                                        >
                                                            {audience}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Industry Focus */}
                                            <div>
                                                <span className="block text-gray-300 text-xs sm:text-sm mb-2">Industry Focus:</span>
                                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                                    {safeArray(currentAd?.industry_audience).map((industry, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs"
                                                        >
                                                            {industry}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dominant Colors */}
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-2">Dominant Colors</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {safeArray(currentAd?.dominant_colors).map((color, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#2b2b2b] bg-[#1a1a1a]"
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0"
                                                                style={{ backgroundColor: String(color).trim() }}
                                                            />
                                                            <span className="text-xs text-gray-200 truncate">{String(color).trim()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ProOverlay>

                            {/* Issues and Suggestions - Mobile Responsive */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Issues Section - Mobile Optimized */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-red-400">
                                                <Search className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                Issues Detected
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>AI-identified problems in your ad that could negatively impact performance or user engagement.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-2 sm:space-y-3">
                                            {safeArray(currentAd?.issues).map((issue, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-2 sm:mr-3 text-red-400 text-base sm:text-lg flex-shrink-0">•</span>
                                                    <span className="text-sm sm:text-base leading-relaxed">{issue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray(currentAd?.issues).length === 0 && (
                                            <div className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                                                No issues detected
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Suggestions Section - Mobile Optimized */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-blue-400">
                                                <Sparkles className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                Suggestions for Improvement
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Actionable recommendations to optimize your ad's performance and increase engagement rates.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ol className="space-y-2 sm:space-y-3">
                                            {safeArray(currentAd?.suggestions).length ? (
                                                safeArray(currentAd?.suggestions).map((suggestion, index) => (
                                                    <li key={index} className="flex items-start text-gray-300">
                                                        <span className="mr-2 sm:mr-3 text-blue-400 font-semibold flex-shrink-0">•</span>
                                                        <span className="text-sm sm:text-base leading-relaxed">{suggestion}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                                                    No suggestions available
                                                </li>
                                            )}
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Feedback - Mobile Responsive */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Designer Feedback - Mobile Optimized */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-purple-400">
                                                <Palette className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                Designer Feedback
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Professional design insights focusing on visual elements, layout, typography, and overall aesthetic appeal.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-2 sm:space-y-3">
                                            {safeArray(currentAd?.feedback_designer).map((feedback, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-2 sm:mr-3 text-purple-400 text-base sm:text-lg flex-shrink-0">•</span>
                                                    <span className="text-sm sm:text-base leading-relaxed">{feedback}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray(currentAd?.feedback_designer).length === 0 && (
                                            <div className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                                                No designer feedback available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Digital Marketing Feedback - Mobile Optimized */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-green-400">
                                                <TrendingUp className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                Marketing Expert Feedback
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Strategic marketing advice on messaging, audience targeting, conversion optimization, and campaign effectiveness.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-2 sm:space-y-3">
                                            {safeArray(currentAd?.feedback_digitalmark).map((feedback, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-2 sm:mr-3 text-green-400 text-base sm:text-lg flex-shrink-0">•</span>
                                                    <span className="text-sm sm:text-base leading-relaxed">{feedback}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray(currentAd?.feedback_digitalmark).length === 0 && (
                                            <div className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                                                No marketing feedback available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Engagement & Performance Metrics - Mobile Responsive A/B Test */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Engagement Metrics - Mobile Optimized */}
                                <ProOverlay message=" Upgrade to Pro to unlock advanced engagement analytics and performance insights.">
                                    <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 p-4 sm:p-6 flex flex-col">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                                                <Activity className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                                Engagement Metrics - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-64 bg-[#2b2b2b] text-sm space-y-2">
                                                    <div>
                                                        <strong>User Interaction Scores:</strong>
                                                        <p className="text-gray-300 text-xs">Measures how actively users engage with your content.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Viral Potential:</strong>
                                                        <p className="text-gray-300 text-xs">Assesses the likelihood of your content being widely shared.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Trust Signals:</strong>
                                                        <p className="text-gray-300 text-xs">Indicates the credibility and reliability perceived by users.</p>
                                                    </div>
                                                    <div>
                                                        <strong>FOMO Triggers:</strong>
                                                        <p className="text-gray-300 text-xs">Highlights urgency or scarcity cues that drive immediate action.</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="space-y-3 sm:space-y-4 flex-1">
                                            {/* Engagement Score Full Row */}
                                            <div
                                                className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#2b2b2b] transition-all duration-300"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow =
                                                        currentAd?.engagement_score <= 50
                                                            ? "0 0 14px 4px rgba(239,68,68,0.7)"
                                                            : currentAd?.engagement_score <= 75
                                                                ? "0 0 14px 4px rgba(250,204,21,0.7)"
                                                                : "0 0 14px 4px rgba(34,197,94,0.7)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow =
                                                        "0 0 10px rgba(255,255,255,0.05)";
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <Users
                                                            className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 ${currentAd?.engagement_score <= 50
                                                                ? "text-red-500"
                                                                : currentAd?.engagement_score <= 75
                                                                    ? "text-yellow-500"
                                                                    : "text-green-500"
                                                                }`}
                                                        />
                                                        <span className="text-gray-300 font-medium text-sm sm:text-base">
                                                            Engagement Score
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`font-semibold text-lg sm:text-xl ${currentAd?.engagement_score <= 50
                                                            ? "text-red-500"
                                                            : currentAd?.engagement_score <= 75
                                                                ? "text-yellow-500"
                                                                : "text-green-500"
                                                            }`}
                                                    >
                                                        {Math.round(currentAd?.engagement_score || 0)}/100
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Other Engagement Metrics - Mobile Grid */}
                                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                                {[
                                                    {
                                                        label: "Viral Potential",
                                                        value: currentAd?.viral_potential_score || 0,
                                                        icon: TrendingUp,
                                                    },
                                                    {
                                                        label: "FOMO Score",
                                                        value: currentAd?.fomo_score || 0,
                                                        icon: Zap,
                                                    },
                                                    {
                                                        label: "Trust Signal Score",
                                                        value: currentAd?.trust_signal_score || 0,
                                                        icon: Shield,
                                                    },
                                                    {
                                                        label: "Urgency Trigger",
                                                        value: currentAd?.urgency_trigger_score || 0,
                                                        icon: AlertTriangle,
                                                    },
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-[#121212] rounded-xl p-2 sm:p-4 border border-[#2b2b2b] transition-all duration-300"
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                item.value <= 50
                                                                    ? "0 0 14px 4px rgba(239,68,68,0.7)"
                                                                    : item.value <= 75
                                                                        ? "0 0 14px 4px rgba(250,204,21,0.7)"
                                                                        : "0 0 14px 4px rgba(34,197,94,0.7)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                "0 0 10px rgba(255,255,255,0.05)";
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {/* Icon on the left, vertically centered */}
                                                            <item.icon
                                                                className={`w-5 h-5 sm:w-6 sm:h-6 ${item.value <= 50
                                                                    ? "text-red-500"
                                                                    : item.value <= 75
                                                                        ? "text-yellow-500"
                                                                        : "text-green-500"
                                                                    }`}
                                                            />

                                                            {/* Text block on the right */}
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-gray-300 font-medium text-xs sm:text-sm mb-1">
                                                                    {item.label}
                                                                </span>
                                                                <span
                                                                    className={`font-semibold text-sm sm:text-lg ${item.value <= 50
                                                                        ? "text-red-500"
                                                                        : item.value <= 75
                                                                            ? "text-yellow-500"
                                                                            : "text-green-500"
                                                                        }`}
                                                                >
                                                                    {Math.round(item.value)}/100
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </ProOverlay>
                                {/* Technical Analysis - Mobile Optimized */}
                                <ProOverlay message=" Upgrade to Pro to access detailed technical analysis and optimization insights.">
                                    <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 p-4 sm:p-6 flex flex-col">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                                                <Activity className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                                Technical Analysis - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-64 bg-[#2b2b2b] text-sm space-y-2">
                                                    <div>
                                                        <strong>Budget Utilization:</strong>
                                                        <p className="text-gray-300 text-xs">Tracks how effectively the allocated budget is being spent.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Visual Composition:</strong>
                                                        <p className="text-gray-300 text-xs">Evaluates layout, symmetry, and design aesthetics of your content.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Structural Optimization:</strong>
                                                        <p className="text-gray-300 text-xs">Checks alignment, spacing, and organization for maximum clarity and impact.</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="space-y-3 sm:space-y-4 flex-1">
                                            {/* Budget Utilization Full Row */}
                                            <div
                                                className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#2b2b2b] transition-all duration-300"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow =
                                                        currentAd?.budget_utilization_score <= 50
                                                            ? "0 0 14px 4px rgba(239,68,68,0.7)"
                                                            : currentAd?.budget_utilization_score <= 75
                                                                ? "0 0 14px 4px rgba(250,204,21,0.7)"
                                                                : "0 0 14px 4px rgba(34,197,94,0.7)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow =
                                                        "0 0 10px rgba(255,255,255,0.05)";
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <DollarSign
                                                            className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 ${currentAd?.budget_utilization_score <= 50
                                                                ? "text-red-500"
                                                                : currentAd?.budget_utilization_score <= 75
                                                                    ? "text-yellow-500"
                                                                    : "text-green-500"
                                                                }`}
                                                        />
                                                        <span className="text-gray-300 font-medium text-sm sm:text-base">
                                                            Budget Utilization
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`font-semibold text-lg sm:text-xl ${currentAd?.budget_utilization_score <= 50
                                                            ? "text-red-500"
                                                            : currentAd?.budget_utilization_score <= 75
                                                                ? "text-yellow-500"
                                                                : "text-green-500"
                                                            }`}
                                                    >
                                                        {Math.round(currentAd?.budget_utilization_score || 0)}/100
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Other Technical Metrics - Mobile Grid */}
                                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                                {[
                                                    {
                                                        label: "Faces Detected",
                                                        value: currentAd?.faces_detected || 0,
                                                        icon: Camera,
                                                        max: 10,
                                                    },
                                                    {
                                                        label: "Logo Visibility",
                                                        value: currentAd?.logo_visibility_score || 0,
                                                        icon: Award,
                                                        max: 100,
                                                    },
                                                    {
                                                        label: "Text Percentage",
                                                        value: currentAd?.text_percentage_score || 0,
                                                        icon: Type,
                                                        max: 100,
                                                    },
                                                    {
                                                        label: "Layout Symmetry",
                                                        value: currentAd?.layout_symmetry_score || 0,
                                                        icon: Layout,
                                                        max: 100,
                                                    },
                                                ].map((item, i) => {
                                                    const getColorClass = () => {
                                                        if (item.max === 10) {
                                                            if (item.value <= 3) return "text-green-500";
                                                            if (item.value <= 7) return "text-yellow-500";
                                                            return "text-red-500";
                                                        } else {
                                                            if (item.value <= 50) return "text-red-500";
                                                            if (item.value <= 75) return "text-yellow-500";
                                                            return "text-green-500";
                                                        }
                                                    };

                                                    const colorClass = getColorClass();

                                                    return (
                                                        <div
                                                            key={i}
                                                            className="bg-[#121212] rounded-xl p-2 sm:p-4 border border-[#2b2b2b] transition-all duration-300"
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.boxShadow =
                                                                    colorClass.includes("red")
                                                                        ? "0 0 14px 4px rgba(239,68,68,0.7)"
                                                                        : colorClass.includes("yellow")
                                                                            ? "0 0 14px 4px rgba(250,204,21,0.7)"
                                                                            : "0 0 14px 4px rgba(34,197,94,0.7)";
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.boxShadow =
                                                                    "0 0 10px rgba(255,255,255,0.05)";
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {/* Icon on the left */}
                                                                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} />

                                                                {/* Text stacked on the right */}
                                                                <div className="flex flex-col text-left">
                                                                    <span className="text-gray-300 font-medium text-xs sm:text-sm mb-1">
                                                                        {item.label}
                                                                    </span>
                                                                    <span className={`font-semibold text-sm sm:text-lg ${colorClass}`}>
                                                                        {Math.round(item.value)}
                                                                        {item.max === 100 ? "/100" : ""}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </ProOverlay>
                            </div>

                            {/* Quick Wins & Insights - Mobile Optimized */}
                            {(currentAd?.quick_win_tip || currentAd?.shareability_comment) && (
                                <div
                                    className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-4 sm:p-6 lg:p-8">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                                                <Sparkles className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                                Quick Wins & Insights - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>
                                                        Actionable insights and quick optimization tips for immediate
                                                        performance improvements.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            {currentAd.quick_win_tip && (
                                                <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-xl p-4 sm:p-6 border border-green-600/20">
                                                    <h4 className="text-base sm:text-lg font-semibold text-green-400 mb-2 sm:mb-3 flex items-center">
                                                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                                        Quick Win Tip
                                                    </h4>
                                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                                        {currentAd.quick_win_tip}
                                                    </p>
                                                </div>
                                            )}

                                            {currentAd.shareability_comment && (
                                                <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl p-4 sm:p-6 border border-blue-600/20">
                                                    <h4 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3 flex items-center">
                                                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                                        Shareability Assessment
                                                    </h4>
                                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                                        {currentAd.shareability_comment}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Emotional + Visual Analysis Combined Section - Mobile Responsive */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Emotional & Color Analysis - Mobile Optimized */}
                                <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
                                    <div className="p-4 sm:p-6 lg:p-8">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                                                <Heart className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                                <span className="hidden sm:inline">Emotional, Color Analysis - Ad {activeTab}</span>
                                                <span className="sm:hidden">Emotional Analysis</span>
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-60 bg-[#2b2b2b]">
                                                    <p>
                                                        Emotional impact analysis and color psychology insights including primary emotions, emotional alignment, and suggested color improvements for better audience connection.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="space-y-4 sm:space-y-6">
                                            {/* Emotional Insights */}
                                            <div
                                                className="bg-[#121212] rounded-xl p-3 sm:p-5 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
                                                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900")}
                                                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)")}
                                            >
                                                <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Emotional Insights</h4>

                                                <div className="space-y-2 sm:space-y-3">
                                                    {/* Primary Emotion */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-300 text-sm sm:text-base">Primary Emotion</span>
                                                        <Badge className="bg-pink-600/20 text-pink-400 border-pink-600/30 text-xs sm:text-sm">
                                                            {currentAd?.primary_emotion || "N/A"}
                                                        </Badge>
                                                    </div>

                                                    {/* Emotional Alignment */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-300 text-sm sm:text-base">Emotional Alignment</span>
                                                        <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs sm:text-sm">
                                                            {currentAd?.emotional_alignment || "N/A"}
                                                        </Badge>
                                                    </div>

                                                    {/* Emotional Boost Suggestions */}
                                                    {safeArray(currentAd?.emotional_boost_suggestions).length > 0 && (
                                                        <div className="pt-2">
                                                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                                                                Emotional Boost Suggestions
                                                            </h5>
                                                            <div className="space-y-1">
                                                                {safeArray(currentAd?.emotional_boost_suggestions).map((suggestion, idx) => (
                                                                    <div key={idx} className="flex items-start">
                                                                        <span className="text-pink-400 mr-1 sm:mr-2 flex-shrink-0">•</span>
                                                                        <span className="text-gray-300 text-xs sm:text-sm leading-relaxed">{suggestion}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Color Analysis */}
                                            <div
                                                className="bg-[#121212] rounded-xl p-3 sm:p-5 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
                                                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900")}
                                                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)")}
                                            >
                                                <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Color Analysis</h4>

                                                <div className="space-y-3 sm:space-y-4">
                                                    {/* Suggested Colors */}
                                                    {safeArray(currentAd?.suggested_colors).length > 0 && (
                                                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 min-w-0 sm:min-w-[140px]">
                                                                Suggested Colors
                                                            </h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {safeArray(currentAd?.suggested_colors).map((color, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[#2b2b2b] bg-[#1a1a1a]"
                                                                    >
                                                                        <span
                                                                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-600 flex-shrink-0"
                                                                            style={{ backgroundColor: String(color).trim() }}
                                                                        />
                                                                        <span className="text-xs text-gray-200 truncate">{String(color).trim()}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Font Feedback */}
                                                    {currentAd?.font_feedback && (
                                                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 min-w-0 sm:min-w-[140px]">
                                                                Font Feedback
                                                            </h5>
                                                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{currentAd.font_feedback}</p>
                                                        </div>
                                                    )}

                                                    {/* Color Harmony Feedback */}
                                                    {currentAd?.color_harmony_feedback && (
                                                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 min-w-0 sm:min-w-[140px]">
                                                                Color Harmony Feedback
                                                            </h5>
                                                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{currentAd.color_harmony_feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Analysis - Mobile Optimized */}
                                <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
                                    <div className="p-4 sm:p-6 lg:p-8">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                                                <Heart className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                                <span className="hidden sm:inline">Visual Analysis - Ad {activeTab}</span>
                                                <span className="sm:hidden">Visual Analysis</span>
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-60 bg-[#2b2b2b] text-sm space-y-2">
                                                    <div>
                                                        <strong>Visual Clarity:</strong>
                                                        <p className="text-gray-300 text-xs">Evaluates how clear and easily interpretable the visual elements are.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Emotional Appeal:</strong>
                                                        <p className="text-gray-300 text-xs">Measures the ability of visuals to evoke the intended emotional response.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Design Balance:</strong>
                                                        <p className="text-gray-300 text-xs">Assesses symmetry, alignment, and proportionality for aesthetic harmony.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Text-Visual Balance:</strong>
                                                        <p className="text-gray-300 text-xs">Checks the readability and integration of text with visuals.</p>
                                                    </div>
                                                    <div>
                                                        <strong>CTA Visibility:</strong>
                                                        <p className="text-gray-300 text-xs">Analyzes how prominent and actionable call-to-action elements are.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Color & Brand Alignment:</strong>
                                                        <p className="text-gray-300 text-xs">Ensures colors and design elements align with the brand identity.</p>
                                                    </div>
                                                    <div>
                                                        <strong>Image & Text Quality:</strong>
                                                        <p className="text-gray-300 text-xs">Evaluates image resolution, typography readability, and overall visual polish.</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="space-y-4 sm:space-y-6">
                                            <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">
                                                Visual Quality Assessment
                                            </h4>

                                            {/* Core Visual Metrics - Mobile Grid */}
                                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                                {[
                                                    { label: "Visual Clarity", value: parseInt(String(currentAd?.visual_clarity)) || 0, icon: Eye, max: 100 },
                                                    { label: "Emotional Appeal", value: parseInt(String(currentAd?.emotional_appeal)) || 0, icon: Heart, max: 100 },
                                                    { label: "Text-Visual", value: parseInt(String(currentAd?.text_visual_balance)) || 0, icon: FileText, max: 100 },
                                                    { label: "CTA Visibility", value: parseInt(String(currentAd?.cta_visibility)) || 0, icon: Target, max: 100 }
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-[#121212] rounded-xl p-2 sm:p-4 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                item.value <= 50
                                                                    ? "0 0 14px 4px rgba(239,68,68,0.7)"
                                                                    : item.value <= 75
                                                                        ? "0 0 14px 4px rgba(250,204,21,0.7)"
                                                                        : "0 0 14px 4px rgba(34,197,94,0.7)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                "0 0 10px rgba(255,255,255,0.05)";
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 sm:gap-4">
                                                            {/* Icon on the left */}
                                                            <item.icon
                                                                className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${item.value <= 50
                                                                    ? "text-red-500"
                                                                    : item.value <= 75
                                                                        ? "text-yellow-500"
                                                                        : "text-green-500"
                                                                    }`}
                                                            />

                                                            {/* Text content */}
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-gray-300 text-xs sm:text-sm font-medium mb-1 leading-tight truncate">
                                                                    {item.label}
                                                                </span>
                                                                <span
                                                                    className={`font-semibold text-sm sm:text-base ${item.value <= 50
                                                                        ? "text-red-500"
                                                                        : item.value <= 75
                                                                            ? "text-yellow-500"
                                                                            : "text-green-500"
                                                                        }`}
                                                                >
                                                                    {Math.round(item.value)}/100
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Design Quality */}
                                            <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Design Quality</h4>
                                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                                {[
                                                    { label: "Color Harmony", value: currentAd?.color_harmony || 0, icon: Palette, max: 100 },
                                                    { label: "Brand Alignment", value: currentAd?.brand_alignment || 0, icon: Award, max: 100 },
                                                    { label: "Text Readability", value: currentAd?.text_readability || 0, icon: FileText, max: 100 },
                                                    { label: "Image Quality", value: currentAd?.image_quality || 0, icon: ImageIcon, max: 100 }
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-[#121212] rounded-xl p-2 sm:p-4 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                item.value <= 50
                                                                    ? "0 0 14px 4px rgba(239,68,68,0.7)"
                                                                    : item.value <= 75
                                                                        ? "0 0 14px 4px rgba(250,204,21,0.7)"
                                                                        : "0 0 14px 4px rgba(34,197,94,0.7)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow =
                                                                "0 0 10px rgba(255,255,255,0.05)";
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 sm:gap-4">
                                                            {/* Icon on the left */}
                                                            <item.icon
                                                                className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${item.value <= 50
                                                                    ? "text-red-500"
                                                                    : item.value <= 75
                                                                        ? "text-yellow-500"
                                                                        : "text-green-500"
                                                                    }`}
                                                            />

                                                            {/* Text content */}
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-gray-300 text-xs sm:text-sm font-medium mb-1 leading-tight truncate">
                                                                    {item.label}
                                                                </span>
                                                                <span
                                                                    className={`font-semibold text-sm sm:text-base ${item.value <= 50
                                                                        ? "text-red-500"
                                                                        : item.value <= 75
                                                                            ? "text-yellow-500"
                                                                            : "text-green-500"
                                                                        }`}
                                                                >
                                                                    {Math.round(item.value)}/100
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* AI-Written Ad Copy Generator */}
                            <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
                                <div className="p-8 space-y-8">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex items-center justify-between w-full">
                                            <h3 className="text-2xl font-bold flex items-center">
                                                <PenTool className="mr-3 h-6 w-6 text-primary" />
                                                AI-Written Ad Copy for Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-5 h-5 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>AI-generated ad copy variations optimized for different platforms and tones to maximize engagement and conversions.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="md:w-[70%] w-full space-y-6">
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-semibold text-primary">Generated Ad Copy</h4>
                                                <div className="space-y-4">
                                                    {filteredAdCopies.map((adCopy, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-[#121212] rounded-2xl p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                                            style={{ transition: "all 0.3s" }}
                                                            onMouseEnter={e => {
                                                                e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                                            }}
                                                            onMouseLeave={e => {
                                                                e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="text-sm text-gray-300">{adCopy.platform || 'N/A'} | {adCopy.tone || 'N/A'}</span>
                                                                <Sparkles className="w-4 h-4 text-green-400" />
                                                            </div>
                                                            <p className="text-white font-medium">{adCopy.copy_text || 'No copy text available'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {filteredAdCopies.length === 0 && (
                                                    <div className="text-gray-400 italic text-center py-8">No ad copies available</div>
                                                )}
                                                {!isProUser && currentAd?.ad_copies && safeArray(currentAd.ad_copies).length > 1 && (
                                                    <ProOverlay message=" Pro users see all ad copy variations.">
                                                        <div className="space-y-4">
                                                            {safeArray(currentAd?.ad_copies).slice(1).map((adCopy, index) => (
                                                                <div
                                                                    key={index + 1}
                                                                    className="bg-[#121212] rounded-2xl p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                                                >
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <span className="text-sm text-gray-300">{adCopy.platform || 'N/A'} | {adCopy.tone || 'N/A'}</span>
                                                                        <span className="text-orange-400">🔥</span>
                                                                    </div>
                                                                    <p className="text-white font-medium">{adCopy.copy_text || 'No copy text available'}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ProOverlay>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className="md:w-[30%] mt-10 w-full bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#222] rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                                            style={{ transition: "all 0.3s" }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                            }}
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center text-white mb-1">
                                                    <GitCompareArrows className="w-5 h-5 mr-2 text-primary" />
                                                    <h4 className="text-lg font-semibold">Platform Analysis</h4>
                                                </div>
                                                <p className="text-sm text-gray-300">
                                                    See which platforms work best for Ad {activeTab} and get platform-specific recommendations for optimal performance.
                                                </p>
                                                <div className="space-y-2">
                                                    {currentAd &&
                                                        getPlatformSuitability(currentAd).slice(0, 3).map((platform) => (
                                                            <div key={platform.platform} className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-300">{platform.platform}</span>
                                                                {platform.suitable ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                                ) : (
                                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                            <div className="mt-6">
                                                <Button
                                                    className="w-full text-white font-semibold rounded-xl py-2 transition duration-200"
                                                    disabled={!isProUser}
                                                    onClick={() => router.push("/upload")}
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Test Another Ad
                                                </Button>
                                                {!isProUser && (
                                                    <p className="mt-2 text-xs text-gray-300 text-center">
                                                        Unlock with Pro for detailed platform insights.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => handleReplace("A")}
                                    className="rounded-xl px-8 py-3 text-lg font-semibold transition-all duration-200 border-[#2b2b2b] text-gray-300 hover:bg-gray-800"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Replace Ad A
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleReplace("B")}
                                    className="rounded-xl px-8 py-3 text-lg font-semibold transition-all duration-200 border-[#2b2b2b] text-gray-300 hover:bg-gray-800"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Replace Ad B
                                </Button>
                                <Button
                                    onClick={handleReanalyze}
                                    className="rounded-xl px-8 py-3 text-lg font-semibold transition-all duration-200"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reanalyze
                                </Button>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </TooltipProvider>
    );

}
