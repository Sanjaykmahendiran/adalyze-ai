"use client"

import { AnimatedTestimonials } from "@/components/landing-page/animated-testimonials"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type TestimonialType = {
  quote: string
  name: string
  designation: string
  src: string
  category: string
}

export default function Testimonials({ category }: { category: string }) {
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([])
  const [filteredTestimonials, setFilteredTestimonials] = useState<TestimonialType[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const url = category
          ? `https://adalyzeai.xyz/App/api.php?gofor=testilist&category=${encodeURIComponent(category)}`
          : `https://adalyzeai.xyz/App/api.php?gofor=testilist`;
        const response = await fetch(url)
        const data = await response.json()

        const formatted: TestimonialType[] = data
          .filter((item: any) => item.status === 1)
          .map((item: any) => ({
            quote: item.content,
            name: item.name,
            designation: item.company ? `${item.role} at ${item.company}` : item.role,
            src: item.imgname,
            category: item.category
          }))

        setTestimonials(formatted)
        setFilteredTestimonials(formatted)

        // Extract unique categories
        const uniqueCategories = ["All", ...Array.from(new Set(formatted.map(item => item.category)))]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching testimonials:", error)
      }
    }

    fetchTestimonials()
  }, [])

  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredTestimonials(testimonials)
    } else {
      setFilteredTestimonials(testimonials.filter(testimonial => testimonial.category === activeCategory))
    }
  }, [activeCategory, testimonials])

  if (testimonials.length === 0) return null

  return (
    <div className="text-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.3 }}
        className="text-center py-2 sm:py-3"
      >
        <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2">
          Why Marketers Trust Adalyze AI
        </h2>
        <p className="text-white font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1">Real Stories, Real Results</p>
        <p className="text-sm sm:text-base text-white/80 max-w-lg sm:max-w-xl mx-auto mt-2">
          Marketers and business owners rely on Adalyze AI to make smarter ad decisions, boost engagement, and improve ROI.
        </p>
      </motion.div>

      {/* Category Filter */}
      {!category && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                activeCategory === category
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>
      )}

      {/* Testimonials */}
      <AnimatedTestimonials testimonials={filteredTestimonials} />

      <motion.div
        className="max-w-screen-xl mx-auto border-t border-[#db4900]/40 mt-12 sm:mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
    </div>
  )
}
