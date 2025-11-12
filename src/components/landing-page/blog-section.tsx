"use client"; // If using Next.js App Router

import Image from "next/image";
import Link from "next/link";
import {
  CalendarIcon,
  User2Icon,
  ArrowRightIcon,
  ClockIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/eventTracker"
import { useRouter } from "next/navigation";

export default function BlogSection() {
  const router = useRouter();

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

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://adalyzeai.xyz/App/tapi.php?gofor=blogslist"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Only take the first three posts
        setBlogPosts(data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-16">
          <span className="text-primary text-lg font-semibold uppercase tracking-wide">
            BLOG
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold mt-2 text-white">
            Explore Insights to Advance Your Career
          </h2>
        </div>

        {/* ✅ Loading State */}
        {loading && (
          <></>
        )}

        {/* ❌ Error State */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-400">Error loading blog posts: {error}</p>
            <p className="mt-2 text-gray-300">Please try again later.</p>
          </div>
        )}

        {/* ✅ Blog List */}
        {!loading && !error && blogPosts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div
                  key={post.slug}
                  className=" rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-black"
                >
                  <Link
                    href={`/blogdetail?slug=${post.slug}`}
                    className="block group"
                    onClick={() => {
                      router.push(`/blogdetail?slug=${post.slug}`);
                      trackEvent("LP_Blog_button_clicked", window.location.href);
                    }}
                  >
                    {/* Image Section */}
                    <div className="h-48 relative m-4 rounded-lg overflow-hidden shine-effect">
                      <Image
                        src={post.banner}
                        alt={post.title}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        fill
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute top-3 left-3 z-10">
                        <Badge className="border border-primary bg-black/70 text-primary font-medium px-3 py-1 text-sm rounded-full transition group-hover:bg-primary group-hover:text-white">
                          AI Insights
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
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

            {/* ✅ View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                stiffness: 80,
              }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="flex justify-center mt-10"
            >
              <Link
                href="/blog"
                className="px-6 py-3 rounded-lg bg-primary/90 hover:bg-primary text-white font-medium transition-all flex items-center gap-2 shadow-md"
                onClick={() => {
                  router.push("/blog");
                  trackEvent("LP_Blog_button_clicked", window.location.href);
                }}
              >
                View All
                <ArrowRightIcon size={18} />
              </Link>
            </motion.div>

          </>
        )}

        {/* ❌ Empty State */}
        {!loading && !error && blogPosts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-300">No blog posts found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
