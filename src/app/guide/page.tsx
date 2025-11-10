"use client"

import { useState, useEffect } from "react"
import {
  Target, Facebook, Instagram, MessageCircle, Play,
  CheckCircle, XCircle, BookOpen, Lightbulb, AlertCircle,
  Search, Calculator, Shield, Youtube, Linkedin, Printer
} from "lucide-react"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import UserLayout from "@/components/layouts/user-layout"
import GuideLoadingSkeleton from "@/components/Skeleton-loading/guideloading"
import { SiGoogle } from "react-icons/si"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import NoDataFound from "@/components/no-data-found"

// Color system
const colors = {
  // Backgrounds
  bg: {
    main: "bg-[#171717]",
    card: "bg-black",
    section: "bg-black",
    input: "bg-[#171717]",
  },
  // Primary orange gradient
  primary: "bg-gradient-to-b from-[#ff6a00] via-[#db4900] to-[#a63a00]",
  // Borders
  border: {
    focus: "border-orange-500",
  },
  // Text colors  
  text: {
    primary: "text-white",
    secondary: "text-gray-300",
    muted: "text-gray-400",
  }
}

// Type definitions (keeping your existing interfaces)
interface Guide {
  guide_id: number
  title: string
  slug: string
  type: 'glossary' | 'tip' | 'tutorial' | 'checklist' | 'troubleshooter' | 'formula' | 'policy'
  platform: string
  goal: string
  read_time_sec: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  summary: string
  body_md: string
  media_url: string | null
  checklist_json: string | null
  troubleshoot_for: string | null
  status: number
  created_at: string
  updated_at: string
}

const scoreBreakdown = [
  { category: "Visual Appeal", weight: 25, description: "Color harmony, composition, and overall aesthetics" },
  { category: "Text Readability", weight: 20, description: "Font choice, size, contrast, and hierarchy" },
  { category: "CTA Effectiveness", weight: 20, description: "Clarity, placement, and urgency of call-to-action" },
  { category: "Platform Fit", weight: 15, description: "Adherence to platform-specific best practices" },
  { category: "Emotional Impact", weight: 10, description: "Ability to evoke desired emotional response" },
  { category: "Brand Consistency", weight: 10, description: "Alignment with brand guidelines and identity" },
]

// Platform and type mappings (keeping your existing ones)
const platformIcons: Record<string, React.ComponentType<any>> = {
  facebook: Facebook, instagram: Instagram, whatsapp: MessageCircle,
  google: SiGoogle, universal: Target, youtube: Youtube,
  linkedin: Linkedin, print: Printer,
}

const typeIcons: Record<string, React.ComponentType<any>> = {
  glossary: BookOpen, tip: Lightbulb, tutorial: Play,
  checklist: CheckCircle, troubleshooter: AlertCircle,
  formula: Calculator, policy: Shield,
}

// Fixed difficulty styles with proper contrast
const difficultyStyles = {
  beginner: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  advanced: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
}

export default function GuidePage() {
  const { userDetails } = useFetchUserDetails()
  const [activeTab, setActiveTab] = useState("all")
  const [activeType, setActiveType] = useState("all")
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Your existing useEffect and filtering logic...
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/guideslist')
        const guidesData = await response.json() as Guide[]
        setGuides(guidesData.filter(guide => guide.status === 1))
      } catch (err) {
        setError('Failed to load guides. Please try again later.')
        console.error('Error fetching guides:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredGuides = guides.filter(guide => {
    const matchesType = activeType === "all" || guide.type === activeType
    const matchesPlatform = activeTab === "all" || guide.platform === activeTab
    const matchesSearch = searchTerm === "" ||
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesType && matchesPlatform && matchesSearch
  })

  const platforms = ["all", ...Array.from(new Set(guides.map(g => g.platform)))]
  const types = ["all", ...Array.from(new Set(guides.map(g => g.type)))]

  const formatReadTime = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} min read`
  }

  // Updated render function with consistent colors
  const renderGuideCard = (guide: Guide) => {
    const TypeIcon = typeIcons[guide.type] || BookOpen
    const PlatformIcon = platformIcons[guide.platform] || Target

    const baseCardClasses = `${colors.bg.card} rounded-lg p-4 sm:p-6 shadow-lg shadow-white/5  hover:scale-[1.02] transition-all duration-300 cursor-pointer`

    // Type-specific color schemes
    const typeStyles = {
      glossary: {
        bg: "bg-indigo-500/20",
        text: "text-indigo-400",
        contentBg: "bg-indigo-500/10 border border-indigo-500/20",
        contentText: "text-indigo-100"
      },
      tip: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        contentBg: "bg-yellow-500/10 border border-yellow-500/20",
        contentText: "text-yellow-100"
      },
      tutorial: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        contentBg: "bg-green-500/10 border border-green-500/20",
        contentText: "text-green-100"
      },
      checklist: {
        bg: "bg-sky-500/20",
        text: "text-sky-400",
        contentBg: "bg-sky-500/10 border border-sky-500/20",
        contentText: "text-sky-100"
      },
      troubleshooter: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        contentBg: "bg-red-500/10 border border-red-500/20",
        contentText: "text-red-100"
      },
      formula: {
        bg: "bg-cyan-500/20",
        text: "text-cyan-400",
        contentBg: "bg-cyan-500/10 border border-cyan-500/20",
        contentText: "text-cyan-100"
      },
      policy: {
        bg: "bg-gray-500/20",
        text: "text-gray-300",
        contentBg: "bg-gray-500/10 border border-gray-500/20",
        contentText: "text-gray-200"
      },
    }


    const style = typeStyles[guide.type as keyof typeof typeStyles] || typeStyles.glossary

    return (
      <div key={guide.guide_id} className={`${baseCardClasses} `}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center`}>
              <TypeIcon className={`w-4 h-4 ${style.text}`} />
            </div>
            <span className={`text-xs px-2 py-1 ${style.bg} ${style.text} rounded-full capitalize`}>
              {guide.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyStyles[guide.difficulty]}`}>
              {guide.difficulty}
            </span>
            <PlatformIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-gray-300">{guide.title}</h3>
        <p className="text-sm text-white/80 mb-3 line-clamp-2">{guide.summary}</p>

        {guide.body_md && (
          <div className={`${style.contentBg} rounded-lg p-3 mb-3`}>
            <p className={`text-xs ${style.contentText} whitespace-pre-wrap line-clamp-4`}>
              {guide.body_md}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="capitalize">{guide.platform}</span>
          <span>{formatReadTime(guide.read_time_sec)}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Content</h2>
            <p className="text-gray-300">{error}</p>
            <button
              className={`mt-4 px-4 py-2 ${colors.primary} text-white rounded-lg hover:opacity-90 transition-opacity`}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserLayout userDetails={userDetails}>
      {loading ? <GuideLoadingSkeleton /> : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white/80">Ad Creation Guide</h1>
            <p className="text-gray-300 text-sm sm:text-base">Learn best practices and understand how our AI scoring works</p>
          </div>

          {/* Search and Filters */}
          <div className={`mb-8 ${colors.bg.section} rounded-xl p-6 shadow-xl`}>
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Search - 60% */}
              <div className="w-full lg:w-3/5">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search guides, topics, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-2 ${colors.bg.input} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20`}
                  />
                </div>
              </div>

              {/* Filters Container - 40% */}
              <div className="w-full lg:w-2/5 flex gap-4">
                {/* Type Filter */}
                <div className="flex-1">
                  <label className="text-sm font-semibold mb-2 block text-white">
                    Content Type
                  </label>
                  <Select value={activeType} onValueChange={(value) => setActiveType(value)}>
                    <SelectTrigger className={`w-full ${colors.bg.input} text-white py-5`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Platform Filter */}
                <div className="flex-1">
                  <label className="text-sm font-semibold mb-2 block text-white">
                    Platform
                  </label>
                  <Select value={activeTab} onValueChange={(value) => setActiveTab(value)}>
                    <SelectTrigger className={`w-full ${colors.bg.input} text-white  py-5`}>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => {
                        const PlatformIcon = platformIcons[platform] || Target
                        return (
                          <SelectItem key={platform} value={platform} className="flex items-center gap-2">
                            {platform !== "all" && <PlatformIcon className="w-4 h-4 text-gray-400" />}
                            {platform === "all" ? "All Platforms" : platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>


          {/* Guides Grid */}
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                {filteredGuides.length} Guide{filteredGuides.length !== 1 ? 's' : ''}
                {activeType !== 'all' && ` - ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
                {activeTab !== 'all' && ` for ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </h2>
            </div>

            {filteredGuides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredGuides.map(renderGuideCard)}
              </div>
            ) : (
                <NoDataFound 
                title={"No guides found"}
                description={"Try adjusting your filters or search term"}/>
            )}
          </section>

          {/* AI Scoring Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-primary">How Our AI Scoring Works</h2>
            <div className={`${colors.bg.card} rounded-lg p-4 sm:p-6 mb-6`}>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                Our AI analyzes your ads across multiple dimensions to provide a comprehensive score out of 100. Here's how
                each category contributes to your final score:
              </p>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {scoreBreakdown.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 bg-[#171717] rounded-lg shadow-lg shadow-white/5 hover:scale-[1.01] transition-all duration-300 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold mb-1 text-sm sm:text-base text-gray-300">{item.category}</h3>
                      <span className="px-3 py-1 bg-primary rounded-full text-xs sm:text-sm self-start text-gray-300">
                        {item.weight}%
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 break-words">{item.description}</p>

                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      )}
    </UserLayout>
  )
}
