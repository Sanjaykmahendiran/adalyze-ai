"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import toast from "react-hot-toast"
import {
  Download, Search, Sparkles, AlertTriangle, CheckCircle, XCircle, Lock, PenTool, GitCompareArrows, Eye, Heart, Target,
  TrendingUp, Palette, Image as ImageIcon, FileText, Award, ChevronLeft, ChevronRight, Info, Users, Zap, Shield, BarChart3,
  Camera, Type, Layout, DollarSign, Upload, ArrowLeft, ShieldCheck, ChartNoAxesCombined, Settings, MousePointerClick, TrendingDown,
  Copy, Share2, Trash2, Loader2, Gift, ChevronUp,
  Check,
  X,
  Lightbulb,
  MessageSquare,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import ResultsPageLoadingSkeleton from "@/components/Skeleton-loading/results-loading"
import { cn } from "@/lib/utils"
import logo from "@/assets/ad-icon-logo.png"
import { ApiResponse } from "./type"
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";
import { motion, AnimatePresence } from "framer-motion"
import { getAdIdFromUrlParams, isTokenExpired, generateShareUrl, generateShareText, parseUserIdFromToken } from "@/lib/tokenUtils"
import { trackEvent } from "@/lib/eventTracker"
import Footer from "@/components/footer"
import UpgradePopup from "@/components/UpgradePopup"
import Chart from 'chart.js/auto'
import PreCampaignChecklist from "./_components/PreCampaignChecklist"

export default function ResultsPage() {
  const { userDetails } = useFetchUserDetails()
  const isFreeTrailUser = userDetails?.fretra_status === 1
  const router = useRouter()
  const searchParams = useSearchParams()
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [showIntro, setShowIntro] = useState(false);
  const [tagsCopied, setTagsCopied] = useState(false);
  const [copiedAdCopyIndex, setCopiedAdCopyIndex] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showIssuesPopup, setShowIssuesPopup] = useState(false)

  // Delete functionality states
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // View Target dialog state
  const [viewTargetOpen, setViewTargetOpen] = useState(false)

  // Upgrade popup state
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)

  // Scroll to Top button visibility
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [showMoreGoReasons, setShowMoreGoReasons] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<any>(null)

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === 'undefined') return
      setShowScrollToTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Check if ad_id came from token (shared link)
  const isFromToken = !!searchParams.get('token')
  const isProUser = isFromToken || userDetails?.payment_status === 1
  // If token/ad-token is older than 7 days, redirect to 404 and do not load results
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && isTokenExpired(token, 7)) {
      setIsExpired(true);
      // Redirect to 404 page
      router.replace('/404');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!chartRef.current || !apiData) return

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Calculate values from apiData
    const dataValues = [
      apiData.visual_clarity || 0,
      apiData.cta_visibility || 0,
      apiData.emotional_appeal || 0,
      apiData.readability_clarity_meter || 0,
      apiData.text_visual_balance || 0
    ]

    const labels = [
      'Visual Appeal',
      'CTA Strength',
      'Emotional Connection',
      'Readability',
      'Text Visual '
    ]

    const colors = ['#fbbf24', '#f97316', '#fb923c', '#22d3ee', '#a855f7']

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: colors,
          borderColor: '#171924',
          borderWidth: 2,
          hoverOffset: 14,
          hoverBorderColor: '#fbbf24',
          hoverBorderWidth: 3,
        }]
      },
      options: {
        layout: {
          padding: 4,
        },
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: true,
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1800,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#fbbf24',
            bodyColor: '#e5e7eb',
            borderColor: '#fbbf24',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}/100`;
              }
            }
          }
        }
      }
    })

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [apiData])

  const handleDownloadPDF = async () => {
    const selector = "body";
    const toHideSelectors = [".skip-block", "noscript"];

    const hidden: Array<{ el: Element; display: string | null }> = [];
    toHideSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const htmlEl = el as HTMLElement;
        hidden.push({ el, display: htmlEl.style.display });
        htmlEl.style.display = "none";
      });
    });

    setIsPdfGenerating(true)
    try {
      const node = document.querySelector(selector);
      if (!node) {
        throw new Error(`Selector not found: ${selector}`);
      }
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 0.5,
        pixelRatio: 0.8
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;

      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      pdf.addImage(dataUrl, "PNG", x, y, scaledWidth, scaledHeight);

      if (userDetails?.type === "2" && (apiData?.agency_website)) {
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        const footerMargin = 0;
        const footerLines: string[] = [];
        if (apiData?.agency_website) footerLines.push(`${apiData.agency_website}`);

        const lineHeights = 5; // mm between lines
        const totalHeight = footerLines.length * lineHeights;
        let startY = pageHeight - footerMargin - (totalHeight / 2);

        footerLines.forEach((line) => {
          const textWidth = pdf.getTextWidth(line);
          const textX = (pageWidth - textWidth) / 2;
          pdf.text(line, textX, startY, { baseline: "bottom" });
          startY += lineHeights;
        });
      }

      pdf.save(`ad-analysis-report-${apiData?.title || 'untitled'}-${new Date().toISOString().split('T')[0]}.pdf`);
      trackEvent("Ad_Analysis_Report_Downloaded", window.location.href, userDetails?.email?.toString())
      // After download completes, scroll to top of the page
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsPdfGenerating(false)
      hidden.forEach(({ el, display }) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = display || "";
      });
    }
  };

  const getAdIdFromUrl = () => {
    return getAdIdFromUrlParams(searchParams);
  };


  const handleShare = () => {
    // Get ad_id from either URL param or token
    const adId = getAdIdFromUrl();

    // Get user_id from userDetails or from token if viewing shared link
    const userId = userDetails?.user_id || null;

    // Generate share URL with ad_id and user_id
    const shareUrl = generateShareUrl(adId, userId || undefined);
    const shareText = generateShareText(adId, userId || undefined);

    // Trigger native share if available
    if (navigator.share) {
      navigator.share({
        title: 'Ad Analysis Results',
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Share link copied to clipboard!');
      });
    }
  };

  // Delete ad function
  const handleDeleteAd = async () => {
    const adId = getAdIdFromUrl();
    if (!adId) {
      toast.error('No ad ID found')
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=deletead&ad_upload_id=${adId}`)

      if (!response.ok) {
        throw new Error('Failed to delete ad')
      }

      const result = await response.json()

      if (result.response === "Ad Deleted") {
        toast.success("Ad deleted successfully")
        // Redirect to my-ads page after successful deletion
        router.push('/my-ads')
      } else {
        throw new Error('Unexpected response from server')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      toast.error('Failed to delete ad. Please try again.')
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  // Rule: If from token, fetch details immediately using token, userDetails NOT needed
  useEffect(() => {
    if (!isFromToken) return;
    if (isExpired) return;
    const adUploadId = getAdIdFromUrlParams(searchParams);
    if (!adUploadId) {
      setError('No ad ID found in URL');
      setLoading(false);
      return;
    }
    let didCancel = false;
    const fetchAdDetails = async () => {
      try {
        const shareToken = searchParams.get('token') || searchParams.get('ad-token');
        let userIdParam = '';
        if (shareToken) {
          const userIdFromToken = parseUserIdFromToken(shareToken);
          if (userIdFromToken) {
            userIdParam = `&user_id=${userIdFromToken}`;
          }
        }
        const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adUploadId}${userIdParam}`);
        if (!response.ok) throw new Error('Failed to fetch ad details');
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'API returned error');
        if (!didCancel) setApiData(result.data);
      } catch (err) {
        if (!didCancel) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!didCancel) setLoading(false);
      }
    };
    setLoading(true);
    setError(null);
    fetchAdDetails();
    return () => { didCancel = true; };
    // Runs once per token
  }, [isFromToken, searchParams, isExpired]);

  // Rule: If NOT from token, only fetch when userDetails is loaded
  useEffect(() => {
    if (isFromToken) return;
    if (isExpired) return;
    if (!userDetails) return;
    const adUploadId = getAdIdFromUrlParams(searchParams);
    if (!adUploadId) {
      setError('No ad ID found in URL');
      setLoading(false);
      return;
    }
    let didCancel = false;
    const fetchAdDetails = async () => {
      try {
        let userIdParam = '';
        if (userDetails?.user_id) {
          userIdParam = `&user_id=${userDetails.user_id}`;
        }
        const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adUploadId}${userIdParam}`);
        if (!response.ok) throw new Error('Failed to fetch ad details');
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'API returned error');
        if (!didCancel) setApiData(result.data);
      } catch (err) {
        if (!didCancel) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!didCancel) setLoading(false);
      }
    };
    setLoading(true);
    setError(null);
    fetchAdDetails();
    return () => { didCancel = true; };
    // Only runs once when userDetails and adUploadId ready
  }, [isFromToken, searchParams, isExpired, userDetails]);

  // Helper function to safely get array or return empty array
  const safeArray = (arr: any): any[] => {
    return Array.isArray(arr) ? arr : []
  }

  // Helper function to parse platform suitability
  const getPlatformSuitability = () => {
    if (!apiData) return [];

    const suitablePlatforms = safeArray(apiData.platform_suits).map(p =>
      typeof p === 'string' ? p.toLowerCase() : String(p).toLowerCase()
    );

    const allPlatforms = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'Flyer'];

    const suitabilityList = allPlatforms
      .filter(platform => suitablePlatforms.includes(platform.toLowerCase()))
      .map(platform => ({ platform, suitable: true }));

    return suitabilityList;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };


  // Helper function to get ad copies (tone filter removed)
  const getFilteredAdCopies = () => {
    const adCopies = safeArray(apiData?.ad_copies)

    if (!isProUser) {
      return adCopies.slice(0, 1)
    }

    return adCopies
  }

  // Image navigation functions
  const nextImage = () => {
    const images = safeArray(apiData?.images)
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    const images = safeArray(apiData?.images)
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const isToday = (d: string | Date) => {
    const date = new Date(d);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  // 3) Decide whether to show the popup once per ad_id when ad was created today
  useEffect(() => {
    if (!apiData) return;

    const adId = getAdIdFromUrl();
    if (!adId) return;

    // Use the uploaded/created date already shown in the header
    const createdAt = apiData.uploaded_on;
    if (!createdAt) return;

    if (!isToday(createdAt)) return; // Only on creation day

    const key = `intro_shown_${adId}`;
    const alreadyShown = typeof window !== 'undefined' ? localStorage.getItem(key) : '1';

    if (!alreadyShown) {
      setShowIntro(true);
    }
  }, [apiData, searchParams]);

  // 4) Handlers to persist one-time display and route on No Go
  const handleIntroChoice = (choice: 'go' | 'no-go') => {
    const adId = getAdIdFromUrl();
    if (adId && typeof window !== 'undefined') {
      localStorage.setItem(`intro_shown_${adId}`, '1');
    }
    setShowIntro(false);
    if (choice === 'no-go') {
      router.push('/upload');
    }
  };

  const ProOverlay = ({ children, message }: { children: React.ReactNode; message: string }) => (
    <div className="relative">
      <div className={isProUser ? "" : "blur-sm pointer-events-none"}>{children}</div>
      {!isProUser && (
        <div className="absolute inset-0 bg-[#121212]/70 flex flex-col items-center justify-center rounded-2xl">
          <div className="text-center p-4">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-primary" />
            <p className="text-white font-semibold mb-4 text-sm sm:text-base px-2">{message}</p>
            <Button
              onClick={() => router.push("/pro")}
              className=" text-white rounded-lg text-sm sm:text-base px-4 py-2"
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-red-400 skip-block" />
          <p className="text-lg sm:text-xl mb-4">Failed to load analysis results</p>
          <Button onClick={() => router.push('/upload')} className=" w-full sm:w-auto">
            Go Back to Upload
          </Button>
        </div>
      </div>
    )
  }

  if (isExpired) {
    return null;
  }

  if (loading) {
    return <ResultsPageLoadingSkeleton />
  }

  if (!apiData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg sm:text-xl mb-4">No data available</p>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">Unable to load analysis results</p>
          <Button onClick={() => router.push('/upload')} className=" w-full sm:w-auto">
            Go Back to Upload
          </Button>
        </div>
      </div>
    )
  }

  const platformSuitability = getPlatformSuitability()
  const filteredAdCopies = getFilteredAdCopies()
  const images = safeArray(apiData?.images)
  const feedbackDigitalMark = safeArray(apiData?.feedback_digitalmark)
  const criticalIssues = safeArray((apiData as any)?.critical_issues)
  const minorIssues = safeArray((apiData as any)?.minor_issues)
  const estimatedCtrLossArr = safeArray((apiData as any)?.estimated_ctr_loss_if_issues_unfixed)
  const estimatedCtrLoss = estimatedCtrLossArr.length > 0 ? estimatedCtrLossArr[0] : null
  const whyOverall = safeArray((apiData as any)?.why_overall_score_out_of_100);
  const whyConfidence = safeArray((apiData as any)?.why_confidence_score);
  const whyMatch = safeArray((apiData as any)?.why_match_score);


  return (
    <TooltipProvider>
      <div className="min-h-screen text-white max-w-7xl mx-auto overflow-x-hidden">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 overflow-x-hidden">
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
            {/* Left: Back + Title + Subtitle */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {/* Back Button - Hidden when viewing via shared token */}
              {!isFromToken && (
                <button
                  onClick={() => {
                    // Show upgrade popup if user is free trial user OR has 0 ads limit
                    if (isFreeTrailUser || Number(userDetails?.ads_limit) === 0) {
                      setShowUpgradePopup(true)
                    } else {
                      router.back()
                    }
                  }}
                  className="flex items-center bg-[#121212] text-gray-300 hover:text-white hover:bg-[#2b2b2b] rounded-full p-2 transition-all cursor-pointer no-print skip-block flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Title + Subtitle */}
              <div className="text-left min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 truncate">Analysis Results</h1>
                <p className="text-gray-300 text-sm sm:text-base hidden sm:block">AI-powered insights for your ad creative</p>
              </div>
            </div>

            {/* Right: Logo */}
            <div className="flex-shrink-0">
              {apiData?.agency_logo && apiData.agency_logo.trim() !== "" ? (
                <Image src={apiData.agency_logo} alt="Logo" className="h-10 sm:h-14 w-auto" width={56} height={56} />
              ) : (
                <Image src={logo} alt="Logo" className="h-10 sm:h-14 w-auto" />
              )}
            </div>
          </div>

          <div className="w-full mx-auto space-y-6 sm:space-y-8 ">
            {/* Ad Overview Card - Mobile First */}

            {/* Mobile Layout: Title + Meta first, then Image + Go/No Go, then Badges + Scores */}
            <div className="lg:hidden bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border-none space-y-4 sm:space-y-6 p-4">
              {/* Title + Meta - Always first on mobile */}
              <div className="lg:hidden">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0 break-words">
                    {apiData.title
                      ? apiData.title.length > 20
                        ? apiData.title.slice(0, 20) + "..."
                        : apiData.title
                      : "Untitled Ad"}
                  </h2>
                  {/* Delete Button - Only for non-token users */}
                  {!isFromToken && (
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label="Delete ad"
                          className="border-red-600 bg-red-600/20 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" />
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1a1a1a] border-[#3d3d3d]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Ad</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            Are you sure you want to delete "{apiData?.title || 'this ad'}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-[#3d3d3d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAd}
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
                  )}
                </div>
              </div>

              {/* Mobile: Image + Go/No Go side by side */}
              <div className="lg:hidden grid grid-cols-2 gap-4">
                {/* Ad Preview - Left side, small square */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#121212] border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                  {apiData.ad_type === "Video" && apiData.video ? (
                    <video
                      src={apiData.video}
                      controls
                      className="w-full h-full object-contain"
                      poster={images.length > 0 ? images[0] : undefined}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    images.length > 0 && (
                      <>
                        <Image
                          src={images[currentImageIndex]}
                          alt={apiData.title || "Ad Image"}
                          fill
                          className="object-contain"
                        />

                        {/* Navigation - Touch Optimized */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all touch-manipulation cursor-pointer"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all touch-manipulation cursor-pointer"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            {/* Indicators - Mobile Optimized */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all touch-manipulation",
                                    index === currentImageIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/75"
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )
                  )}
                </div>

                {/* Go/No Go - Right side, small */}
                <div className="bg-[#171717] rounded-xl p-3 flex flex-col justify-center items-center hover:scale-[1.01] transition-all duration-300">
                  <h3 className="text-white font-semibold text-sm mb-2">Go / No Go</h3>
                  <p
                    className={`text-3xl font-bold ${apiData?.go_no_go === "Go"
                      ? "text-green-400"
                      : "text-red-400"
                      }`}
                  >
                    {apiData?.go_no_go || ""}
                  </p>
                  <p className="text-white/50 text-xs text-center mt-1">Ready to run?</p>
                </div>
              </div>

              {/* Mobile: Badges and Scores below */}
              <div className="lg:hidden space-y-4">
                {/* Badges - Mobile Stacked */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2  transition-all duration-300">
                    <span className="text-sm">Industry:</span>
                    <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 text-xs">
                      {apiData.industry || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2  transition-all duration-300 max-w-full">
                    <span className="text-sm flex-shrink-0">Best Suit for:</span>
                    <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                      {platformSuitability.map((platform) => (
                        <Badge
                          key={platform.platform}
                          className={cn(
                            "flex items-center gap-1 transition-all duration-300 text-xs whitespace-nowrap",
                            platform.suitable
                              ? "bg-green-600/20 text-green-400 border border-green-600/30"
                              : "bg-red-600/20 text-red-400 border border-red-600/30"
                          )}
                        >
                          {platform.suitable && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                          {platform.platform}
                        </Badge>
                      ))}

                    </div>
                  </div>
                </div>

                {/* Score Section - Mobile Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Performance Score - Full Width */}
                  <div
                    className="flex items-center justify-between p-4 sm:p-6 rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                    }}
                  >
                    {/* Left section */}
                    <div className="flex flex-col items-start">
                      <ChartNoAxesCombined
                        className={`h-8 w-8 sm:h-10 sm:w-10 mb-2 ${apiData.score_out_of_100 < 50
                          ? "text-red-400"
                          : apiData.score_out_of_100 < 75
                            ? "text-[#F99244]"
                            : "text-[#22C55E]"
                          }`}
                      />
                      <h3 className="text-sm sm:text-base font-medium text-gray-300">
                        Performance Score
                      </h3>
                    </div>

                    {/* Right section */}
                    <div
                      className={`text-3xl sm:text-5xl font-extrabold ${apiData.score_out_of_100 < 50
                        ? "text-red-400"
                        : apiData.score_out_of_100 < 75
                          ? "text-[#F99244]"
                          : "text-[#22C55E]"
                        }`}
                    >
                      {apiData.score_out_of_100}%
                    </div>
                  </div>


                  {/* Confidence Score & Match Score - Two Columns */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Confidence Score */}
                    <div
                      className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                      }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <ShieldCheck
                          className={`h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-2 ${apiData.confidence_score < 50
                            ? "text-red-400"
                            : apiData.confidence_score < 75
                              ? "text-[#F99244]"
                              : "text-[#22C55E]"
                            }`}
                        />
                        <h3 className="text-xs font-medium text-gray-300 mb-1">
                          Confidence Score
                        </h3>
                        <div
                          className={`text-xl font-bold ${apiData.confidence_score < 50
                            ? "text-red-400"
                            : apiData.confidence_score < 75
                              ? "text-[#F99244]"
                              : "text-[#22C55E]"
                            }`}
                        >
                          {apiData.confidence_score || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div
                      className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                      }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Target
                          className={`h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-2 ${apiData.match_score < 50
                            ? "text-red-400"
                            : apiData.match_score < 75
                              ? "text-[#F99244]"
                              : "text-[#22C55E]"
                            }`}
                        />
                        <h3 className="text-xs font-medium text-gray-300 mb-1">
                          Match Score
                        </h3>
                        <div
                          className={`text-xl font-bold ${apiData.match_score < 50
                            ? "text-red-400"
                            : apiData.match_score < 75
                              ? "text-[#F99244]"
                              : "text-[#22C55E]"
                            }`}
                        >
                          {apiData.match_score || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - View Target and Delete */}
                <div className="mt-4 sm:mt-6 flex justify-end gap-2 skip-block">

                  {/* View Target Button */}
                  <Dialog open={viewTargetOpen} onOpenChange={setViewTargetOpen}>
                    <DialogTrigger asChild>
                    <Button
                        size="sm"
                        aria-label="View target details"
                        className={`
                                    flex items-center gap-2 font-medium transition-all duration-200
                                  ${apiData?.target_match_score >= 80
                            ? "bg-green-700/20 text-green-400 border border-green-700/40 hover:bg-green-700/30"
                            : apiData?.target_match_score >= 60
                              ? "bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 hover:bg-yellow-700/30"
                              : "bg-red-700/20 text-red-400 border border-red-700/40 hover:bg-red-700/30"}
                            `}
                      >
                        <Target className="w-3 h-3" />
                        View Target
                        {apiData?.target_match_score && (
                          <span className="text-xs font-semibold">
                            ({apiData.target_match_score}%)
                          </span>
                        )}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="bg-black border border-[#2b2b2b] rounded-2xl w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#db4900]" />
                          Target Details
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* --- Target Insights Unified Section --- */}
                        {apiData?.target_match_score && (
                          <div className="bg-[#171717] rounded-2xl p-4 sm:p-5 shadow-md space-y-6">

                            {/* --- Header with Score --- */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              {/* Left section - title and subtitle */}
                              <div className="flex flex-col gap-1">
                                <h3 className="text-white font-semibold text-base sm:text-lg flex items-center gap-2">
                                  <BarChart3 className="w-5 h-5 text-primary shrink-0" />
                                  Targeting Comparison
                                </h3>
                                <p className="text-xs text-white/60">
                                  How well your targeting aligns with the suggested setup
                                </p>
                              </div>

                              {/* Right section - badge */}
                              <div
                                className={`px-3 py-1 text-sm sm:text-base font-semibold rounded-full border self-start sm:self-auto ${apiData.target_match_score >= 80
                                  ? "bg-green-700/20 text-green-400 border-green-700/40"
                                  : apiData.target_match_score >= 60
                                    ? "bg-yellow-700/20 text-yellow-400 border-yellow-700/40"
                                    : "bg-red-700/20 text-red-400 border-red-700/40"
                                  }`}
                              >
                                {apiData.target_match_score}% Match
                              </div>
                            </div>

                            {/* --- Targeting Comparison Cards --- */}
                            {apiData?.targeting_compare_json?.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {apiData.targeting_compare_json.map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className={`rounded-lg p-3 border relative overflow-hidden transition-all ${item.match === "match"
                                      ? "border-green-700/40 bg-green-900/10"
                                      : item.match === "partial"
                                        ? "border-yellow-700/40 bg-yellow-900/10"
                                        : "border-red-700/40 bg-red-900/10"
                                      }`}
                                  >
                                    {/* Top Indicator */}
                                    <div
                                      className={`absolute top-0 left-0 h-1 w-full ${item.match === "match"
                                        ? "bg-green-500/70"
                                        : item.match === "partial"
                                          ? "bg-yellow-500/70"
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
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                          }`}
                                      >
                                        {item.match}
                                      </span>
                                    </div>

                                    {/* Comparison Details */}
                                    <div className="text-xs space-y-1">
                                      <p className="text-white/60">
                                        You:{" "}
                                        <span className="text-white font-medium">{item.user}</span>
                                      </p>
                                      <p className="text-white/60">
                                        Suggested:{" "}
                                        <span className="text-white font-medium">
                                          {item.suggested}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* --- Divider Line --- */}
                            {apiData?.suggested_interests?.length > 0 && (
                              <div className="border-t border-[#2b2b2b]" />
                            )}

                            {/* --- Suggested Interests Section --- */}
                            {apiData?.suggested_interests?.length > 0 && (
                              <div>
                                <h3 className="text-white font-semibold flex items-center gap-2 mb-3 text-base sm:text-lg">
                                  <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                                  Suggested Interests
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {apiData.suggested_interests.map((interest: string, i: number) => (
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

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isPdfGenerating || !apiData}
                    className={`flex items-center justify-center rounded-lg p-2 sm:p-3 transition-all duration-300
                           ${isPdfGenerating || !apiData
                        ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                        : "bg-[#db4900]/20 text-[#db4900] hover:bg-[#db4900]/30 hover:scale-110"
                      }`}
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                </div>
              </div>
            </div>

            {/* Mobile: Readability & Uniqueness in one row */}
            <div className="lg:hidden grid grid-cols-2 gap-2 mt-6">
              {/* Readability - Mobile */}
              <div className="bg-black px-3 py-3 rounded-xl hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm">Readability</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="w-50 bg-[#2b2b2b]">
                      <p>Measures how easy it is for your target audience to read and understand your ad content.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-white/50 text-xs mb-3">Clarity of your ad content.</p>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-2xl font-bold ${(apiData?.readability_clarity_meter || 0) >= 70
                      ? "text-green-400"
                      : (apiData?.readability_clarity_meter || 0) >= 50
                        ? "text-[#F99244]"
                        : "text-red-400"
                      }`}
                  >
                    {apiData?.readability_clarity_meter || 0}%
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FileText className="w-full h-full text-primary" />
                  </div>
                </div>
              </div>

              {/* Uniqueness - Mobile */}
              <div className="bg-black px-3 py-3 rounded-xl hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm">Uniqueness</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="w-50 bg-[#2b2b2b]">
                      <p>Analyzes how distinctive your ad is compared to competitors in your industry.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-white/50 text-xs mb-3">How different your ad is.</p>
                <div className="flex items-center justify-between">
                  <div
                    className={`text-2xl font-bold ${(apiData?.competitor_uniqueness_meter || 0) >= 70
                      ? "text-green-400"
                      : (apiData?.competitor_uniqueness_meter || 0) >= 50
                        ? "text-[#F99244]"
                        : "text-red-400"
                      }`}
                  >
                    {apiData?.competitor_uniqueness_meter || 0}%
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Sparkles className="w-full h-full text-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Hidden on mobile */}
            <div className="hidden bg-black lg:grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 p-6 rounded-2xl">
              {/* Ad Preview Section - Desktop */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300 max-w-sm mx-auto lg:max-w-none">
                  {apiData.ad_type === "Video" && apiData.video ? (
                    <video
                      src={apiData.video}
                      controls
                      className="w-full h-full object-contain"
                      poster={images.length > 0 ? images[0] : undefined}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    images.length > 0 && (
                      <>
                        <Image
                          src={images[currentImageIndex]}
                          alt={apiData.title || "Ad Image"}
                          fill
                          className="object-contain"
                        />

                        {/* Navigation - Touch Optimized */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all touch-manipulation cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all touch-manipulation cursor-pointer"
                            >
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {/* Indicators - Mobile Optimized */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={cn(
                                    "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all touch-manipulation",
                                    index === currentImageIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/75"
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )
                  )}
                </div>

                {/* Counter / Label */}
                {apiData.ad_type === "Video" && apiData.video ? (
                  <div className="text-center mt-2 text-sm text-gray-400">Video Ad</div>
                ) : (
                  images.length > 1 && (
                    <div className="text-center mt-2 text-sm text-gray-400">
                      {currentImageIndex + 1} of {images.length}
                    </div>
                  )
                )}

                {/* View Target Button - Below Ad Preview */}
                <div className="mt-4 flex justify-start">
                  <Dialog open={viewTargetOpen} onOpenChange={setViewTargetOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        aria-label="View target details"
                        className={`
                                    flex items-center gap-2 font-medium transition-all duration-200
                                  ${apiData?.target_match_score >= 80
                            ? "bg-green-700/20 text-green-400 border border-green-700/40 hover:bg-green-700/30"
                            : apiData?.target_match_score >= 60
                              ? "bg-yellow-700/20 text-yellow-400 border border-yellow-700/40 hover:bg-yellow-700/30"
                              : "bg-red-700/20 text-red-400 border border-red-700/40 hover:bg-red-700/30"}
                            `}
                      >
                        <Target className="w-3 h-3" />
                        View Target
                        {apiData?.target_match_score && (
                          <span className="text-xs font-semibold">
                            ({apiData.target_match_score}%)
                          </span>
                        )}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="bg-black border border-[#2b2b2b] rounded-2xl w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#db4900]" />
                          Target Details
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* --- Target Insights Unified Section --- */}
                        {apiData?.target_match_score && (
                          <div className="bg-[#171717] rounded-2xl p-4 sm:p-5 shadow-md space-y-6">

                            {/* --- Header with Score --- */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              {/* Left section - title and subtitle */}
                              <div className="flex flex-col gap-1">
                                <h3 className="text-white font-semibold text-base sm:text-lg flex items-center gap-2">
                                  <BarChart3 className="w-5 h-5 text-primary shrink-0" />
                                  Targeting Comparison
                                </h3>
                                <p className="text-xs text-white/60">
                                  How well your targeting aligns with the suggested setup
                                </p>
                              </div>

                              {/* Right section - badge */}
                              <div
                                className={`px-3 py-1 text-sm sm:text-base font-semibold rounded-full border self-start sm:self-auto ${apiData.target_match_score >= 80
                                  ? "bg-green-700/20 text-green-400 border-green-700/40"
                                  : apiData.target_match_score >= 60
                                    ? "bg-yellow-700/20 text-yellow-400 border-yellow-700/40"
                                    : "bg-red-700/20 text-red-400 border-red-700/40"
                                  }`}
                              >
                                {apiData.target_match_score}% Match
                              </div>
                            </div>

                            {/* --- Targeting Comparison Cards --- */}
                            {apiData?.targeting_compare_json?.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {apiData.targeting_compare_json.map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className={`rounded-lg p-3 border relative overflow-hidden transition-all ${item.match === "match"
                                      ? "border-green-700/40 bg-green-900/10"
                                      : item.match === "partial"
                                        ? "border-yellow-700/40 bg-yellow-900/10"
                                        : "border-red-700/40 bg-red-900/10"
                                      }`}
                                  >
                                    {/* Top Indicator */}
                                    <div
                                      className={`absolute top-0 left-0 h-1 w-full ${item.match === "match"
                                        ? "bg-green-500/70"
                                        : item.match === "partial"
                                          ? "bg-yellow-500/70"
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
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                          }`}
                                      >
                                        {item.match}
                                      </span>
                                    </div>

                                    {/* Comparison Details */}
                                    <div className="text-xs space-y-1">
                                      <p className="text-white/60">
                                        You:{" "}
                                        <span className="text-white font-medium">{item.user}</span>
                                      </p>
                                      <p className="text-white/60">
                                        Suggested:{" "}
                                        <span className="text-white font-medium">
                                          {item.suggested}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* --- Divider Line --- */}
                            {apiData?.suggested_interests?.length > 0 && (
                              <div className="border-t border-[#2b2b2b]" />
                            )}

                            {/* --- Suggested Interests Section --- */}
                            {apiData?.suggested_interests?.length > 0 && (
                              <div>
                                <h3 className="text-white font-semibold flex items-center gap-2 mb-3 text-base sm:text-lg">
                                  <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                                  Suggested Interests
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {apiData.suggested_interests.map((interest: string, i: number) => (
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
                </div>

              </div>

              {/* Basic Info + Scores - Desktop */}
              <div className="lg:col-span-2 space-y-2 sm:space-y-4 order-2 lg:order-2">
                {/* Title + Meta - Desktop */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-0 break-words">
                      {apiData.title
                        ? apiData.title.length > 20
                          ? apiData.title.slice(0, 20) + "..."
                          : apiData.title
                        : "Untitled Ad"}
                    </h2>
                    <div className="text-gray-300 flex items-center text-xs sm:text-sm gap-2 flex-shrink-0 skip-block">
                      {!isFromToken && (
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label="Delete ad"
                          className="ml-2 border-red-600 bg-red-600/20 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors skip-block"
                          disabled={deleteLoading}
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          {deleteLoading ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 " />

                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>


                  {/* Badges - Desktop */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2  transition-all duration-300">
                      <span className="text-sm">Industry:</span>
                      <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 text-xs">
                        {apiData.industry || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2  transition-all duration-300 max-w-full">
                      <span className="text-sm flex-shrink-0">Best Suit for:</span>
                      <div className="flex flex-wrap gap-1 sm:gap-2 max-w-full overflow-hidden">
                        {platformSuitability.map((platform) => (
                          <Badge
                            key={platform.platform}
                            className={cn(
                              "flex items-center gap-1 transition-all duration-300 text-xs whitespace-nowrap",
                              platform.suitable
                                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                : "bg-red-600/20 text-red-400 border border-red-600/30"
                            )}
                          >
                            {platform.suitable && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                            {platform.platform}
                          </Badge>
                        ))}

                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Section - Desktop Layout (Go + Scores) */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  {/* Left: Go / No Go large card */}
                  <div
                    className="relative bg-[#171717] border border-[#2a2a2a] rounded-2xl p-6 h-full flex flex-col overflow-hidden hover:scale-[1.01] transition-all duration-300"
                    style={{ transition: "all 0.3s" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                    }}
                  >
                    <div className="flex items-start justify-between w-full mb-4">
                      {(() => {
                        const status = apiData?.go_no_go;
                        const isGo = status === "Go";
                        const colorClass = isGo ? "text-green-400" : "text-red-400";

                        return (
                          <>
                            <h3
                              className={`font-bold ${isGo
                                ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                                : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                                } ${colorClass}`}
                            >
                              {status || ""}
                            </h3>
                            {isGo ? (
                              <Check className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-white/50" />
                            ) : (
                              <X className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-white/50" />
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Go / No Go main reasons - summary */}
                    <div className="mt-2 flex flex-col gap-1">
                      {/* Why: Overall Score */}
                      <div>
                        <span className="block font-semibold text-xs text-white mb-0.5">Overall Evaluation Summary</span>
                        <ul className="list-disc  text-white/80 text-sm">
                          {whyOverall.length > 0 && (
                            <li className="mb-1 last:mb-0 flex items-center">
                              <span>{whyOverall[0]}</span>
                            </li>
                          )}
                          {whyOverall.length === 0 && <li>No details available.</li>}
                        </ul>
                      </div>

                      {(whyOverall.join(" ").length > 140 || whyConfidence.join(" ").length > 140 || whyMatch.join(" ").length > 140) && (
                        <div className="flex justify-end mt-1">
                          <Button size="sm" variant="link" className="px-3 text-xs text-primary py-1 h-7" onClick={() => setShowMoreGoReasons(true)}>View more</Button>
                        </div>
                      )}
                    </div>
                    {/* Modal dialog for full reasons */}
                    <Dialog open={showMoreGoReasons} onOpenChange={setShowMoreGoReasons}>
                      <DialogContent className="bg-black min-w-2xl border border-gray-800">
                        <DialogHeader className="border-b border-white/50 pb-2">
                          <DialogTitle className="text-white text-2xl">
                            Go / No-Go Decision — Detailed Analysis
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 max-h-[60vh] overflow-auto">
                          {/* Overall Evaluation */}
                          <div>
                            <span className="block font-semibold text-lg text-primary mb-1">
                              Overall Evaluation Summary
                            </span>
                            <ul className="list-disc ml-4 text-sm text-white/80 space-y-1">
                              {whyOverall.length > 0 ? whyOverall.map((text: any, idx: number) => (
                                <li key={`dlg-whyoverall-${idx}`}>{String(text)}</li>
                              )) : <li>No details available.</li>}
                            </ul>
                          </div>

                          {/* Confidence Insights */}
                          <div>
                            <span className="block font-semibold text-lg text-primary mb-1">
                              Confidence Score Insights
                            </span>
                            <ul className="list-disc ml-4 text-sm text-white/80 space-y-1">
                              {whyConfidence.length > 0 ? whyConfidence.map((text: any, idx: number) => (
                                <li key={`dlg-whyconfidence-${idx}`}>{String(text)}</li>
                              )) : <li>No details available.</li>}
                            </ul>
                          </div>

                          {/* Match Score Analysis */}
                          <div>
                            <span className="block font-semibold text-lg text-primary mb-1">
                              Match Score Analysis
                            </span>
                            <ul className="list-disc ml-4 text-sm text-white/80 space-y-1">
                              {whyMatch.length > 0 ? whyMatch.map((text: any, idx: number) => (
                                <li key={`dlg-whymatch-${idx}`}>{String(text)}</li>
                              )) : <li>No details available.</li>}
                            </ul>
                          </div>
                        </div>

                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Right: Scores stack - top large performance, bottom two small cards */}
                  <div className="grid grid-rows-[auto_1fr] gap-4">
                    {/* Performance - large */}
                    <div
                      className="p-4 rounded-2xl bg-[#171717] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                      }}
                    >
                      <div>
                        <ChartNoAxesCombined
                          className={`w-14 h-14 ${apiData.score_out_of_100 < 50
                            ? "text-red-400"
                            : apiData.score_out_of_100 < 75
                              ? "text-[#F99244]"
                              : "text-[#22C55E]"
                            }`}
                        />
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-gray-300 mb-1">Performance Score</h3>
                          <div
                            className={`text-5xl font-bold ${apiData.score_out_of_100 < 50
                              ? "text-red-400"
                              : apiData.score_out_of_100 < 75
                                ? "text-[#F99244]"
                                : "text-[#22C55E]"
                              }`}
                          >
                            {(apiData.score_out_of_100 || 0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: two small cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Confidence */}
                      <div
                        className="p-4 rounded-2xl bg-[#171717] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                        }}
                      >
                        <div className="flex justify-center">
                          <div className="flex flex-col items-center text-center">
                            <ShieldCheck
                              className={`w-10 h-10 mb-2 ${apiData.confidence_score < 50
                                ? "text-red-400"
                                : apiData.confidence_score < 75
                                  ? "text-[#F99244]"
                                  : "text-[#22C55E]"
                                }`}
                            />
                            <h3 className="text-sm font-medium text-gray-300 mb-1">
                              Confidence Score
                            </h3>
                            <div
                              className={`text-3xl font-bold ${apiData.confidence_score < 50
                                ? "text-red-400"
                                : apiData.confidence_score < 75
                                  ? "text-[#F99244]"
                                  : "text-[#22C55E]"
                                }`}
                            >
                              {(apiData.confidence_score || 0)}%
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Match */}
                      <div
                        className="p-4 rounded-2xl bg-[#171717] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                        }}
                      >
                        <div className="flex justify-center">
                          <div className="flex flex-col items-center text-center">
                            <Target
                              className={`w-10 h-10 mb-2 ${apiData.match_score < 50
                                ? "text-red-400"
                                : apiData.match_score < 75
                                  ? "text-[#F99244]"
                                  : "text-[#22C55E]"
                                }`}
                            />
                            <h3 className="text-sm font-medium text-gray-300 mb-1">Match Score</h3>
                            <div
                              className={`text-3xl font-bold ${apiData.match_score < 50
                                ? "text-red-400"
                                : apiData.match_score < 75
                                  ? "text-[#F99244]"
                                  : "text-[#22C55E]"
                                }`}
                            >
                              {(apiData.match_score || 0)}%
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Unified Actions Row - inside the card, bottom full width */}
                <div className="hidden lg:flex lg:col-span-3 mt-4 justify-end gap-2 skip-block">
                  {/* CTAs */}
                  {isProUser && (
                    <>
                      <Button
                        variant="link"
                        onClick={() => { handleShare(); trackEvent("Ad_Analysis_Report_Shared", window.location.href, userDetails?.email?.toString()) }}
                        className="rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Results
                      </Button>
                      <Button
                        variant="link"
                        onClick={handleDownloadPDF}
                        disabled={isPdfGenerating || !apiData}
                        className="rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isPdfGenerating ? "Generating..." : "Download Report"}
                      </Button>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Row 3 */}
            <div className="col-span-4 grid grid-cols-1 lg:grid-cols-6 gap-6 auto-rows-fr">
              {/* Issues Detected - takes 2 columns */}
              <div className=" lg:col-span-2 h-full">
                <div
                  className="relative bg-black rounded-2xl p-4 sm:p-6 h-full flex flex-col overflow-hidden hover:scale-[1.01] transition-all duration-300"
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
                  <div className="text-left w-full space-y-4 pt-2">
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
                    <div className="relative bg-[#141414] rounded-xl border border-[#2a2a2a] p-4 mt-3 flex items-center justify-between hover:border-[#DB4900] transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="w-5 h-5 text-red-400 mt-[2px]" />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Estimated CTR Loss
                          </p>
                          <p className="text-xs text-white/70 mt-1">
                            If issues remain unfixed
                          </p>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-red-400">
                        {estimatedCtrLoss || "25.66%"}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Readability, Best Days & Time, Uniqueness, Ad Fatigue arranged by rows */}
              <div className="lg:col-span-4 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Row 1 - Col 1: Readability (hidden on small to preserve previous behavior) */}
                  <div className="hidden lg:block">
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
                          className={`text-3xl sm:text-5xl md:text-6xl font-bold ${(apiData?.readability_clarity_meter || 0) >= 70
                            ? "text-green-400"
                            : (apiData?.readability_clarity_meter || 0) >= 50
                              ? "text-[#F99244]"
                              : "text-red-400"
                            }`}
                        >
                          {apiData?.readability_clarity_meter || 0}%
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
                        let text = apiData?.best_day_time_to_post || "";

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
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
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
                  <div className="hidden lg:block">
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
                          className={`text-3xl sm:text-4xl md:text-5xl mb-1 font-bold ${(apiData?.competitor_uniqueness_meter || 0) >= 70
                            ? "text-green-400"
                            : (apiData?.competitor_uniqueness_meter || 0) >= 50
                              ? "text-[#F99244]"
                              : "text-red-400"
                            }`}
                        >
                          {apiData?.competitor_uniqueness_meter || 0}%
                        </div>
                      </div>
                      <div className="bg-[#171717] rounded-lg p-3 border border-[#2a2a2a] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <p className="text-xs text-white/80">
                          {apiData.competitor_uniqueness_text || "No Competitor Uniqueness"}
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
                            {apiData?.ad_fatigue_score || "N/A"}
                          </div>
                          <div className="w-16 h-16 flex items-center justify-center">
                            <Sparkles className="w-full h-full text-primary" />
                          </div>
                        </div>
                        <div
                          className="border border-primary text-primary text-xs rounded-xl px-3 py-1.5 "
                        >
                          {apiData.prevention_tip_to_avoid_ad_fatigue || "No tips"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Insights - Mobile Optimized */}
            <ProOverlay message=" Upgrade to Pro to see detailed engagement insights.">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
                {/* Traffic Prediction */}
                <div
                  className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                  style={{ transition: "all 0.3s" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                  }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-semibold text-primary">Traffic Prediction</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="w-50 bg-[#2b2b2b]">
                        <p>
                          Predicted user engagement metrics including scroll-stopping ability, click-through
                          rates, and conversion likelihood.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Traffic Efficiency Score */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Traffic Efficiency Score</span>
                      {(() => {
                        const value = Number(apiData.traffic_efficiency_index) || 0;
                        let label = "N/A";
                        let colorClass = "text-gray-400";

                        if (value >= 70) {
                          label = "High";
                          colorClass = "text-green-400";
                        } else if (value >= 40) {
                          label = "Moderate";
                          colorClass = "text-[#F99244]";
                        } else if (value > 0) {
                          label = "Low";
                          colorClass = "text-red-400";
                        }

                        return (
                          <span className={`font-bold text-sm sm:text-base ${colorClass}`}>
                            {label} ({value})
                          </span>
                        );
                      })()}
                    </div>


                    {/* Scroll Stop Power */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Scroll Stop Power</span>
                      <span
                        className={`font-bold text-sm sm:text-base ${apiData.scroll_stoppower === "High"
                          ? "text-green-400"
                          : apiData.scroll_stoppower === "Moderate"
                            ? "text-[#F99244]"
                            : apiData.scroll_stoppower === "Low"
                              ? "text-red-400"
                              : "text-white/70"
                          }`}
                      >
                        {apiData.scroll_stoppower || "N/A"}
                      </span>
                    </div>

                    {/* Estimated CTR */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Estimated CTR</span>
                      <span
                        className={`font-bold text-sm sm:text-base ${parseFloat(apiData.estimated_ctr) >= 5
                          ? "text-green-400"
                          : parseFloat(apiData.estimated_ctr) >= 2
                            ? "text-[#F99244]"
                            : "text-red-400"
                          }`}
                      >
                        {apiData.estimated_ctr || "N/A"}
                      </span>
                    </div>

                    {/* Conversion Probability */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Conversion Probability</span>
                      <span
                        className={`font-bold text-sm sm:text-base ${parseFloat(apiData.conversion_probability) >= 50
                          ? "text-green-400"
                          : parseFloat(apiData.conversion_probability) >= 20
                            ? "text-[#F99244]"
                            : "text-red-400"
                          }`}
                      >
                        {apiData.conversion_probability || "N/A"}
                      </span>
                    </div>

                    {/* Predicted Reach */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Predicted Reach</span>
                      <span
                        className={`font-bold text-sm sm:text-base ${apiData.predicted_reach >= 10000
                          ? "text-green-400"
                          : apiData.predicted_reach >= 5000
                            ? "text-[#F99244]"
                            : "text-red-400"
                          }`}
                      >
                        {apiData.predicted_reach?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Merged Budget & Audience Insights Card (takes 2 columns) */}
                <div
                  className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300 lg:col-span-2"
                  style={{ transition: "all 0.3s" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                  }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-semibold text-primary">Budget & Audience Strategy</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="w-60 bg-[#2b2b2b] space-y-2">
                        <p>
                          Comprehensive financial and targeting strategy — including expected CPM, ROI, and
                          audience testing recommendations.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4">
                    {/* Left Column: Metrics */}
                    <div className="space-y-2 sm:space-y-3">
                      {/* Expected CPM + ROI Range */}
                      <div className="bg-[#171717] p-4 rounded-xl space-y-3">
                        {/* Expected CPM */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm sm:text-base">Expected CPM</span>
                          <span
                            className={`font-bold text-sm sm:text-base ${Number(apiData.expected_cpm) <= 5
                              ? "text-green-400"
                              : Number(apiData.expected_cpm) <= 15
                                ? "text-[#F99244]"
                                : "text-red-400"
                              }`}
                          >
                            {apiData.expected_cpm || "N/A"}
                          </span>
                        </div>

                        {/* ROI Range */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm sm:text-base">ROI Range</span>
                          <span
                            className={`font-bold text-sm sm:text-base ${apiData.roi_max >= 5
                              ? "text-green-400"
                              : apiData.roi_max >= 3
                                ? "text-[#F99244]"
                                : "text-red-400"
                              }`}
                          >
                            {apiData.roi_min || 0}x - {apiData.roi_max || 0}x
                          </span>
                        </div>
                      </div>

                      {/* Budget + Duration (two separate boxes, side by side on larger screens) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Suggested Test Budget */}
                        <div className="bg-[#171717] py-4 px-2 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                          <span className="text-gray-300 text-sm sm:text-base">Test Budget</span>
                          <span className="font-bold text-xl sm:text-2xl text-primary">
                            ${apiData.suggested_test_budget_in_usd || "N/A"}
                          </span>
                        </div>

                        {/* Suggested Test Duration */}
                        <div className="bg-[#171717] py-4 px-2 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                          <span className="text-gray-300 text-sm sm:text-base">Test Duration</span>
                          <span className="font-bold text-xl sm:text-2xl text-primary">
                            {apiData.suggested_test_duration_days
                              ? `${apiData.suggested_test_duration_days} days`
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Strategy & Audience */}
                    <div className="flex flex-col justify-between space-y-4 sm:space-y-5">
                      {/* Top 3 Audience */}
                      <div>
                        <span className="block text-gray-300 text-xs sm:text-sm mb-2">Top Audience:</span>
                        <div className="flex flex-wrap gap-2">
                          {safeArray(apiData.top_5_audience).map((aud, idx) => (
                            <Badge
                              key={idx}
                              className="bg-green-600/20 text-green-400 border-green-600/30 text-xs whitespace-nowrap"
                            >
                              {aud}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Spend Recommendation */}

                      <div className="bg-[#171717] border border-[#2b2b2b] rounded-lg p-3 sm:p-4 max-w-[95%]">
                        <p className="text-primary text-xs sm:text-sm mb-1 font-medium">Strategy Tip:</p>
                        <p className="text-gray-100 text-xs sm:text-sm leading-relaxed">
                          {apiData.spend_recommendation_strategy_tip || "No recommendation available."}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </ProOverlay>

            {/* Issues and Digital Marketing Feedback - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Issues Section */}
              <div
                className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl hover:scale-[1.01] transition-all duration-300"
                style={{ transition: "all 0.3s", maxHeight: "300px" }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                }}
              >
                <div className="px-4 sm:px-6 py-2 sm:py-4 overflow-y-auto h-full">
                  {/* Critical Issues Block */}
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
                    {criticalIssues.map((issue, index) => (
                      <li key={index} className="flex items-start text-white">
                        <span className="mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">•</span>
                        <span className="text-xs sm:text-sm leading-relaxed">{issue}</span>
                      </li>
                    ))}
                  </ul>

                  {criticalIssues.length === 0 && (
                    <div className="text-white/70 text-center py-6 sm:py-8 text-sm sm:text-base">
                      No critical issues detected
                    </div>
                  )}

                  {/* Minor Issues Block */}
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
                    {minorIssues.map((issue, index) => (
                      <li key={index} className="flex items-start text-white">
                        <span className="mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">•</span>
                        <span className="text-xs sm:text-sm leading-relaxed">{issue}</span>
                      </li>
                    ))}
                  </ul>

                  {minorIssues.length === 0 && (
                    <div className="text-white/70 text-center py-6 sm:py-8 text-sm sm:text-base">
                      No minor issues detected
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Marketing Feedback */}
              <div
                className="bg-black border border-[#2b2b2b] rounded-xl sm:rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                style={{ transition: "all 0.3s", maxHeight: "300px" }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                }}
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
                    {feedbackDigitalMark.map((feedback, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-2 sm:mr-3 text-green-400 text-base sm:text-lg flex-shrink-0">•</span>
                        <span className="text-sm sm:text-base leading-relaxed">{feedback}</span>
                      </li>
                    ))}
                  </ul>

                  {feedbackDigitalMark.length === 0 && (
                    <div className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                      No marketing feedback available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ad Creative Suggestions - Mobile Optimized */}
            {apiData.next_ad_idea_based_on_this_post && (
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
                          {apiData.next_ad_idea_based_on_this_post.headline}
                        </p>
                      </div>

                      {/* Short Caption */}
                      <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl p-4 sm:p-6 border border-blue-600/20">
                        <h4 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3 flex items-center">
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                          Short Caption
                        </h4>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                          {apiData.next_ad_idea_based_on_this_post.short_caption}
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
                        {apiData.next_ad_idea_based_on_this_post.visual_idea}
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
                    {apiData.primary_emotion || "—"}
                  </span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: "Logo Visibility", value: apiData.logo_visibility_score || 0, max: 100 },
                    { label: "Text Percentage", value: apiData.text_percentage_score || 0, max: 100 },
                    { label: "Faces Detected", value: apiData.faces_detected || 0, max: 10 },
                    { label: "Layout Symmetry", value: apiData.layout_symmetry_score || 0, max: 100 },
                    { label: "Color Harmony", value: apiData.color_harmony || 0, max: 100 },
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
                            const score = apiData.engagement_score || 0;
                            const color =
                              score <= 50
                                ? "rgba(239,68,68,0.7)" // red
                                : score <= 75
                                  ? "rgba(249, 146, 68)" // orange
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
                              className={`w-5 h-5 sm:w-6 sm:h-6 ${apiData.engagement_score <= 50
                                ? "text-red-500"
                                : apiData.engagement_score <= 75
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
                                className={`font-bold text-lg sm:text-xl ${apiData.engagement_score <= 50
                                  ? "text-red-500"
                                  : apiData.engagement_score <= 75
                                    ? "text-[#F99244]"
                                    : "text-green-500"
                                  }`}
                              >
                                {Math.round(apiData.engagement_score || 0)}%
                              </span>
                            </div>
                          </div>
                        </div>


                        {/* Other Engagement Metrics */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          {[
                            { label: "Viral Potential", value: apiData.viral_potential_score || 0, icon: TrendingUp },
                            { label: "FOMO Score", value: apiData.fomo_score || 0, icon: Zap },
                            { label: "Trust Signal", value: apiData.trust_signal_score || 0, icon: Shield },
                            { label: "Urgency Trigger", value: apiData.urgency_trigger_score || 0, icon: AlertTriangle },
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
                                        ? "0 0 8px 2px rgba(249, 146, 68)"
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
                      className={`text-2xl sm:text-3xl font-bold leading-tight ${(apiData?.score_out_of_100 || 0) <= 50
                        ? "text-red-500"
                        : (apiData?.score_out_of_100 || 0) <= 75
                          ? "text-[#F99244]"
                          : "text-green-500"
                        }`}
                    >
                      {apiData?.score_out_of_100 || 0}
                    </div>
                    <div className="text-xs text-gray-400 tracking-wide">Overall Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad Copy Generator - Mobile Optimized */}
            <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Top: Title */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                      <PenTool className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      AI-Written Ad Copy Generator
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="w-50 bg-[#2b2b2b]">
                        <p>AI-generated ad copy variations optimized for different platforms and tones to maximize engagement and conversions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Bottom: Ad Copy Output & CTA Buttons - Mobile Stacked */}
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left: Ad Copy Output */}
                  <div className="lg:w-[70%] w-full space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-base sm:text-lg font-semibold text-primary">Generated Ad Copy</h4>

                      {/* Display filtered ad copies */}
                      <div className="space-y-3 sm:space-y-4">
                        {filteredAdCopies.map((adCopy, index) => (
                          <div
                            key={index}
                            className="bg-[#121212] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                            style={{ transition: "all 0.3s" }}
                            onMouseEnter={e => {
                              e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900"
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)"
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs sm:text-sm text-gray-300">
                                {adCopy.platform || "N/A"} | {adCopy.tone || "N/A"}
                              </span>

                              {/* Copy button */}
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

                            <p className="text-white font-medium text-sm sm:text-base leading-relaxed">
                              {adCopy.copy_text || "No copy text available"}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Show message if no ad copies */}
                      {filteredAdCopies.length === 0 && (
                        <div className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                          No ad copies available
                        </div>
                      )}

                      {/* Pro overlay for additional copies */}
                      {!isProUser && safeArray(apiData?.ad_copies).length > 1 && (
                        <ProOverlay message=" Pro users see all ad copy variations.">
                          <div className="space-y-3 sm:space-y-4">
                            {safeArray(apiData?.ad_copies).slice(1).map((adCopy, index) => (
                              <div
                                key={index + 1}
                                className="bg-[#121212] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                style={{ transition: "all 0.3s" }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900"
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)"
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-xs sm:text-sm text-gray-300">
                                    {adCopy.platform || "N/A"} | {adCopy.tone || "N/A"}
                                  </span>

                                  {/* Copy button for locked Pro items */}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(adCopy.copy_text || "");
                                      setCopiedAdCopyIndex(index + 1000); // Using offset to distinguish from main copies
                                      setTimeout(() => setCopiedAdCopyIndex(null), 2000);
                                    }}
                                    className="p-1 rounded-md hover:bg-[#171717] transition "
                                    title={copiedAdCopyIndex === index + 1000 ? "Copied!" : "Copy text"}
                                  >
                                    {copiedAdCopyIndex === index + 1000 ? (
                                      <CheckCircle className="w-4 h-4 text-green-500 cursor-pointer" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-orange-400 hover:text-primary cursor-pointer" />
                                    )}
                                  </button>
                                </div>

                                <p className="text-white font-medium text-sm sm:text-base leading-relaxed">
                                  {adCopy.copy_text || "No copy text available"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ProOverlay>
                      )}
                    </div>
                  </div>

                  {/* Right: Trending Tags Section - Mobile Optimized */}
                  <div className="lg:w-[30%] w-full bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#222] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                    style={{ transition: "all 0.3s" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 8px 2px #DB4900";
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
                            if (apiData?.["10_trending_tags_relatedto_ad"]) {
                              const tagsText = apiData["10_trending_tags_relatedto_ad"].join(" ");
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
                      <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                        {apiData?.["10_trending_tags_relatedto_ad"]?.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 hover:bg-primary/30 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1 cursor-pointer whitespace-nowrap"
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

            <div className="skip-block">
              {apiData?.go_no_go?.trim()?.toLowerCase() === 'go' && (
                <PreCampaignChecklist
                  adUploadId={apiData.ad_upload_id}
                  userId={String(userDetails?.user_id)}
                />
              )}
            </div>

            {/* CTA section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8 skip-block">
              {/* Analyzed On */}
              <div className="flex items-center text-white text-sm gap-1">
                <span>Analyzed On</span>
                <span className="truncate font-medium">
                  {apiData.uploaded_on ? formatDate(apiData.uploaded_on) : "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                {!isFromToken && (
                  <>
                    <Button
                      className="text-white border border-primary bg-[#171717] font-semibold rounded-lg py-3 transition duration-200 text-base"
                      disabled={isFromToken ? false : !isProUser}
                      onClick={() => {
                        if (isFromToken) {
                          window.open("/register", "_blank")
                          trackEvent("Register_Clicked_from_Results", window.location.href)
                        } else {
                          router.push("/ab-test")
                          trackEvent("Compare_Ad_Clicked_from_Results", window.location.href, userDetails?.email?.toString())
                        }
                      }}
                    >
                      <GitCompareArrows className="w-4 h-4 mr-2" />
                      {isFromToken ? "Register Now" : "Compare Now"}
                    </Button><Button
                      onClick={() => isProUser ? router.push("/upload") : router.push("/pro")}
                      className="rounded-lg px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-200"
                    >
                      {isProUser ? "Re-analyze" : "Upgrade"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isFromToken && (
              <div className="my-10" />
            )}

          </div>
        </main>


        {showIntro && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#171717] bg-black p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-2">Pre-run check</h3>

              <div className="text-sm text-gray-400 mb-1">Go / No Go</div>
              <p
                className={cn(
                  "text-5xl font-bold mb-4",
                  apiData?.go_no_go === 'Go' ? "text-green-400" : "text-red-400"
                )}
              >
                {apiData?.go_no_go === 'Go' ? 'Go' : 'No Go'}
              </p>

              <p className="text-sm text-gray-300">
                AI-powered overview of performance, confidence, match fit, key issues, and quick-win suggestions to decide if this ad is ready to run today.
              </p>

              <div className="mt-6 flex gap-3">
                <Button onClick={() => handleIntroChoice('go')} className="flex-1">
                  View report
                </Button>
              </div>
            </div>
          </div>
        )}

        {isProUser && !isFromToken && (
          <motion.button
            className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg sm:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { handleShare(); trackEvent("Ad_Analysis_Report_Shared", window.location.href, userDetails?.email?.toString()) }}
            aria-label="Share Results"
          >
            <Share2 className="h-6 w-6 text-white" />
          </motion.button>
        )}

        {!isFromToken && (isFreeTrailUser || Number(userDetails?.ads_limit) === 0) && (
          <div className="fixed bottom-24 right-6 z-50 ">
            <button
              onClick={() => router.push("/pro")}
              className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-[#db4900]/40 text-white  shadow-lg hover:bg-[#db4900]/30 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-[#db4900]/30"
            >
              <Gift className="w-4 h-4 font-bold" />
              <span className="text-sm font-semibold">Upgrade</span>
            </button>
          </div>
        )}

        {/* Fixed button for shared token views */}
        {isFromToken && (
          <motion.div
            className="fixed bottom-22 right-4 z-50 skip-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => { window.open("/register", "_blank"); trackEvent("Register_Clicked_from_Results", window.location.href) }}
              className="rounded-lg px-6 sm:px-8 py-6 sm:py-7 text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              size="lg"
            >
              Analyze your ad. Join now
            </Button>
          </motion.div>
        )}

        {/* PDF generation loading popup */}
        {isPdfGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm skip-block">
            <motion.div
              className="bg-[#1f1f21] text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 flex items-center gap-3 skip-block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Loader2 className="w-5 h-5 animate-spin skip-block" />
              <span className="text-sm skip-block">Generating report...</span>
            </motion.div>
          </div>
        )}

        {/* Back to top */}
        <AnimatePresence>
          {showScrollToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-20 sm:bottom-4 right-4 z-50 flex items-center justify-center bg-black hover:bg-[#1f1f21]/80 border border-primary text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#db4900] focus:ring-opacity-50 active:scale-95 min-w-[44px] min-h-[44px] skip-block"
              aria-label="Scroll to top"
            >
              <ChevronUp className="w-8 h-8" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Upgrade Popup */}
        {showUpgradePopup &&
          <UpgradePopup
            isOpen={showUpgradePopup}
            onClose={() => setShowUpgradePopup(false)}
            onUpgrade={() => router.push("/pro")}
            onMaybeLater={() => { setShowUpgradePopup(false); router.back() }}
          />
        }
      </div>

      {!isFromToken && (
        <div className="skip-block mt-10">
          <Footer />
        </div>
      )}

      {isFromToken && (
        <footer className=" h-[50px] w-full bg-black flex items-center justify-center text-xs text-white/70 print:hidden">
          <div className="flex flex-col items-center gap-1">
            {(apiData?.agency_website) && (
              <a href={apiData?.agency_website} target="_blank" className="text-white">
                {apiData?.agency_website ? apiData.agency_website : ''}
              </a>
            )}
          </div>
        </footer>
      )}
    </TooltipProvider>
  )
}
