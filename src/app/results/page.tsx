"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import toast from "react-hot-toast"
import {
  Download,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  PenTool,
  GitCompareArrows,
  Eye,
  Heart,
  Target,
  TrendingUp,
  Palette,
  Image as ImageIcon,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
  Users,
  Zap,
  Shield,
  BarChart3,
  Camera,
  Type,
  Layout,
  DollarSign,
  Upload,
  ArrowLeft,
  ShieldCheck,
  ChartNoAxesCombined,
  Settings,
  MousePointerClick,
  TrendingDown,
  Share,
  Copy,
  Share2,
  Trash2,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import ResultsPageLoadingSkeleton from "@/components/Skeleton-loading/results-loading"
import { cn } from "@/lib/utils"
import logo from "@/assets/ad-icon-logo.png"
import { ApiResponse } from "./type"
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";
import { motion } from "framer-motion"
import { trackEvent } from "@/lib/eventTracker"

export default function ResultsPage() {
  const { userDetails } = useFetchUserDetails()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTone, setSelectedTone] = useState("friendly")
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [showIntro, setShowIntro] = useState(false);
  const [tagsCopied, setTagsCopied] = useState(false);
  const [copiedAdCopyIndex, setCopiedAdCopyIndex] = useState<number | null>(null);

  // Delete functionality states
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // View Target dialog state
  const [viewTargetOpen, setViewTargetOpen] = useState(false)

  // Check if ad_id came from token (shared link)
  const isFromToken = !!searchParams.get('token')
  const isProUser = isFromToken || userDetails?.payment_status === 1

  const handleDownloadPDF = async () => {
    const selector = "body";
    const toHideSelectors = [".skip-block", "noscript"];

    const hidden = [] as any;
    toHideSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        hidden.push({ el, display: el?.style.display });
        el.style.display = "none";
      });
    });

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

      pdf.save(`ad-analysis-report-${apiData?.title || 'untitled'}-${new Date().toISOString().split('T')[0]}.pdf`);
      trackEvent("Ad_Analysis_Report_Downloaded", window.location.href, userDetails?.email?.toString())
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      hidden.forEach(({ el, display }) => (el.style.display = display));
    }
  };

  const getAdIdFromUrl = () => {
    const token = searchParams.get('token');
    const directAdId = searchParams.get('ad_id');

    if (token && token.length > 14) {
      const adIdFromToken = token.substring(8, token.length - 6);
      return adIdFromToken;
    }

    // Fallback to direct ad_id from URL
    return directAdId || '';
  };


  const handleShare = () => {
    const currentDate = new Date();

    // Format date components (DD MM YYYY)
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    // Format time components (HH MM SS)
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    // Get ad_id from either URL param or token (used only for token generation, not for sharing)
    const adId = getAdIdFromUrl();

    // Generate token: DDMMYYYY + ad_id + HHMMSS
    const token = `${day}${month}${year}${adId}${hours}${minutes}${seconds}`;

    // Get current domain
    const currentDomain = window.location.origin;

    // Create share URL
    const shareUrl = `${currentDomain}/results?token=${token}`;

    // Custom text for sharing (without ad_id)
    const shareText = `Check out the ad analysis results shared on ${day}-${month}-${year} at ${hours}:${minutes}:${seconds}: ${shareUrl}`;

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

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const adUploadId = getAdIdFromUrl();

        if (!adUploadId) {
          setError('No ad ID found in URL');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adUploadId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch ad details');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'API returned error');
        }

        setApiData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
  }, [searchParams]);

  // Helper function to safely get array or return empty array
  const safeArray = (arr: any): any[] => {
    return Array.isArray(arr) ? arr : []
  }

  // Helper function to parse platform suitability
  const getPlatformSuitability = () => {
    if (!apiData) return []

    const suitablePlatforms = safeArray(apiData.platform_suits).map(p =>
      typeof p === 'string' ? p.toLowerCase() : String(p).toLowerCase()
    )
    const notSuitablePlatforms = safeArray(apiData.platform_notsuits).map(p =>
      typeof p === 'string' ? p.toLowerCase() : String(p).toLowerCase()
    )

    const allPlatforms = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'Flyer']

    const suitabilityList = allPlatforms.flatMap(platform => {
      const platformLower = platform.toLowerCase()
      if (suitablePlatforms.includes(platformLower)) {
        return { platform, suitable: true, warning: false }
      } else if (notSuitablePlatforms.includes(platformLower)) {
        return { platform, suitable: false, warning: true }
      } else {
        return []
      }
    })

    return suitabilityList.sort((a, b) => {
      if (a.suitable && !b.suitable) return -1
      if (!a.suitable && b.suitable) return 1
      return 0
    })
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helper function to get filtered ad copies based on selected tone
  const getFilteredAdCopies = () => {
    const adCopies = safeArray(apiData?.ad_copies)

    if (!isProUser) {
      return adCopies.slice(0, 1)
    }

    if (selectedTone === "friendly") {
      return adCopies
    }

    return adCopies.filter(copy =>
      copy.tone?.toLowerCase().includes(selectedTone.toLowerCase())
    )
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
          <p className="text-gray-300 mb-6 text-sm sm:text-base">{error}</p>
          <Button onClick={() => router.push('/upload')} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            Go Back to Upload
          </Button>
        </div>
      </div>
    )
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
          <Button onClick={() => router.push('/upload')} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            Go Back to Upload
          </Button>
        </div>
      </div>
    )
  }

  const platformSuitability = getPlatformSuitability()
  const filteredAdCopies = getFilteredAdCopies()
  const images = safeArray(apiData?.images)
  const issues = safeArray(apiData?.issues)
  const suggestions = safeArray(apiData?.suggestions)
  const feedbackDesigner = safeArray(apiData?.feedback_designer)
  const feedbackDigitalMark = safeArray(apiData?.feedback_digitalmark)
  const mismatchWarnings = safeArray(apiData?.mismatch_warnings).filter(warning => warning && warning.trim() !== '')

  return (
    <TooltipProvider>
      <div className="min-h-screen text-white max-w-7xl mx-auto">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
            {/* Left: Back + Title + Subtitle */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {/* Back Button - Hidden when viewing via shared token */}
              {!isFromToken && (
                <button
                  onClick={() => router.back()}
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
              <Image src={logo} alt="Logo" className="h-10 sm:h-14 w-auto" />
            </div>
          </div>

          <div className="w-full mx-auto space-y-6 sm:space-y-8">
            {/* Ad Overview Card - Mobile First */}

            {/* Mobile Layout: Title + Meta first, then Image + Go/No Go, then Badges + Scores */}
            <div className="lg:hidden bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border-none space-y-4 sm:space-y-6 p-4">
              {/* Title + Meta - Always first on mobile */}
              <div className="lg:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0 break-words">
                    {apiData.title
                      ? apiData.title.length > 20
                        ? apiData.title.slice(0, 20) + "..."
                        : apiData.title
                      : "Untitled Ad"}
                  </h2>
                  <div className="text-gray-300 flex items-end text-xs sm:text-sm gap-2 flex-shrink-0">
                    <Upload className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{apiData.uploaded_on ? formatDate(apiData.uploaded_on) : "Unknown"}</span>
                  </div>
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
                    className={`text-3xl font-bold ${safeArray(apiData?.go_no_go)[0] === "Go"
                      ? "text-green-400"
                      : "text-red-400"
                      }`}
                  >
                    {safeArray(apiData?.go_no_go)[0] || ""}
                  </p>
                  <p className="text-white/50 text-xs text-center mt-1">Ready to run?</p>
                </div>
              </div>

              {/* Mobile: Badges and Scores below */}
              <div className="lg:hidden space-y-4">
                {/* Badges - Mobile Stacked */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 bg-[#121212] border border-[#2b2b2b] rounded-xl px-3 py-2 transition-all duration-300">
                    <span className="text-sm">Industry:</span>
                    <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 text-xs">
                      {apiData.industry || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-[#2b2b2b] rounded-xl px-3 py-2 transition-all duration-300">
                    <span className="text-sm flex-shrink-0">Best Suit for:</span>
                    <div className="flex flex-wrap gap-1">
                      {platformSuitability.map((platform) => (
                        <Badge
                          key={platform.platform}
                          className={cn(
                            "flex items-center gap-1 transition-all duration-300 text-xs",
                            platform.suitable
                              ? "bg-green-600/20 text-green-400 border border-green-600/30"
                              : platform.warning
                                ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                : "bg-red-600/20 text-red-400 border border-red-600/30"
                          )}
                        >
                          {platform.suitable ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : platform.warning ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {platform.platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Section - Mobile Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Performance Score */}
                  <div
                    className="p-3 rounded-xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <ChartNoAxesCombined
                        className={`h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-2 ${apiData.score_out_of_100 < 50
                          ? "text-red-400"
                          : apiData.score_out_of_100 < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">Performance Score</h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${apiData.score_out_of_100 < 50
                          ? "text-red-400"
                          : apiData.score_out_of_100 < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      >
                        {apiData.score_out_of_100}/100
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
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
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">Confidence Score</h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${apiData.confidence_score < 50
                          ? "text-red-400"
                          : apiData.confidence_score < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      >
                        {apiData.confidence_score || 0}/100
                      </div>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
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
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">Match Score</h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${apiData.match_score < 50
                          ? "text-red-400"
                          : apiData.match_score < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      >
                        {apiData.match_score || 0}/100
                      </div>
                    </div>
                  </div>

                  {/* Issues Detected */}
                  <div
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <AlertTriangle
                        className={`h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-2 ${issues.length === 0 ? "text-[#22C55E]" : "text-red-400"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">
                        Issues Detected
                      </h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${issues.length === 0 ? "text-[#22C55E]" : "text-red-400"
                          }`}
                      >
                        {String(issues.length).padStart(2, "0")}
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
                      >
                        <Target className="w-3 h-3 mr-2" />
                        View Target
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black  max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#db4900]" />
                          Target Details
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/80 text-xs mb-1">Title</p>
                            <p className="text-white text-sm font-medium">{apiData?.title || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white/80 text-xs mb-1">Ad Type</p>
                            <p className="text-white text-sm font-medium">{apiData?.ad_type || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="border-t border-[#3d3d3d] pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/80 text-xs mb-1">Industry</p>
                              <p className="text-white text-sm font-medium">{apiData?.industry || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-white/80 text-xs mb-1">Platform</p>
                              <p className="text-white text-sm font-medium">{apiData?.platform || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-[#3d3d3d] pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/80 text-xs mb-1">Gender</p>
                              <p className="text-white text-sm font-medium">{apiData?.gender || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-white/80 text-xs mb-1">Age Range</p>
                              <p className="text-white text-sm font-medium">{apiData?.age || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-[#3d3d3d] pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/80 text-xs mb-1">Country</p>
                              <p className="text-white text-sm font-medium">{apiData?.country || 'N/A'}</p>
                            </div>
                            {apiData?.state && apiData.state.trim() !== '' && (
                              <div>
                                <p className="text-white/80 text-xs mb-1">State</p>
                                <p className="text-white text-sm font-medium">{apiData.state}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {apiData?.video && apiData.video.trim() !== '' && (
                          <div className="border-t border-[#3d3d3d] pt-4">
                            <p className="text-gray-400 text-xs mb-1">Video</p>
                            <p className="text-white text-sm font-medium break-all">{apiData.video}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

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
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete Ad
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

                {/* Mismatch Warnings - Mobile Optimized */}
                {mismatchWarnings.length > 0 && (
                  <div className="mt-4 sm:mt-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-300">Mismatch Warnings</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="w-50 bg-[#2b2b2b]">
                          <p>
                            Potential inconsistencies between your ad elements that might affect performance or brand alignment.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {mismatchWarnings.map((warning, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                        >
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-200 text-xs sm:text-sm leading-relaxed">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                        ? "text-yellow-400"
                        : "text-red-400"
                      }`}
                  >
                    {apiData?.readability_clarity_meter || 0}/100
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
                        ? "text-yellow-400"
                        : "text-red-400"
                      }`}
                  >
                    {apiData?.competitor_uniqueness_meter || 0}/100
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
              </div>

              {/* Basic Info + Scores - Desktop */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-2">
                {/* Title + Meta - Desktop */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-0 break-words">
                      {apiData.title
                        ? apiData.title.length > 20
                          ? apiData.title.slice(0, 20) + "..."
                          : apiData.title
                        : "Untitled Ad"}
                    </h2>
                    <div className="text-gray-300 flex items-end text-xs sm:text-sm gap-2 flex-shrink-0">
                      <Upload className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{apiData.uploaded_on ? formatDate(apiData.uploaded_on) : "Unknown"}</span>
                    </div>
                  </div>

                  {/* Badges - Desktop */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 bg-[#121212] border border-[#2b2b2b] rounded-xl px-3 py-2 transition-all duration-300">
                      <span className="text-sm">Industry:</span>
                      <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 text-xs sm:text-sm">
                        {apiData.industry || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 bg-[#121212] border border-[#2b2b2b] rounded-xl px-3 py-2 transition-all duration-300">
                      <span className="text-sm flex-shrink-0">Best Suit for:</span>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {platformSuitability.map((platform) => (
                          <Badge
                            key={platform.platform}
                            className={cn(
                              "flex items-center gap-1 transition-all duration-300 text-xs",
                              platform.suitable
                                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                : platform.warning
                                  ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                  : "bg-red-600/20 text-red-400 border border-red-600/30"
                            )}
                          >
                            {platform.suitable ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : platform.warning ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {platform.platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Section - Desktop Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Performance Score */}
                  <div
                    className="p-3 sm:p-3 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <ChartNoAxesCombined
                        className={`h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-2 ${apiData.score_out_of_100 < 50
                          ? "text-red-400"
                          : apiData.score_out_of_100 < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">Performance Score</h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${apiData.score_out_of_100 < 50
                          ? "text-red-400"
                          : apiData.score_out_of_100 < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      >
                        {apiData.score_out_of_100}/100
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
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
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">Confidence Score</h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${apiData.confidence_score < 50
                          ? "text-red-400"
                          : apiData.confidence_score < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      >
                        {apiData.confidence_score || 0}/100
                      </div>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
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
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">Match Score</h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${apiData.match_score < 50
                          ? "text-red-400"
                          : apiData.match_score < 75
                            ? "text-yellow-400"
                            : "text-[#22C55E]"
                          }`}
                      >
                        {apiData.match_score || 0}/100
                      </div>
                    </div>
                  </div>

                  {/* Issues Detected */}
                  <div
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg hover:scale-[1.01] transition-all duration-300"
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <AlertTriangle
                        className={`h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 mb-2 ${issues.length === 0 ? "text-[#22C55E]" : "text-red-400"
                          }`}
                      />
                      <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-300 mb-1">
                        Issues Detected
                      </h3>
                      <div
                        className={`text-lg sm:text-xl lg:text-3xl font-bold ${issues.length === 0 ? "text-[#22C55E]" : "text-red-400"
                          }`}
                      >
                        {String(issues.length).padStart(2, "0")}
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
                      >
                        <Target className="w-3 h-3 mr-2" />
                        View Target
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black  max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#db4900]" />
                          Target Details
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/80 text-xs mb-1">Title</p>
                            <p className="text-white text-sm font-medium">{apiData?.title || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white/80 text-xs mb-1">Ad Type</p>
                            <p className="text-white text-sm font-medium">{apiData?.ad_type || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="border-t border-[#3d3d3d] pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/80 text-xs mb-1">Industry</p>
                              <p className="text-white text-sm font-medium">{apiData?.industry || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-white/80 text-xs mb-1">Platform</p>
                              <p className="text-white text-sm font-medium">{apiData?.platform || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-[#3d3d3d] pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/80 text-xs mb-1">Gender</p>
                              <p className="text-white text-sm font-medium">{apiData?.gender || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-white/80 text-xs mb-1">Age Range</p>
                              <p className="text-white text-sm font-medium">{apiData?.age || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-[#3d3d3d] pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/80 text-xs mb-1">Country</p>
                              <p className="text-white text-sm font-medium">{apiData?.country || 'N/A'}</p>
                            </div>
                            {apiData?.state && apiData.state.trim() !== '' && (
                              <div>
                                <p className="text-white/80 text-xs mb-1">State</p>
                                <p className="text-white text-sm font-medium">{apiData.state}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {apiData?.video && apiData.video.trim() !== '' && (
                          <div className="border-t border-[#3d3d3d] pt-4">
                            <p className="text-gray-400 text-xs mb-1">Video</p>
                            <p className="text-white text-sm font-medium break-all">{apiData.video}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

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
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete Ad
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

                {/* Mismatch Warnings - Desktop Optimized */}
                {mismatchWarnings.length > 0 && (
                  <div className="mt-4 sm:mt-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-300">Mismatch Warnings</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="w-50 bg-[#2b2b2b]">
                          <p>
                            Potential inconsistencies between your ad elements that might affect performance or brand alignment.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {mismatchWarnings.map((warning, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                        >
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-200 text-xs sm:text-sm leading-relaxed">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div className="col-span-4 grid grid-cols-1 lg:grid-cols-6 gap-6 auto-rows-fr">
              {/* Go/No-Go Only - takes 2 columns */}
              <div className="hidden lg:block lg:col-span-2 h-full">
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
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold text-xl">Go / No Go</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="w-50 bg-[#2b2b2b]">
                            <p>AI-powered assessment that evaluates your ad's overall readiness for launch. A "Go" indicates your ad meets quality standards and is likely to perform well, while "No Go" suggests areas need improvement before running.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-white/50 text-sm">Indicates if your ad is ready to run or needs improvement</p>
                    </div>

                  </div>

                  {/* Decision Text - center */}
                  <div className="flex-1 flex justify-center items-center">
                    <p
                      className={`text-7xl sm:text-6xl md:text-8xl font-bold z-10 ${safeArray(apiData?.go_no_go)[0] === "Go"
                        ? "text-green-400"
                        : "text-red-400"
                        }`}
                    >
                      {safeArray(apiData?.go_no_go)[0] || ""}
                    </p>
                  </div>

                  {/* Icon from bottom - full width */}
                  {safeArray(apiData?.go_no_go)[0] === "Go" ? (
                    <TrendingUp className="left-1 w-full h-40 text-green-500" />
                  ) : (
                    <TrendingDown className="left-1 w-full h-40 text-red-500" />
                  )}
                </div>
              </div>

              {/* Readability & Uniqueness - takes 2 columns */}
              <div className="lg:col-span-2 h-full hidden lg:block">
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
                          <p>Measures how easy it is for your target audience to read and understand your ad content. Higher scores indicate clearer messaging, better font choices, and optimal text structure.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-white/50 text-sm mb-4">Clarity of your ad content.</p>
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-4xl sm:text-5xl md:text-6xl font-bold ${(apiData?.readability_clarity_meter || 0) >= 70
                          ? "text-green-400"
                          : (apiData?.readability_clarity_meter || 0) >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                          }`}
                      >
                        {apiData?.readability_clarity_meter || 0}/100
                      </div>
                      <div className="w-10  sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 flex items-center justify-center">
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
                          <p>Analyzes how distinctive your ad is compared to competitors in your industry. Higher scores indicate more original content, creative approaches, and unique value propositions that help you stand out.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-white/50 text-sm mb-4">How different your ad is.</p>
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-4xl sm:text-5xl md:text-6xl font-bold ${(apiData?.competitor_uniqueness_meter || 0) >= 70
                          ? "text-green-400"
                          : (apiData?.competitor_uniqueness_meter || 0) >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                          }`}
                      >
                        {apiData?.competitor_uniqueness_meter || 0}/100
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
                          <p>AI-analyzed optimal timing for posting your ad based on your target audience's online behavior patterns, platform algorithms, and industry best practices to maximize reach and engagement.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-white/50 text-sm mb-4">Recommended days and times for posting your ads to maximize reach.</p>

                    <div className="flex items-center gap-x-4">
                      {/* Best Days */}
                      <div>
                        <h4 className="text-white text-sm mb-2 font-medium">Days</h4>
                        <div className="flex flex-wrap gap-2">
                          {safeArray(apiData?.best_day_time_to_post).map((item, index) => {
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
                          {safeArray(apiData?.best_day_time_to_post).map((item, index) => {
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
                          <p>Predicts how quickly your audience will become tired of seeing your ad. Lower scores indicate longer-lasting appeal, while higher scores suggest you may need to refresh or rotate your creative sooner.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-white/50 text-sm mb-4">Estimates how quickly your audience may get tired of seeing your ad.</p>
                    <div className="flex items-center justify-center">
                      <div className="text-4xl font-bold text-amber-400">
                        {safeArray(apiData?.ad_fatigue_score)[0] || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Insights - Mobile Optimized */}
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
                    {/* Scroll Stop Power */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Scroll Stop Power</span>
                      <span
                        className={`font-bold text-sm sm:text-base ${apiData.scroll_stoppower === "High"
                          ? "text-green-400"
                          : apiData.scroll_stoppower === "Moderate"
                            ? "text-yellow-400"
                            : apiData.scroll_stoppower === "Low"
                              ? "text-red-400"
                              : "text-gray-400"
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
                            ? "text-yellow-400"
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
                            ? "text-yellow-400"
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
                            ? "text-yellow-400"
                            : "text-red-400"
                          }`}
                      >
                        {apiData.predicted_reach?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget & ROI - Mobile Optimized */}
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
                      <Badge
                        className={`text-xs sm:text-sm ${apiData.budget_level === "Low"
                          ? "bg-green-600/20 text-green-400 border-green-600/30"
                          : apiData.budget_level === "Medium"
                            ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                            : apiData.budget_level === "High"
                              ? "bg-red-600/20 text-red-400 border-red-600/30"
                              : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                          }`}
                      >
                        {apiData.budget_level || "N/A"}
                      </Badge>
                    </div>

                    {/* Expected CPM */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Expected CPM</span>
                      <span
                        className={`font-bold text-sm sm:text-base ${Number(apiData.expected_cpm) <= 5
                          ? "text-green-400"
                          : Number(apiData.expected_cpm) <= 15
                            ? "text-yellow-400"
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
                            ? "text-yellow-400"
                            : "text-red-400"
                          }`}
                      >
                        {apiData.roi_min || 0}x - {apiData.roi_max || 0}x
                      </span>
                    </div>

                    {/* Spend Efficiency */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">Spend Efficiency</span>
                      <span
                        className={`font-bold text-sm sm:text-base ${apiData.spend_efficiency === "Excellent"
                          ? "text-green-400"
                          : apiData.spend_efficiency === "Good"
                            ? "text-yellow-400"
                            : apiData.spend_efficiency === "Poor"
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                      >
                        {apiData.spend_efficiency || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audience - Mobile Optimized */}
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
                        {safeArray(apiData.top_audience).map((audience, idx) => (
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
                        {safeArray(apiData.industry_audience).map((industry, idx) => (
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
                        {safeArray(apiData.dominant_colors).map((color, idx) => (
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
                    {issues.map((issue, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-2 sm:mr-3 text-red-400 text-base sm:text-lg flex-shrink-0">•</span>
                        <span className="text-sm sm:text-base leading-relaxed">{issue}</span>
                      </li>
                    ))}
                  </ul>
                  {issues.length === 0 && (
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
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-2 sm:mr-3 text-blue-400 font-semibold flex-shrink-0">•</span>
                        <span className="text-sm sm:text-base leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ol>
                  {suggestions.length === 0 && (
                    <div className="text-gray-400 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                      No suggestions available
                    </div>
                  )}
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
                      For Designers
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
                    {feedbackDesigner.map((feedback, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-2 sm:mr-3 text-purple-400 text-base sm:text-lg flex-shrink-0">•</span>
                        <span className="text-sm sm:text-base leading-relaxed">{feedback}</span>
                      </li>
                    ))}
                  </ul>
                  {feedbackDesigner.length === 0 && (
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

            {/* Engagement & Performance Metrics - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Engagement Metrics - Mobile Optimized */}
              <ProOverlay message=" Upgrade to Pro to unlock advanced engagement analytics and performance insights.">
                <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 p-4 sm:p-6 flex flex-col">
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
                          <p className="text-gray-300 text-xs">Measures how actively users interact with your content, such as likes, comments, and shares.</p>
                        </div>
                        <div>
                          <strong>Viral Potential:</strong>
                          <p className="text-gray-300 text-xs">Assesses the likelihood of your content being widely shared across platforms.</p>
                        </div>
                        <div>
                          <strong>Trust Signal Score:</strong>
                          <p className="text-gray-300 text-xs">Indicates how credible and reliable your content appears to users.</p>
                        </div>
                        <div>
                          <strong>FOMO Score:</strong>
                          <p className="text-gray-300 text-xs">Measures the extent to which your content creates fear of missing out or prompts immediate attention.</p>
                        </div>
                        <div>
                          <strong>Urgency Trigger:</strong>
                          <p className="text-gray-300 text-xs">Highlights time-sensitive or limited-availability cues that drive users to act quickly.</p>
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
                          apiData.engagement_score <= 50
                            ? "0 0 14px 4px rgba(239,68,68,0.7)"
                            : apiData.engagement_score <= 75
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
                            className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 ${apiData.engagement_score <= 50
                              ? "text-red-500"
                              : apiData.engagement_score <= 75
                                ? "text-yellow-500"
                                : "text-green-500"
                              }`}
                          />
                          <span className="text-gray-300 font-medium text-sm sm:text-base">
                            Engagement Score
                          </span>
                        </div>
                        <span
                          className={`font-semibold text-lg sm:text-xl ${apiData.engagement_score <= 50
                            ? "text-red-500"
                            : apiData.engagement_score <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                            }`}
                        >
                          {Math.round(apiData.engagement_score || 0)}/100
                        </span>
                      </div>
                    </div>

                    {/* Other Engagement Metrics - Mobile Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      {[
                        {
                          label: "Viral Potential",
                          value: apiData.viral_potential_score || 0,
                          icon: TrendingUp,
                        },
                        {
                          label: "FOMO Score",
                          value: apiData.fomo_score || 0,
                          icon: Zap,
                        },
                        {
                          label: "Trust Signal Score",
                          value: apiData.trust_signal_score || 0,
                          icon: Shield,
                        },
                        {
                          label: "Urgency Trigger",
                          value: apiData.urgency_trigger_score || 0,
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
                          <div className="flex items-center gap-4 ">
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
                            <div className="flex flex-col text-left ">
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

              {/* Technical Metrics - Mobile Optimized */}
              <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 p-4 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                    <Settings className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    Technical Analysis
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="w-64 bg-[#2b2b2b] text-sm space-y-2">
                      <div>
                        <strong>Budget Utilization:</strong>
                        <p className="text-gray-300 text-xs">Tracks how efficiently your allocated budget is being spent on campaigns or content.</p>
                      </div>
                      <div>
                        <strong>Faces Detected:</strong>
                        <p className="text-gray-300 text-xs">Counts and identifies faces in images or videos to ensure people are clearly visible.</p>
                      </div>
                      <div>
                        <strong>Logo Visibility:</strong>
                        <p className="text-gray-300 text-xs">Assesses whether logos are clearly visible and prominent in your content.</p>
                      </div>
                      <div>
                        <strong>Text Percentage:</strong>
                        <p className="text-gray-300 text-xs">Measures the proportion of text relative to images to maintain visual balance and readability.</p>
                      </div>
                      <div>
                        <strong>Layout Symmetry:</strong>
                        <p className="text-gray-300 text-xs">Evaluates the visual balance and alignment of elements for a harmonious design.</p>
                      </div>
                    </TooltipContent>

                  </Tooltip>
                </div>

                <div className="space-y-3 sm:space-y-4 flex-1">
                  {/* Budget Utilization */}
                  <div
                    className="bg-[#121212] rounded-xl p-3 sm:p-4 border border-[#2b2b2b] transition-all duration-300"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        apiData.budget_utilization_score <= 50
                          ? "0 0 14px 4px rgba(239,68,68,0.7)"
                          : apiData.budget_utilization_score <= 75
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
                          className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 ${apiData.budget_utilization_score <= 50
                            ? "text-red-500"
                            : apiData.budget_utilization_score <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                            }`}
                        />
                        <span className="text-gray-300 font-medium text-sm sm:text-base">
                          Budget Utilization
                        </span>
                      </div>
                      <span className={`font-semibold text-lg sm:text-xl ${apiData.budget_utilization_score <= 50
                        ? "text-red-500"
                        : apiData.budget_utilization_score <= 75
                          ? "text-yellow-500"
                          : "text-green-500"
                        }`}>
                        {Math.round(apiData.budget_utilization_score || 0)}/100
                      </span>
                    </div>
                  </div>

                  {/* Other Technical Metrics - Mobile Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {[
                      {
                        label: "Faces Detected",
                        value: apiData.faces_detected || 0,
                        icon: Camera,
                        max: 10,
                      },
                      {
                        label: "Logo Visibility",
                        value: apiData.logo_visibility_score || 0,
                        icon: Award,
                        max: 100,
                      },
                      {
                        label: "Text Percentage",
                        value: apiData.text_percentage_score || 0,
                        icon: Type,
                        max: 100,
                      },
                      {
                        label: "Layout Symmetry",
                        value: apiData.layout_symmetry_score || 0,
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
                            <item.icon
                              className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`}
                            />

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
              {/* </ProOverlay> */}
            </div>

            {/* Quick Wins & Insights - Mobile Optimized */}
            {(apiData.quick_win_tip || apiData.shareability_comment) && (
              <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]"
                style={{ transition: "all 0.3s" }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 0 20px 4px #DB4900";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                }}
              >
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                      <Sparkles className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      Quick Wins & Insights
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="w-50 bg-[#2b2b2b]">
                        <p>Actionable insights and quick optimization tips for immediate performance improvements.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {apiData.quick_win_tip && (
                      <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-xl p-4 sm:p-6 border border-green-600/20">
                        <h4 className="text-base sm:text-lg font-semibold text-green-400 mb-2 sm:mb-3 flex items-center">
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                          Quick Win Tip
                        </h4>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{apiData.quick_win_tip}</p>
                      </div>
                    )}

                    {apiData.shareability_comment && (
                      <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl p-4 sm:p-6 border border-blue-600/20">
                        <h4 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3 flex items-center">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                          Shareability Assessment
                        </h4>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{apiData.shareability_comment}</p>
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
                      <Palette className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      Emotional, Color Analysis
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
                            {apiData.primary_emotion || "N/A"}
                          </Badge>
                        </div>

                        {/* Emotional Alignment */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm sm:text-base">Emotional Alignment</span>
                          <span className="inline-block bg-purple-600/20 text-purple-400 border border-purple-600/30 text-xs sm:text-sm px-2 py-1 rounded-full">
                            {apiData.emotional_alignment || "N/A"}
                          </span>

                        </div>

                        {/* Emotional Boost Suggestions */}
                        {safeArray(apiData.emotional_boost_suggestions).length > 0 && (
                          <div className="pt-2">
                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                              Emotional Boost Suggestions
                            </h5>
                            <div className="space-y-1">
                              {safeArray(apiData.emotional_boost_suggestions).map((suggestion, idx) => (
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
                        {safeArray(apiData.suggested_colors).length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 min-w-0 sm:min-w-[140px]">
                              Suggested Colors
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {safeArray(apiData.suggested_colors).map((color, idx) => (
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
                        {apiData.font_feedback && (
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 min-w-0 sm:min-w-[140px]">
                              Font Feedback
                            </h5>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{apiData.font_feedback}</p>
                          </div>
                        )}

                        {/* Color Harmony Feedback */}
                        {apiData.color_harmony_feedback && (
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                            <h5 className="text-xs sm:text-sm font-semibold text-gray-300 min-w-0 sm:min-w-[140px]">
                              Color Harmony Feedback
                            </h5>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{apiData.color_harmony_feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Analysis - Mobile Optimized */}
              <ProOverlay message=" Upgrade to Pro to access comprehensive visual quality analysis and design optimization insights.">
                <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b]">
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold flex items-center">
                        <Eye className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                        Visual Analysis
                      </h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="w-60 h-80 overflow-y-auto bg-[#2b2b2b] text-sm space-y-2">
                          <div>
                            <strong>Visual Clarity:</strong>
                            <p className="text-gray-300 text-xs">Evaluates how clear and easily interpretable the visual elements are.</p>
                          </div>
                          <div>
                            <strong>Emotional Appeal:</strong>
                            <p className="text-gray-300 text-xs">Measures how effectively visuals evoke the intended emotional response from viewers.</p>
                          </div>
                          <div>
                            <strong>Text-Visual:</strong>
                            <p className="text-gray-300 text-xs">Assesses how well text and visuals are integrated, including alignment, spacing, and proportionality.</p>
                          </div>
                          <div>
                            <strong>CTA Visibility:</strong>
                            <p className="text-gray-300 text-xs">Analyzes how prominent and noticeable call-to-action elements are within the content.</p>
                          </div>
                          <div>
                            <strong>Color Harmony:</strong>
                            <p className="text-gray-300 text-xs">Checks if colors are balanced and aesthetically pleasing, enhancing overall visual appeal.</p>
                          </div>
                          <div>
                            <strong>Brand Alignment:</strong>
                            <p className="text-gray-300 text-xs">Ensures design elements, colors, and visuals are consistent with the brand identity.</p>
                          </div>
                          <div>
                            <strong>Text Readability:</strong>
                            <p className="text-gray-300 text-xs">Evaluates font size, contrast, and clarity to ensure text is easy to read.</p>
                          </div>
                          <div>
                            <strong>Image Quality:</strong>
                            <p className="text-gray-300 text-xs">Assesses resolution, sharpness, and overall visual polish of images used.</p>
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
                          { label: "Visual Clarity", value: parseInt(String(apiData.visual_clarity)) || 0, icon: Eye, max: 100 },
                          { label: "Emotional Appeal", value: parseInt(String(apiData.emotional_appeal)) || 0, icon: Heart, max: 100 },
                          { label: "Text-Visual", value: parseInt(String(apiData.text_visual_balance)) || 0, icon: FileText, max: 100 },
                          { label: "CTA Visibility", value: parseInt(String(apiData.cta_visibility)) || 0, icon: Target, max: 100 }
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
                            <div className="flex items-center gap-4">
                              {/* Icon on the left */}
                              <item.icon
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${item.value <= 50
                                  ? "text-red-500"
                                  : item.value <= 75
                                    ? "text-yellow-500"
                                    : "text-green-500"
                                  }`}
                              />

                              {/* Text stacked on the right */}
                              <div className="flex flex-col text-left">
                                <span className="text-gray-300 text-xs sm:text-sm font-medium mb-1 leading-tight">
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

                      {/* Design Quality */}
                      <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Design Quality</h4>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        {[
                          { label: "Color Harmony", value: apiData.color_harmony || 0, icon: Palette, max: 100 },
                          { label: "Brand Alignment", value: apiData.brand_alignment || 0, icon: Award, max: 100 },
                          { label: "Text Readability", value: apiData.text_readability || 0, icon: FileText, max: 100 },
                          { label: "Image Quality", value: apiData.image_quality || 0, icon: ImageIcon, max: 100 }
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
                            <div className="flex items-center gap-4">
                              {/* Icon on the left */}
                              <item.icon
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${item.value <= 50
                                  ? "text-red-500"
                                  : item.value <= 75
                                    ? "text-yellow-500"
                                    : "text-green-500"
                                  }`}
                              />

                              {/* Text stacked on the right */}
                              <div className="flex flex-col text-left">
                                <span className="text-gray-300 text-xs sm:text-sm font-medium mb-1 leading-tight">
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
                </div>
              </ProOverlay>
            </div>

            {/* Ad Copy Generator - Mobile Optimized */}
            <div className="bg-black rounded-2xl sm:rounded-3xl shadow-lg shadow-white/10 border border-[#2b2b2b] skip-block">
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
                        Boost your ad’s reach with these trending hashtags.
                      </p>

                      {/* Tags Display */}
                      <div className="flex flex-wrap gap-2">
                        {apiData?.["10_trending_tags_relatedto_ad"]?.map((tag, index) => (
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

            {isFromToken && (
              <div className="my-10" />
            )}

            {/* Action Buttons - Mobile Optimized */}
            {!isFromToken && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center skip-block">
                <Button
                  onClick={() =>
                    isProUser ? router.push("/upload") : router.push("/pro")
                  }
                  className="rounded-lg px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-200 w-full sm:w-auto"
                >
                  {isProUser ? "Re-analyze" : "Upgrade"}
                </Button>

                {/* Share & Download Buttons only for Pro Users */}
                {isProUser && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => { handleShare(); trackEvent("Ad_Analysis_Report_Shared", window.location.href, userDetails?.email?.toString()) }}
                      className="rounded-lg px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold transition-all duration-200 w-full sm:w-auto hidden sm:flex"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Results
                    </Button>

                    <div className="flex flex-row gap-3 sm:gap-4">
                      <Button
                        variant="outline"
                        onClick={handleDownloadPDF}
                        disabled={isPdfGenerating || !apiData}
                        className="rounded-lg px-6 sm:px-8 py-4 sm:py-5 text-xs sm:text-lg font-semibold transition-all duration-200 "
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isPdfGenerating ? "Generating..." : "Download Report"}
                      </Button>

                      <Button
                        className="text-white font-semibold rounded-lg py-2 sm:py-3 transition duration-200 text-xs sm:text-base"
                        disabled={isFromToken ? false : !isProUser}
                        onClick={() => {
                          if (isFromToken) {
                            window.open("/register", "_blank");
                            trackEvent("Register_Clicked_from_Results", window.location.href)
                          } else {
                            router.push("/ab-test");
                            trackEvent("Compare_Ad_Clicked_from_Results", window.location.href, userDetails?.email?.toString())
                          }
                        }}
                      >
                        <GitCompareArrows className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {isFromToken ? "Register Now" : "Compare Now"}
                      </Button>
                    </div>
                    <div className="mb-14 lg:hidden" />
                  </>
                )}
              </div>
            )}

          </div>
        </main>
        {showIntro && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-2b2b2b bg-121212 p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-2">Pre-run check</h3>

              <div className="text-sm text-gray-400 mb-1">Go / No Go</div>
              <p
                className={cn(
                  "text-5xl font-bold mb-4",
                  safeArray(apiData?.go_no_go)[0] === 'Go' ? "text-green-400" : "text-red-400"
                )}
              >
                {safeArray(apiData?.go_no_go)[0] === 'Go' ? 'Go' : 'No Go'}
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

        {/* Fixed button for shared token views */}
        {isFromToken && (
          <motion.div
            className="fixed bottom-4 right-4 z-50 skip-block"
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
      </div>
    </TooltipProvider>
  )
}
