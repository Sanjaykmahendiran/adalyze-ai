"use client"

import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, User2Icon, ArrowRightIcon, ClockIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"
import Spinner from "@/components/overlay"

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
            cache: 'no-store' // For dynamic data
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
    const searchParams = useSearchParams()
    const [blogData, setBlogData] = useState<BlogPost | null>(null)
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBlogData = async () => {
            try {
                setLoading(true)
                const blogId = searchParams.get('blogs_id')

                if (!blogId) {
                    setError("Blog ID not provided")
                    return
                }

                // Fetch the specific blog post
                const blogPost = await getBlogPostById(blogId)

                if (!blogPost) {
                    setError("Blog post not found")
                    return
                }

                setBlogData(blogPost)

                // Fetch all blog posts for related posts
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
        return (
            <Spinner />
        )
    }

    if (error || !blogData) {
        notFound()
    }

    const bannerUrl = blogData.banner;

    return (
        <div className="min-h-screen ">
            <Header />
            <div className="mt-16 pt-18">
                <div className="relative bg-cover bg-center h-50 bg-no-repeat bg-fixed" style={{ backgroundImage: `url(${bannerUrl})` }}>
                    <div className="absolute inset-0 bg-black/70"></div>
                    <div className="container text-center text-white relative z-10 py-16 flex flex-col items-center justify-center">
                        <h3 className="text-3xl font-bold">{blogData.title}</h3>
                    </div>
                </div>

                <div className="container py-12 text-gray-300">
                    <div className="max-w-4xl mx-auto">
                        <article>
                            <div className="text-lg">
                                <div className="flex space-x-4 text-gray-300 mb-6">
                                    <span>{formatDate(blogData.created_at)}</span>
                                    <span>Admin</span>
                                    <span>{blogData.reading_time}</span>
                                </div>
                                <h1 className="text-3xl font-bold mb-4 text-primary">{blogData.title}</h1>
                                {blogData.outline && (
                                    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border-l-4 border-primary">
                                        <h2 className="text-xl font-semibold mb-2 text-white">Overview</h2>
                                        <p className="text-gray-300">{blogData.outline}</p>
                                    </div>
                                )}
                                <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: blogData.content }}></div>
                                {blogData.key_takeaways && (
                                    <div className="mt-8 p-4 bg-[#111827] rounded-lg border-l-4 border-blue-500">
                                        <h2 className="text-xl font-semibold mb-2 text-blue-400">Key Takeaways</h2>
                                        <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: blogData.key_takeaways }}></div>
                                    </div>
                                )}
                            </div>
                        </article>
                    </div>
                    <div className="max-w-7xl mx-auto">
                        {relatedPosts.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-2xl font-bold mb-6 text-white">Related Posts</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {relatedPosts.map((post) => (
                                        <div
                                            key={post.blogs_id}
                                            className="border border-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-[#1a1a1a]"
                                        >
                                            <Link href={`/blogdetail?blogs_id=${post.blogs_id}`}>
                                                <div className="h-48 relative m-6 rounded-lg overflow-hidden shine-effect">
                                                    <Image
                                                        src={post.banner}
                                                        alt={post.title}
                                                        className="object-cover"
                                                        fill
                                                    />
                                                    <div className="absolute top-4 left-4 z-10">
                                                        <Badge className="border border-primary bg-black/70 text-primary px-3 py-1 text-sm hover:bg-primary hover:text-white rounded-full transition">
                                                            AI Insights
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    {/* Meta Info */}
                                                    <div className="flex items-center justify-between text-sm text-gray-300 mb-3 flex-wrap">
                                                        <div className="flex items-center gap-3">
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
                                                            <span>{post.reading_time} read</span>
                                                        </div>
                                                    </div>

                                                    {/* Title */}
                                                    <h2 className="text-lg font-semibold text-white group-hover:text-primary mb-3 transition-colors leading-tight">
                                                        {post.title}
                                                    </h2>

                                                    {/* Outline */}
                                                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                                        {post.outline}
                                                    </p>

                                                    {/* Read More CTA */}
                                                    <div className="flex items-center text-primary group-hover:text-primary/70 transition-colors">
                                                        <span className="text-sm font-medium mr-2">
                                                            Read More
                                                        </span>
                                                        <ArrowRightIcon
                                                            size={16}
                                                            className="group-hover:translate-x-1 transition-transform duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <LandingPageFooter />
        </div>
    );
}
