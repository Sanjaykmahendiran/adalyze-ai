"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react"
import { notFound, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import Image from "next/image"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Spinner from "@/components/overlay"
import { axiosInstance1 } from "@/configs/axios"

// Type definitions
interface CaseStudy {
  cs_id: number
  title: string
  slug: string
  banner_title: string
  client_name: string
  challenge: string
  insight: string
  action_taken: string
  outcome: string
  status: number
  created_at: string
  banner_subtitle: string
  banner_image_url: string
  banner_cta_label: string
  banner_cta_url: string
  industry: string
  platform: string
  region: string
  timeframe: string
  objectives: string
  strategy: string
  results_summary: string
  kpi_primary_label: string
  kpi_primary_value: string
  sidebar_metrics: string
  metrics_json: string
  testimonial_quote: string
  testimonial_name: string
  testimonial_role: string
  read_time_minutes: number
  order_index: number
  thumbnail_url: string
  tags: string
}

interface SidebarMetric {
  value: string
  label: string
}

// Loading component
function LoadingSpinner() {
  return <Spinner />
}

// Error component
function ErrorMessage({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-300 mb-6 text-sm sm:text-base">{message}</p>
        <Link href="/case-studies">
          <Button className="w-full sm:w-auto">Back to Case Studies</Button>
        </Link>
      </div>
    </main>
  )
}

// Main component
export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [otherCaseStudies, setOtherCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Check if this is dashboard view
  const isDashboard = searchParams.get('type') === 'dashboard'

  // Client-side fetch functions
  const fetchAllCaseStudies = () => {
    return axiosInstance1.get("?gofor=casestudylist")
      .then(response => response.data)
      .then(data => data as CaseStudy[])
      .catch(error => {
        console.error("Error fetching case studies:", error)
        return []
      })
  }

  const fetchCaseStudyById = (slug: string) => {
    return axiosInstance1.get(`?gofor=getcasestudy&slug=${slug}`)
      .then(response => response.data)
      .then(data => data as CaseStudy)
      .catch(error => {
        console.error("Error fetching case study:", error)
        return undefined
      })
  }

  useEffect(() => {
    const fetchData = () => {
      setLoading(true)
      setError(null)

      const slug = searchParams.get('slug')

      if (!slug) {
        // If no cs_id in search params, try to find by slug
        fetchAllCaseStudies()
          .then(allStudies => {
            const studyBySlug = allStudies.find(study => study.slug === slug)

            if (studyBySlug) {
              setCaseStudy(studyBySlug)
              setOtherCaseStudies(
                allStudies
                  .filter(study => study.slug !== slug)

              )
            } else {
              setError("Case study not found")
            }
          })
          .catch(error => {
            console.error('Error fetching case study data:', error)
            setError("Failed to load case study")
          })
          .finally(() => setLoading(false))
      } else {
        // Fetch by cs_id from search params
        Promise.all([
          fetchCaseStudyById(slug),
          fetchAllCaseStudies()
        ])
          .then(([studyData, allStudies]) => {
            if (studyData) {
              setCaseStudy(studyData)
              setOtherCaseStudies(
                allStudies
                  .filter(study => study.slug !== slug)
                  .slice(0, 3)
              )
            } else {
              setError("Case study not found")
            }
          })
          .catch(error => {
            console.error('Error fetching case study data:', error)
            setError("Failed to load case study")
          })
          .finally(() => setLoading(false))
      }
    }

    fetchData()
  }, [params.slug, searchParams])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!caseStudy) {
    return <ErrorMessage message="Case study not found" />
  }

  let sidebarMetrics: SidebarMetric[] = []
  try {
    sidebarMetrics = JSON.parse(caseStudy.sidebar_metrics || "[]") as SidebarMetric[]
  } catch (e) {
    console.warn("Failed to parse sidebar metrics:", e)
  }

  let metricsData: Record<string, any> = {}
  try {
    metricsData = JSON.parse(caseStudy.metrics_json || "{}") as Record<string, any>
  } catch (e) {
    console.warn("Failed to parse metrics JSON:", e)
  }

  const bannerUrl = caseStudy.banner_image_url

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-gray-100">
      {/* Conditionally render Header */}
      {!isDashboard && <Header />}

      {/* Hero Banner - Mobile Optimized */}
      <div className={`${!isDashboard ? 'mt-16' : ''} `}>
        {!isDashboard && (
          <div className="relative bg-cover bg-center h-48 sm:h-64 md:h-80 lg:h-96 bg-no-repeat"
            style={{ backgroundImage: `url(${bannerUrl})` }}>
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center relative z-10">
              <div className="text-center text-white max-w-4xl">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight px-2">
                  {caseStudy.title}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section - Mobile First Layout */}
        <div className="bg-[#171717]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {/* Breadcrumbs - Hidden on mobile and dashboard, shown on larger screens */}
            {!isDashboard && (
              <div className="hidden md:flex items-center text-sm text-gray-300 mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span className="mx-2">•</span>
                <Link href="/case-studies" className="hover:text-white transition-colors">
                  Case studies
                </Link>
                <span className="mx-2">•</span>
                <span>{caseStudy.industry}</span>
              </div>
            )}

            {/* Mobile-First Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main content - Mobile First */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  {isDashboard && (
                    <div className="bg-[#3d3d3d] p-2 rounded-full flex-shrink-0">
                      <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {caseStudy.title}
                  </h1>
                </div>

                {/* Client Info - Mobile Optimized */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm text-primary uppercase font-semibold mb-2 sm:mb-3">
                    INSIGHTS FROM
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-white flex items-center justify-center text-sm sm:text-lg font-semibold flex-shrink-0">
                      {caseStudy.client_name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm sm:text-base truncate">
                        {caseStudy.client_name.toUpperCase()}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-300 truncate">
                        {caseStudy.testimonial_role || caseStudy.industry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags Section - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-6 sm:mb-8">
                  {/* Platform + Region */}
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-primary uppercase font-bold mb-2 sm:mb-3">
                      PLATFORM
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-black text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                        {caseStudy.platform}
                      </Badge>
                      <Badge className="bg-black text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                        {caseStudy.region}
                      </Badge>
                    </div>
                  </div>

                  {/* Divider - Hidden on mobile */}
                  <div className="w-px bg-[#3d3d3d] hidden sm:block"></div>

                  {/* Industry + Tags */}
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-primary uppercase font-bold mb-2 sm:mb-3">
                      INDUSTRY
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-black text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                        {caseStudy.industry}
                      </Badge>
                      {caseStudy.tags &&
                        caseStudy.tags.split(",").map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-black text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar card - Mobile First */}
              <div className="bg-black p-4 sm:p-6 rounded-lg rounded-br-[60px] sm:rounded-br-[100px] shadow-sm  order-1 lg:order-2">
                <div className="flex items-center mb-3 sm:mb-4">
                  <p className="font-bold text-xl sm:text-2xl text-white">{caseStudy.industry}</p>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mb-4 leading-relaxed">
                  {caseStudy.results_summary ||
                    "Adalyze AI is a comprehensive advertising optimization platform that makes campaigns more effective, competitive, and dynamic for businesses."}
                </p>
                <div className="space-y-2 text-gray-300">
                  <p className="text-xs sm:text-sm font-medium">
                    <span className="text-gray-400">Platform:</span> {caseStudy.platform}
                  </p>
                  <p className="text-xs sm:text-sm font-medium">
                    <span className="text-gray-400">Region:</span> {caseStudy.region}
                  </p>
                  <p className="text-xs sm:text-sm font-medium">
                    <span className="text-gray-400">Timeframe:</span> {caseStudy.timeframe}
                  </p>
                  {caseStudy.read_time_minutes && (
                    <p className="text-xs sm:text-sm font-medium">
                      <span className="text-gray-400">Read time:</span> {caseStudy.read_time_minutes} min
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized Layout */}
      <div className="bg-[#0d0d0d] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Mobile Results Section - Shows first on mobile */}
            <div className="lg:hidden bg-[#1a1a1a] p-4 sm:p-6 rounded-lg border border-[#2b2b2b] mt-6 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Key Results:</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{caseStudy.kpi_primary_value}</p>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1">{caseStudy.kpi_primary_label}</p>
                </div>
                {sidebarMetrics.slice(0, 1).map((metric, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{metric.value}</p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1">{metric.label}</p>
                  </div>
                ))}
              </div>
              {sidebarMetrics.length > 1 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {sidebarMetrics.slice(1).map((metric, index) => (
                    <div key={index + 1} className="text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-primary">{metric.value}</p>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Sidebar Results - Hidden on mobile */}
            <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start h-fit pt-16">
              <h2 className="text-xl font-semibold mb-6 text-white">Key Results:</h2>
              <div className="space-y-8">
                <div>
                  <p className="text-4xl xl:text-5xl font-bold text-primary">{caseStudy.kpi_primary_value}</p>
                  <p className="text-sm text-gray-300 mt-2">{caseStudy.kpi_primary_label}</p>
                </div>
                {sidebarMetrics.map((metric, index) => (
                  <div key={index} className="space-y-3">
                    <p className="text-4xl xl:text-5xl font-bold text-primary">{metric.value}</p>
                    <p className="text-sm text-gray-300">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Column - Mobile Optimized */}
            <div className="lg:col-span-2 pt-6 lg:pt-16">
              <div className="text-gray-300 space-y-6 sm:space-y-8">
                <p className="text-sm sm:text-base leading-relaxed">
                  We worked with {caseStudy.client_name} in the {caseStudy.industry.toLowerCase()} industry to
                  optimize their {caseStudy.platform.toLowerCase()} campaigns.
                </p>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">The Challenge</h2>
                  <p className="text-sm sm:text-base leading-relaxed">{caseStudy.challenge}</p>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">The Insight</h2>
                  <p className="text-sm sm:text-base leading-relaxed">{caseStudy.insight}</p>
                </div>

                {/* Testimonial - Mobile Optimized */}
                {caseStudy.testimonial_quote && (
                  <div className="border-l-4 border-[#3d3d3d] pl-4 sm:pl-6 italic text-gray-300 bg-black p-4 sm:p-6 rounded-r-lg">
                    <p className="text-sm sm:text-base leading-relaxed">&quot;{caseStudy.testimonial_quote}&quot;</p>
                    <p className="mt-3 text-xs sm:text-sm font-medium">
                      — {caseStudy.testimonial_name}, {caseStudy.testimonial_role}
                    </p>
                  </div>
                )}

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">The Solution</h2>
                  <p className="text-sm sm:text-base leading-relaxed">{caseStudy.action_taken}</p>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">The Results</h2>
                  <p className="text-sm sm:text-base leading-relaxed">{caseStudy.outcome}</p>
                </div>

                {/* Mobile-Responsive Table */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Campaign Overview</h3>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#3d3d3d]">
                        <thead className="bg-[#171717] text-gray-300">
                          <tr>
                            <th className="py-2 sm:py-3 px-3 sm:px-4 text-left text-xs sm:text-sm font-semibold">
                              Metric
                            </th>
                            <th className="py-2 sm:py-3 px-3 sm:px-4 text-left text-xs sm:text-sm font-semibold">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-xs sm:text-sm">
                          <tr className="bg-[#171717]">
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d] font-medium">
                              Industry
                            </td>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d]">
                              {caseStudy.industry}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d] font-medium">
                              Platform
                            </td>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d]">
                              {caseStudy.platform}
                            </td>
                          </tr>
                          <tr className="bg-[#121212]">
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d] font-medium">
                              Region
                            </td>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d]">
                              {caseStudy.region}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d] font-medium">
                              Timeframe
                            </td>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d]">
                              {caseStudy.timeframe}
                            </td>
                          </tr>
                          <tr className="bg-[#121212]">
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d] font-medium">
                              Objectives
                            </td>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d]">
                              {caseStudy.objectives}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d] font-medium">
                              Strategy
                            </td>
                            <td className="py-2 sm:py-3 px-3 sm:px-4 border-t border-[#3d3d3d]">
                              {caseStudy.strategy}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Results Summary - Mobile Optimized */}
                <div className="border-l-4 border-blue-600 bg-black p-4 sm:p-6 rounded-r-lg">
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{caseStudy.results_summary}</p>
                  <p className="mt-3 text-gray-300 text-xs sm:text-sm">
                    — {caseStudy.testimonial_name}, {caseStudy.testimonial_role}
                  </p>
                </div>
                {isDashboard && (
                  <div className="mb-10" />
                )}
                {/* CTA Section - Mobile Optimized */}
                {!isDashboard && (
                  <div className="bg-black p-4 sm:p-6 rounded-lg shadow-sm  mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
                      Want Similar Results?
                    </h3>
                    <p className="mb-4 sm:mb-6 text-gray-300 text-sm sm:text-base">
                      Take your first step toward optimizing your campaigns.
                    </p>
                    <Link href="/register">
                      <Button className="w-full sm:w-auto text-white rounded-lg px-6 py-3 font-medium text-sm sm:text-base">
                        Try Adalyze AI Now
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Case Studies - Mobile Responsive Grid */}
        {isDashboard && otherCaseStudies.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-primary">More customer stories</h2>
              <Link href="/case-study" className="text-sm text-gray-300 flex items-center hover:text-white transition-colors">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* 70% - 30% Layout in same row */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 items-stretch">
              {/* All case studies with horizontal overflow - 70% width */}
              <div className="w-full lg:w-[70%] overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 sm:gap-6 pb-4 h-full ">
                  {otherCaseStudies.map((study) => (
                    <article
                      key={study.slug}
                      className="bg-[#121212] rounded-lg overflow-hidden shadow-md border border-[#2b2b2b] flex flex-col hover:border-[#3d3d3d] transition-colors w-120  flex-shrink-0 "
                    >
                      {/* Banner Image - Fixed Height */}
                      <div className="h-32 sm:h-40 bg-[#2b2b2b] relative flex items-center justify-center flex-shrink-0">
                        {study.banner_image_url ? (
                          <Image
                            src={study.banner_image_url}
                            alt={study.title}
                            fill
                            className="object-cover"
                            sizes="320px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <p className="font-bold text-primary text-lg sm:text-2xl text-center px-4">
                            {study.industry}
                          </p>
                        )}
                      </div>

                      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                        <div className="flex-1">
                          {/* Banner title */}
                          <div className="flex items-center mb-3 sm:mb-4">
                            <div className="bg-[#db4900]/20 text-primary rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
                              {study.banner_title}
                            </div>
                          </div>

                          {/* Case study title & description */}
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 text-white leading-tight line-clamp-2">
                            {study.title}
                          </h3>
                          <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed line-clamp-3">
                            {study.banner_subtitle}
                          </p>
                        </div>

                        <div className="mt-auto">
                          {/* Client info - Mobile Optimized */}
                          <div className="flex items-center mb-3 sm:mb-4">
                            <div className="mr-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                              {study.client_name
                                .split(" ")
                                .slice(0, 2)
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white text-sm sm:text-base truncate">
                                {study.client_name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-300 truncate">
                                {study.industry}
                              </p>
                            </div>
                          </div>

                          {/* CTA - Touch Friendly */}
                          <Link
                            href={`/case-study-detail?slug=${study.slug}`}
                            className="inline-flex items-center text-primary font-medium hover:text-[#db4900]/70 transition-colors text-sm sm:text-base group"
                          >
                            {study.banner_cta_label || "Read case study"}{" "}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Fixed third card with static content - 30% width */}
              <div className="w-full lg:w-[30%]">
                <article className="bg-[#121212] rounded-lg overflow-hidden shadow-md border border-[#2b2b2b] flex flex-col hover:border-[#3d3d3d] transition-colors h-[500px] sm:h-[520px] lg:h-[540px]">
                  {/* Static Banner - Fixed Height */}
                  <div className="h-32 sm:h-40 bg-gradient-to-r from-[#db4900] to-[#ff6b35] relative flex items-center justify-center flex-shrink-0">
                    <p className="font-bold text-white text-lg sm:text-2xl text-center px-4">
                      Success Stories
                    </p>
                  </div>

                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                    <div className="flex-1">
                      {/* Static Banner title */}
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="bg-[#db4900]/20 text-primary rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
                          Featured
                        </div>
                      </div>

                      {/* Static title & description */}
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 text-white leading-tight">
                        Explore More Success Stories
                      </h3>
                      <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                        Discover how our solutions have transformed businesses across various industries and helped them achieve remarkable growth.
                      </p>
                    </div>

                    <div className="mt-auto">
                      <Button
                        onClick={() => router.push(isDashboard ? "/upload" : "/register")}
                        className="inline-flex items-center font-medium transition-colors text-sm sm:text-base group"
                      >
                        {isDashboard ? "Upload Your Ad" : "Register Now"}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>


                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isDashboard && (
        <LandingPageFooter />
      )}
    </main>
  )
}
