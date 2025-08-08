"use client"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  PenTool,
  GitCompareArrows,
  Volume2,
  Eye,
  Clock,
  TrendingUp,
  Users,
  Target,
  Zap,
  BarChart3,
  Heart,
  Share2,
  Camera,
  Brain,
  Award,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"

// Static data for video analysis results
const staticVideoData = {
  ad_id: 12345,
  title: "Fashion Brand Summer Collection Ad",
  video_url: "/placeholder.svg?height=400&width=225&text=Video+Preview",
  uploaded_on: "2024-01-15T10:30:00Z",
  industry: "Fashion & Retail",
  video_length: "32s",

  // AI Analysis Results
  ad_summary:
    "A vibrant 32-second fashion ad showcasing summer collection with upbeat music, quick cuts, and strong brand presence. Features diverse models in outdoor settings with clear product focus and compelling call-to-action.",

  // Core Metrics (0-100)
  clarity_score: "87",
  emotional_appeal_score: "92",
  cta_effectiveness: "78",
  headline_score: "85",
  demographic_relevance: "89",

  // Video-Specific Metrics
  audio_quality: "Excellent",
  hook_effectiveness: "Strong",
  brand_visibility: "High",
  retention_rate: "82%",
  completion_rate: "68%",
  engagement_prediction: "91",

  // AI Analysis - What Matches
  matching_elements: [
    "Target audience alignment (18-35 female demographic)",
    "Brand colors consistent throughout video",
    "Music tempo matches product energy",
    "Visual style fits fashion industry standards",
    "Call-to-action timing is optimal (28s mark)",
    "Product showcase duration is appropriate",
    "Lighting quality enhances product appeal",
  ],

  // AI Analysis - What Doesn't Match
  non_matching_elements: [
    "Text overlay duration too short for mobile viewing",
    "Brand logo appears too late in the sequence",
    "Some scenes lack sufficient contrast for accessibility",
    "Pacing slightly fast for older demographic segments",
    "Missing captions for audio-off viewing",
  ],

  // Platform Suitability
  platform_suits: ["Instagram Reels", "TikTok", "YouTube Shorts"],
  platform_notsuits: ["LinkedIn", "Twitter"],

  // AI Suggestions for Better Performance
  suggestions: [
    "Increase text overlay duration to 3-4 seconds for better readability on mobile devices",
    "Move brand logo appearance to within first 5 seconds to improve brand recall",
    "Add subtle background music fade during voiceover sections",
    "Include captions or text overlays for key product benefits",
    "Optimize thumbnail with high-contrast product image",
    "Consider adding user-generated content clips for authenticity",
    "Implement color grading to enhance visual consistency",
  ],

  // Recommended Changes for Better Performance
  recommended_changes: [
    "Restructure opening hook - lead with strongest visual within first 3 seconds",
    "Reduce scene transition speed by 15% for better comprehension",
    "Add price point or offer mention in the first 10 seconds",
    "Include more close-up product shots for detail visibility",
    "Strengthen call-to-action with urgency elements (limited time, exclusive)",
    "Add social proof elements (reviews, ratings, testimonials)",
    "Optimize aspect ratio variants for different platforms",
  ],

  // Performance Predictions
  predicted_metrics: {
    click_through_rate: "3.2%",
    conversion_rate: "2.8%",
    cost_per_click: "$0.45",
    reach_potential: "High",
    viral_potential: "Medium-High",
  },

  // Tone Analysis
  tone: "Energetic & Aspirational",
  is_ad_successful: "Yes",

  // Generated Ad Copies
  ad_copies: [
    {
      platform: "Instagram Reels",
      tone: "Energetic",
      copy_text:
        "✨ Summer vibes are HERE! Discover our latest collection that's taking over feeds everywhere. Swipe up to shop the look that everyone's talking about! #SummerStyle #Fashion #OOTD",
    },
    {
      platform: "TikTok",
      tone: "Trendy",
      copy_text:
        "POV: You found the perfect summer wardrobe 🔥 This collection is giving main character energy! Which piece is your fave? Drop a 💖 if you're obsessed! #SummerFashion #MainCharacter",
    },
    {
      platform: "YouTube Shorts",
      tone: "Friendly",
      copy_text:
        "Hey fashion lovers! Ready to upgrade your summer style? Our new collection combines comfort with trendy designs. Perfect for beach days, city strolls, or date nights! Shop now ➡️",
    },
    {
      platform: "Facebook",
      tone: "Professional",
      copy_text:
        "Introducing our Summer 2024 Collection - where style meets comfort. Carefully curated pieces for the modern woman. Free shipping on orders over $75. Shop the collection today!",
    },
  ],
}

// AI Analysis Categories - What the AI looks for
const aiAnalysisCategories = [
  {
    category: "Visual Elements",
    icon: Eye,
    checks: [
      { item: "Color scheme consistency", status: "match", score: 92 },
      { item: "Brand visual identity", status: "match", score: 88 },
      { item: "Product visibility", status: "match", score: 85 },
      { item: "Scene composition", status: "partial", score: 76 },
      { item: "Lighting quality", status: "match", score: 90 },
    ],
  },
  {
    category: "Audio Analysis",
    icon: Volume2,
    checks: [
      { item: "Music genre alignment", status: "match", score: 94 },
      { item: "Audio quality", status: "match", score: 89 },
      { item: "Voiceover clarity", status: "match", score: 87 },
      { item: "Sound effects timing", status: "partial", score: 72 },
      { item: "Audio-visual sync", status: "match", score: 91 },
    ],
  },
  {
    category: "Content Structure",
    icon: BarChart3,
    checks: [
      { item: "Hook effectiveness (0-3s)", status: "match", score: 88 },
      { item: "Story progression", status: "match", score: 85 },
      { item: "CTA placement", status: "partial", score: 78 },
      { item: "Information hierarchy", status: "match", score: 82 },
      { item: "Pacing optimization", status: "no-match", score: 65 },
    ],
  },
  {
    category: "Target Audience",
    icon: Users,
    checks: [
      { item: "Age group alignment", status: "match", score: 89 },
      { item: "Gender targeting", status: "match", score: 92 },
      { item: "Interest matching", status: "match", score: 87 },
      { item: "Cultural relevance", status: "match", score: 84 },
      { item: "Lifestyle alignment", status: "partial", score: 79 },
    ],
  },
  {
    category: "Platform Optimization",
    icon: Target,
    checks: [
      { item: "Aspect ratio suitability", status: "match", score: 95 },
      { item: "Duration optimization", status: "match", score: 88 },
      { item: "Mobile-first design", status: "partial", score: 76 },
      { item: "Platform-specific features", status: "no-match", score: 62 },
      { item: "Thumbnail optimization", status: "match", score: 83 },
    ],
  },
  {
    category: "Engagement Factors",
    icon: Heart,
    checks: [
      { item: "Emotional triggers", status: "match", score: 92 },
      { item: "Visual appeal", status: "match", score: 89 },
      { item: "Shareability elements", status: "partial", score: 74 },
      { item: "Comment-worthy moments", status: "match", score: 86 },
      { item: "Trend incorporation", status: "partial", score: 71 },
    ],
  },
]

export default function VideoResultsPage() {
  const { userDetails } = useFetchUserDetails()
  const router = useRouter()
  const [selectedTone, setSelectedTone] = useState("energetic")
  const [isPlaying, setIsPlaying] = useState(false)
  const isProUser = userDetails?.payment_status === 1
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectPadding, setAspectPadding] = useState("56.25%"); // fallback 16:9

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      if (videoWidth && videoHeight) {
        setAspectPadding(`${(videoHeight / videoWidth) * 100}%`);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  // Helper function to get platform suitability
  const getPlatformSuitability = () => {
    const suitable = staticVideoData.platform_suits.map((platform) => ({
      platform,
      suitable: true,
      warning: false,
    }))

    const notSuitable = staticVideoData.platform_notsuits.map((platform) => ({
      platform,
      suitable: false,
      warning: true,
    }))

    return [...suitable, ...notSuitable]
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Helper function to get filtered ad copies
  const getFilteredAdCopies = () => {
    if (!isProUser) {
      return staticVideoData.ad_copies.slice(0, 1)
    }
    if (selectedTone === "energetic") {
      return staticVideoData.ad_copies
    }
    return staticVideoData.ad_copies.filter((copy) => copy.tone.toLowerCase().includes(selectedTone.toLowerCase()))
  }

  // Calculate overall score
  const calculateOverallScore = () => {
    const clarity = Number.parseInt(staticVideoData.clarity_score)
    const emotional = Number.parseInt(staticVideoData.emotional_appeal_score)
    const cta = Number.parseInt(staticVideoData.cta_effectiveness)
    const headline = Number.parseInt(staticVideoData.headline_score)
    const demographic = Number.parseInt(staticVideoData.demographic_relevance)

    return Math.round((clarity + emotional + cta + headline + demographic) / 5)
  }

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
  )

  const platformSuitability = getPlatformSuitability()
  const filteredAdCopies = getFilteredAdCopies()
  const overallScore = calculateOverallScore()

  return (
    <UserLayout userDetails={userDetails}>
      <div className="min-h-screen text-white">
        <main className="container mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Video Analysis Results</h1>
            <p className="text-gray-400">AI-powered insights for your video ad creative</p>
          </div>

          <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Video Overview Card */}
            <div className="bg-black  rounded-3xl shadow-lg shadow-white/5 border-none">
              <div className="p-8">
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                  {/* Video Preview Section */}
                  <div className="lg:col-span-1">
                    <div
                      className="relative overflow-hidden rounded-2xl bg-[#121212] border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                      style={{ paddingTop: aspectPadding }}
                    >
                      <video
                        ref={(el) => (videoRef.current = el)}
                        src={staticVideoData.video_url}
                        poster="/placeholder.svg?height=400&width=225&text=Video+Preview"
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        onLoadedMetadata={onLoadedMetadata}
                        onEnded={handleEnded}
                        playsInline
                        muted={false}
                        controls={false}
                        preload="metadata"
                      />

                      {!isPlaying && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                          onClick={() => setIsPlaying(true)}
                        >
                          <Play
                            className="w-16 h-16 text-white/80 hover:scale-110 transition-transform"
                          />
                        </div>
                      )}

                      {!staticVideoData.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                          <div className="text-center">
                            <Camera className="w-16 h-16 text-white/60 mx-auto mb-4" />
                            <p className="text-white/80 font-medium">
                              Fashion Summer Collection
                            </p>
                            <p className="text-white/60 text-sm">32 seconds</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Basic Info and Score Section */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{staticVideoData.title}</h2>
                      <p className="text-gray-400 mb-4">Uploaded on: {formatDate(staticVideoData.uploaded_on)}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30">
                          Industry: {staticVideoData.industry}
                        </Badge>
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30">
                          <Clock className="w-3 h-3 mr-1" />
                          {staticVideoData.video_length}
                        </Badge>
                        <Badge className="bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30">
                          <Award className="w-3 h-3 mr-1" />
                          High Performance
                        </Badge>
                      </div>
                    </div>

                    {/* Score Section */}
                    <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold">AI Performance Score</h3>
                        <div className="text-4xl font-bold text-green-400">{overallScore}/100</div>
                      </div>

                      {/* Platform Suitability */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-gray-300">Platform Suitability</h4>
                        <div className="flex flex-wrap gap-3">
                          {platformSuitability.map((platform) => (
                            <Badge
                              key={platform.platform}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ${platform.suitable
                                  ? "bg-green-600/20 text-green-400 border-green-600/30"
                                  : "bg-red-600/20 text-red-400 border-red-600/30"
                                }`}
                            >
                              {platform.suitable ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              {platform.platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Summary */}
                <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                  <h4 className="text-lg font-semibold mb-3 text-gray-300 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Video Analysis Summary
                  </h4>
                  <p className="text-gray-300 leading-relaxed">{staticVideoData.ad_summary}</p>
                </div>
              </div>
            </div>

            {/* Performance Predictions */}
            <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#121212]">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <BarChart3 className="mr-3 h-6 w-6 text-blue-400" />
                  Performance Predictions
                  {!isProUser && (
                    <Badge className="ml-3 bg-blue-600/20 text-blue-400 border-blue-600/30">Pro Feature</Badge>
                  )}
                </h3>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Video Quality Metrics */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-gray-300">Quality Analysis</h4>
                    <ProOverlay message="🔐 Upgrade to Pro to see detailed predictions">
                      <div className="space-y-4">
                        {[
                          { label: "Visual Clarity", value: Number.parseInt(staticVideoData.clarity_score), icon: Eye },
                          {
                            label: "Emotional Appeal",
                            value: Number.parseInt(staticVideoData.emotional_appeal_score),
                            icon: Heart,
                          },
                          {
                            label: "CTA Effectiveness",
                            value: Number.parseInt(staticVideoData.cta_effectiveness),
                            icon: Target,
                          },
                          {
                            label: "Headline Impact",
                            value: Number.parseInt(staticVideoData.headline_score),
                            icon: Zap,
                          },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <item.icon className="w-4 h-4 mr-2 text-blue-400" />
                                <span className="text-gray-300">{item.label}</span>
                              </div>
                              <span className="font-semibold">{item.value}/100</span>
                            </div>
                            <Progress value={item.value} className="h-2 bg-gray-800" />
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300 mt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-300">Predicted Performance</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Click-Through Rate</span>
                            <span className="font-bold text-green-400">
                              {staticVideoData.predicted_metrics.click_through_rate}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Conversion Rate</span>
                            <span className="font-bold text-blue-400">
                              {staticVideoData.predicted_metrics.conversion_rate}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Cost Per Click</span>
                            <span className="font-bold text-purple-400">
                              {staticVideoData.predicted_metrics.cost_per_click}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ProOverlay>
                  </div>

                  {/* Engagement Predictions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">Engagement Score</span>
                      <span className="text-3xl font-bold text-blue-400">
                        {staticVideoData.engagement_prediction}/100
                      </span>
                    </div>
                    <Progress
                      value={Number.parseInt(staticVideoData.engagement_prediction)}
                      className="h-3 mb-6 bg-gray-800"
                    />

                    <ProOverlay message="🔐 Unlock detailed engagement analytics">
                      <div className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                        <h4 className="text-lg font-semibold mb-4 text-gray-300">Video Metrics</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-green-400" />
                              <span className="text-gray-400">Retention Rate</span>
                            </div>
                            <span className="font-bold text-green-400">{staticVideoData.retention_rate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-blue-400" />
                              <span className="text-gray-400">Completion Rate</span>
                            </div>
                            <span className="font-bold text-blue-400">{staticVideoData.completion_rate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Share2 className="w-4 h-4 mr-2 text-purple-400" />
                              <span className="text-gray-400">Viral Potential</span>
                            </div>
                            <span className="font-bold text-purple-400">
                              {staticVideoData.predicted_metrics.viral_potential}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ProOverlay>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Analysis Breakdown */}
            <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#121212]">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Brain className="mr-3 h-6 w-6 text-blue-400" />
                  What Our AI Analyzed
                  {!isProUser && (
                    <Badge className="ml-3 bg-blue-600/20 text-blue-400 border-blue-600/30">Pro Feature</Badge>
                  )}
                </h3>

                <ProOverlay message="🔐 Upgrade to Pro to see detailed AI analysis breakdown">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {aiAnalysisCategories.map((category, index) => (
                      <div
                        key={index}
                        className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                      >
                        <h4 className="text-lg font-semibold mb-4 text-gray-300 flex items-center">
                          <category.icon className="w-5 h-5 mr-2 text-blue-400" />
                          {category.category}
                        </h4>
                        <div className="space-y-3">
                          {category.checks.map((check, checkIndex) => (
                            <div key={checkIndex} className="flex items-center justify-between">
                              <div className="flex items-center">
                                {check.status === "match" ? (
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                ) : check.status === "partial" ? (
                                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 mr-2 text-red-400" />
                                )}
                                <span className="text-gray-300 text-sm">{check.item}</span>
                              </div>
                              <span
                                className={`text-sm font-semibold ${check.score >= 85
                                    ? "text-green-400"
                                    : check.score >= 70
                                      ? "text-amber-400"
                                      : "text-red-400"
                                  }`}
                              >
                                {check.score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ProOverlay>
              </div>
            </div>

            {/* What Matches vs What Doesn't */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* What Matches */}
              <div className="bg-black border border-[#121212] rounded-2xl shadow-lg shadow-white/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <div className="p-6">
                  <h3 className="flex items-center text-xl font-semibold text-green-400 mb-4">
                    <CheckCircle className="mr-3 h-5 w-5" />✅ What's Working Well
                  </h3>
                  <ul className="space-y-3">
                    {staticVideoData.matching_elements.map((element, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-green-400 text-lg">•</span>
                        <span>{element}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* What Doesn't Match */}
              <div className="bg-black border border-[#121212] rounded-2xl shadow-lg shadow-white/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <div className="p-6">
                  <h3 className="flex items-center text-xl font-semibold text-amber-400 mb-4">
                    <AlertTriangle className="mr-3 h-5 w-5" />
                    ⚠️ Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {staticVideoData.non_matching_elements.map((element, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-amber-400 text-lg">•</span>
                        <span>{element}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Suggestions and Recommended Changes */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* AI Suggestions */}
              <div className="bg-black border border-[#121212] rounded-2xl shadow-lg shadow-white/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <div className="p-6">
                  <h3 className="flex items-center text-xl font-semibold text-blue-400 mb-4">
                    <Sparkles className="mr-3 h-5 w-5" />💡 AI Suggestions
                  </h3>
                  <ul className="space-y-3">
                    {staticVideoData.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-blue-400 text-lg">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Changes */}
              <div className="bg-black border border-[#121212] rounded-2xl shadow-lg shadow-white/5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <div className="p-6">
                  <h3 className="flex items-center text-xl font-semibold text-purple-400 mb-4">
                    <TrendingUp className="mr-3 h-5 w-5" />🚀 Priority Changes
                  </h3>
                  <ol className="space-y-3">
                    {staticVideoData.recommended_changes.map((change, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="mr-3 text-purple-400 font-semibold">{index + 1}.</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>


            {/* AI-Generated Video Copy Section */}
            <div className="bg-black rounded-3xl shadow-lg shadow-white/5 border border-[#121212]">
              <div className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <h3 className="text-2xl font-bold flex items-center">
                    <PenTool className="mr-3 h-6 w-6 text-primary" />
                    AI-Generated Video Copy
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tone Selector {!isProUser && <span className="text-blue-400">(Pro Only)</span>}
                    </label>
                    <Select value={selectedTone} onValueChange={setSelectedTone} disabled={!isProUser}>
                      <SelectTrigger className="w-48 bg-[#121212] border-gray-700">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-gray-700">
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="trendy">Trendy</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="md:w-[70%] w-full space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300">Generated Video Scripts</h4>
                      <div className="space-y-4">
                        {filteredAdCopies.map((adCopy, index) => (
                          <div
                            key={index}
                            className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm text-gray-400">
                                {adCopy.platform} | {adCopy.tone}
                              </span>
                              <Sparkles className="w-4 h-4 text-green-400" />
                            </div>
                            <p className="text-white font-medium">{adCopy.copy_text}</p>
                          </div>
                        ))}
                      </div>

                      {!isProUser && staticVideoData.ad_copies.length > 1 && (
                        <ProOverlay message="🔐 Pro users see all video script variations">
                          <div className="space-y-4">
                            {staticVideoData.ad_copies.slice(1).map((adCopy, index) => (
                              <div
                                key={index + 1}
                                className="bg-[#121212] rounded-2xl p-6 border border-[#121212] hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <span className="text-sm text-gray-400">
                                    {adCopy.platform} | {adCopy.tone}
                                  </span>
                                  <span className="text-orange-400">🔥</span>
                                </div>
                                <p className="text-white font-medium">{adCopy.copy_text}</p>
                              </div>
                            ))}
                          </div>
                        </ProOverlay>
                      )}

                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          className="bg-transparent border-green-600 text-green-400 hover:bg-green-600/20 w-full md:w-auto"
                          disabled={!isProUser}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Scripts
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-[30%] mt-10 w-full bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#222] rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center text-white mb-1">
                        <GitCompareArrows className="w-5 h-5 mr-2 text-primary" />
                        <h4 className="text-lg font-semibold">Video A/B Testing</h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        Compare different versions of your video ads side-by-side. Test various hooks, CTAs, and
                        creative elements to optimize performance across platforms.
                      </p>
                    </div>
                    <div className="mt-6">
                      <Button
                        className="w-full text-white font-semibold rounded-xl py-2 transition duration-200"
                        disabled={!isProUser}
                        onClick={() => router.push("/ab-test")}
                      >
                        <GitCompareArrows className="w-4 h-4 mr-2" />
                        Compare Videos
                      </Button>
                      {!isProUser && (
                        <p className="mt-2 text-xs text-gray-400 text-center">
                          Unlock with Pro to access video comparison.
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
                Analyze Another Video
              </Button>
            </div>
          </div>
        </main>
      </div>
    </UserLayout>
  )
}
