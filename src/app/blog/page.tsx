"use client"

import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, User2Icon, ArrowRightIcon, ClockIcon, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Spinner from "@/components/overlay"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"

interface BlogPost {
  blogs_id: number
  title: string
  slug: string
  banner: string
  outline: string
  content: string
  reading_time: string
  key_takeaways: string
  status: number
  created_at: string
}

export default function Blogs() {
  const router = useRouter()
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const isDashboard = searchParams.get("type") === "dashboard"

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          "https://adalyzeai.xyz/App/tapi.php?gofor=blogslist"
        )
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        const data = await response.json()
        setBlogPosts(data)
      } catch (err) {
        console.error("Error fetching blog posts:", err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <>
    <div className="min-h-screen max-w-7xl mx-auto pt-10 pb-20">
      {!isDashboard && <Header />}

      <div
        className={` flex flex-col items-center px-4 ${
          !isDashboard ? "py-36" : "pt-8 pb-8"
        }`}
      >
        {/* Heading Section */}
        <div
          className={`mb-8 sm:mb-16 w-full flex items-center ${
            isDashboard ? "justify-start" : "justify-center"
          }`}
        >
          {isDashboard && (
            <div
              className="bg-[#3d3d3d] p-2 rounded-full cursor-pointer mr-4 flex-shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft />
            </div>
          )}
          <h2
            className={`text-2xl sm:text-4xl font-bold text-white ${
              isDashboard ? "text-left" : "text-center"
            }`}
          >
            Insights and Tips for AI-Powered Advertising
          </h2>
        </div>

        {/* Loading */}
        {loading && <Spinner />}

        {/* Error */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-400">Error loading blog posts: {error}</p>
            <p className="mt-2 text-gray-300">Please try again later.</p>
          </div>
        )}
 
        {/* Blog Posts Grid */}
        {!loading && !error && (
          <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div
                key={post.slug}
                className="border border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-black"
              >
                <Link href={`/blogdetail?slug=${post.slug}`}>
                  <div className="h-48 relative m-6 rounded-lg overflow-hidden shine-effect">
                    <Image
                      src={post.banner}
                      alt={post.title}
                      className="object-cover"
                      fill
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="border border-primary bg-black/70 font-thin text-primary px-3 py-1 text-sm hover:bg-primary hover:text-white rounded-full transition">
                        AI Insights
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4 text-sm text-gray-300 mb-3 flex-wrap">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <User2Icon size={14} className="text-primary" />
                          <span>Admin</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon size={14} className="text-primary" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon size={14} className="text-primary" />
                        <span>{post.reading_time}</span>
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold text-white hover:text-primary mb-3 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {post.outline}
                    </p>
                    <div className="flex items-center text-primary">
                      <span className="text-sm font-medium mr-2">Read more</span>
                      <ArrowRightIcon size={16} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* No posts */}
        {!loading && !error && blogPosts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-300">No blog posts found.</p>
          </div>
        )}
      </div>

    </div>
    {!isDashboard && <LandingPageFooter />}
    </>
  )
}
