import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { cn } from "@/lib/utils"
import logo from "@/assets/ad-icon-logo.png"
import { ApiResponse } from "../type"
import { Button } from "@/components/ui/button"
import html2pdf from 'html2pdf.js'

interface DownloadReportProps {
  apiData: ApiResponse
  currentImageIndex?: number
}

export default function DownloadReport({
  apiData,
  currentImageIndex = 0,
}: DownloadReportProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      const element = document.getElementById('download-report');

      if (!element) {
        throw new Error('Report element not found');
      }

      // Add PDF-specific class to convert colors
      element.classList.add('pdf-conversion');

      const options = {
        margin: 0.5,
        filename: `ad-analysis-report-${apiData.title || 'untitled'}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#000000',
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            // Convert OKLCH colors to RGB in the cloned document
            const clonedElement = clonedDoc.getElementById('download-report');
            if (clonedElement) {
              // Force specific color values
              const style = clonedDoc.createElement('style');
              style.textContent = `
                .pdf-conversion * {
                  color: rgb(255, 255, 255) !important;
                }
                .pdf-conversion .text-gray-300 {
                  color: rgb(209, 213, 219) !important;
                }
                .pdf-conversion .text-gray-400 {
                  color: rgb(156, 163, 175) !important;
                }
                .pdf-conversion .bg-black {
                  background-color: rgb(0, 0, 0) !important;
                }
                .pdf-conversion .bg-\\[\\#121212\\] {
                  background-color: rgb(18, 18, 18) !important;
                }
                .pdf-conversion .border-\\[\\#2b2b2b\\] {
                  border-color: rgb(43, 43, 43) !important;
                }
                .pdf-conversion .text-red-400 {
                  color: rgb(248, 113, 113) !important;
                }
                .pdf-conversion .text-green-400 {
                  color: rgb(74, 222, 128) !important;
                }
                .pdf-conversion .text-blue-400 {
                  color: rgb(96, 165, 250) !important;
                }
                .pdf-conversion .text-yellow-400 {
                  color: rgb(251, 191, 36) !important;
                }
                .pdf-conversion .text-purple-400 {
                  color: rgb(196, 181, 253) !important;
                }
                .pdf-conversion .text-pink-400 {
                  color: rgb(244, 114, 182) !important;
                }
                .pdf-conversion .text-amber-400 {
                  color: rgb(251, 191, 36) !important;
                }
                .pdf-conversion .text-\\[\\#22C55E\\] {
                  color: rgb(34, 197, 94) !important;
                }
              `;
              clonedDoc.head.appendChild(style);
            }
          }
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      };

      await html2pdf().set(options).from(element).save();

      // Remove the PDF class after generation
      element.classList.remove('pdf-conversion');

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Remove the PDF class even if there's an error
      const element = document.getElementById('download-report');
      if (element) {
        element.classList.remove('pdf-conversion');
      }
    } finally {
      setIsDownloading(false);
    }
  };


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

  // Helper function to get filtered ad copies
  const getFilteredAdCopies = () => {
    const adCopies = safeArray(apiData?.ad_copies)
    return adCopies
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
    <div>
      <div
        className="min-h-screen text-white bg-black max-w-5xl mx-auto print:bg-white print:text-black"
        id="download-report"
        style={{
          // PDF-specific styling
          backgroundColor: '#000000',
          color: '#ffffff',
          width: '210mm', // A4 width
          minHeight: '297mm', // A4 height
          margin: '0',
          padding: '0',
          boxSizing: 'border-box',
          fontSize: '14px',
          lineHeight: '1.4'
        }}
      >
        <main
          className="container mx-auto px-6 py-12"
          style={{
            padding: '20px',
            maxWidth: '100%'
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-1">Analysis Results</h1>
              <p className="text-gray-300">AI-powered insights for your ad creative</p>
            </div>
            <div className="text-right">
              <Image src={logo} alt="Logo" className="h-18 w-18" />
            </div>
          </div>

          <div className="w-full mx-auto space-y-8">
            {/* Ad Overview Card */}
            <div className="bg-black rounded-3xl border border-[#2b2b2b]">
              <div className="p-8 space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Ad Preview Section */}
                  <div className="lg:col-span-1">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#121212] border border-[#2b2b2b]">
                      {apiData.ad_type === "video" && apiData.video ? (
                        <video
                          src={apiData.video}
                          className="w-full h-full object-contain"
                          poster={images.length > 0 ? images[0] : undefined}
                          style={{ maxHeight: '300px' }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        images.length > 0 && (
                          <Image
                            src={images[currentImageIndex]}
                            alt={apiData.title || "Ad Image"}
                            fill
                            className="object-contain"
                            style={{ maxHeight: '300px' }}
                          />
                        )
                      )}
                    </div>
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
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-3xl font-bold">
                          {apiData.title || "Untitled Ad"}
                        </h2>
                        <div className="text-gray-300 flex items-center text-sm gap-2">
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          {apiData.uploaded_on ? formatDate(apiData.uploaded_on) : "Unknown"}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 bg-[#121212] border border-[#2b2b2b] rounded-xl px-3 py-2">
                          <span className="text-gray-300">Industry:</span>
                          <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/30">
                            {apiData.industry || "N/A"}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2 bg-[#121212] border border-[#2b2b2b] rounded-xl px-3 py-2">
                          <span className="text-gray-300 shrink-0">Best Suit for:</span>
                          <div className="flex flex-wrap gap-2">
                            {platformSuitability.map((platform) => (
                              <Badge
                                key={platform.platform}
                                className={cn(
                                  "flex items-center gap-2",
                                  platform.suitable
                                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                    : platform.warning
                                      ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                      : "bg-red-600/20 text-red-400 border border-red-600/30"
                                )}
                              >
                                {platform.suitable ? (
                                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : platform.warning ? (
                                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {platform.platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Performance Score */}
                      <div className="p-4 rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex justify-center">
                            <svg
                              className={`h-10 w-10 ${(apiData.score_out_of_100 ?? 0) < 50
                                ? "text-red-400"
                                : (apiData.score_out_of_100 ?? 0) < 75
                                  ? "text-yellow-400"
                                  : "text-[#22C55E]"
                                }`}
                              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-300 truncate">Performance Score</h3>
                            <div
                              className={`text-2xl font-bold ${(apiData.score_out_of_100 ?? 0) < 50
                                ? "text-red-400"
                                : (apiData.score_out_of_100 ?? 0) < 75
                                  ? "text-yellow-400"
                                  : "text-[#22C55E]"
                                }`}
                            >
                              {(apiData.score_out_of_100 ?? 0)}/100
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="p-4 rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex justify-center">
                            <svg
                              className={`h-10 w-10 ${(apiData.confidence_score ?? 0) < 50
                                ? "text-red-400"
                                : (apiData.confidence_score ?? 0) < 75
                                  ? "text-yellow-400"
                                  : "text-[#22C55E]"
                                }`}
                              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-300 truncate">Confidence Score</h3>
                            <div
                              className={`text-2xl font-bold ${(apiData.confidence_score ?? 0) < 50
                                ? "text-red-400"
                                : (apiData.confidence_score ?? 0) < 75
                                  ? "text-yellow-400"
                                  : "text-[#22C55E]"
                                }`}
                            >
                              {apiData.confidence_score || 0}/100
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="p-4 rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex justify-center">
                            <svg
                              className={`h-10 w-10 ${Number(apiData.match_score ?? 0) < 50
                                ? "text-red-400"
                                : Number(apiData.match_score ?? 0) < 75
                                  ? "text-yellow-400"
                                  : "text-[#22C55E]"
                                }`}
                              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-300 truncate">Match Score</h3>
                            <div
                              className={`text-2xl font-bold ${Number(apiData.match_score ?? 0) < 50
                                ? "text-red-400"
                                : Number(apiData.match_score ?? 0) < 75
                                  ? "text-yellow-400"
                                  : "text-[#22C55E]"
                                }`}
                            >
                              {apiData.match_score || 0}/100
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Issues Detected */}
                      <div className="p-4 rounded-2xl bg-[#121212] border border-[#2a2a2a] shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex justify-center">
                            <svg
                              className={`h-10 w-10 ${issues.length < 8 ? "text-[#22C55E]" : "text-red-400"}`}
                              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-300 truncate">Issues Detected</h3>
                            <div
                              className={`text-2xl font-bold ${issues.length < 8 ? "text-[#22C55E]" : "text-red-400"}`}
                            >
                              {String(issues.length).padStart(2, "0")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mismatch Warnings */}
                    {mismatchWarnings.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-300">Mismatch Warnings</h4>
                        </div>
                        <div className="space-y-3">
                          {mismatchWarnings.map((warning, index) => (
                            <div
                              key={index}
                              className="flex items-start p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg"
                            >
                              <svg className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                              </svg>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Prediction */}
              <div className="bg-black rounded-2xl p-6 border border-[#2b2b2b]">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-primary">Traffic Prediction</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Scroll Stop Power</span>
                    <span
                      className={`font-bold text-sm ${apiData.scroll_stoppower === "High"
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

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Estimated CTR</span>
                    <span
                      className={`font-bold text-sm ${parseFloat(apiData.estimated_ctr || "0") >= 5
                        ? "text-green-400"
                        : parseFloat(apiData.estimated_ctr || "0") >= 2
                          ? "text-yellow-400"
                          : "text-red-400"
                        }`}
                    >
                      {apiData.estimated_ctr || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Conversion Probability</span>
                    <span
                      className={`font-bold text-sm ${parseFloat(apiData.conversion_probability || "0") >= 50
                        ? "text-green-400"
                        : parseFloat(apiData.conversion_probability || "0") >= 20
                          ? "text-yellow-400"
                          : "text-red-400"
                        }`}
                    >
                      {apiData.conversion_probability || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Predicted Reach</span>
                    <span
                      className={`font-bold text-sm ${(apiData.predicted_reach ?? 0) >= 10000
                        ? "text-green-400"
                        : (apiData.predicted_reach ?? 0) >= 5000
                          ? "text-yellow-400"
                          : "text-red-400"
                        }`}
                    >
                      {apiData.predicted_reach?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget & ROI */}
              <div className="bg-black rounded-2xl p-6 border border-[#2b2b2b]">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-primary">Budget & ROI Insights</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Budget Level</span>
                    <Badge
                      className={`text-xs ${apiData.budget_level === "Low"
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

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Expected CPM</span>
                    <span
                      className={`font-bold text-sm ${Number(apiData.expected_cpm) <= 5
                        ? "text-green-400"
                        : Number(apiData.expected_cpm) <= 15
                          ? "text-yellow-400"
                          : "text-red-400"
                        }`}
                    >
                      {apiData.expected_cpm || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">ROI Range</span>
                    <span
                      className={`font-bold text-sm ${((apiData.roi_max ?? 0)) >= 5
                        ? "text-green-400"
                        : (apiData.roi_max ?? 0) >= 3
                          ? "text-yellow-400"
                          : "text-red-400"
                        }`}
                    >
                      {apiData.roi_min || 0}x - {apiData.roi_max || 0}x
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Spend Efficiency</span>
                    <span
                      className={`font-bold text-sm ${apiData.spend_efficiency === "Excellent"
                        ? "text-green-400"
                        : apiData.spend_efficiency === "Good"
                          ? "text-yellow-400"
                          : "text-red-400"
                        }`}
                    >
                      {apiData.spend_efficiency || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audience */}
              <div className="bg-black rounded-2xl p-6 border border-[#2b2b2b]">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-primary">Target Audience & Colors</h4>
                </div>
                <div className="space-y-5">
                  <div>
                    <span className="block text-gray-300 text-sm mb-2">Primary Audience:</span>
                    <div className="flex flex-wrap gap-2">
                      {safeArray(apiData.top_audience).map((audience, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 rounded-md border text-xs bg-green-600/20 text-green-400 border-green-600/30 break-words"
                        >
                          {audience}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-gray-300 text-sm mb-2">Industry Focus:</span>
                    <div className="flex flex-wrap gap-2">
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

            {/* Issues and Suggestions */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Issues Section */}
              <div className="bg-black border border-[#2b2b2b] rounded-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center text-xl font-semibold text-red-400">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                      </svg>
                      Issues Detected
                    </h3>
                  </div>
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {issues.map((issue, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-red-400 text-lg">•</span>
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                  {issues.length === 0 && (
                    <div className="text-gray-400 italic">No issues detected</div>
                  )}
                </div>
              </div>

              {/* Suggestions Section */}
              <div className="bg-black border border-[#2b2b2b] rounded-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center text-xl font-semibold text-blue-400">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      Suggestions for Improvement
                    </h3>
                  </div>
                  <ol className="space-y-3 max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-blue-400 font-semibold">•</span>
                        <span className="text-sm">{suggestion}</span>
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
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Designer Feedback */}
              <div className="bg-black border border-[#2b2b2b] rounded-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center text-xl font-semibold text-purple-400">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.152-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                      </svg>
                      Designer Feedback
                    </h3>
                  </div>
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {feedbackDesigner.map((feedback, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-purple-400 text-lg">•</span>
                        <span className="text-sm">{feedback}</span>
                      </li>
                    ))}
                  </ul>
                  {feedbackDesigner.length === 0 && (
                    <div className="text-gray-400 italic">No designer feedback available</div>
                  )}
                </div>
              </div>

              {/* Digital Marketing Feedback */}
              <div className="bg-black border border-[#2b2b2b] rounded-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center text-xl font-semibold text-green-400">
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 010 1.693l-7.45 7.45-1.907-.305z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.35 7.2l3.428-.428a1.5 1.5 0 112.121 2.12l-.428 3.43a11.95 11.95 0 01-3.395.25l-4.242-4.243a11.95 11.95 0 01.25-3.394z" />
                      </svg>
                      Marketing Expert Feedback
                    </h3>
                  </div>
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {feedbackDigitalMark.map((feedback, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-green-400 text-lg">•</span>
                        <span className="text-sm">{feedback}</span>
                      </li>
                    ))}
                  </ul>
                  {feedbackDigitalMark.length === 0 && (
                    <div className="text-gray-400 italic">No marketing feedback available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Engagement & Performance Metrics */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Engagement Metrics */}
              <div className="bg-black rounded-3xl border border-[#2b2b2b] p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <svg className="mr-3 h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Engagement Metrics
                  </h3>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Engagement Score Full Row */}
                  <div className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg
                          className={`w-5 h-5 mr-3 ${((apiData.engagement_score ?? 0)) <= 50
                            ? "text-red-500"
                            : (apiData.engagement_score ?? 0) <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                            }`}
                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span className="text-gray-300 font-medium text-sm">
                          Engagement Score
                        </span>
                      </div>
                      <span
                        className={`font-semibold text-lg ${((apiData.engagement_score ?? 0)) <= 50
                          ? "text-red-500"
                          : (apiData.engagement_score ?? 0) <= 75
                            ? "text-yellow-500"
                            : "text-green-500"
                          }`}
                      >
                        {Math.round(apiData.engagement_score || 0)}/100
                      </span>
                    </div>
                  </div>

                  {/* Other Engagement Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Viral Potential",
                        value: apiData.viral_potential_score || 0,
                        icon: "trending",
                      },
                      {
                        label: "FOMO Score",
                        value: apiData.fomo_score || 0,
                        icon: "zap",
                      },
                      {
                        label: "Trust Signal Score",
                        value: apiData.trust_signal_score || 0,
                        icon: "shield",
                      },
                      {
                        label: "Urgency Trigger",
                        value: apiData.urgency_trigger_score || 0,
                        icon: "alert",
                      },
                    ].map((item, i) => {
                      const getIcon = (type: string) => {
                        const iconClass = `w-5 h-5 mr-2 flex-shrink-0 ${item.value <= 50
                          ? "text-red-500"
                          : item.value <= 75
                            ? "text-yellow-500"
                            : "text-green-500"
                          }`;

                        if (type === "trending") {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 010 1.693l-7.45 7.45-1.907-.305z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.35 7.2l3.428-.428a1.5 1.5 0 112.121 2.12l-.428 3.43a11.95 11.95 0 01-3.395.25l-4.242-4.243a11.95 11.95 0 01.25-3.394z" />
                            </svg>
                          );
                        } else if (type === "zap") {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                          );
                        } else if (type === "shield") {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                            </svg>
                          );
                        } else {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                          );
                        }
                      };

                      return (
                        <div
                          key={i}
                          className="bg-[#121212] rounded-xl p-3 border border-[#2b2b2b] flex items-center"
                        >
                          {getIcon(item.icon)}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-gray-300 font-medium text-xs truncate">
                              {item.label}
                            </span>
                            <span
                              className={`font-semibold text-sm ${item.value <= 50
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
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Technical Metrics */}
              <div className="bg-black rounded-3xl border border-[#2b2b2b] p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <svg className="mr-3 h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Technical Analysis
                  </h3>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Budget Utilization */}
                  <div className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg
                          className={`w-5 h-5 mr-3 ${((apiData.budget_utilization_score ?? 0) <= 50
                            ? "text-red-500"
                            : (apiData.budget_utilization_score ?? 0) <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                          )}`}
                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-300 font-medium text-sm">
                          Budget Utilization
                        </span>
                      </div>
                      <span className={`font-semibold text-lg ${(apiData.budget_utilization_score ?? 0) <= 50
                        ? "text-red-500"
                        : (apiData.budget_utilization_score ?? 0) <= 75
                          ? "text-yellow-500"
                          : "text-green-500"
                        }`}>
                        {Math.round(apiData.budget_utilization_score ?? 0)}/100
                      </span>
                    </div>
                  </div>

                  {/* Other Technical Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Faces Detected",
                        value: apiData.faces_detected || 0,
                        icon: "camera",
                        max: 10,
                      },
                      {
                        label: "Logo Visibility",
                        value: apiData.logo_visibility_score || 0,
                        icon: "award",
                        max: 100,
                      },
                      {
                        label: "Text Percentage",
                        value: apiData.text_percentage_score || 0,
                        icon: "type",
                        max: 100,
                      },
                      {
                        label: "Layout Symmetry",
                        value: apiData.layout_symmetry_score || 0,
                        icon: "layout",
                        max: 100,
                      },
                    ].map((item, i) => {
                      // Custom color logic
                      const getColorClass = () => {
                        if (item.max === 10) {
                          // Faces Detected thresholds
                          if (item.value <= 3) return "text-green-500";
                          if (item.value <= 7) return "text-yellow-500";
                          return "text-red-500";
                        } else {
                          // Default 100 scale thresholds
                          if (item.value <= 50) return "text-red-500";
                          if (item.value <= 75) return "text-yellow-500";
                          return "text-green-500";
                        }
                      };

                      const colorClass = getColorClass();

                      const getIcon = (type: string) => {
                        const iconClass = `w-5 h-5 mr-2 flex-shrink-0 ${colorClass}`;

                        if (type === "camera") {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                            </svg>
                          );
                        } else if (type === "award") {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                            </svg>
                          );
                        } else if (type === "type") {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                            </svg>
                          );
                        } else {
                          return (
                            <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                          );
                        }
                      };

                      return (
                        <div
                          key={i}
                          className="bg-[#121212] rounded-xl p-3 border border-[#2b2b2b] flex items-center"
                        >
                          {getIcon(item.icon)}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-gray-300 font-medium text-xs truncate">
                              {item.label}
                            </span>
                            <span className={`font-semibold text-sm ${colorClass}`}>
                              {Math.round(item.value)}
                              {item.max === 100 ? "/100" : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Wins & Insights */}
            {(apiData.quick_win_tip || apiData.shareability_comment) && (
              <div className="bg-black rounded-3xl border border-[#2b2b2b]">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold flex items-center">
                      <svg className="mr-3 h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      Quick Wins & Insights
                    </h3>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {apiData.quick_win_tip && (
                      <div className="bg-gradient-to-br from-green-600/10 to-green-800/10 rounded-xl p-6 border border-green-600/20">
                        <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                          </svg>
                          Quick Win Tip
                        </h4>
                        <p className="text-gray-300 text-sm">{apiData.quick_win_tip}</p>
                      </div>
                    )}

                    {apiData.shareability_comment && (
                      <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 rounded-xl p-6 border border-blue-600/20">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                          </svg>
                          Shareability Assessment
                        </h4>
                        <p className="text-gray-300 text-sm">{apiData.shareability_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Emotional + Visual Analysis Combined Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-black rounded-3xl border border-[#2b2b2b]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <svg className="mr-2 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      Emotional & Color Analysis
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {/* Emotional Insights */}
                    <div className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b]">
                      <h4 className="text-lg font-semibold text-primary mb-4">Emotional Insights</h4>

                      <div className="space-y-3">
                        {/* Primary Emotion */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Primary Emotion</span>
                          <Badge className="bg-pink-600/20 text-pink-400 border-pink-600/30 text-xs">
                            {apiData.primary_emotion || "N/A"}
                          </Badge>
                        </div>

                        {/* Emotional Alignment */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Emotional Alignment</span>
                          <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs">
                            {apiData.emotional_alignment || "N/A"}
                          </Badge>
                        </div>

                        {/* Emotional Boost Suggestions */}
                        {safeArray(apiData.emotional_boost_suggestions).length > 0 && (
                          <div className="pt-2">
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">
                              Emotional Boost Suggestions
                            </h5>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {safeArray(apiData.emotional_boost_suggestions).map((suggestion, idx) => (
                                <div key={idx} className="flex items-start">
                                  <span className="text-pink-400 mr-1">•</span>
                                  <span className="text-gray-300 text-xs">{suggestion}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Color Analysis */}
                    <div className="bg-[#121212] rounded-xl p-4 border border-[#2b2b2b]">
                      <h4 className="text-lg font-semibold text-primary mb-4">Color Analysis</h4>

                      <div className="space-y-4">
                        {/* Suggested Colors */}
                        {safeArray(apiData.suggested_colors).length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">
                              Suggested Colors
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {safeArray(apiData.suggested_colors).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 px-2 py-1 rounded-lg border border-[#2b2b2b] bg-[#1a1a1a]"
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
                        )}

                        {/* Font Feedback */}
                        {apiData.font_feedback && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">
                              Font Feedback
                            </h5>
                            <p className="text-gray-300 text-xs">{apiData.font_feedback}</p>
                          </div>
                        )}

                        {/* Color Harmony Feedback */}
                        {apiData.color_harmony_feedback && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">
                              Color Harmony Feedback
                            </h5>
                            <p className="text-gray-300 text-xs">{apiData.color_harmony_feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-3xl border border-[#2b2b2b]">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <svg className="mr-2 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Visual Analysis
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-primary mb-4">
                      Visual Quality Assessment
                    </h4>

                    {/* Core Visual Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Visual Clarity", value: parseInt(String(apiData.visual_clarity)) || 0, icon: "eye", max: 100 },
                        { label: "Emotional Appeal", value: parseInt(String(apiData.emotional_appeal)) || 0, icon: "heart", max: 100 },
                        { label: "Text-Visual Balance", value: parseInt(String(apiData.text_visual_balance)) || 0, icon: "text", max: 100 },
                        { label: "CTA Visibility", value: parseInt(String(apiData.cta_visibility)) || 0, icon: "target", max: 100 }
                      ].map((item, i) => {
                        const getIcon = (type: string) => {
                          const iconClass = `w-5 h-5 mr-2 flex-shrink-0 ${item.value <= 50
                            ? "text-red-500"
                            : item.value <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                            }`;

                          if (type === "eye") {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            );
                          } else if (type === "heart") {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                              </svg>
                            );
                          } else if (type === "text") {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            );
                          } else {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                            );
                          }
                        };

                        return (
                          <div
                            key={i}
                            className="bg-[#121212] rounded-xl p-3 border border-[#2b2b2b] flex items-center"
                          >
                            {getIcon(item.icon)}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-gray-300 text-xs mb-1 truncate">{item.label}</span>
                              <span
                                className={`font-semibold text-sm ${item.value <= 50
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
                        );
                      })}
                    </div>

                    {/* Design Quality */}
                    <h4 className="text-lg font-semibold text-primary mb-4">Design Quality</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Color Harmony", value: apiData.color_harmony || 0, icon: "palette", max: 100 },
                        { label: "Brand Alignment", value: apiData.brand_alignment || 0, icon: "award", max: 100 },
                        { label: "Text Readability", value: apiData.text_readability || 0, icon: "text", max: 100 },
                        { label: "Image Quality", value: apiData.image_quality || 0, icon: "image", max: 100 }
                      ].map((item, i) => {
                        const getIcon = (type: string) => {
                          const iconClass = `w-5 h-5 mr-2 flex-shrink-0 ${item.value <= 50
                            ? "text-red-500"
                            : item.value <= 75
                              ? "text-yellow-500"
                              : "text-green-500"
                            }`;

                          if (type === "palette") {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.152-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                              </svg>
                            );
                          } else if (type === "award") {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                              </svg>
                            );
                          } else if (type === "text") {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            );
                          } else {
                            return (
                              <svg className={iconClass} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                              </svg>
                            );
                          }
                        };

                        return (
                          <div
                            key={i}
                            className="bg-[#121212] rounded-xl p-3 border border-[#2b2b2b] flex items-center"
                          >
                            {getIcon(item.icon)}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-gray-300 text-xs mb-1 truncate">{item.label}</span>
                              <span
                                className={`font-semibold text-sm ${item.value <= 50
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
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad Copy Generator */}
            <div className="bg-black rounded-3xl border border-[#2b2b2b]">
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center">
                    <svg className="mr-3 h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    AI-Written Ad Copy Generator
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-primary">Generated Ad Copy</h4>

                    <div className="space-y-4" style={{ maxHeight: 'none' }}>
                      {filteredAdCopies.map((adCopy, index) => (
                        <div key={index} className="bg-[#121212] rounded-2xl p-6 border border-[#2b2b2b]">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm text-gray-300">{adCopy.platform || 'N/A'} | {adCopy.tone || 'N/A'}</span>
                            <svg className="w-4 h-4 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                          </div>
                          <p className="text-white font-medium text-sm">{adCopy.copy_text || 'No copy text available'}</p>
                        </div>
                      ))}
                    </div>

                    {filteredAdCopies.length === 0 && (
                      <div className="text-gray-400 italic text-center py-8">
                        No ad copies available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div className="p-4 border-t border-gray-800 flex justify-end">
        <Button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
