"use client"

import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, User2Icon, ArrowRightIcon, ClockIcon, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { notFound, useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import Spinner from "@/components/overlay"
import { Button } from "@/components/ui/button"

interface BlogPost {
    blogs_id: number;
    title: string;
    slug: string;
    banner: string;
    outline: string;
    content: string;
    reading_time: string;
    key_takeaways: string;
    status: number;
    created_at: string;
}

async function getBlogPostById(blogId: string): Promise<BlogPost | null> {
    try {
        const response = await fetch(`https://adalyzeai.xyz/App/api.php?gofor=getblog&blogs_id=${blogId}`, {
            cache: 'no-store'
        })
        if (!response.ok) throw new Error("Failed to fetch blog post")
        return (await response.json()) as BlogPost
    } catch (error) {
        console.error("Error fetching blog post:", error)
        return null
    }
}

async function getAllBlogPosts(): Promise<BlogPost[]> {
    try {
        const response = await fetch("https://adalyzeai.xyz/App/api.php?gofor=blogslist", {
            cache: 'no-store'
        })
        if (!response.ok) throw new Error("Failed to fetch blog posts")
        return (await response.json()) as BlogPost[]
    } catch (error) {
        console.error("Error fetching blog posts:", error)
        return []
    }
}

export default function BlogPost() {
    const router = useRouter();
    const searchParams = useSearchParams()
    const [blogData, setBlogData] = useState<BlogPost | null>(null)
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isDashboard = searchParams.get('type') === 'dashboard'

    useEffect(() => {
        const fetchBlogData = async () => {
            try {
                setLoading(true)
                const blogId = searchParams.get('blogs_id')

                if (!blogId) {
                    setError("Blog ID not provided")
                    return
                }

                const blogPost = await getBlogPostById(blogId)

                if (!blogPost) {
                    setError("Blog post not found")
                    return
                }

                setBlogData(blogPost)

                const allPosts = await getAllBlogPosts()
                const related = allPosts
                    .filter(post => post.blogs_id !== parseInt(blogId))
                    .slice(0, 3)

                setRelatedPosts(related)
            } catch (err) {
                setError("Failed to load blog post")
                console.error("Error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchBlogData()
    }, [searchParams])

    const formatDate = (dateString: string | number | Date) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return <Spinner />
    }

    if (error || !blogData) {
        notFound()
    }

    const bannerUrl = blogData.banner;

    return (
        <div className="min-h-screen bg-black">
            {!isDashboard && <Header />}

            {/* Hero Banner Section - Mobile Optimized */}
            <div className={`${!isDashboard ? 'mt-16' : 'pt-4 sm:pt-8'} `}>
                {!isDashboard && (
                    <div className="relative bg-cover bg-center h-48 sm:h-64 md:h-80 lg:h-96 bg-no-repeat"
                        style={{ backgroundImage: `url(${bannerUrl})` }}>
                        <div className="absolute inset-0 bg-black/70"></div>
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center relative z-10">
                            <div className="text-center text-white max-w-4xl">
                                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight px-4">
                                    {blogData.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Section - Mobile First */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 text-gray-300">
                    <div className="max-w-4xl mx-auto">
                        <article className="space-y-6 sm:space-y-8">


                            {/* Meta Information - Mobile Optimized */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-400 pb-4 border-b border-[#3d3d3d]">
                                <div className="flex items-center gap-4 ">
                                    {isDashboard && (
                                        <div className="bg-[#3d3d3d] p-2 rounded-full flex-shrink-0">
                                            <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon size={16} className="text-primary" />
                                        <span>{formatDate(blogData.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User2Icon size={16} className="text-primary" />
                                        <span>Admin</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ClockIcon size={16} className="text-primary" />
                                        <span>{blogData.reading_time}</span>
                                    </div>
                                </div>
                            </div>


                            {/* Article Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight mb-4">
                                {blogData.title}
                            </h1>

                            {/* Banner Image below title */}
                            {isDashboard && (
                                <div className="w-full h-40 sm:h-52 md:h-64 relative rounded-md overflow-hidden">
                                    <Image
                                        src={blogData.banner}
                                        alt={blogData.title}
                                        fill
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            {/* Overview Section - Enhanced Mobile Layout */}
                            {blogData.outline && (
                                <div className="p-4 sm:p-6 bg-[#171717] rounded-lg border-l-4 border-primary">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Overview
                                    </h2>
                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                        {blogData.outline}
                                    </p>
                                </div>
                            )}

                            {/* Main Content - Mobile Optimized Typography */}
                            <div className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-300 
                                          prose-headings:text-white prose-headings:font-semibold
                                          prose-p:leading-relaxed prose-p:mb-4
                                          prose-img:rounded-lg prose-img:shadow-lg
                                          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                          prose-strong:text-white prose-strong:font-semibold
                                          prose-ul:space-y-2 prose-ol:space-y-2
                                          prose-li:leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: blogData.content }}>
                            </div>

                            {/* Key Takeaways - Enhanced Mobile Design */}
                            {blogData.key_takeaways && (
                                <div className="mt-8 p-4 sm:p-6 bg-[#111827] rounded-lg border-l-4 border-blue-500">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-3 text-blue-400 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        Key Takeaways
                                    </h2>
                                    <div className="text-gray-300 text-sm sm:text-base leading-relaxed 
                                                  prose prose-invert prose-sm sm:prose-base max-w-none
                                                  prose-ul:space-y-2 prose-li:leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: blogData.key_takeaways }}>
                                    </div>
                                </div>
                            )}
                        </article>
                    </div>

                    {/* Related Posts Section - Fully Responsive Grid */}
                    {isDashboard && relatedPosts.length > 0 && (
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
                                <h2 className="text-xl sm:text-2xl font-semibold text-primary">Related Posts</h2>
                                <Link href="/blog" className="text-sm text-gray-300 flex items-center hover:text-white transition-colors">
                                    View all <ArrowRightIcon className="h-4 w-4 ml-1" />
                                </Link>
                            </div>

                            {/* 70% - 30% Layout in same row */}
                            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 items-stretch">
                                {/* All related posts with horizontal overflow - 70% width */}
                                <div className="w-full lg:w-[70%] overflow-x-auto scrollbar-hide">
                                    <div className="flex gap-4 sm:gap-6 pb-4 h-full">
                                        {relatedPosts.map((post) => (
                                            <article
                                                key={post.blogs_id}
                                                className="bg-[#171717] border border-[#3d3d3d] rounded-xl overflow-hidden 
                       shadow-lg hover:shadow-xl hover:border-gray-700 
                       transition-all duration-300 hover:transform hover:-translate-y-1
                       w-80 flex-shrink-0 flex flex-col"
                                            >
                                                <Link href={`/blogdetail?blogs_id=${post.blogs_id}`} className="block h-full">
                                                    {/* Image Container - Fixed Height */}
                                                    <div className="relative h-32 sm:h-40 m-4 sm:m-6 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={post.banner}
                                                            alt={post.title}
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            fill
                                                            sizes="320px"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                        <div className="absolute top-3 left-3">
                                                            <Badge className="border border-primary bg-black/80 text-primary text-xs 
                                   px-2 py-1 hover:bg-primary hover:text-white 
                                   rounded-full transition-colors">
                                                                AI Insights
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Content Section - Enhanced Mobile Layout */}
                                                    <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
                                                        <div className="flex-1">
                                                            {/* Meta Info - Mobile Optimized */}
                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 mb-3">
                                                                <div className="flex items-center gap-1">
                                                                    <User2Icon size={12} className="text-primary" />
                                                                    <span>Admin</span>
                                                                </div>
                                                                <span className="text-gray-600">•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarIcon size={12} className="text-primary" />
                                                                    <span>{formatDate(post.created_at)}</span>
                                                                </div>
                                                                <span className="text-gray-600">•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <ClockIcon size={12} className="text-primary" />
                                                                    <span>{post.reading_time}</span>
                                                                </div>
                                                            </div>

                                                            {/* Title - Mobile Typography */}
                                                            <h3 className="text-base sm:text-lg font-semibold text-white 
                                 group-hover:text-primary transition-colors 
                                 leading-tight line-clamp-2 mb-2">
                                                                {post.title}
                                                            </h3>

                                                            {/* Excerpt - Mobile Optimized */}
                                                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3">
                                                                {post.outline}
                                                            </p>
                                                        </div>

                                                        {/* CTA - Touch Friendly */}
                                                        <div className="mt-auto">
                                                            <div className="flex items-center text-primary group-hover:text-primary/80 
                                  transition-colors text-sm font-medium">
                                                                <span className="mr-2">Read Article</span>
                                                                <ArrowRightIcon
                                                                    size={16}
                                                                    className="group-hover:translate-x-1 transition-transform duration-200"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </article>
                                        ))}
                                    </div>
                                </div>

                                {/* Fixed third card with static content - 30% width */}
                                <div className="w-full lg:w-[30%]">
                                    <article className="bg-[#171717] border border-[#3d3d3d] rounded-xl overflow-hidden 
                          shadow-lg hover:shadow-xl hover:border-gray-700 
                          transition-all duration-300 hover:transform hover:-translate-y-1
                          h-[500px] sm:h-[520px] lg:h-[540px] flex flex-col">
                                        {/* Static Banner - Fixed Height */}
                                        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary to-primary/80 relative flex items-center justify-center flex-shrink-0 m-4 sm:m-6 rounded-lg">
                                            <p className="font-bold text-white text-lg sm:text-2xl text-center px-4">
                                                Latest Insights
                                            </p>
                                        </div>

                                        <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between">
                                            <div className="flex-1">
                                                {/* Static Banner title */}
                                                <div className="flex items-center mb-3 sm:mb-4">
                                                    <div className="bg-primary/20 text-primary rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
                                                        Featured
                                                    </div>
                                                </div>

                                                {/* Static title & description */}
                                                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 text-white leading-tight">
                                                    Discover More AI Insights
                                                </h3>
                                                <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                                                    Explore our comprehensive collection of AI-powered insights and stay ahead with the latest trends in technology and innovation.
                                                </p>
                                            </div>

                                            <div className="mt-auto">
                                                <Button
                                                    onClick={() => router.push(isDashboard ? "/blog" : "/register")}
                                                    className="inline-flex items-center font-medium transition-colors text-sm sm:text-base group w-full justify-center"
                                                >
                                                    {isDashboard ? "View All Posts" : "Get Started"}
                                                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {!isDashboard && <LandingPageFooter />}
        </div>
    );
}
