"use client"

import Link from "next/link"
import { ArrowRight, ArrowRightIcon } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { trackEvent } from "@/lib/eventTracker"

export default function CaseStudySection({ category }: { category: string }) {
    const router = useRouter()
    const [caseStudies, setCaseStudies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCaseStudies = async () => {
            try {
                const url = category
                    ? `https://adalyzeai.xyz/App/api.php?gofor=casestudylist&category=${encodeURIComponent(category)}`
                    : `https://adalyzeai.xyz/App/api.php?gofor=casestudylist`;
                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error('Failed to fetch case studies')
                }
                const data = await response.json()
                setCaseStudies(data.slice(0, 3))
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }
        fetchCaseStudies()
    }, [])

    if (loading) return null
    if (error || caseStudies.length === 0) return null

    return (
        <section className="py-18 px-4 max-w-7xl mx-auto">
            {/* Title Animation */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.3 }}
                className="text-center py-2 sm:py-3 mb-20"
            >
                <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2 px-1">
                    Success Stories
                </h2>
                <p className="text-white font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1">Real Results from Real Clients</p>
                <p className="text-sm sm:text-base text-white/80 max-w-xl sm:max-w-2xl mx-auto px-1">
                    Businesses have transformed their advertising with Adalyze AI, achieving higher engagement and measurable wins.
                </p>
            </motion.div>

            {/* Card Grid with Stagger */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                    hidden: {},
                    show: {
                        transition: {
                            staggerChildren: 0.2
                        }
                    }
                }}
            >
                {caseStudies.map((caseStudy) => (
                    <motion.div
                        key={caseStudy.slug}
                        className="bg-[#121212] rounded-lg overflow-hidden shadow-md border border-[#2b2b2b] flex flex-col cursor-pointer"
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            show: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => {
                            router.push(`/case-study-detail?slug=${caseStudy.slug}`);
                            trackEvent("LP_Case_Study_button_clicked", window.location.href);
                        }}
                    >
                        {/* Banner */}
                        <div className="h-40 bg-[#2b2b2b] relative flex items-center justify-center shine-effect">
                            {caseStudy.banner_image_url ? (
                                <Image
                                    src={caseStudy.banner_image_url}
                                    alt={caseStudy.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <p className="font-bold text-primary text-2xl text-center px-4">
                                    {caseStudy.industry}
                                </p>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center mb-4">
                                <div className="bg-[#db4900]/20 text-primary rounded-full px-3 py-1 text-sm font-medium">
                                    {caseStudy.banner_title || caseStudy.kpi_primary_value}
                                </div>
                            </div>
                            <h2 className="text-xl font-bold mb-3 text-white">{caseStudy.title}</h2>
                            <p className="text-gray-300 mb-4 flex-1">
                                {caseStudy.banner_subtitle || caseStudy.outcome}
                            </p>
                            <div className="flex items-center mb-4">
                                <div className="mr-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                                    {caseStudy.client_name
                                        ?.split(" ")
                                        .slice(0, 2)
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{caseStudy.client_name}</p>
                                    <p className="text-sm text-gray-300">{caseStudy.industry}</p>
                                </div>
                            </div>
                            <Link
                                href={`/case-study-detail?slug=${caseStudy.slug}`}
                                className="mt-2 inline-flex items-center text-primary font-medium hover:text-[#db4900]/50"
                            >
                                {caseStudy.banner_cta_label || "Read case study"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

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
                    href="/case-study"
                    className="px-6 py-3 rounded-lg bg-primary/90 hover:bg-primary text-white font-medium transition-all flex items-center gap-2 shadow-md"
                    onClick={() => {
                        router.push("/case-study");
                        trackEvent("LP_Case_Study_button_clicked", window.location.href);
                    }}
                >
                    Read Case Studies & Insights
                    <ArrowRightIcon size={18} />
                </Link>
            </motion.div>

            <motion.div
                className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
            />
        </section>
    )
}
