"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  Activity,
  BarChart3,
  Camera,
  Type,
  Layout,
  DollarSign,
  Upload,
  ArrowLeft,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import ResultsPageLoadingSkeleton from "@/components/Skeleton-loading/results-loading"
import { cn } from "@/lib/utils"
import { generatePDFReport, ApiResponse } from "@/lib/pdfGenerator"
import logo from "@/assets/ad-icon-logo.png"

export default function ResultsPage() {
  const { userDetails } = useFetchUserDetails()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTone, setSelectedTone] = useState("friendly")
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const isProUser = userDetails?.payment_status === 1

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const adUploadId = searchParams.get('ad_id') || ''
        const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=addetail&ad_upload_id=${adUploadId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch ad details')
        }

        const result = await response.json()
        setApiData(result.data) // Access data from the response
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAdDetails()
  }, [searchParams])

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
        return [] // exclude unknowns
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

  // PDF generation handler

  const ProOverlay = ({ children, message }: { children: React.ReactNode; message: string }) => (
    <div className="relative">
      <div className={isProUser ? "" : "blur-sm pointer-events-none"}>{children}</div>
      {!isProUser && (
        <div className="absolute inset-0 bg-[#121212]/70 flex flex-col items-center justify-center rounded-2xl">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-white font-semibold mb-4">{message}</p>
            <Button
              onClick={() => router.push("/pro")}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const handleGeneratePDF = async () => {
    if (!apiData) return

    try {
      // Import html2pdf dynamically to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default

      // Get the results page element
      const element = document.getElementById('results-page')

      if (!element) {
        throw new Error('Results page element not found')
      }

      // Configure PDF options to preserve your dark theme
      const opt = {
        margin: 0.3,
        filename: `ad-analysis-${apiData.title || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.95
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#000000', // Your black background
          scrollX: 0,
          scrollY: 0,
          width: element.scrollWidth,
          height: element.scrollHeight,
          ignoreElements: (element) => {
            // Skip elements that shouldn't be in PDF
            return element.classList?.contains('no-print') || false
          }
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after'
        }
      }

      // Show loading state with your theme colors


      // Temporarily ensure all colors are preserved during capture
      const originalBodyStyle = document.body.style.cssText
      document.body.style.cssText += '; background: #000000 !important;'

      // Generate PDF
      await html2pdf().set(opt).from(element).save()

      // Restore original styles
      document.body.style.cssText = originalBodyStyle


    } catch (error) {
      console.error('PDF generation error:', error)

      // Show error with your theme colors
      const errorToast = document.createElement('div')
      errorToast.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #1a1a1a; color: #ff6b6b; padding: 16px 24px; border-radius: 12px; z-index: 9999; border: 1px solid #ff6b6b;">
        Failed to generate PDF. Please try again.
      </div>
    `
      document.body.appendChild(errorToast)
      setTimeout(() => document.body.removeChild(errorToast), 3000)
    }
  }

  // Alternative implementation using jsPDF + html2canvas for more control
  const handleGeneratePDFAlternative = async () => {
    if (!apiData) return

    try {
      // Import libraries dynamically
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).jsPDF

      const element = document.getElementById('results-page')

      if (!element) {
        throw new Error('Results page element not found')
      }

      // Show loading state
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'visible'

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      })

      // Restore original overflow
      document.body.style.overflow = originalOverflow

      // Calculate PDF dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      let position = 0

      // Add first page
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save the PDF
      const filename = `ad-analysis-${apiData.title || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)

    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF report. Please try again.')
    }
  }

  // CSS additions to improve PDF output (add to your global CSS or component styles)
  const pdfOptimizedStyles = `
  @media print {
    #results-page {
      background: white !important;
      color: black !important;
    }
    
    #results-page * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }
    
    .page-break-before {
      page-break-before: always;
    }
    
    .page-break-after {
      page-break-after: always;
    }
    
    .no-print {
      display: none !important;
    }
  }
`

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-xl mb-4">Failed to load analysis results</p>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button onClick={() => router.push('/upload')} className="bg-blue-600 hover:bg-blue-700">
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-xl mb-4">No data available</p>
          <p className="text-gray-300 mb-6">Unable to load analysis results</p>
          <Button onClick={() => router.push('/upload')} className="bg-blue-600 hover:bg-blue-700">
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
      <div className="min-h-screen text-white max-w-7xl mx-auto" id="results-page">
        <main className="container mx-auto px-6 py-12">
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
                <h1 className="text-4xl font-bold mb-1">Analysis Results</h1>
                <p className="text-gray-300">AI-powered insights for your ad creative</p>
              </div>
            </div>

            {/* Right: Logo */}
            <div>
              <Image src={logo} alt="Logo" className="h-14 w-auto" />
            </div>
          </div>


          <div className="w-full mx-auto space-y-8">
            {/* Ad Overview Card */}
            <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border-none">
              <div className="p-8 space-y-8">
                {/* Row 1: Ad Preview + Basic Info */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Ad Preview Section */}
                  <div className="lg:col-span-1">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#121212] border  border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                      {apiData.ad_type === "video" && apiData.video ? (
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

                            {/* Navigation */}
                            {images.length > 1 && (
                              <>
                                <button
                                  onClick={prevImage}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={nextImage}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>

                                {/* Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                  {images.map((_, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setCurrentImageIndex(index)}
                                      className={cn(
                                        "w-2 h-2 rounded-full transition-all",
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
                    {apiData.ad_type === "video" && apiData.video ? (
                      <div className="text-center mt-2 text-sm text-gray-400">Video Ad</div>
                    ) : (
                      images.length > 1 && (
                        <div className="text-center mt-2 text-sm text-gray-400">
                          {currentImageIndex + 1} of {images.length}
                        </div>
                      )
                    )}
                  </div>

                  {/* Basic Info + Scores */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Title + Meta */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-3xl font-bold mb-2">
                          {apiData.title || "Untitled Ad"}
                        </h2>
                        <div className="text-gray-300 flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          {apiData.uploaded_on ? formatDate(apiData.uploaded_on) : "Unknown"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30">
                          Industry: {apiData.industry || "N/A"}
                        </Badge>
                        <Badge className="bg-purple-600/20 text-purple-400 border border-purple-600/30">
                          {apiData.ad_type || "Unknown"}
                        </Badge>
                        {platformSuitability.map((platform) => (
                          <Badge
                            key={platform.platform}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300",
                              platform.suitable
                                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                : platform.warning
                                  ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                  : "bg-red-600/20 text-red-400 border border-red-600/30"
                            )}
                          >
                            {platform.suitable ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : platform.warning ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {platform.platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Score Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Performance Score */}
                      <div
                        className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] transition-all duration-300 text-center shadow-lg hover:scale-[1.01] transition-all duration-300"

                        style={{
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                        }}>

                        <h3 className="text-base font-medium text-gray-300 mb-2">Performance Score</h3>
                        <div
                          className={`text-3xl font-bold ${apiData.score_out_of_100 < 50
                            ? "text-red-400"
                            : apiData.score_out_of_100 < 75
                              ? "text-yellow-400"
                              : "text-[#22C55E]"
                            }`}
                        >
                          {apiData.score_out_of_100}/100
                        </div>

                      </div>

                      {/* Confidence Score */}
                      <div
                        className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] transition-all duration-300 text-center shadow-lg hover:scale-[1.01] transition-all duration-300"
                        style={{
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                        }}>
                        <h3 className="text-base font-medium text-gray-300 mb-2">Confidence Score</h3>
                        <div
                          className={`text-3xl font-bold ${apiData.confidence_score < 50
                            ? "text-red-400"
                            : apiData.confidence_score < 75
                              ? "text-yellow-400"
                              : "text-[#22C55E]"
                            }`}
                        >
                          {apiData.confidence_score || 0}/100
                        </div>

                      </div>

                      {/* Match Score */}
                      <div
                        className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] transition-all duration-300 text-center shadow-lg hover:scale-[1.01] transition-all duration-300"
                        style={{
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                        }}>
                        <h3 className="text-base font-medium text-gray-300 mb-2">Match Score</h3>
                        <div
                          className={`text-3xl font-bold ${apiData.match_score < 50
                            ? "text-red-400"
                            : apiData.match_score < 75
                              ? "text-yellow-400"
                              : "text-[#22C55E]"
                            }`}
                        >
                          {apiData.match_score || 0}/100
                        </div>

                      </div>

                      {/* Issues Detected */}
                      <div
                        className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] transition-all duration-300 text-center shadow-lg hover:scale-[1.01] transition-all duration-300"
                        style={{
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                        }}>
                        <h3 className="text-base font-medium text-gray-300 mb-2">Issues Detected</h3>
                        <div
                          className={`text-3xl font-bold ${issues.length < 8 ? "text-[#22C55E]" : "text-red-400"
                            }`}
                        >
                          {String(issues.length).padStart(2, "0")}
                        </div>

                      </div>
                    </div>


                    {/* Mismatch Warnings */}
                    {mismatchWarnings.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-300">Mismatch Warnings</h4>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-gray-400 hover:text-white cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="w-50 bg-[#2b2b2b]">
                              <p>
                                Potential inconsistencies between your ad elements that might affect performance or brand alignment.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="space-y-3">
                          {mismatchWarnings.map((warning, index) => (
                            <div
                              key={index}
                              className="flex items-start p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                            >
                              <AlertTriangle className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-amber-200 text-sm">{warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Engagement Insights */}
            <ProOverlay message="🔐 Upgrade to Pro to see detailed engagement insights.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Traffic Prediction */}
                <div className="bg-black rounded-2xl p-4 border  border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                  style={{
                    transition: "all 0.3s",
                  }}
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
                      <span className="font-bold text-green-400">{apiData.scroll_stoppower || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Estimated CTR</span>
                      <span className="font-bold text-green-400">{apiData.estimated_ctr || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Conversion Probability</span>
                      <span className="font-bold text-green-400">{apiData.conversion_probability || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Predicted Reach</span>
                      <span className="font-bold text-blue-400">{apiData.predicted_reach?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Budget & ROI */}
                <div className="bg-black rounded-2xl p-4 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                  style={{
                    transition: "all 0.3s",
                  }}
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
                        {apiData.budget_level || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Expected CPM</span>
                      <span className="font-bold text-yellow-400">{apiData.expected_cpm || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">ROI Range</span>
                      <span className="font-bold text-green-400">
                        {apiData.roi_min || 0}x - {apiData.roi_max || 0}x
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Spend Efficiency</span>
                      <span className="font-bold text-purple-400">{apiData.spend_efficiency || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Audience */}
                <div className="bg-black rounded-2xl p-4 border border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                  style={{
                    transition: "all 0.3s",
                  }}
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
                        {safeArray(apiData.top_audience).map((audience, idx) => (
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
                        {safeArray(apiData.industry_audience).map((industry, idx) => (
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
                        {safeArray(apiData.dominant_colors).map((color, idx) => (
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

            {/* Issues and Suggestions */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Issues Section */}
              <div
                className="bg-black border  border-[#2b2b2b] rounded-2xl  hover:scale-[1.01] transition-all duration-300"
                style={{
                  transition: "all 0.3s",
                }}
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
                      Issues Detected
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
                    {issues.map((issue, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-red-400 text-lg">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                  {issues.length === 0 && (
                    <div className="text-gray-400 italic">No issues detected</div>
                  )}
                </div>
              </div>


              {/* Suggestions Section */}
              <div
                className="bg-black border  border-[#2b2b2b] rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                style={{
                  transition: "all 0.3s",
                }}
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
                      Suggestions for Improvement
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
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-blue-400 font-semibold">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ol>
                  {suggestions.length === 0 && (
                    <div className="text-gray-400 italic">No suggestions available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Feedback */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Designer Feedback */}
              <div
                className="bg-black border  border-[#2b2b2b] rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                style={{
                  transition: "all 0.3s",
                }}
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
                      Designer Feedback
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
                    {feedbackDesigner.map((feedback, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-purple-400 text-lg">•</span>
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                  {feedbackDesigner.length === 0 && (
                    <div className="text-gray-400 italic">No designer feedback available</div>
                  )}
                </div>
              </div>

              {/* Digital Marketing Feedback */}
              <div
                className="bg-black border  border-[#2b2b2b] rounded-2xl shadow-lg shadow-white/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                style={{
                  transition: "all 0.3s",
                }}
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
                      Marketing Expert Feedback
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
                    {feedbackDigitalMark.map((feedback, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-green-400 text-lg">•</span>
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                  {feedbackDigitalMark.length === 0 && (
                    <div className="text-gray-400 italic">No marketing feedback available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Engagement & Performance Metrics - NEW SECTION */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Engagement Metrics */}
              <div className="bg-black rounded-3xl shadow-lg shadow-white/10 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Activity className="mr-3 h-6 w-6 text-primary" />
                    Engagement Metrics
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
                          className={`w-5 h-5 mr-3 ${apiData.engagement_score <= 50
                            ? "text-red-500"
                            : apiData.engagement_score <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                            }`}
                        />
                        <span className="text-gray-300 font-medium">Engagement Score</span>
                      </div>
                      <span className="font-semibold text-white">
                        {Math.round(apiData.engagement_score || 0)}/100
                      </span>
                    </div>
                    <Progress
                      value={apiData.engagement_score || 0}
                      className="h-1 w-full bg-gray-800"
                      indicatorClassName={
                        apiData.engagement_score <= 50
                          ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          : apiData.engagement_score <= 75
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

              {/* Technical Metrics */}
              <div className="bg-black rounded-3xl shadow-lg shadow-white/10 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Activity className="mr-3 h-6 w-6 text-primary" />
                    Technical Analysis
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
                  {/* Budget Utilization */}
                  <div
                    className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b] transition-all duration-300"
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
                          className={`w-5 h-5 mr-3 ${apiData.budget_utilization_score <= 50
                            ? "text-red-500"
                            : apiData.budget_utilization_score <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                            }`}
                        />
                        <span className="text-gray-300 font-medium">
                          Budget Utilization
                        </span>
                      </div>
                      <span className="font-semibold text-white">
                        {Math.round(apiData.budget_utilization_score || 0)}/100
                      </span>
                    </div>
                    <Progress
                      value={apiData.budget_utilization_score || 0}
                      className="h-1 w-full bg-gray-800"
                      indicatorClassName={
                        apiData.budget_utilization_score <= 50
                          ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          : apiData.budget_utilization_score <= 75
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

            {/* Quick Wins & Insights - NEW SECTION */}
            {(apiData.quick_win_tip || apiData.shareability_comment) && (
              <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border  border-[#2b2b2b]"
                style={{
                  transition: "all 0.3s",
                }}
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
                      Quick Wins & Insights
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
                    {apiData.quick_win_tip && (
                      <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-xl p-6 border border-green-600/20">
                        <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                          <Zap className="w-5 h-5 mr-2" />
                          Quick Win Tip
                        </h4>
                        <p className="text-gray-300">{apiData.quick_win_tip}</p>
                      </div>
                    )}

                    {apiData.shareability_comment && (
                      <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl p-6 border border-blue-600/20">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          Shareability Assessment
                        </h4>
                        <p className="text-gray-300">{apiData.shareability_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Emotional + Visual Analysis Combined Section */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border  border-[#2b2b2b]">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold flex items-center">
                      <Heart className="mr-2 h-6 w-6 text-primary" />
                      Emotional, Color Analysis
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
                            {apiData.primary_emotion || "N/A"}
                          </Badge>
                        </div>

                        {/* Emotional Alignment */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Emotional Alignment</span>
                          <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                            {apiData.emotional_alignment || "N/A"}
                          </Badge>
                        </div>

                        {/* Emotional Boost Suggestions */}
                        {safeArray(apiData.emotional_boost_suggestions).length > 0 && (
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-semibold text-gray-300 mb-1">
                              Emotional Boost Suggestions
                            </h5>
                            <div className="space-y-1">
                              {safeArray(apiData.emotional_boost_suggestions).map((suggestion, idx) => (
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
                        {safeArray(apiData.suggested_colors).length > 0 && (
                          <div className="flex items-start justify-between gap-4">
                            <h5 className="text-sm font-semibold text-gray-300 min-w-[140px]">
                              Suggested Colors
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {safeArray(apiData.suggested_colors).map((color, idx) => (
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
                        {apiData.font_feedback && (
                          <div className="flex items-start justify-between gap-4">
                            <h5 className="text-sm font-semibold text-gray-300 min-w-[140px]">
                              Font Feedback
                            </h5>
                            <p className="text-gray-300 text-sm">{apiData.font_feedback}</p>
                          </div>
                        )}

                        {/* Color Harmony Feedback */}
                        {apiData.color_harmony_feedback && (
                          <div className="flex items-start justify-between gap-4">
                            <h5 className="text-sm font-semibold text-gray-300 min-w-[140px]">
                              Color Harmony Feedback
                            </h5>
                            <p className="text-gray-300 text-sm text-right">{apiData.color_harmony_feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border  border-[#2b2b2b]">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold flex items-center">
                      <Heart className="mr-2 h-6 w-6 text-primary" />
                      Visual Analysis
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
                  {/* RIGHT COLUMN stays as you had it */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-primary mb-4">
                      Visual Quality Assessment
                    </h4>

                    {/* Core Visual Metrics */}
                    <div className="grid lg:grid-cols-2 gap-4">
                      {[
                        { label: "Visual Clarity", value: parseInt(String(apiData.visual_clarity)) || 0, icon: Eye, max: 100 },
                        { label: "Emotional Appeal", value: parseInt(String(apiData.emotional_appeal)) || 0, icon: Heart, max: 100 },
                        { label: "Text-Visual Balance", value: parseInt(String(apiData.text_visual_balance)) || 0, icon: FileText, max: 100 },
                        { label: "CTA Visibility", value: parseInt(String(apiData.cta_visibility)) || 0, icon: Target, max: 100 }
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
                        { label: "Color Harmony", value: apiData.color_harmony || 0, icon: Palette, max: 100 },
                        { label: "Brand Alignment", value: apiData.brand_alignment || 0, icon: Award, max: 100 },
                        { label: "Text Readability", value: apiData.text_readability || 0, icon: FileText, max: 100 },
                        { label: "Image Quality", value: apiData.image_quality || 0, icon: ImageIcon, max: 100 }
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

            {/* Ad Copy Generator */}
            <div className="bg-black rounded-3xl shadow-lg shadow-white/10 border  border-[#2b2b2b]">
              <div className="p-8 space-y-8">
                {/* Top: Title */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-2xl font-bold flex items-center">
                      <PenTool className="mr-3 h-6 w-6 text-primary" />
                      AI-Written Ad Copy Generator
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

                {/* Bottom: Ad Copy Output & CTA Buttons */}
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Left: Ad Copy Output */}
                  <div className="md:w-[70%] w-full space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-primary">Generated Ad Copy</h4>

                      {/* Display filtered ad copies */}
                      <div className="space-y-4">
                        {filteredAdCopies.map((adCopy, index) => (
                          <div key={index} className="bg-[#121212] rounded-2xl p-6 border  border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                            style={{
                              transition: "all 0.3s",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                            }}>
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm text-gray-300">{adCopy.platform || 'N/A'} | {adCopy.tone || 'N/A'}</span>
                              <Sparkles className="w-4 h-4 text-green-400" />
                            </div>
                            <p className="text-white font-medium">{adCopy.copy_text || 'No copy text available'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Show message if no ad copies */}
                      {filteredAdCopies.length === 0 && (
                        <div className="text-gray-400 italic text-center py-8">
                          No ad copies available
                        </div>
                      )}

                      {/* Pro overlay for additional copies */}
                      {!isProUser && safeArray(apiData?.ad_copies).length > 1 && (
                        <ProOverlay message="🔐 Pro users see all ad copy variations.">
                          <div className="space-y-4">
                            {safeArray(apiData?.ad_copies).slice(1).map((adCopy, index) => (
                              <div key={index + 1} className="bg-[#121212] rounded-2xl p-6 border  border-[#2b2b2b] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                                style={{
                                  transition: "all 0.3s",
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                                }}>
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

                  {/* Right: CTA Section */}
                  <div className="md:w-[30%] mt-10 w-full bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#222] rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                    style={{
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 0 14px 4px #DB4900";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.05)";
                    }}>
                    <div className="space-y-4">
                      <div className="flex items-center text-white mb-1">
                        <GitCompareArrows className="w-5 h-5 mr-2 text-primary" />
                        <h4 className="text-lg font-semibold">Ad Comparison</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Want to compare ads side-by-side? Use our Ad Comparison tool to test different versions of your ad copy, evaluate tone and platform variations, and discover what resonates most with your audience — all in one place.
                      </p>
                    </div>

                    <div className="mt-6">
                      <Button
                        className="w-full text-white font-semibold rounded-xl py-2 transition duration-200"
                        disabled={!isProUser}
                        onClick={() => router.push("/ab-test")}
                      >
                        <GitCompareArrows className="w-4 h-4 mr-2" />
                        Compare Now
                      </Button>
                      {!isProUser && (
                        <p className="mt-2 text-xs text-gray-300 text-center">
                          Unlock with Pro to access ad comparison.
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
                onClick={() => router.push("/upload")}
                className="rounded-xl px-8 py-3 text-lg font-semibold transition-all duration-200"
              >
                Re-analyze
              </Button>
              <Button
                variant="outline"
                onClick={handleGeneratePDF}
                disabled={loading || !apiData}
                className="rounded-xl px-8 py-3 text-lg font-semibold transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
