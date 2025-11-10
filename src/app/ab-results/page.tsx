"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Lock, Trophy, RefreshCw, Sparkles, Search, AlertTriangle, PenTool,
    CheckCircle, XCircle, Eye, Heart, FileText, Target, Palette, Award, ImageIcon, TrendingUp,
    ChevronLeft, ChevronRight, Zap, Shield, Activity, BarChart3, Camera, Type, Layout, DollarSign,
    Users,
    ArrowLeft,
    Info,
    TrendingDown,
    Copy,
    Trash2,
    Loader2,
    MessageSquare,
    MousePointerClick,
    Lightbulb,
    ArrowRight,
} from "lucide-react";
import Chart from 'chart.js/auto'
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import useFetchUserDetails from "@/hooks/useFetchUserDetails";
import AbResultsLoadingSkeleton from "@/components/Skeleton-loading/ab-results-loading";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import logo from "@/assets/ad-icon-logo.png"
import { getAdIdFromUrlParams, parseUserIdFromToken } from "@/lib/tokenUtils"
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
    const [tagsCopied, setTagsCopied] = useState(false);
    const [copiedAdCopyIndex, setCopiedAdCopyIndex] = useState<number | null>(null);
    const chartRef = React.useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = React.useRef<any>(null);

    // Delete functionality states
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // View Target dialog states
    const [viewTargetOpenA, setViewTargetOpenA] = useState(false);
    const [viewTargetOpenB, setViewTargetOpenB] = useState(false);

    const isProUser = userDetails?.payment_status === 1;

    useEffect(() => {
        const fetchAdDetails = async () => {
            try {
                const tokenA = searchParams.get("ad-token-a");
                const tokenB = searchParams.get("ad-token-b");
                const adIdA = tokenA ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenA })) : searchParams.get("ad_id_a") || "";
                const adIdB = tokenB ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenB })) : searchParams.get("ad_id_b") || "";

                const token = tokenA || tokenB;
                let userIdParam = '';
                if (token) {
                    const userIdFromToken = parseUserIdFromToken(token);
                    if (userIdFromToken) {
                        userIdParam = `&user_id=${userIdFromToken}`;
                    }
                } else if (userDetails?.user_id) {
                    // If no token but userDetails available, use that user_id
                    userIdParam = `&user_id=${userDetails.user_id}`;
                }
                if (!adIdA || !adIdB) throw new Error("Missing ad IDs for comparison");
                const [responseA, responseB] = await Promise.all([
                    fetch(`/api/addetail?ad_upload_id=${adIdA}${userIdParam}`),
                    fetch(`/api/addetail?ad_upload_id=${adIdB}${userIdParam}`),
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

    // Chart: render doughnut for current tab ad
    useEffect(() => {
        if (!chartRef.current) return;
        const current = currentAd as any;
        if (!current) return;
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        const dataValues = [
            Number(current?.visual_clarity) || 0,
            Number(current?.cta_visibility) || 0,
            Number(current?.emotional_appeal) || 0,
            Number(current?.readability_clarity_meter) || 0,
            Number(current?.text_visual_balance) || 0,
        ];
        const labels = [
            'Visual Appeal',
            'CTA Strength',
            'Emotional Connection',
            'Readability',
            'Text Visual ',
        ];
        const colors = ['#fbbf24', '#f97316', '#fb923c', '#22d3ee', '#a855f7'];
        chartInstanceRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data: dataValues, backgroundColor: colors, borderColor: '#171924', borderWidth: 2, hoverOffset: 14, hoverBorderColor: '#fbbf24', hoverBorderWidth: 3 }] },
            options: {
                layout: { padding: 4 },
                cutout: '65%',
                responsive: true,
                maintainAspectRatio: true,
                animation: { animateRotate: true, animateScale: true, duration: 1200, easing: 'easeOutQuart' },
                plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', titleColor: '#fbbf24', bodyColor: '#e5e7eb', borderColor: '#fbbf24', borderWidth: 1, padding: 12, callbacks: { label: (context: any) => `${context.label || ''}: ${context.parsed || 0}/100` } } }
            }
        });
        return () => { if (chartInstanceRef.current) chartInstanceRef.current.destroy(); };
    }, [activeTab, adDataA, adDataB]);

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

            const tokenA = searchParams.get("ad-token-a");
            const tokenB = searchParams.get("ad-token-b");
            const adIdA = tokenA ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenA })) : searchParams.get("ad_id_a") || "";
            const adIdB = tokenB ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenB })) : searchParams.get("ad_id_b") || "";

            if (!adIdA || !adIdB) {
                console.log("Missing ad IDs for A/B test comparison");
                return;
            }

            const response = await fetch(
                `/api/ab-analyze?ad_upload_id1=${adIdA}&ad_upload_id2=${adIdB}`
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

    // Delete AB ad function
    const handleDeleteAbAd = async () => {
        const tokenA = searchParams.get("ad-token-a");
        const tokenB = searchParams.get("ad-token-b");
        const adIdA = tokenA ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenA })) : searchParams.get("ad_id_a") || "";
        const adIdB = tokenB ? getAdIdFromUrlParams(new URLSearchParams({ 'ad-token': tokenB })) : searchParams.get("ad_id_b") || "";

        if (!adIdA || !adIdB) {
            toast.error('No ad IDs found');
            return;
        }

        setDeleteLoading(true);

        try {
            const response = await fetch(`/api/delete-ab-ad?ad_upload_id_a=${adIdA}&ad_upload_id_b=${adIdB}`);

            if (!response.ok) {
                throw new Error('Failed to delete A/B ad');
            }

            const result = await response.json();

            if (result.response === "AB Ad Deleted") {
                toast.success("A/B ad deleted successfully");
                // Redirect to my-ads page after successful deletion
                router.push('/my-ads');
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            console.error('Error deleting A/B ad:', error);
            toast.error('Failed to delete A/B ad. Please try again.');
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    // Add this useEffect after your existing fetchAdDetails useEffect
    useEffect(() => {
        if (adDataA && adDataB && !fetchingWinner && !abTestResult) {
            fetchABTestWinner();
        }
    }, [adDataA, adDataB, searchParams]);

    // Set active tab to winner when data is loaded
    useEffect(() => {
        if (adDataA && adDataB) {
            const winner = getWinner();
            if (winner) {
                setActiveTab(winner);
            }
        }
    }, [adDataA, adDataB, abTestResult]);

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
    const criticalIssues = safeArray((currentAd as any)?.critical_issues)
    const minorIssues = safeArray((currentAd as any)?.minor_issues)
    const estimatedCtrLossArr = safeArray((currentAd as any)?.estimated_ctr_loss_if_issues_unfixed)
    const estimatedCtrLoss = estimatedCtrLossArr.length > 0 ? estimatedCtrLossArr[0] : null

    // Render Ad Preview (unchanged from your file, expanded if needed)
    const renderAdPreview = (adData: ApiResponse, isWinner: boolean, adType: "A" | "B") => {
        const images = safeArray(adData.images);
        const currentIndex = adType === "A" ? currentImageIndexA : currentImageIndexB;
        const nextImage = adType === "A" ? nextImageA : nextImageB;
        const prevImage = adType === "A" ? prevImageA : nextImageB;

        return (
            <div className={`bg-black rounded-3xl shadow-lg shadow-white/5 border hover:scale-[1.01] transition-all duration-300 ${isWinner ? "border-2 border-yellow-400 shadow-[0_0_15px_#facc15]" : "border-[#121212]"}`}>
                <div className={`p-3 sm:p-6 relative ${isWinner ? "pt-8" : ""}`}>
                    {isWinner && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-base bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Trophy className="w-5 h-5" />
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
                    <div className="bg-[#121212] rounded-2xl p-3 sm:p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <h3 className="text-xl font-semibold text-white">Ad {adType} - {adData.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30">{adData.industry}</Badge>
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
                            >                  <h3 className="text-white font-semibold text-sm mb-2">Go / No Go</h3>
                                <p
                                    className={`text-3xl font-bold ${adData?.go_no_go === "Go"
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    {adData?.go_no_go || ""}
                                </p>
                                <p className="text-white/50 text-xs text-center mt-1">Ready to run?</p>
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
                                <h4 className="text-base font-medium text-gray-300 mb-2">Performance Score</h4>
                                <div className={`text-3xl font-bold ${adData.score_out_of_100 < 50
                                    ? "text-red-400"
                                    : adData.score_out_of_100 < 75
                                        ? "text-yellow-400"
                                        : "text-[#22C55E]"
                                    }`}>
                                    {adData.score_out_of_100}%
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
                                    {adData.confidence_score || 0}%
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
                                <div className={`text-3xl font-bold ${Number(adData.match_score) < 50
                                    ? "text-red-400"
                                    : Number(adData.match_score) < 75
                                        ? "text-yellow-400"
                                        : "text-[#22C55E]"
                                    }`}>
                                    {adData.match_score || 0}%
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
                    <main className="container mx-auto px-4 py-8 sm:py-12">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">

                            {/* Left: Back + Title + Subtitle */}
                            <div className="flex items-start sm:items-center gap-3">
                                {/* Back Button */}
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center bg-[#121212] text-gray-300 hover:text-white hover:bg-[#2b2b2b] rounded-full p-2 transition-all cursor-pointer no-print skip-block flex-shrink-0"
                                >
                                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>

                                {/* Title + Subtitle */}
                                <div className="text-left">
                                    <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
                                        A/B Test Comparison
                                    </h1>
                                    <p className="text-sm sm:text-base text-gray-300">
                                        Side-by-side analysis of your ad creatives
                                    </p>
                                </div>
                            </div>

                            {/* Right: Logo (Hidden on mobile) */}
                            <div className="self-start sm:self-auto hidden sm:block">
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    className="h-10 sm:h-14 w-auto"
                                />
                            </div>

                        </div>


                        <div className="w-full mx-auto space-y-8">
                            {/* Ad Comparison Preview Cards - Winner first on mobile */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Mobile: Show winner first */}
                                <div className={`md:order-none ${winner === "A" ? "order-1" : "order-2"}`}>
                                    {renderAdPreview(adDataA, winner === "A", "A")}
                                </div>
                                <div className={`md:order-none ${winner === "B" ? "order-1" : "order-2"}`}>
                                    {renderAdPreview(adDataB, winner === "B", "B")}
                                </div>
                            </div>

                            {/* view target and delete */}
                            <div className="flex gap-2 items-end sm:items-center sm:w-auto w-full justify-end">
                                {/* View Target Button */}
                                <Dialog open={activeTab === "A" ? viewTargetOpenA : viewTargetOpenB} onOpenChange={activeTab === "A" ? setViewTargetOpenA : setViewTargetOpenB}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            aria-label="View target details"
                                            className={`
                                                    flex items-center gap-2 font-medium transition-all duration-200
                                                    ${(activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score) >= 80
                                                    ? "bg-green-700/20 text-green-400 border border-green-700/40 hover:bg-green-700/30"
                                                    : (activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score) >= 60
                                                        ? "bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 hover:bg-yellow-700/30"
                                                        : "bg-red-700/20 text-red-400 border border-red-700/40 hover:bg-red-700/30"
                                                }
                                                `}
                                        >
                                            <Target className="w-3 h-3" />
                                            View Target
                                            {(activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score) && (
                                                <span className="text-xs font-semibold">
                                                    ({activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score}%)
                                                </span>
                                            )}
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#171717] border border-primary rounded-2xl w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6">
                                        <DialogHeader>
                                            <DialogTitle className="text-white text-lg sm:text-xl mt-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                                    {/* --- Left (Title + Subtitle) --- */}
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-white font-semibold text-base sm:text-lg flex items-center gap-2">
                                                            <BarChart3 className="w-5 h-5 text-primary shrink-0" />
                                                            Targeting Comparison
                                                        </h3>
                                                        <p className="text-xs text-white/60">
                                                            How well your targeting aligns with the suggested setup
                                                        </p>
                                                    </div>

                                                    {/* --- Right (Score Badge) --- */}
                                                    <div
                                                        className={`
                                    px-3 py-1 text-sm sm:text-base font-semibold rounded-full border
                                    self-center sm:self-auto
                                    ${(activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score) >= 80
                                                                ? "bg-green-700/20 text-green-400 border-green-700/40"
                                                                : (activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score) >= 60
                                                                    ? "bg-[#F99244]/20 text-[#F99244] border-[#F99244]/40"
                                                                    : "bg-red-700/20 text-red-400 border-red-700/40"
                                                            }
                                `}
                                                    >
                                                        {(activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score)}% Match
                                                    </div>
                                                </div>
                                            </DialogTitle>
                                        </DialogHeader>


                                        <div className="space-y-6">
                                            {/* --- Target Insights Unified Section --- */}
                                            {(activeTab === "A" ? adDataA?.target_match_score : adDataB?.target_match_score) && (
                                                <div className=" space-y-6">

                                                    {/* --- Targeting Comparison Cards --- */}
                                                    {(activeTab === "A" ? adDataA?.targeting_compare_json : adDataB?.targeting_compare_json)?.length > 0 && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {(activeTab === "A" ? adDataA?.targeting_compare_json : adDataB?.targeting_compare_json).map((item: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className={`rounded-lg px-2  py-2 border relative overflow-hidden transition-all ${item.match === "match"
                                                                        ? "border-green-700/40 bg-green-900/10"
                                                                        : item.match === "partial"
                                                                            ? "border-[#F99244]/40 bg-[#F99244]/10"
                                                                            : "border-red-700/40 bg-red-900/10"
                                                                        }`}
                                                                >
                                                                    {/* Top Indicator */}
                                                                    <div
                                                                        className={`absolute top-0 left-0 h-1 w-full ${item.match === "match"
                                                                            ? "bg-green-500/70"
                                                                            : item.match === "partial"
                                                                                ? "bg-[#F99244]/70"
                                                                                : "bg-red-500/70"
                                                                            }`}
                                                                    />

                                                                    {/* Metric */}
                                                                    <div className="flex items-center justify-between mb-2 mt-1">
                                                                        <p className="text-white font-medium text-sm">{item.metric}</p>
                                                                        <span
                                                                            className={`text-xs font-bold uppercase ${item.match === "match"
                                                                                ? "text-green-400"
                                                                                : item.match === "partial"
                                                                                    ? "text-[#F99244]"
                                                                                    : "text-red-400"
                                                                                }`}
                                                                        >
                                                                            {item.match}
                                                                        </span>
                                                                    </div>

                                                                    {/* Comparison Details */}
                                                                    <div className="text-xs space-y-1">
                                                                        <p className="text-white/60">
                                                                            <span className="text-white font-medium">{item.user}</span>
                                                                        </p>
                                                                        <p className="text-white/60">
                                                                            <span
                                                                                className={`flex items-center justify-between w-full px-2 py-1 rounded-md border ${item.match === "match"
                                                                                    ? "bg-green-700/20 text-green-400 border-green-700/40"
                                                                                    : item.match === "partial"
                                                                                        ? "bg-[#F99244]/20 text-[#F99244] border-[#F99244]/40"
                                                                                        : "bg-red-700/20 text-red-400 border-red-700/40"
                                                                                    }`}
                                                                            >
                                                                                <span className="mr-3">AI Recommendation</span>
                                                                                <span className="font-bold">{item.suggested}</span>
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* --- Divider Line --- */}
                                                    {(activeTab === "A" ? adDataA?.suggested_interests : adDataB?.suggested_interests)?.length > 0 && (
                                                        <div className="border-t border-[#2b2b2b] mb-2" />
                                                    )}

                                                    {/* --- Suggested Interests Section --- */}
                                                    {(activeTab === "A" ? adDataA?.suggested_interests : adDataB?.suggested_interests)?.length > 0 && (
                                                        <div>
                                                            <h3 className="text-white font-semibold flex items-center gap-2 mb-2 text-base sm:text-lg">
                                                                <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                                                                Suggested Interests
                                                            </h3>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(activeTab === "A" ? adDataA?.suggested_interests : adDataB?.suggested_interests).map((interest: string, i: number) => (
                                                                    <span
                                                                        key={i}
                                                                        className="text-xs sm:text-sm bg-[#db4900]/20 text-[#db4900] px-3 py-1 rounded-full border border-[#db4900]/40 hover:bg-[#db4900]/30 transition-all duration-200"
                                                                    >
                                                                        {interest}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    </DialogContent>
                                </Dialog>

                                {/* Delete Button */}
                                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            aria-label="Delete A/B test"
                                            className="border-red-600 bg-red-600/20 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                                            disabled={deleteLoading}
                                        >
                                            {deleteLoading ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span className="hidden sm:inline ml-2 ">Deleting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-3 h-3" />
                                                    <span className="hidden sm:inline ml-2">Delete A/B Test</span>
                                                </>
                                            )}
                                        </Button>

                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-[#171717] border border-primary rounded-2xl p-4 sm:p-6">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Delete A/B Test</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-300">
                                                Are you sure you want to delete this A/B test? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-transparent border-[#3d3d3d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteAbAd}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                disabled={deleteLoading}
                                            >
                                                {deleteLoading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete'
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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


                            {/* Tab Navigation with Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 flex-wrap">
                                {/* Tabs */}
                                <div className="bg-black rounded-2xl p-2 border border-[#2b2b2b] inline-flex">
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
                            </div>
                            {/* Row 3 */}
                            <div className="col-span-4 grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-6 lg:auto-rows-fr items-start lg:items-stretch mt-2 sm:mt-6">
                                {/* Issues Detected - takes 2 columns */}
                                <div className="lg:col-span-2 mb-0 lg:h-full lg:flex lg:flex-col">
                                    <div
                                        className="relative bg-black rounded-2xl p-4 sm:p-6 lg:h-full lg:flex lg:flex-col overflow-hidden hover:scale-[1.01] transition-all duration-300"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between w-full mb-4">
                                            <div className="flex flex-col">
                                                {/* Icon + Tooltip */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <AlertTriangle className="w-12 h-12 text-primary" />
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="w-52 bg-[#2b2b2b] text-xs text-gray-200">
                                                            <p>
                                                                AI-powered analysis highlighting issues that may reduce ad performance and engagement before launch.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>

                                                {/* Title + Description */}
                                                <div className="space-y-1">
                                                    <h3 className="text-white font-semibold text-xl tracking-wide leading-tight">
                                                        Issues Detected
                                                    </h3>
                                                    <p className="text-white/50 text-sm leading-snug">
                                                        Ad readiness summary and potential loss estimate
                                                    </p>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Body */}
                                        <div className="text-left w-full space-y-2 sm:space-y-4 pt-1 sm:pt-2">
                                            {/* Issue Counters */}
                                            <div className="grid grid-cols-2 gap-3 w-full items-stretch">
                                                {/* Critical Issues */}
                                                <div className="relative bg-[#171717] border border-[#2a2a2a] rounded-xl py-4 px-2 text-center flex flex-col justify-center group hover:border-red-500 transition-all duration-300">
                                                    <p className="text-red-300 text-sm font-semibold mb-1 flex items-center justify-center gap-1">
                                                        Critical Issues
                                                    </p>
                                                    <div className="text-3xl font-bold text-red-400 tracking-wide">
                                                        {criticalIssues.length.toString().padStart(2, "0")}
                                                    </div>
                                                    {criticalIssues.length > 0 && (
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            {criticalIssues.length === 1 ? "Needs immediate attention" : "Multiple areas need fix"}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Minor Issues */}
                                                <div className="relative bg-[#171717] border border-[#2a2a2a] rounded-xl py-4 py-2 text-center flex flex-col justify-center group hover:border-[#F99244]/60 transition-all duration-300">
                                                    <p className="text-[#F99244] text-sm font-semibold mb-1 flex items-center justify-center gap-1">
                                                        Minor Issues
                                                    </p>
                                                    <div className="text-3xl font-bold text-[#F99244] tracking-wide">
                                                        {minorIssues.length.toString().padStart(2, "0")}
                                                    </div>
                                                    {minorIssues.length > 0 && (
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            {minorIssues.length === 1 ? "Minor adjustment suggested" : "Minor improvements possible"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CTR Loss */}
                                            <div className="relative bg-[#141414] rounded-xl border border-[#2a2a2a] p-4 mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-[#DB4900] transition-all duration-300">
                                                <div className="flex items-center gap-3">
                                                    <TrendingDown className="w-5 h-5 text-red-400 mt-[2px]" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">Estimated CTR Loss</p>
                                                        <p className="text-xs text-white/70 mt-1">If issues remain unfixed</p>
                                                    </div>
                                                </div>

                                                <div className="text-3xl font-bold text-red-400 mt-3 sm:mt-0 self-center sm:self-auto">
                                                    {estimatedCtrLoss || "0%"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Readability, Best Days & Time, Uniqueness, Ad Fatigue arranged by rows */}
                                <div className="lg:col-span-4 lg:flex lg:flex-col lg:h-full">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-full">
                                        {/* Row 1 - Col 1: Readability (hidden on small to preserve previous behavior) */}
                                        <div className="">
                                            <div
                                                className="bg-black px-4 py-4 rounded-2xl h-full hover:scale-[1.01] transition-all duration-300"
                                                style={{ transition: "all 0.3s" }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
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
                                                            <p>Measures how easy it is for your target audience to read and understand your ad content. Higher scores indicate clearer messaging, better font choices, and optimal text structure.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <p className="text-white/50 text-sm mb-4">Clarity of your ad content.</p>
                                                <div className="flex items-center justify-between">
                                                    <div
                                                        className={`text-3xl sm:text-5xl md:text-6xl font-bold ${(currentAd?.readability_clarity_meter || 0) >= 70
                                                            ? "text-green-400"
                                                            : (currentAd?.readability_clarity_meter || 0) >= 50
                                                                ? "text-[#F99244]"
                                                                : "text-red-400"
                                                            }`}
                                                    >
                                                        {currentAd?.readability_clarity_meter || 0}%
                                                    </div>
                                                    <div className="w-8  h-8 sm:w-10 md:w-14 sm:h-10 md:h-14 flex items-center justify-center">
                                                        <FileText className="w-full h-full text-primary" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 1 - Col 2: Best Days & Time */}
                                        <div>
                                            <div
                                                className="bg-black px-4 py-4 rounded-2xl h-full hover:scale-[1.01] transition-all duration-300"
                                                style={{ transition: "all 0.3s" }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                                                }}
                                                onMouseLeave={(e) => {
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
                                                            <p>
                                                                AI-analyzed optimal timing for posting your ad based on your target
                                                                audience's online behavior patterns, platform algorithms, and
                                                                industry best practices to maximize reach and engagement.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>

                                                <p className="text-white/50 text-sm mb-4">
                                                    Best days and times to post your ads.
                                                </p>

                                                {/* ✅ Days & Times Logic */}
                                                {(() => {
                                                    let text = currentAd?.best_day_time_to_post || "";

                                                    let dayPart = "";
                                                    let timePart = "";

                                                    if (text.includes(",")) {
                                                        // Format: "Monday, 10 AM - 2 PM"
                                                        [dayPart, timePart] = text.split(",");
                                                    } else if (text.includes("between")) {
                                                        // Format: "Weekdays between 10 AM - 2 PM"
                                                        const [days, times] = text.split("between");
                                                        dayPart = days.trim();
                                                        timePart = times.trim();
                                                    } else {
                                                        // Only one string, no comma or between
                                                        dayPart = text.trim();
                                                    }

                                                    return (
                                                        <div className="flex flex-row items-start sm:items-center gap-6">
                                                            {/* Days */}
                                                            <div>
                                                                <h4 className="text-white text-sm mb-2 font-medium">Days</h4>
                                                                <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                                                                    {dayPart && (
                                                                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs whitespace-nowrap">
                                                                            {dayPart}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Times */}
                                                            <div>
                                                                <h4 className="text-white text-sm mb-2 font-medium">Times</h4>
                                                                <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                                                                    {timePart ? (
                                                                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs whitespace-nowrap">
                                                                            {timePart}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs whitespace-nowrap">
                                                                            ---
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                        </div>

                                        {/* Row 2 - Col 1: Uniqueness (hidden on small to preserve previous behavior) */}
                                        <div className="">
                                            <div
                                                className="bg-black px-4 py-4 rounded-2xl h-full hover:scale-[1.01] transition-all duration-300"
                                                style={{ transition: "all 0.3s" }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
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
                                                            <p>Analyzes how distinctive your ad is compared to competitors in your industry. Higher scores indicate more original content, creative approaches, and unique value propositions that help you stand out.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <p className="text-white/50 text-sm mb-4">How different your ad is.</p>
                                                <div className="flex items-center justify-between">
                                                    <div
                                                        className={`text-3xl sm:text-4xl md:text-5xl mb-1 font-bold ${(currentAd?.competitor_uniqueness_meter || 0) >= 70
                                                            ? "text-green-400"
                                                            : (currentAd?.competitor_uniqueness_meter || 0) >= 50
                                                                ? "text-[#F99244]"
                                                                : "text-red-400"
                                                            }`}
                                                    >
                                                        {currentAd?.competitor_uniqueness_meter || 0}%
                                                    </div>
                                                </div>
                                                <div className="bg-[#171717] rounded-lg p-3 border border-[#2a2a2a] flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                    <p className="text-xs text-white/80">
                                                        {currentAd?.competitor_uniqueness_text || "No Competitor Uniqueness"}
                                                    </p>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Row 2 - Col 2: Ad Fatigue */}
                                        <div>
                                            <div
                                                className="bg-black px-4 py-4 rounded-2xl h-full hover:scale-[1.01] transition-all duration-300"
                                                style={{ transition: "all 0.3s" }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
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
                                                            <p>Predicts how quickly your audience will become tired of seeing your ad. Lower scores indicate longer-lasting appeal, while higher scores suggest you may need to refresh or rotate your creative sooner.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <p className="text-white/50 text-sm mb-4">Estimates audience fatigue rate.</p>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-4xl font-bold text-[#F99244]">
                                                            {currentAd?.ad_fatigue_score || "N/A"}
                                                        </div>
                                                        <div className="w-16 h-16 flex items-center justify-center">
                                                            <Sparkles className="w-full h-full text-primary" />
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="border border-primary text-primary text-xs rounded-xl px-3 py-1.5 "
                                                    >
                                                        {currentAd?.prevention_tip_to_avoid_ad_fatigue || "No tips"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Engagement Insights - Pro Overlay (match Results) */}
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
                                                <span className="text-gray-300 text-sm sm:text-base">Traffic Efficiency Score</span>
                                                {(() => {
                                                    const value = Number((currentAd as any)?.traffic_efficiency_index) || 0;
                                                    let label = "N/A";
                                                    let colorClass = "text-gray-400";
                                                    if (value >= 70) { label = "High"; colorClass = "text-green-400"; }
                                                    else if (value >= 40) { label = "Moderate"; colorClass = "text-[#F99244]"; }
                                                    else if (value > 0) { label = "Low"; colorClass = "text-red-400"; }
                                                    return <span className={`font-bold text-sm sm:text-base ${colorClass}`}>{label} ({value})</span>;
                                                })()}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Scroll Stop Power</span>
                                                <span className={`font-bold text-sm sm:text-base ${((currentAd as any)?.scroll_stoppower === 'High') ? 'text-green-400' : ((currentAd as any)?.scroll_stoppower === 'Moderate') ? 'text-[#F99244]' : ((currentAd as any)?.scroll_stoppower === 'Low') ? 'text-red-400' : 'text-white/70'}`}>{(currentAd as any)?.scroll_stoppower || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Estimated CTR</span>
                                                <span className={`font-bold text-sm sm:text-base ${parseFloat((currentAd as any)?.estimated_ctr) >= 5 ? 'text-green-400' : parseFloat((currentAd as any)?.estimated_ctr) >= 2 ? 'text-[#F99244]' : 'text-red-400'}`}>{(currentAd as any)?.estimated_ctr || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Conversion Probability</span>
                                                <span className={`font-bold text-sm sm:text-base ${parseFloat((currentAd as any)?.conversion_probability) >= 50 ? 'text-green-400' : parseFloat((currentAd as any)?.conversion_probability) >= 20 ? 'text-[#F99244]' : 'text-red-400'}`}>{(currentAd as any)?.conversion_probability || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm sm:text-base">Predicted Reach</span>
                                                <span className={`font-bold text-sm sm:text-base ${((currentAd as any)?.predicted_reach || 0) >= 10000 ? 'text-green-400' : ((currentAd as any)?.predicted_reach || 0) >= 5000 ? 'text-[#F99244]' : 'text-red-400'}`}>{(currentAd as any)?.predicted_reach?.toLocaleString() || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Merged Budget & Audience Strategy */}
                                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300 lg:col-span-2"
                                        style={{ transition: "all 0.3s" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                        }}>
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h4 className="text-base sm:text-lg font-semibold text-primary">Budget & Audience Strategy</h4>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-60 bg-[#2b2b2b] space-y-2">
                                                    <p>Comprehensive financial and targeting strategy — including expected CPM, ROI, and audience tips.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4">
                                            {/* Metrics */}
                                            <div className="space-y-3">
                                                <div className="bg-[#171717] p-4 rounded-xl space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-300 text-sm sm:text-base">Expected CPM</span>
                                                        <span className={`font-bold text-sm sm:text-base ${Number((currentAd as any)?.expected_cpm) <= 5 ? 'text-green-400' : Number((currentAd as any)?.expected_cpm) <= 15 ? 'text-[#F99244]' : 'text-red-400'}`}>{(currentAd as any)?.expected_cpm || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-300 text-sm sm:text-base">ROI Range</span>
                                                        <span className={`font-bold text-sm sm:text-base ${((currentAd as any)?.roi_max || 0) >= 5 ? 'text-green-400' : ((currentAd as any)?.roi_max || 0) >= 3 ? 'text-[#F99244]' : 'text-red-400'}`}>{(currentAd as any)?.roi_min || 0}x - {(currentAd as any)?.roi_max || 0}x</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-[#171717] py-4 px-2 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                                                        <span className="text-gray-300 text-sm sm:text-base">Test Budget</span>
                                                        <span className="font-bold text-xl sm:text-2xl text-primary">${(currentAd as any)?.suggested_test_budget_in_usd || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-[#171717] py-4 px-2 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                                                        <span className="text-gray-300 text-sm sm:text-base">Test Duration</span>
                                                        <span className="font-bold text-xl sm:text-2xl text-primary">{(currentAd as any)?.suggested_test_duration_days ? `${(currentAd as any)?.suggested_test_duration_days} days` : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Audience & Strategy Tip */}
                                            <div className="flex flex-col justify-between space-y-4 sm:space-y-5">
                                                <div>
                                                    <span className="block text-gray-300 text-xs sm:text-sm mb-2">Top Audience:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {safeArray((currentAd as any)?.top_5_audience || (currentAd as any)?.top_audience).map((aud: string, idx: number) => (
                                                            <Badge key={idx} className="bg-green-600/20 text-green-400 border-green-600/30 text-xs whitespace-nowrap">{aud}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-[#171717] border border-[#2b2b2b] rounded-lg p-3 sm:p-4 max-w-[95%]">
                                                    <p className="text-primary text-xs sm:text-sm mb-1 font-medium">Strategy Tip:</p>
                                                    <p className="text-gray-100 text-xs sm:text-sm leading-relaxed">{(currentAd as any)?.spend_recommendation_strategy_tip || 'No recommendation available.'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ProOverlay>

                            {/* Issues and Digital Marketing Feedback - Mobile Responsive (match Results) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Issues Section */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s", maxHeight: "300px" }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900"; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)"; }}
                                >
                                    <div className="px-4 sm:px-6 py-2 sm:py-4 overflow-y-auto h-full">
                                        {/* Critical Issues */}
                                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                                            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-red-400">
                                                <Search className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                Critical Issues
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Major problems in your ad that could greatly harm performance or user trust.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-1">
                                            {safeArray((currentAd as any)?.critical_issues).map((issue, index) => (
                                                <li key={index} className="flex items-start text-white">
                                                    <span className="mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">•</span>
                                                    <span className="text-xs sm:text-sm leading-relaxed">{issue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray((currentAd as any)?.critical_issues).length === 0 && (
                                            <div className="text-white/70 text-center py-6 sm:py-8 text-sm sm:text-base">No critical issues detected</div>
                                        )}

                                        {/* Minor Issues */}
                                        <div className="flex items-center justify-between mt-3 mb-1 sm:mb-2">
                                            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-[#F99244]">
                                                <Search className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                Minor Issues
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-50 bg-[#2b2b2b]">
                                                    <p>Lesser problems in your ad that may impact engagement or usability.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <ul className="space-y-1">
                                            {safeArray((currentAd as any)?.minor_issues).map((issue, index) => (
                                                <li key={index} className="flex items-start text-white">
                                                    <span className="mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">•</span>
                                                    <span className="text-xs sm:text-sm leading-relaxed">{issue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray((currentAd as any)?.minor_issues).length === 0 && (
                                            <div className="text-white/70 text-center py-6 sm:py-8 text-sm sm:text-base">No minor issues detected</div>
                                        )}
                                    </div>
                                </div>

                                {/* Digital Marketing Feedback */}
                                <div
                                    className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s", maxHeight: "300px" }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900"; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)"; }}
                                >
                                    <div className="p-4 sm:p-6 overflow-y-auto h-full">
                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                            <h3 className="flex items-center text-lg sm:text-xl font-semibold text-green-400">
                                                <TrendingUp className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                For Marketing Experts
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
                                            {safeArray((currentAd as any)?.feedback_digitalmark).map((feedback, index) => (
                                                <li key={index} className="flex items-start text-gray-300">
                                                    <span className="mr-2 sm:mr-3 text-green-400 text-base sm:text-lg flex-shrink-0">•</span>
                                                    <span className="text-sm sm:text-base leading-relaxed">{feedback}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {safeArray((currentAd as any)?.feedback_digitalmark).length === 0 && (
                                            <div className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">No marketing feedback available</div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Ad Creative Suggestions - Mobile Optimized */}
                            {currentAd?.next_ad_idea_based_on_this_post && (
                                <div
                                    className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="p-4 sm:p-6 lg:p-8">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                                                <Sparkles className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                                Creative Variation Tip
                                            </h3>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="w-60 bg-[#2b2b2b] text-gray-200">
                                                    <p>
                                                        AI-generated creative ideas based on your current ad — including
                                                        headline, caption, and visual concept — to inspire your next
                                                        campaign.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Left Column */}
                                            <div className="space-y-4 sm:space-y-6">
                                                {/* Headline Idea */}
                                                <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-xl p-4 sm:p-6 border border-green-600/20">
                                                    <h4 className="text-base sm:text-lg font-semibold text-green-400 mb-2 sm:mb-3 flex items-center">
                                                        <Type className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                                        Headline Idea
                                                    </h4>
                                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                                        {currentAd?.next_ad_idea_based_on_this_post?.headline}
                                                    </p>
                                                </div>

                                                {/* Short Caption */}
                                                <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl p-4 sm:p-6 border border-blue-600/20">
                                                    <h4 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3 flex items-center">
                                                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                                        Short Caption
                                                    </h4>
                                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                                        {currentAd?.next_ad_idea_based_on_this_post?.short_caption}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Column - Visual Idea */}
                                            <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-xl p-4 sm:p-6 border border-purple-600/20 flex flex-col items-start text-left">
                                                <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-3 sm:mb-4" />
                                                <h4 className="text-lg sm:text-xl font-semibold text-purple-400 mb-2 sm:mb-3">
                                                    Visual Idea
                                                </h4>
                                                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                                    {currentAd?.next_ad_idea_based_on_this_post?.visual_idea}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Engagement & Performance Metrics - Mobile Responsive */}
                            <div className="grid grid-cols-1 lg:grid-cols-[28.5%_41%_28.5%] gap-2 sm:gap-4 w-full">
                                {/* Technical Metrics (30%) */}
                                <div
                                    className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <h4 className="text-base sm:text-lg font-semibold text-white">Technical Metrics</h4>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-64 bg-[#2b2b2b] text-sm space-y-2">
                                                <div>
                                                    <strong>Budget Utilization:</strong>
                                                    <p className="text-gray-300 text-xs">Tracks how efficiently your allocated budget is being spent.</p>
                                                </div>
                                                <div>
                                                    <strong>Faces Detected:</strong>
                                                    <p className="text-gray-300 text-xs">Ensures people are clearly visible in content.</p>
                                                </div>
                                                <div>
                                                    <strong>Logo Visibility:</strong>
                                                    <p className="text-gray-300 text-xs">Checks if your logo is prominent and clear.</p>
                                                </div>
                                                <div>
                                                    <strong>Text Percentage:</strong>
                                                    <p className="text-gray-300 text-xs">Measures the balance between visuals and text.</p>
                                                </div>
                                                <div>
                                                    <strong>Layout Symmetry:</strong>
                                                    <p className="text-gray-300 text-xs">Evaluates the visual alignment and balance.</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                                        <span className="text-gray-300 text-sm sm:text-base">Primary Emotion</span>
                                        <span className="text-primary border border-primary rounded-lg px-3 py-1 text-xs sm:text-sm font-medium bg-[#1a1a1a]">
                                            {currentAd?.primary_emotion || "—"}
                                        </span>
                                    </div>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { label: "Logo Visibility", value: currentAd?.logo_visibility_score || 0, max: 100 },
                                            { label: "Text Percentage", value: currentAd?.text_percentage_score || 0, max: 100 },
                                            { label: "Faces Detected", value: currentAd?.faces_detected || 0, max: 10 },
                                            { label: "Layout Symmetry", value: currentAd?.layout_symmetry_score || 0, max: 100 },
                                            { label: "Color Harmony", value: currentAd?.color_harmony || 0, max: 100 },
                                        ].map((item, i) => {
                                            const getColorClass = () => {
                                                if (item.max === 10) {
                                                    if (item.value <= 3) return "text-green-400";
                                                    if (item.value <= 7) return "text-[#F99244]";
                                                    return "text-red-400";
                                                } else {
                                                    if (item.value <= 50) return "text-red-400";
                                                    if (item.value <= 75) return "text-[#F99244]";
                                                    return "text-green-400";
                                                }
                                            };

                                            const colorClass = getColorClass();

                                            // Add leading zero for Faces Detected if single digit
                                            const formattedValue =
                                                item.label === "Faces Detected"
                                                    ? String(item.value).padStart(2, "0")
                                                    : Math.round(item.value);

                                            return (
                                                <div key={i} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-gray-300 text-sm sm:text-base">{item.label}</span>
                                                    </div>
                                                    <span className={`font-bold text-sm sm:text-base ${colorClass}`}>
                                                        {formattedValue}
                                                        {item.max === 100 ? "%" : ""}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                </div>

                                {/* Engagement Metrics - Centered (2 Columns Wide) */}
                                <div className="lg:col-span-1 flex justify-center">
                                    <div className="w-full">
                                        <ProOverlay message="Upgrade to Pro to unlock advanced engagement analytics and performance insights.">
                                            <div className="w-full bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 p-4 sm:p-6 flex flex-col hover:scale-[1.01] transition-all duration-300">
                                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                                    <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                                                        <MousePointerClick className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                                                        Engagement Metrics
                                                    </h3>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="w-64 bg-[#2b2b2b] text-sm space-y-2">
                                                            <div>
                                                                <strong>Engagement Score:</strong>
                                                                <p className="text-gray-300 text-xs">
                                                                    Measures how actively users interact with your content (likes, comments, shares).
                                                                </p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>

                                                <div className="space-y-3 sm:space-y-4 flex-1">
                                                    {/* Engagement Score */}
                                                    <div
                                                        className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#2b2b2b] transition-all duration-300"
                                                        onMouseEnter={(e) => {
                                                            const score = currentAd?.engagement_score || 0;
                                                            const color =
                                                                score <= 50
                                                                    ? "rgba(239,68,68,0.7)" // red
                                                                    : score <= 75
                                                                        ? "rgba(249,146,68,0.7)" // orange
                                                                        : "rgba(34,197,94,0.7)"; // green
                                                            e.currentTarget.style.boxShadow = `0 0 8px 2px ${color}`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* Icon */}
                                                            <MousePointerClick
                                                                className={`w-5 h-5 sm:w-6 sm:h-6 ${(currentAd?.engagement_score || 0) <= 50
                                                                    ? "text-red-500"
                                                                    : (currentAd?.engagement_score || 0) <= 75
                                                                        ? "text-[#F99244]"
                                                                        : "text-green-500"
                                                                    }`}
                                                            />

                                                            {/* Text content */}
                                                            <div className="flex justify-between items-center w-full">
                                                                <span className="text-gray-300 font-medium text-sm sm:text-base">
                                                                    Engagement Score
                                                                </span>
                                                                <span
                                                                    className={`font-bold text-lg sm:text-xl ${(currentAd?.engagement_score || 0) <= 50
                                                                        ? "text-red-500"
                                                                        : (currentAd?.engagement_score || 0) <= 75
                                                                            ? "text-[#F99244]"
                                                                            : "text-green-500"
                                                                        }`}
                                                                >
                                                                    {Math.round(currentAd?.engagement_score || 0)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>


                                                    {/* Other Engagement Metrics */}
                                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                                        {[
                                                            { label: "Viral Potential", value: currentAd?.viral_potential_score || 0, icon: TrendingUp },
                                                            { label: "FOMO Score", value: currentAd?.fomo_score || 0, icon: Zap },
                                                            { label: "Trust Signal", value: currentAd?.trust_signal_score || 0, icon: Shield },
                                                            { label: "Urgency Trigger", value: currentAd?.urgency_trigger_score || 0, icon: AlertTriangle },
                                                        ].map((item, i) => {
                                                            const getColorClass = () => {
                                                                if (item.value <= 50) return "text-red-500";
                                                                if (item.value <= 75) return "text-[#F99244]";
                                                                return "text-green-500";
                                                            };
                                                            const colorClass = getColorClass();

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#2b2b2b] transition-all duration-300"
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.boxShadow =
                                                                            colorClass.includes("red")
                                                                                ? "0 0 8px 2px rgba(239,68,68,0.7)"
                                                                                : colorClass.includes("F99244")
                                                                                    ? "0 0 8px 2px rgba(249,146,68,0.7)"
                                                                                    : "0 0 8px 2px rgba(34,197,94,0.7)";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.boxShadow =
                                                                            "0 0 10px rgba(255,255,255,0.05)";
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} />
                                                                        <div className="flex flex-col text-left">
                                                                            <span className="text-gray-300 font-medium text-xs sm:text-sm">
                                                                                {item.label}
                                                                            </span>
                                                                            <span
                                                                                className={`font-semibold text-sm sm:text-lg ${colorClass}`}
                                                                            >
                                                                                {Math.round(item.value)}%
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
                                </div>

                                {/* Performance Composition Chart */}
                                <div className="bg-black rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 relative overflow-hidden h-full flex flex-col"
                                    style={{ transition: "all 0.3s" }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-base sm:text-lg font-semibold text-white ">
                                            Performance Composition
                                        </h2>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent className="w-64 bg-[#2b2b2b] text-sm">
                                                <p>
                                                    Creative strength across key performance areas including visual appeal,
                                                    CTA effectiveness, emotional resonance, readability, and trust indicators.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <p className="text-sm text-white/70 text-left">
                                        Core creative strengths
                                    </p>

                                    <div className="relative mx-auto h-[300px] w-[250px] sm:h-[250px] sm:w-[250px]" >
                                        <canvas ref={chartRef} className="absolute top-5 left-0 w-full h-full p-4" />
                                        <div className="absolute sm:top-[55%] top-[48%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                            <div
                                                className={`text-2xl sm:text-3xl font-bold leading-tight ${(currentAd?.score_out_of_100 || 0) <= 50
                                                    ? "text-red-500"
                                                    : (currentAd?.score_out_of_100 || 0) <= 75
                                                        ? "text-[#F99244]"
                                                        : "text-green-500"
                                                    }`}
                                            >
                                                {currentAd?.score_out_of_100 || 0}
                                            </div>
                                            <div className="text-xs text-gray-400 tracking-wide">Overall Score</div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* AI-Written Ad Copy Generator */}
                            <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
                                <div className="p-3 sm:p-8 space-y-8">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex items-center justify-between w-full">
                                            <h3 className="text-base sm:text-2xl  font-bold flex items-center">
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
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(adCopy.copy_text || "");
                                                                        setCopiedAdCopyIndex(index);
                                                                        setTimeout(() => setCopiedAdCopyIndex(null), 2000);
                                                                    }}
                                                                    className="p-1 rounded-md hover:bg-[#171717] transition"
                                                                    title={copiedAdCopyIndex === index ? "Copied!" : "Copy text"}
                                                                >
                                                                    {copiedAdCopyIndex === index ? (
                                                                        <CheckCircle className="w-4 h-4 text-green-500 cursor-pointer" />
                                                                    ) : (
                                                                        <Copy className="w-4 h-4 text-gray-300 hover:text-primary cursor-pointer" />
                                                                    )}
                                                                </button>
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
                                        <div className="lg:w-[30%] w-full bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#222] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                                            style={{ transition: "all 0.3s" }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                            }}>
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="flex items-center justify-between text-white mb-1">
                                                    <div className="flex items-center">
                                                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary flex-shrink-0" />
                                                        <h4 className="text-base sm:text-lg font-semibold">Trending Tags</h4>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (currentAd?.["10_trending_tags_relatedto_ad"]) {
                                                                const tagsText = currentAd["10_trending_tags_relatedto_ad"].join(" ");
                                                                navigator.clipboard.writeText(tagsText);
                                                                setTagsCopied(true);
                                                                setTimeout(() => setTagsCopied(false), 2000);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all duration-200"
                                                        title={tagsCopied ? "Copied!" : "Copy all tags"}
                                                    >
                                                        {tagsCopied ? (
                                                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
                                                    Boost your ad's reach with these trending hashtags.
                                                </p>

                                                {/* Tags Display */}
                                                <div className="flex flex-wrap gap-2">
                                                    {currentAd?.["10_trending_tags_relatedto_ad"]?.map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 hover:bg-primary/30 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1 cursor-pointer"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={handleReanalyze}
                                    className="rounded-xl px-8 py-3 text-lg font-semibold transition-all duration-200"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reanalyze
                                </Button>
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

                            </div>
                        </div>
                    </main>
                </div>
            )}
        </TooltipProvider>
    );

}
