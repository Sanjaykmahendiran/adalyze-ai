import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  Heart,
  ImageIcon,
  Layout,
  Palette,
  PenTool,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Type,
  Users,
  XCircle,
  Zap
} from "lucide-react";

const DownloadResultA4 = ({
  apiData,
  images,
  currentImageIndex,
  setCurrentImageIndex,
  nextImage,
  prevImage,
  issues,
  suggestions,
  platformSuitability,
  mismatchWarnings,
  feedbackDesigner,
  feedbackDigitalMark,
  filteredAdCopies,
  safeArray,
  formatDate,
  cn
}) => {
  return (
    <div className="min-h-screen text-black bg-white print:bg-white print:text-black">
      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-break {
            page-break-before: always;
          }
          
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <main className="w-full max-w-none px-4 py-6 print:px-0 print:py-0">
        {/* Header Section */}
        <div className="text-center mb-6 avoid-break">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Analysis Results</h1>
          <p className="text-gray-600 text-sm">AI-powered insights for your ad creative</p>
        </div>

        <div className="w-full space-y-4">
          {/* Ad Overview Card - Compact Layout */}
          <div className="border border-gray-300 rounded-lg avoid-break">
            <div className="p-4">
              {/* Ad Preview + Basic Info - Single Row for A4 */}
              <div className="flex gap-4 mb-4">
                {/* Ad Preview - Smaller for A4 */}
                <div className="w-32 h-32 flex-shrink-0">
                  <div className="relative w-full h-full overflow-hidden rounded-lg border border-gray-200">
                    {apiData.ad_type === "video" && apiData.video ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Video Ad</span>
                      </div>
                    ) : (
                      images.length > 0 && (
                        <Image
                          src={images[currentImageIndex]}
                          alt={apiData.title || "Ad Image"}
                          fill
                          className="object-contain"
                        />
                      )
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="text-center mt-1 text-xs text-gray-500">
                      {currentImageIndex + 1} of {images.length}
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-1 text-gray-900">
                    {apiData.title || "Untitled Ad"}
                  </h2>
                  <p className="text-gray-600 text-xs mb-2">
                    Uploaded: {apiData.uploaded_on ? formatDate(apiData.uploaded_on) : 'Unknown'}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border">
                      {apiData.industry || 'N/A'}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded border">
                      {apiData.ad_type || 'Unknown'}
                    </span>
                  </div>

                  {/* Scores - Compact Grid */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center p-2 border border-gray-200 rounded">
                      <div className="font-semibold text-green-600">{apiData.score_out_of_100 || 0}</div>
                      <div className="text-gray-600">Performance</div>
                    </div>
                    <div className="text-center p-2 border border-gray-200 rounded">
                      <div className="font-semibold text-yellow-600">{apiData.confidence_score || 0}</div>
                      <div className="text-gray-600">Confidence</div>
                    </div>
                    <div className="text-center p-2 border border-gray-200 rounded">
                      <div className="font-semibold text-green-600">{apiData.match_score || 0}</div>
                      <div className="text-gray-600">Match</div>
                    </div>
                    <div className="text-center p-2 border border-gray-200 rounded">
                      <div className="font-semibold text-red-600">{issues.length}</div>
                      <div className="text-gray-600">Issues</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Suitability + Colors - Compact Row */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Platform Suitability</h4>
                  <div className="flex flex-wrap gap-1">
                    {platformSuitability.map((platform) => (
                      <span
                        key={platform.platform}
                        className={`px-2 py-1 rounded text-xs border ${
                          platform.suitable
                            ? "bg-green-100 text-green-800 border-green-300"
                            : platform.warning
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {platform.platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Dominant Colors</h4>
                  <div className="flex flex-wrap gap-1">
                    {safeArray(apiData.dominant_colors).slice(0, 5).map((color, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border border-gray-400"
                          style={{ backgroundColor: String(color).trim() }}
                        />
                        <span className="text-xs text-gray-600">
                          {String(color).trim().substring(0, 7)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Traffic Insights - Compact Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="border border-gray-200 rounded p-2">
                  <h4 className="font-semibold text-gray-700 mb-1">Traffic</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>CTR:</span>
                      <span className="font-medium">{apiData.estimated_ctr || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reach:</span>
                      <span className="font-medium">{apiData.predicted_reach?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2">
                  <h4 className="font-semibold text-gray-700 mb-1">Budget</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="font-medium">{apiData.budget_level || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CPM:</span>
                      <span className="font-medium">{apiData.expected_cpm || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-2">
                  <h4 className="font-semibold text-gray-700 mb-1">Audience</h4>
                  <div className="space-y-1">
                    {safeArray(apiData.top_audience).slice(0, 2).map((audience, idx) => (
                      <span key={idx} className="block px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issues and Suggestions - Side by Side */}
          <div className="grid grid-cols-2 gap-4 avoid-break">
            <div className="border border-gray-300 rounded-lg p-3">
              <h3 className="flex items-center text-sm font-semibold text-red-600 mb-2">
                <Search className="mr-2 h-4 w-4" />
                Issues Detected
              </h3>
              <ul className="space-y-1 text-xs">
                {issues.slice(0, 6).map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-red-500">•</span>
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-gray-300 rounded-lg p-3">
              <h3 className="flex items-center text-sm font-semibold text-blue-600 mb-2">
                <Sparkles className="mr-2 h-4 w-4" />
                Suggestions
              </h3>
              <ul className="space-y-1 text-xs">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-blue-500">•</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Professional Feedback - Page Break */}
          <div className="print-break grid grid-cols-2 gap-4 avoid-break">
            <div className="border border-gray-300 rounded-lg p-3">
              <h3 className="flex items-center text-sm font-semibold text-purple-600 mb-2">
                <Palette className="mr-2 h-4 w-4" />
                Designer Feedback
              </h3>
              <ul className="space-y-1 text-xs">
                {feedbackDesigner.slice(0, 5).map((feedback, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-purple-500">•</span>
                    <span className="text-gray-700">{feedback}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-gray-300 rounded-lg p-3">
              <h3 className="flex items-center text-sm font-semibold text-green-600 mb-2">
                <TrendingUp className="mr-2 h-4 w-4" />
                Marketing Feedback
              </h3>
              <ul className="space-y-1 text-xs">
                {feedbackDigitalMark.slice(0, 5).map((feedback, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-green-500">•</span>
                    <span className="text-gray-700">{feedback}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Metrics - Compact Grid */}
          <div className="avoid-break">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { label: "Engagement", value: apiData.engagement_score || 0 },
                { label: "Viral Potential", value: apiData.viral_potential_score || 0 },
                { label: "Trust Signal", value: apiData.trust_signal_score || 0 },
                { label: "Visual Clarity", value: parseInt(String(apiData.visual_clarity)) || 0 },
                { label: "Logo Visibility", value: apiData.logo_visibility_score || 0 },
                { label: "Text Balance", value: parseInt(String(apiData.text_visual_balance)) || 0 },
                { label: "Color Harmony", value: apiData.color_harmony || 0 },
                { label: "Brand Alignment", value: apiData.brand_alignment || 0 }
              ].map((item, i) => (
                <div key={i} className="border border-gray-200 rounded p-2 text-center">
                  <div className={`font-semibold ${
                    item.value <= 50 ? "text-red-600" : 
                    item.value <= 75 ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {Math.round(item.value)}
                  </div>
                  <div className="text-gray-600 text-xs leading-tight">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Copy Section */}
          <div className="avoid-break">
            <h3 className="flex items-center text-sm font-semibold text-gray-800 mb-3">
              <PenTool className="mr-2 h-4 w-4" />
              Generated Ad Copy
            </h3>
            <div className="space-y-2">
              {filteredAdCopies.slice(0, 3).map((adCopy, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    {adCopy.platform || 'N/A'} | {adCopy.tone || 'N/A'}
                  </div>
                  <p className="text-sm text-gray-800">{adCopy.copy_text || 'No copy text available'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DownloadResultA4;
