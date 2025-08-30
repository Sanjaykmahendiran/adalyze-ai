"use client"

import { AnimatedTestimonials } from "@/components/landing-page/animated-testimonials"
import { motion } from "framer-motion"
import image1 from "@/assets/testimonial-1.jpg"
import image2 from "@/assets/testimonial-2.jpg"
import image3 from "@/assets/testimonial-3.jpg"
import image4 from "@/assets/testimonial-4.jpg"
import image5 from "@/assets/testimonial-5.jpg"

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Adalyze’s AI-driven insights have completely transformed the way we analyze and optimize our ad campaigns. This is exactly the intelligence we’ve been looking for.",
      name: "Sarah Chen",
      designation: "Product Manager at TechFlow",
      src: image1.src,
    },
    {
      quote:
        "Implementation was seamless and the ad performance improvements exceeded our expectations. Adalyze’s flexibility lets us adapt to every campaign need instantly.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      src: image2.src,
    },
    {
      quote:
        "Adalyze has significantly boosted our ad ROI. The intuitive dashboard turns complex performance metrics into clear, actionable insights.",
      name: "Emily Watson",
      designation: "Operations Director at CloudScale",
      src: image3.src,
    },
    {
      quote:
        "The level of support and depth of AI analysis is outstanding. Adalyze consistently delivers on its promise to make every ad dollar work harder.",
      name: "James Kim",
      designation: "Engineering Lead at DataPro",
      src: image4.src,
    },
    {
      quote:
        "The scalability and precision targeting powered by Adalyze have been game-changing for our campaigns. It’s a must-have for any growing brand.",
      name: "Lisa Thompson",
      designation: "VP of Technology at FutureNet",
      src: image5.src,
    },
  ]

  return (
    <div className="text-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10 ">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.3 }}
        
      >
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-primary font-bold mb-3">Why Marketers Trust Adalyze</h2>

        {/* Description */}
        <p className="text-gray-300 max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
          Adalyze empowers marketing teams with AI-driven ad analysis, helping them uncover insights, optimize
          campaigns, and maximize ROI. Here's what industry leaders have to say about how Adalyze transformed their
          advertising strategy.
        </p>
      </motion.div>
      {/* Testimonials */}
      <AnimatedTestimonials testimonials={testimonials} />

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
