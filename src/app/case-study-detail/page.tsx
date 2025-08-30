"use client"

import Link from "next/link"
import { ArrowRight, ArrowUp } from "lucide-react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import Image from "next/image"
import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Spinner from "@/components/overlay"

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
    <main className="min-h-screen bg-[#0d0d0d] text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-300">{message}</p>
        <Link href="/case-studies" className="mt-4 inline-block">
          <Button>Back to Case Studies</Button>
        </Link>
      </div>
    </main>
  )
}

// Main component
export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)
  const [otherCaseStudies, setOtherCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Client-side fetch functions
  const fetchAllCaseStudies = () => {
    return fetch("https://adalyzeai.xyz/App/api.php?gofor=casestudylist", {
      cache: 'no-store'
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch case studies")
        return response.json()
      })
      .then(data => data as CaseStudy[])
      .catch(error => {
        console.error("Error fetching case studies:", error)
        return []
      })
  }

  const fetchCaseStudyById = (csId: string) => {
    return fetch(
      `https://adalyzeai.xyz/App/api.php?gofor=getcasestudy&cs_id=${csId}`,
      { cache: 'no-store' }
    )
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch case study")
        return response.json()
      })
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

      const csId = searchParams.get('cs_id')

      if (!csId) {
        // If no cs_id in search params, try to find by slug
        fetchAllCaseStudies()
          .then(allStudies => {
            const studyBySlug = allStudies.find(study => study.slug === params.slug)

            if (studyBySlug) {
              setCaseStudy(studyBySlug)
              setOtherCaseStudies(
                allStudies
                  .filter(study => study.cs_id !== studyBySlug.cs_id)
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
      } else {
        // Fetch by cs_id from search params
        Promise.all([
          fetchCaseStudyById(csId),
          fetchAllCaseStudies()
        ])
          .then(([studyData, allStudies]) => {
            if (studyData) {
              setCaseStudy(studyData)
              setOtherCaseStudies(
                allStudies
                  .filter(study => study.cs_id !== studyData.cs_id)
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
      <Header />
      <div className="mt-16 pt-18">
        <div className="relative bg-cover bg-center h-50 bg-no-repeat bg-fixed" style={{ backgroundImage: `url(${bannerUrl})` }}>
          <div className="absolute inset-0 bg-black/70"></div>
          <div className="container text-center text-white relative z-10 py-16 flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold">{caseStudy.title}</h3>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-[#121212]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8 py-10 w-full">
            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center text-sm text-gray-300 mb-6 px-4 md:px-0">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">•</span>
              <Link href="/case-studies" className="hover:text-white">
                Case studies
              </Link>
              <span className="mx-2">•</span>
              <span>{caseStudy.industry}</span>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0">
              {/* Main content */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold text-white mb-8">{caseStudy.title}</h1>

                <div className="flex items-center mb-8">
                  <div>
                    <p className="text-sm text-primary uppercase font-semibold mb-1">INSIGHTS FROM</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                        {caseStudy.client_name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{caseStudy.client_name.toUpperCase()}</p>
                        <p className="text-sm text-gray-300">{caseStudy.testimonial_role || caseStudy.industry}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 mb-8">
                  {/* Platform + Region */}
                  <div className="pt-4 flex-1">
                    <p className="text-sm text-primary uppercase font-bold mb-2">PLATFORM</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#1f2937] text-primary text-sm font-semibold px-3 py-1 rounded-full">
                        {caseStudy.platform}
                      </Badge>
                      <Badge className="bg-[#1f2937] text-primary text-sm font-semibold px-3 py-1 rounded-full">
                        {caseStudy.region}
                      </Badge>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-gray-700 hidden sm:block"></div>

                  {/* Industry + Tags */}
                  <div className="pt-4 flex-1">
                    <p className="text-sm text-primary uppercase font-bold mb-2">INDUSTRY</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#1f2937] text-primary text-sm font-semibold px-3 py-1 rounded-full">
                        {caseStudy.industry}
                      </Badge>
                      {caseStudy.tags &&
                        caseStudy.tags.split(",").map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-[#1f2937] text-primary text-sm font-semibold px-3 py-1 rounded-full"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar card */}
              <div className="bg-[#1a1a1a] p-6 rounded-lg rounded-br-[100px] shadow-sm space-y-4 border border-[#2b2b2b]">
                <div className="flex items-center">
                  <p className="font-bold text-2xl text-white">{caseStudy.industry}</p>
                </div>
                <p className="text-sm text-gray-300">
                  {caseStudy.results_summary ||
                    "Adalyze AI is a comprehensive advertising optimization platform that makes campaigns more effective, competitive, and dynamic for businesses."}
                </p>
                <div className="space-y-2 text-gray-300">
                  <p className="text-sm font-medium">Platform: {caseStudy.platform}</p>
                  <p className="text-sm font-medium">Region: {caseStudy.region}</p>
                  <p className="text-sm font-medium">Timeframe: {caseStudy.timeframe}</p>
                  {caseStudy.read_time_minutes && (
                    <p className="text-sm font-medium">Read time: {caseStudy.read_time_minutes} min</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#0d0d0d] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar Results */}
            <div className="md:sticky md:top-8 md:self-start h-fit pt-16">
              <h2 className="text-xl font-semibold mb-6 text-white">Key Results:</h2>
              <div className="space-y-8">
                <div>
                  <p className="text-5xl font-bold text-primary">{caseStudy.kpi_primary_value}</p>
                  <p className="text-sm text-gray-300">{caseStudy.kpi_primary_label}</p>
                </div>
                {sidebarMetrics.map((metric, index) => (
                  <div key={index} className="space-y-3">
                    <p className="text-5xl font-bold text-primary">{metric.value}</p>
                    <p className="text-sm text-gray-300">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 pt-16 min-h-screen">
              <div className="overflow-y-auto text-gray-300">
                <p className="mb-6">
                  We worked with {caseStudy.client_name} in the {caseStudy.industry.toLowerCase()} industry to
                  optimize their {caseStudy.platform.toLowerCase()} campaigns.
                </p>

                <h2 className="text-2xl font-semibold mb-4 text-white">The Challenge</h2>
                <p className="mb-4">{caseStudy.challenge}</p>

                <h2 className="text-2xl font-semibold mb-4 text-white">The Insight</h2>
                <p className="mb-6">{caseStudy.insight}</p>

                {caseStudy.testimonial_quote && (
                  <div className="border-l-4 border-gray-600 pl-4 italic text-gray-300 mb-8">
                    <p>&quot;{caseStudy.testimonial_quote}&quot;</p>
                    <p className="mt-2">
                      — {caseStudy.testimonial_name}, {caseStudy.testimonial_role}
                    </p>
                  </div>
                )}

                <h2 className="text-2xl font-semibold mb-4 text-white">The Solution</h2>
                <p className="mb-6">{caseStudy.action_taken}</p>

                <h2 className="text-2xl font-semibold mb-4 text-white">The Results</h2>
                <p className="mb-6">{caseStudy.outcome}</p>

                {/* Table */}
                <h3 className="text-xl font-semibold mb-4 text-white">Campaign Overview</h3>
                <div className="overflow-x-auto mb-8">
                  <table className="min-w-full bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
                    <thead className="bg-[#2a2a2a] text-gray-300">
                      <tr>
                        <th className="py-3 px-4 text-left">Metric</th>
                        <th className="py-3 px-4 text-left">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[#121212]">
                        <td className="py-3 px-4 border-t border-gray-700">Industry</td>
                        <td className="py-3 px-4 border-t border-gray-700">{caseStudy.industry}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 border-t border-gray-700">Platform</td>
                        <td className="py-3 px-4 border-t border-gray-700">{caseStudy.platform}</td>
                      </tr>
                      <tr className="bg-[#121212]">
                        <td className="py-3 px-4 border-t border-gray-700">Region</td>
                        <td className="py-3 px-4 border-t border-gray-700">{caseStudy.region}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 border-t border-gray-700">Timeframe</td>
                        <td className="py-3 px-4 border-t border-gray-700">{caseStudy.timeframe}</td>
                      </tr>
                      <tr className="bg-[#121212]">
                        <td className="py-3 px-4 border-t border-gray-700">Objectives</td>
                        <td className="py-3 px-4 border-t border-gray-700">{caseStudy.objectives}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 border-t border-gray-700">Strategy</td>
                        <td className="py-3 px-4 border-t border-gray-700">{caseStudy.strategy}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-l-4 border-blue-600 bg-[#1a1a1a] p-4 mb-8 rounded">
                  <p className="text-gray-200">{caseStudy.results_summary}</p>
                  <p className="mt-2 text-gray-300">
                    — {caseStudy.testimonial_name}, {caseStudy.testimonial_role}
                  </p>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-sm border border-gray-800 mb-12">
                  <h3 className="text-xl font-semibold mb-4 text-white">Want Similar Results?</h3>
                  <p className="mb-4 text-gray-300">Take your first step toward optimizing your campaigns.</p>
                  <Link href="/register">
                    <Button className="text-white rounded-lg px-6 py-3 font-medium">
                      Try Adalyze AI Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More case studies */}
        {otherCaseStudies.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">More customer stories</h2>
              <Link href="/case-study" className="text-sm text-gray-300 flex items-center hover:text-white">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherCaseStudies.map((study) => (
                <div
                  key={study.cs_id}
                  className="bg-[#121212] rounded-lg overflow-hidden shadow-md border border-[#2b2b2b] flex flex-col"
                >
                  {/* Banner Image */}
                  <div className="h-40 bg-[#2b2b2b] relative flex items-center justify-center">
                    {study.banner_image_url ? (
                      <Image
                        src={study.banner_image_url}
                        alt={study.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <p className="font-bold text-primary text-2xl text-center px-4">
                        {study.industry}
                      </p>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Banner title */}
                    <div className="flex items-center mb-4">
                      <div className="bg-[#db4900]/20 text-primary rounded-full px-3 py-1 text-sm font-medium">
                        {study.banner_title}
                      </div>
                    </div>

                    {/* Case study title & description */}
                    <h2 className="text-xl font-bold mb-3 text-white">{study.title}</h2>
                    <p className="text-gray-300 mb-4 flex-1">{study.banner_subtitle}</p>

                    {/* Client info */}
                    <div className="flex items-center mb-4">
                      <div className="mr-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                        {study.client_name
                          .split(" ")
                          .slice(0, 2)
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{study.client_name}</p>
                        <p className="text-sm text-gray-300">{study.industry}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/case-study-detail?cs_id=${study.cs_id}`}
                      className="mt-2 inline-flex items-center text-primary font-medium hover:text-[#db4900]/50"
                    >
                      {study.banner_cta_label || "Read case study"}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LandingPageFooter />
    </main>
  )
}
