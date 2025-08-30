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
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import useFetchUserDetails from "@/hooks/useFetchUserDetails";
import UserLayout from "@/components/layouts/user-layout";
import AbResultsLoadingSkeleton from "@/components/Skeleton-loading/ab-results-loading";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import logo from "@/assets/ad-icon-logo.png"

// Array helper
const safeArray = (arr: any): any[] => Array.isArray(arr) ? arr : arr ? [arr] : [];

// Interface for API response (now complete)
interface AdCopy {
    platform: string;
    tone: string;
    copy_text: string;
}

interface ApiResponse {
    ad_id: number;
    title: string;
    images: string[];
    ad_type: string;
    video: string;
    uploaded_on: string;
    industry: string;
    score_out_of_100: number;
    platform_suits: string[] | string;
    platform_notsuits: string[] | string;
    issues: string[];
    suggestions: string[];
    feedback_designer: string[];
    feedback_digitalmark: string[];
    visual_clarity: number | string;
    emotional_appeal: number | string;
    primary_emotion?: string;
    emotional_alignment?: string;
    emotional_boost_suggestions?: string[];
    text_visual_balance: number | string;
    cta_visibility: number | string;
    color_harmony: number;
    color_harmony_feedback?: string;
    brand_alignment: number;
    text_readability: number;
    image_quality: number;
    scroll_stoppower: string;
    estimated_ctr: string;
    conversion_probability: string;
    budget_level: string;
    expected_cpm: string;
    confidence_score: number;
    match_score: number | string;
    top_audience?: string[] | string;
    industry_audience?: string[] | string;
    mismatch_warnings?: string[];
    roi_min: number | string;
    roi_max: number | string;
    dominant_colors: string[] | string;
    suggested_colors?: string[];
    font_feedback?: string;
    layout_symmetry_score?: number;
    predicted_reach?: number;
    spend_efficiency?: string;
    faces_detected?: number;
    logo_visibility_score?: number;
    text_percentage_score?: number;
    urgency_trigger_score?: number;
    fomo_score?: number;
    trust_signal_score?: number;
    engagement_score?: number;
    viral_potential_score?: number;
    budget_utilization_score?: number;
    quick_win_tip?: string;
    shareability_comment?: string;
    ad_copies: AdCopy[];
}

export default function ABTestResults() {
    const { userDetails } = useFetchUserDetails();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"A" | "B">("A");
    const [selectedTone, setSelectedTone] = useState("friendly");
    const [adDataA, setAdDataA] = useState<ApiResponse | null>(null);
    const [adDataB, setAdDataB] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndexA, setCurrentImageIndexA] = useState(0);
    const [currentImageIndexB, setCurrentImageIndexB] = useState(0);

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

    // Date formatting
    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    // Ad copy filtering
    const getFilteredAdCopies = (apiData: ApiResponse) => {
        const adCopies = safeArray(apiData?.ad_copies);
        if (!isProUser) return adCopies.slice(0, 1);
        if (selectedTone === "friendly") return adCopies;
        return adCopies.filter((copy) => copy.tone?.toLowerCase().includes(selectedTone.toLowerCase()));
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
        if (!adDataA || !adDataB) return null;
        return Number(adDataA.score_out_of_100) > Number(adDataB.score_out_of_100) ? "A" : "B";
    };

    // Key differences between A & B (add more if needed)
    const getKeyDifferences = () => {
        if (!adDataA || !adDataB) return [];
        const differences = [];
        const scoreDiff = Math.abs(Number(adDataA.score_out_of_100) - Number(adDataB.score_out_of_100));
        const winner = getWinner();

        differences.push(`Ad ${winner} has a ${scoreDiff} point advantage in overall performance score`);
        const ctaDiffA = Number(adDataA.cta_visibility);
        const ctaDiffB = Number(adDataB.cta_visibility);
        if (Math.abs(ctaDiffA - ctaDiffB) > 10) {
            const ctaWinner = ctaDiffA > ctaDiffB ? "A" : "B";
            differences.push(`Ad ${ctaWinner} has significantly better CTA visibility (${Math.max(ctaDiffA, ctaDiffB)} vs ${Math.min(ctaDiffA, ctaDiffB)})`);
        }
        const emotionalDiffA = Number(adDataA.emotional_appeal);
        const emotionalDiffB = Number(adDataB.emotional_appeal);
        if (Math.abs(emotionalDiffA - emotionalDiffB) > 10) {
            const emotionalWinner = emotionalDiffA > emotionalDiffB ? "A" : "B";
            differences.push(`Ad ${emotionalWinner} creates stronger emotional connection with the audience`);
        }
        if (Math.abs(Number(adDataA.confidence_score) - Number(adDataB.confidence_score)) > 5) {
            const confWinner = Number(adDataA.confidence_score) > Number(adDataB.confidence_score) ? "A" : "B";
            differences.push(`Ad ${confWinner} shows higher prediction confidence (${Math.max(Number(adDataA.confidence_score), Number(adDataB.confidence_score))} vs ${Math.min(Number(adDataA.confidence_score), Number(adDataB.confidence_score))})`);
        }
        return differences;
    };

    // AI Commentary
    const getAICommentary = () => {
        if (!adDataA || !adDataB) return "";
        const winner = getWinner();
        const winnerData = winner === "A" ? adDataA : adDataB;
        const loserData = winner === "A" ? adDataB : adDataA;
        return `Ad ${winner} performs better with a score of ${winnerData.score_out_of_100}/100 compared to Ad ${winner === "A" ? "B" : "A"}'s ${loserData.score_out_of_100}/100. Key success factors include better ${Number(winnerData.cta_visibility) > Number(loserData.cta_visibility) ? "CTA visibility" : "visual clarity"} and stronger audience alignment. The winning ad also shows a confidence score of ${winnerData.confidence_score}/100, indicating more reliable performance predictions. Consider applying Ad ${winner}'s design principles to future campaigns for improved performance.`;
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
    const currentImageIndex = activeTab === "A" ? currentImageIndexA : currentImageIndexB;
    const winner = getWinner();
    const keyDifferences = getKeyDifferences();
    const aiCommentary = getAICommentary();
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
                                    className="flex items-center bg-[#121212] text-gray-300 hover:text-white rounded-full p-2 transition-all"
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

                            {/* Engagement Insights - Pro Overlay */}
                            <ProOverlay message="🔐 Upgrade to Pro to see detailed engagement insights.">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Traffic Prediction */}
                                    <div className="bg-black rounded-2xl p-4 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-primary">Traffic Prediction</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Predicted user engagement metrics including scroll-stopping ability, click-through rates, and conversion likelihood.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Scroll Stop Power</span>
                                                <span className="font-bold text-green-400">{currentAd?.scroll_stoppower || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Estimated CTR</span>
                                                <span className="font-bold text-green-400">{currentAd?.estimated_ctr || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Conversion Probability</span>
                                                <span className="font-bold text-green-400">{currentAd?.conversion_probability || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Predicted Reach</span>
                                                <span className="font-bold text-blue-400">{currentAd?.predicted_reach?.toLocaleString() || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Budget & ROI */}
                                    <div className="bg-black rounded-2xl p-4 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-primary">Budget & ROI Insights</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Financial optimization insights including recommended budget levels, expected costs, and return on investment projections.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Budget Level</span>
                                                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                                    {currentAd?.budget_level || 'N/A'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Expected CPM</span>
                                                <span className="font-bold text-yellow-400">{currentAd?.expected_cpm || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">ROI Range</span>
                                                <span className="font-bold text-green-400">
                                                    {currentAd?.roi_min || 0}x - {currentAd?.roi_max || 0}x
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300">Spend Efficiency</span>
                                                <span className="font-bold text-purple-400">{currentAd?.spend_efficiency || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audience */}
                                    <div className="bg-black rounded-2xl p-4 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-primary">Target Audience & Colors</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b] space-y-2">
                                                    <p>AI-identified primary audience segments and demographic targeting recommendations for maximum ad effectiveness.</p>
                                                    <p>The primary colors detected in your ad that influence brand perception and emotional response.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="space-y-5">
                                            {/* Primary Audience */}
                                            <div>
                                                <span className="block text-gray-300 text-sm mb-1">Primary Audience:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {safeArray(currentAd?.top_audience).map((audience, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            className="bg-green-600/20 text-green-400 border-green-600/30"
                                                        >
                                                            {audience}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Industry Focus */}
                                            <div>
                                                <span className="block text-gray-300 text-sm mb-1">Industry Focus:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {safeArray(currentAd?.industry_audience).map((industry, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            className="bg-blue-600/20 text-blue-400 border-blue-600/30"
                                                        >
                                                            {industry}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dominant Colors */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-300 mb-2">Dominant Colors</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {safeArray(currentAd?.dominant_colors).map((color, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#2b2b2b] bg-[#1a1a1a]"
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full border border-gray-600"
                                                                style={{ backgroundColor: String(color).trim() }}
                                                            />
                                                            <span className="text-xs text-gray-200">{String(color).trim()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ProOverlay>
                            {/* Issues and Suggestions Grid */}
                            <div className="grid lg:grid-cols-2 gap-4">
                                {/* Issues Section */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-2xl shadow-lg shadow-white/10 hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="flex items-center text-xl font-semibold text-red-400">
                                                <Search className="mr-3 h-5 w-5" />
                                                Issues Detected - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>AI-identified problems in your ad that could negatively impact performance or user engagement.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-3">
                                            {safeArray(currentAd?.issues).map((issue, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-3 text-red-400 text-lg">•</span>
                                                    <span>{issue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray(currentAd?.issues).length === 0 && (
                                            <div className="text-gray-400 italic">No issues detected</div>
                                        )}
                                    </div>
                                </div>

                                {/* Suggestions Section */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-2xl shadow-lg shadow-white/10 hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="flex items-center text-xl font-semibold text-blue-400">
                                                <Sparkles className="mr-3 h-5 w-5" />
                                                Suggestions for Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Actionable recommendations to optimize your ad's performance and increase engagement rates.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ol className="space-y-3">
                                            {safeArray(currentAd?.suggestions).length ? (
                                                safeArray(currentAd?.suggestions).map((suggestion, index) => (
                                                    <li key={index} className="flex items-start text-gray-300">
                                                        <span className="mr-3 text-blue-400 font-semibold">•</span>
                                                        <span>{suggestion}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-gray-400 italic">No suggestions available.</li>
                                            )}
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Feedback */}
                            <div className="grid lg:grid-cols-2 gap-4">
                                {/* Designer Feedback */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-2xl shadow-lg shadow-white/10 hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="flex items-center text-xl font-semibold text-purple-400">
                                                <Palette className="mr-3 h-5 w-5" />
                                                Designer Feedback - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Professional design insights focusing on visual elements, layout, typography, and overall aesthetic appeal.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-3">
                                            {safeArray(currentAd?.feedback_designer).map((feedback, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-3 text-purple-400 text-lg">•</span>
                                                    <span>{feedback}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray(currentAd?.feedback_designer).length === 0 && (
                                            <div className="text-gray-400 italic">No designer feedback available</div>
                                        )}
                                    </div>
                                </div>

                                {/* Digital Marketing Feedback */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-2xl shadow-lg shadow-white/10 hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="flex items-center text-xl font-semibold text-green-400">
                                                <TrendingUp className="mr-3 h-5 w-5" />
                                                Marketing Expert Feedback - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Strategic marketing advice on messaging, audience targeting, conversion optimization, and campaign effectiveness.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-3">
                                            {safeArray(currentAd?.feedback_digitalmark).map((feedback, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-3 text-green-400 text-lg">•</span>
                                                    <span>{feedback}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray(currentAd?.feedback_digitalmark).length === 0 && (
                                            <div className="text-gray-400 italic">No marketing feedback available</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Engagement & Performance Metrics */}
                            <div className="grid lg:grid-cols-2 gap-4">
                                {/* Engagement Metrics */}
                                <div className="bg-black rounded-3xl shadow-lg shadow-white/10 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold flex items-center">
                                            <Activity className="mr-3 h-6 w-6 text-primary" />
                                            Engagement Metrics - Ad {activeTab}
                                        </h3>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-5 h-5 text-gray-400 hover:text-white cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-64 bg-[#2b2b2b] text-sm">
                                                <p>
                                                    Advanced engagement analytics and technical performance indicators
                                                    for your ad campaign.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* Engagement Score Full Row */}
                                        <div
                                            className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b] transition-all duration-300"
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
                                                        className={`w-5 h-5 mr-3 ${currentAd?.engagement_score <= 50
                                                            ? "text-red-500"
                                                            : currentAd?.engagement_score <= 75
                                                                ? "text-yellow-500"
                                                                : "text-green-500"
                                                            }`}
                                                    />
                                                    <span className="text-gray-300 font-medium">Engagement Score</span>
                                                </div>
                                                <span className="font-semibold text-white">
                                                    {Math.round(currentAd?.engagement_score || 0)}/100
                                                </span>
                                            </div>
                                            <Progress
                                                value={currentAd?.engagement_score || 0}
                                                className="h-1 w-full bg-gray-800"
                                                indicatorClassName={
                                                    currentAd?.engagement_score <= 50
                                                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                                        : currentAd?.engagement_score <= 75
                                                            ? "bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                                            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                                                }
                                            />
                                        </div>

                                        {/* Other Engagement Metrics */}
                                        <div className="grid grid-cols-2 gap-4">
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
                                                    className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b] transition-all duration-300"
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
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center">
                                                            <item.icon
                                                                className={`w-5 h-5 mr-3 ${item.value <= 50
                                                                    ? "text-red-500"
                                                                    : item.value <= 75
                                                                        ? "text-yellow-500"
                                                                        : "text-green-500"
                                                                    }`}
                                                            />
                                                            <span className="text-gray-300 font-medium">
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-white">
                                                            {Math.round(item.value)}/100
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={item.value}
                                                        className="h-1 w-full bg-gray-800"
                                                        indicatorClassName={
                                                            item.value <= 50
                                                                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                                                : item.value <= 75
                                                                    ? "bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                                                    : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Technical Analysis */}
                                <div className="bg-black rounded-3xl shadow-lg shadow-white/10 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold flex items-center">
                                            <Activity className="mr-3 h-6 w-6 text-primary" />
                                            Technical Analysis - Ad {activeTab}
                                        </h3>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-5 h-5 text-gray-400 hover:text-white cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-64 bg-[#2b2b2b] text-sm">
                                                <p>
                                                    Advanced technical performance indicators and ad creative
                                                    structure.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* Budget Utilization Full Row */}
                                        <div
                                            className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b] transition-all duration-300"
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
                                                        className={`w-5 h-5 mr-3 ${currentAd?.budget_utilization_score <= 50
                                                            ? "text-red-500"
                                                            : currentAd?.budget_utilization_score <= 75
                                                                ? "text-yellow-500"
                                                                : "text-green-500"
                                                            }`}
                                                    />
                                                    <span className="text-gray-300 font-medium">
                                                        Budget Utilization
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-white">
                                                    {Math.round(currentAd?.budget_utilization_score || 0)}/100
                                                </span>
                                            </div>
                                            <Progress
                                                value={currentAd?.budget_utilization_score || 0}
                                                className="h-1 w-full bg-gray-800"
                                                indicatorClassName={
                                                    currentAd?.budget_utilization_score <= 50
                                                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                                        : currentAd?.budget_utilization_score <= 75
                                                            ? "bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                                            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                                                }
                                            />
                                        </div>

                                        {/* Other Technical Metrics */}
                                        <div className="grid grid-cols-2 gap-4">
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
                                            ].map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b] transition-all duration-300"
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow =
                                                            item.max === 100
                                                                ? item.value <= 50
                                                                    ? "0 0 14px 4px rgba(239,68,68,0.7)"
                                                                    : item.value <= 75
                                                                        ? "0 0 14px 4px rgba(250,204,21,0.7)"
                                                                        : "0 0 14px 4px rgba(34,197,94,0.7)"
                                                                : "0 0 14px 4px #DB4900";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow =
                                                            "0 0 10px rgba(255,255,255,0.05)";
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center">
                                                            <item.icon
                                                                className={`w-5 h-5 mr-3 ${item.max === 100
                                                                    ? item.value <= 50
                                                                        ? "text-red-500"
                                                                        : item.value <= 75
                                                                            ? "text-yellow-500"
                                                                            : "text-green-500"
                                                                    : "text-primary"
                                                                    }`}
                                                            />
                                                            <span className="text-gray-300 font-medium">
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-white">
                                                            {Math.round(item.value)}
                                                            {item.max === 100 ? "/100" : ""}
                                                        </span>
                                                    </div>
                                                    {item.max === 100 && (
                                                        <Progress
                                                            value={item.value}
                                                            className="h-1 w-full bg-gray-800"
                                                            indicatorClassName={
                                                                item.value <= 50
                                                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                                                    : item.value <= 75
                                                                        ? "bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                                                        : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Quick Wins & Insights */}
                            {(currentAd?.quick_win_tip || currentAd?.shareability_comment) && (
                                <div
                                    className="bg-black rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold flex items-center">
                                                <Sparkles className="mr-3 h-6 w-6 text-primary" />
                                                Quick Wins & Insights - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-5 h-5 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Actionable insights and quick optimization tips for immediate performance improvements.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="grid lg:grid-cols-2 gap-6">
                                            {currentAd.quick_win_tip && (
                                                <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-xl p-6 border border-green-600/20">
                                                    <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                                                        <Zap className="w-5 h-5 mr-2" />
                                                        Quick Win Tip
                                                    </h4>
                                                    <p className="text-gray-300">{currentAd.quick_win_tip}</p>
                                                </div>
                                            )}
                                            {currentAd.shareability_comment && (
                                                <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl p-6 border border-blue-600/20">
                                                    <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                                                        <BarChart3 className="w-5 h-5 mr-2" />
                                                        Shareability Assessment
                                                    </h4>
                                                    <p className="text-gray-300">{currentAd.shareability_comment}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Emotional + Visual Analysis Combined Section */}
                            <div className="grid lg:grid-cols-2 gap-4">
                                <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold flex items-center">
                                                <Heart className="mr-2 h-6 w-6 text-primary" />
                                                Emotional, Color Analysis - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-5 h-5 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-60 bg-[#2b2b2b]">
                                                    <p>
                                                        Combined insights on emotional impact, color psychology, and visual
                                                        quality metrics of your advertisement.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {/* LEFT COLUMN → Emotional + Color Analysis */}
                                        <div className="space-y-6">
                                            {/* Emotional Insights */}
                                            <div
                                                className="bg-[#121212] rounded-xl p-5 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
                                                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900")}
                                                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)")}
                                            >
                                                <h4 className="text-lg font-semibold text-primary mb-4">Emotional Insights</h4>

                                                <div className="space-y-3">
                                                    {/* Primary Emotion */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-300">Primary Emotion</span>
                                                        <Badge className="bg-pink-600/20 text-pink-400 border-pink-600/30">
                                                            {currentAd?.primary_emotion || "N/A"}
                                                        </Badge>
                                                    </div>

                                                    {/* Emotional Alignment */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-300">Emotional Alignment</span>
                                                        <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                                                            {currentAd?.emotional_alignment || "N/A"}
                                                        </Badge>
                                                    </div>

                                                    {/* Emotional Boost Suggestions */}
                                                    {safeArray(currentAd?.emotional_boost_suggestions).length > 0 && (
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="text-sm font-semibold text-gray-300 mb-1">
                                                                Emotional Boost Suggestions
                                                            </h5>
                                                            <div className="space-y-1">
                                                                {safeArray(currentAd?.emotional_boost_suggestions).map((suggestion, idx) => (
                                                                    <div key={idx} className="flex items-start">
                                                                        <span className="text-pink-400 mr-1">•</span>
                                                                        <span className="text-gray-300 text-sm">{suggestion}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Color Analysis */}
                                            <div
                                                className="bg-[#121212] rounded-xl p-5 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
                                                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900")}
                                                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)")}
                                            >
                                                <h4 className="text-lg font-semibold text-primary mb-4">Color Analysis</h4>

                                                <div className="space-y-4">
                                                    {/* Suggested Colors */}
                                                    {safeArray(currentAd?.suggested_colors).length > 0 && (
                                                        <div className="flex items-start justify-between gap-4">
                                                            <h5 className="text-sm font-semibold text-gray-300 min-w-[140px]">
                                                                Suggested Colors
                                                            </h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {safeArray(currentAd?.suggested_colors).map((color, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#2b2b2b] bg-[#1a1a1a]"
                                                                    >
                                                                        <span
                                                                            className="w-4 h-4 rounded-full border border-gray-600"
                                                                            style={{ backgroundColor: String(color).trim() }}
                                                                        />
                                                                        <span className="text-sm text-gray-200">{String(color).trim()}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Font Feedback */}
                                                    {currentAd?.font_feedback && (
                                                        <div className="flex items-start justify-between gap-4">
                                                            <h5 className="text-sm font-semibold text-gray-300 min-w-[140px]">
                                                                Font Feedback
                                                            </h5>
                                                            <p className="text-gray-300 text-sm">{currentAd.font_feedback}</p>
                                                        </div>
                                                    )}

                                                    {/* Color Harmony Feedback */}
                                                    {currentAd?.color_harmony_feedback && (
                                                        <div className="flex items-start justify-between gap-4">
                                                            <h5 className="text-sm font-semibold text-gray-300 min-w-[140px]">
                                                                Color Harmony Feedback
                                                            </h5>
                                                            <p className="text-gray-300 text-sm text-right">{currentAd.color_harmony_feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold flex items-center">
                                                <Heart className="mr-2 h-6 w-6 text-primary" />
                                                Visual Analysis - Ad {activeTab}
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-5 h-5 text-gray-400 hover:text-white cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-60 bg-[#2b2b2b]">
                                                    <p>
                                                        Combined insights on emotional impact, color psychology, and visual
                                                        quality metrics of your advertisement.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {/* RIGHT COLUMN → Visual Quality Assessment */}
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-semibold text-primary mb-4">
                                                Visual Quality Assessment
                                            </h4>

                                            {/* Core Visual Metrics */}
                                            <div className="grid lg:grid-cols-2 gap-4">
                                                {[
                                                    { label: "Visual Clarity", value: parseInt(String(currentAd?.visual_clarity)) || 0, icon: Eye, max: 100 },
                                                    { label: "Emotional Appeal", value: parseInt(String(currentAd?.emotional_appeal)) || 0, icon: Heart, max: 100 },
                                                    { label: "Text-Visual Balance", value: parseInt(String(currentAd?.text_visual_balance)) || 0, icon: FileText, max: 100 },
                                                    { label: "CTA Visibility", value: parseInt(String(currentAd?.cta_visibility)) || 0, icon: Target, max: 100 }
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-[#121212] rounded-xl p-4 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
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
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center">
                                                                <item.icon
                                                                    className={`w-5 h-5 mr-2 ${item.value <= 50
                                                                        ? "text-red-500"
                                                                        : item.value <= 75
                                                                            ? "text-yellow-500"
                                                                            : "text-green-500"
                                                                        }`}
                                                                />
                                                                <span className="text-gray-300">{item.label}</span>
                                                            </div>
                                                            <span className="font-semibold text-white">
                                                                {Math.round(item.value)}/100
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={item.value}
                                                            className="h-1 w-full bg-gray-800"
                                                            indicatorClassName={
                                                                item.value <= 50
                                                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                                                    : item.value <= 75
                                                                        ? "bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                                                        : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Design Quality */}
                                            <h4 className="text-lg font-semibold text-primary mb-4">Design Quality</h4>
                                            <div className="grid lg:grid-cols-2 gap-4">
                                                {[
                                                    { label: "Color Harmony", value: currentAd?.color_harmony || 0, icon: Palette, max: 100 },
                                                    { label: "Brand Alignment", value: currentAd?.brand_alignment || 0, icon: Award, max: 100 },
                                                    { label: "Text Readability", value: currentAd?.text_readability || 0, icon: FileText, max: 100 },
                                                    { label: "Image Quality", value: currentAd?.image_quality || 0, icon: ImageIcon, max: 100 }
                                                ].map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-[#121212] rounded-xl p-4 border border-[#121212] shadow-lg shadow-white/10 transition-all duration-300"
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
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center">
                                                                <item.icon
                                                                    className={`w-5 h-5 mr-2 ${item.value <= 50
                                                                        ? "text-red-500"
                                                                        : item.value <= 75
                                                                            ? "text-yellow-500"
                                                                            : "text-green-500"
                                                                        }`}
                                                                />
                                                                <span className="text-gray-300">{item.label}</span>
                                                            </div>
                                                            <span className="font-semibold text-white">
                                                                {Math.round(item.value)}/100
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={item.value}
                                                            className="h-1 w-full bg-gray-800"
                                                            indicatorClassName={
                                                                item.value <= 50
                                                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                                                    : item.value <= 75
                                                                        ? "bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                                                        : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"
                                                            }
                                                        />
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
                                                    <ProOverlay message="🔐 Pro users see all ad copy variations.">
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

                            {/* Key Differences */}
                            {/* <Card
                                className="bg-black rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b] hover:scale-[1.01] transition-all duration-300"
                                style={{ transition: "all 0.3s" }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center">
                                            <Sparkles className="w-5 h-5 mr-2 text-primary" />
                                            Key Differences
                                        </h3>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                <p>Significant performance differences between your two ad variations.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <ul className="space-y-3">
                                        {keyDifferences.map((difference, index) => (
                                            <li key={index} className="flex items-start text-gray-300">
                                                <span className="text-cyan-400 mr-3 mt-1">•</span>
                                                {difference}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card> */}

                            {/* AI Commentary */}
                            {/* <Card
                                className="bg-gradient-to-r from-[#db4900]/20 to-[#db4900]/20 border border-[#db4900]/40 hover:scale-[1.01] transition-all duration-300"
                                style={{ transition: "all 0.3s" }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center">
                                            <Sparkles className="w-5 h-5 mr-2 text-primary" />
                                            AI Commentary
                                        </h3>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                <p>AI-generated insights comparing the performance and characteristics of both ads.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{aiCommentary}</p>
                                </CardContent>
                            </Card> */}

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
