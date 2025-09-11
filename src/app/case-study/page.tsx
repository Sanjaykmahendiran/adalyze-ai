// app/case-studies/page.tsx
'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"

interface CaseStudy {
  cs_id: string
  slug: string
  title: string
  banner_title: string
  banner_subtitle: string
  banner_image_url: string
  client_name: string
  industry: string
  banner_cta_label: string
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCaseStudies = () => {
      fetch('https://adalyzeai.xyz/App/api.php?gofor=casestudylist')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch case studies')
          }
          return response.json()
        })
        .then(data => {
          setCaseStudies(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Error fetching case studies:', error)
          setError('Failed to load case studies')
          setLoading(false)
        })
    }

    fetchCaseStudies()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-36">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-[#2b2b2b] rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-[#2b2b2b] rounded w-96 mx-auto mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#121212] rounded-lg p-6 h-96">
                    <div className="h-40 bg-[#2b2b2b] rounded mb-4"></div>
                    <div className="h-4 bg-[#2b2b2b] rounded w-20 mb-2"></div>
                    <div className="h-6 bg-[#2b2b2b] rounded w-full mb-3"></div>
                    <div className="h-4 bg-[#2b2b2b] rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <LandingPageFooter />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-36">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:text-[#db4900]/50"
            >
              Try Again
            </button>
          </div>
        </div>
        <LandingPageFooter />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-34">
        <div className="flex items-center text-sm text-gray-200 mb-6">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <span className="mx-2">•</span>
          <span className="text-primary">Case studies</span>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">Case Studies</h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Discover how Adalyze AI is transforming advertising and helping brands succeed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <div
              key={study.slug || study.cs_id}
              className="bg-[#121212] rounded-lg overflow-hidden shadow-md border border-[#2b2b2b] flex flex-col"
            >
              <div className="h-40 bg-[#2b2b2b] relative flex items-center justify-center shine-effect">
                {study.banner_image_url ? (
                  <Image
                    src={study.banner_image_url}
                    alt={study.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <p className="font-bold text-primary text-2xl text-center px-4">
                    {study.industry}
                  </p>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="bg-[#db4900]/20 text-primary rounded-full px-3 py-1 text-sm font-medium">
                    {study.banner_title}
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">{study.title}</h2>
                <p className="text-gray-300 mb-4 flex-1">{study.banner_subtitle}</p>
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

        {caseStudies.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-300">No case studies available at the moment.</p>
          </div>
        )}
      </div>
      <LandingPageFooter />
    </main>
  )
}
