"use client";

import {
  Check,
  Smartphone,
  AlertTriangle,
  Zap,
  Type,
  MousePointerClick,
  Gauge,
  Users,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import IntroImage from "@/assets/checklist/lp-intro-section.webp";
import ChecklistHeade from "../header/page";
import { motion } from "framer-motion";

// Import your principle images
import principle1 from "@/assets/Landing-page/step1.webp";
import principle2 from "@/assets/Landing-page/step2.webp";
import principle3 from "@/assets/Landing-page/step3.webp";
import principle4 from "@/assets/Landing-page/step1.webp";
import principle5 from "@/assets/Landing-page/step2.webp";
import principle6 from "@/assets/Landing-page/step3.webp";

const textVariants = {
  hiddenLeft: { x: -100, opacity: 0 },
  hiddenRight: { x: 100, opacity: 0 },
  show: { x: 0, opacity: 1 },
};

const imageVariants = {
  hiddenLeft: { x: -100, opacity: 0 },
  hiddenRight: { x: 100, opacity: 0 },
  show: { x: 0, opacity: 1 },
};

const MobileFriendlyLandingPage: React.FC = () => {
  const principles = [
    {
      num: "01",
      title: "Clarity Comes First",
      desc: "Your headline should instantly communicate what the offer is, who it's for, and why it matters. Keep it short, specific, and focused on the visitor's benefit.",
      icon: Type,
      image: principle1,
      alt: "Clarity in landing page design",
      highlights: [
        'Avoid vague copy like "Welcome to our website"',
        "Lead with a promise or transformation",
        "Use strong subheadings to reinforce clarity",
      ],
      exampleGood:
        '"Prevent Hair Fall in 30 Days — Herbal Ingredients. Free Doctor Consultation Included."',
      exampleBad: ["Welcome to Our Website", "Leading Brand Since 1998"],
    },
    {
      num: "02",
      title: "Keep the Design Clean and Readable",
      desc: "Good design doesn't decorate — it directs. Use clear fonts, proper spacing, and visual hierarchy to guide attention.",
      icon: FileText,
      image: principle2,
      alt: "Clean and readable design",
      highlights: [
        "Use modern, legible fonts (Poppins, Inter, Roboto)",
        "Headline: 20–24px | Body: 16–18px",
        "Avoid text walls — use short sentences and bullets",
        "Maintain high contrast between text and background",
      ],
    },
    {
      num: "03",
      title: "Place the Primary CTA Above the Fold",
      desc: "Users should instantly see the next step without scrolling. Your call-to-action must be visible, actionable, and emotionally directed.",
      icon: MousePointerClick,
      image: principle3,
      alt: "CTA placement above the fold",
      highlights: [
        'Use clear labels like "Get My Free Trial"',
        'Avoid vague CTAs like "Learn More"',
        "CTA should combine action + benefit",
      ],
    },
    {
      num: "04",
      title: "Speed Optimization is Critical",
      desc: "Slow pages kill trust and conversions. Optimize for performance — every second matters.",
      icon: Gauge,
      image: principle4,
      alt: "Speed optimization metrics",
      highlights: [
        "Load Time ≤ 3 seconds",
        "Compress images (use WebP)",
        "Use CDN like Cloudflare",
        "Minimize scripts and third-party tags",
      ],
      tools: [
        {
          name: "PageSpeed Insights",
          link: "https://pagespeed.web.dev/",
        },
        { name: "GTMetrix", link: "https://gtmetrix.com/" },
      ],
    },
    {
      num: "05",
      title: "Use Social Proof",
      desc: "Humans trust humans. Testimonials, ratings, and user feedback increase credibility instantly.",
      icon: Users,
      image: principle5,
      alt: "Social proof examples",
      highlights: [
        "Add 3–5 testimonials (with photo and name)",
        "Include Google Reviews or client logos",
        'Show data like "Trusted by 10,000+ users"',
      ],
    },
    {
      num: "06",
      title: "Keep Forms Short",
      desc: "Every extra field reduces conversions. Only ask for what's essential to take action.",
      icon: FileText,
      image: principle6,
      alt: "Short form examples",
      highlights: [
        "Maximum 3 fields for lead forms",
        "Use autofill and smart defaults",
        "Add progress indicators for multi-step forms",
      ],
      table: [
        ["Lead Form", "Name, Phone, Email (max 3 fields)"],
        ["Appointment Booking", "Name, Phone, Date (optional)"],
        ["E-commerce Checkout", "Use autofill; keep minimal"],
      ],
    },
  ];

  return (
    <main className="w-full bg-black antialiased">
      <ChecklistHeade />

      <div className="max-w-7xl mx-auto">
        {/* Introduction Section */}
        <section className="px-4 py-3 md:py-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto space-y-6 bg-[#141413] rounded-2xl p-6"
          >
            <div className="relative max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl md:text-5xl font-bold mb-2 leading-tight text-white"
              >
                Mobile Friendly Landing Page Added
              </motion.h1>
            </div>
         <motion.p
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.5, delay: 0.1 }}
  viewport={{ once: true }}
  className="text-base md:text-lg leading-relaxed text-gray-200 text-center"
>
  Your ad's real performance begins after the click. If your landing page is slow, confusing, or not mobile-friendly, even the best Facebook, Google, or LinkedIn ad will fail to convert.
</motion.p>

<motion.p
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  viewport={{ once: true }}
  className="text-base md:text-lg leading-relaxed text-gray-200 text-center"
>
  With over 80% of ad traffic coming from mobile, a desktop-first page leads to drop-offs and wasted spend. This checklist ensures your landing page is fast, responsive, and optimized before launching any campaign.
</motion.p>


            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="w-full mt-4 md:mt-14 h-64 md:h-96 flex items-center justify-center"
            >
              <Image
                src={IntroImage}
                alt="Landing Page"
                width={1000}
                height={1000}
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Why it matters Section */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">
                Why Mobile-Friendly Landing Pages Matter
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-base md:text-lg leading-relaxed text-white/80 mb-4"
            >
              When someone clicks your ad, they are in a fragile decision-making
              moment. They are curious — not convinced. If the landing page
              experience is not smooth, the user abandons instantly.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
              className="text-lg font-semibold text-primary mb-4"
            >
              Here's what typically goes wrong on a bad mobile landing page:
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="overflow-x-auto rounded-lg ring-1 ring-white/10 mb-8"
           style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} >
              <table className="w-full border-collapse">
              <thead>
  <tr className="bg-primary">
    <th className="border border-zinc-800 px-4 py-3 text-left text-lg font-bold text-white">
      Problem
    </th>
    <th className="border border-zinc-800 px-4 py-3 text-left text-lg font-bold text-white">
      Result
    </th>
  </tr>
</thead>

                <tbody>
                  {[
                    {
                      problem: "Text is too small or requires zooming",
                      result: "Users leave in seconds",
                      icon: Type,
                    },
                    {
                      problem: "Buttons are tiny or hidden",
                      result: "User can't act → bounce",
                      icon: MousePointerClick,
                    },
                    {
                      problem: "Page loads slowly",
                      result: "Users close before it opens",
                      icon: Gauge,
                    },
                    {
                      problem: "Too much content",
                      result: "Cognitive overload → exit",
                      icon: FileText,
                    },
                    {
                      problem: "Layout breaks on small screens",
                      result: "Loss of trust + instant exit",
                      icon: Smartphone,
                    },
                  ].map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-black hover:bg-black transition-all duration-200 hover:translate-x-1"
                      >
                        <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-rose-400 shrink-0" />
                            <span>{row.problem}</span>
                          </div>
                        </td>
                        <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                          {row.result}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>

            <div className="mt-6">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-base md:text-lg text-gray-200 mb-4"
              >
                A good mobile landing page, on the other hand, does the
                following:
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Loads in under 3 seconds",
                  "Shows a clear headline immediately",
                  "Has a clean visual flow with space to breathe",
                  "Places the CTA button above the fold",
                  "Uses large, readable text",
                  "Makes it easy to scroll and understand key value points",
                  "Optimized for mobile responsiveness",
                  "Highlights key features with visuals",
                  "Encourages trust with testimonials",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 bg-black border border-[#121212] rounded-lg px-3 py-3 hover:bg-black hover:shadow-[0_0_10px_rgba(219,73,0,0.2)] transition-all duration-200"
                  >
                    <Check className="text-primary h-6 w-6 shrink-0" />
                    <span className="text-white/90 text-sm leading-relaxed">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-8 bg-primary/20 border border-primary/40 backdrop-blur-sm rounded-lg p-5 flex items-start gap-3"
            >
              <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-base md:text-lg text-primary font-medium">
                Your goal is not to impress with design — but to reduce friction
                and help the visitor say "yes" faster.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Core Principles - STICKY SCROLL SECTION - FIXED */}
        <section className="relative py-8 sm:py-10 mt-4 sm:mt-6 mb-8 sm:mb-10 px-4">
          <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
            {/* Section Title */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-center py-2 sm:py-3 mb-8 sm:mb-10"
            >
              <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2 px-1">
                Core Principles of a Mobile Friendly Landing Page
              </h2>
              <p className="text-white font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1">
                6 Essential Steps to Higher Conversions
              </p>
              <p className="text-sm sm:text-base text-white/80 max-w-xl sm:max-w-2xl mx-auto px-1">
                Build landing pages that convert effortlessly — focused, fast,
                and designed for mobile users first.
              </p>
            </motion.div>

            {/* Principles Container with Sticky Scroll */}
            <div className="relative space-y-20 sm:space-y-24">
              {principles.map((item, index) => {
                const Icon = item.icon;
                const reverse = index % 2 === 1;
                const textInitial = reverse ? "hiddenRight" : "hiddenLeft";
                const imageInitial = reverse ? "hiddenLeft" : "hiddenRight";

                return (
                  <div
                    key={index}
                    className="sticky top-16 sm:top-20 flex items-center justify-center"
                    style={{ zIndex: index + 1 }}
                  >
                    {/* Sticky card with animations - INCREASED SIZE */}
                    <motion.div
                      className="relative rounded-xl sm:rounded-2xl overflow-visible bg-black border border-[#db4900]/50 p-6 sm:p-8 md:p-10 lg:p-14 w-full max-w-[90rem] mx-auto min-h-[600px] md:min-h-[700px]"
                      initial="hidden"
                      whileInView="show"
                      viewport={{
                        once: false,
                        amount: 0.35,
                        margin: "-15% 0% -15% 0%",
                      }}
                    >
                      <div
                        className={`flex flex-col md:flex-row items-start gap-8 sm:gap-10 lg:gap-12 h-full ${
                          reverse ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        {/* Mobile Image on top */}
                        <motion.div
                          className="flex-shrink-0 relative z-50 w-full md:hidden"
                          variants={imageVariants}
                          initial={imageInitial}
                          whileInView="show"
                          transition={{
                            duration: 0.6,
                            ease: [0.4, 0, 0.2, 1],
                            delay: 0.2,
                          }}
                          viewport={{
                            once: false,
                            amount: 0.35,
                            margin: "-15% 0% -15% 0%",
                          }}
                        >
                          <div className="relative w-full h-64 sm:h-72">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.alt}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 384px"
                              priority={index === 0}
                            />
                          </div>
                        </motion.div>

                        {/* Text Content */}
                        <motion.div
                          className={`flex-1 text-white ${
                            reverse ? "md:pl-8 lg:pl-12" : "md:pr-8 lg:pr-12"
                          }`}
                          variants={textVariants}
                          initial={textInitial}
                          whileInView="show"
                          transition={{
                            duration: 0.6,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          viewport={{
                            once: false,
                            amount: 0.35,
                            margin: "-15% 0% -15% 0%",
                          }}
                        >
                          {/* Icon and Title - SIDE BY SIDE */}
                          <div className="flex items-center gap-5 sm:gap-6 mb-4 sm:mb-6">
  {/* Icon Container */}
  {/* <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[#db4900] to-[#b71c1c] text-white shadow-md shrink-0">
    <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
  </div> */}

  {/* Title */}
  <h3 className="font-bold leading-tight tracking-tight text-2xl sm:text-3xl md:text-3xl lg:text-3xl bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text text-transparent">
    {item.title}
  </h3>
</div>


                          <p className="text-base sm:text-lg md:text-xl opacity-90 leading-relaxed mb-2">
                            {item.desc}
                          </p>

                          {/* Highlights */}
                          {item.highlights && (
                            <ul className="space-y-3 text-white/80 mb-2">
                              {item.highlights.map((point, j) => (
                                <motion.li
                                  key={j}
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: j * 0.05,
                                  }}
                                  viewport={{ once: true }}
                                  className="flex items-start gap-3 text-sm sm:text-base md:text-lg"
                                >
                                  <span className="text-primary text-xl">•</span>
                                  <span>{point}</span>
                                </motion.li>
                              ))}
                            </ul>
                          )}

                          {/* Example Good / Bad */}
                          {item.exampleGood && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4 }}
                              viewport={{ once: true }}
                              className="border-l-4 border-emerald-500 pl-4 mb-2"
                            >
                              <p className="text-xs sm:text-sm text-emerald-400 mb-1 font-semibold">
                                Strong Example:
                              </p>
                              <p className="text-white/80 italic text-sm sm:text-base">
                                {item.exampleGood}
                              </p>
                            </motion.div>
                          )}
                          {item.exampleBad && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4 }}
                              viewport={{ once: true }}
                              className="border-l-4 border-rose-500 pl-4 mb-2"
                            >
                              <p className="text-xs sm:text-sm text-rose-400 mb-1 font-semibold">
                                Weak Headlines:
                              </p>
                              <ul className="text-white/80 space-y-1 text-sm sm:text-base">
                                {item.exampleBad.map((bad, b) => (
                                  <li key={b}>• {bad}</li>
                                ))}
                              </ul>
                            </motion.div>
                          )}

                          {/* Tools */}
                          {item.tools && (
                            <div className="mt-4">
                              <p className="text-xs sm:text-sm text-white/80 mb-2">
                                Check speed with:
                              </p>
                              <ul className="space-y-2">
                                {item.tools.map((tool, t) => (
                                  <li key={t}>
                                    <a
                                      href={tool.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-2 text-sm"
                                    >
                                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                      {tool.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Table */}
                          {item.table && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              viewport={{ once: true }}
                              className="overflow-x-auto mt-6 rounded-lg ring-1 ring-white/10"
                            >
                              <table className="w-full border-collapse text-left">
                                <thead className="bg-[#1a1a1a]">
                                  <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-white/80">
                                      Type of Campaign
                                    </th>
                                    <th className="px-4 py-3 text-sm font-semibold text-white/80">
                                      Recommended Fields
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.table.map((row, j) => (
                                    <motion.tr
                                      key={j}
                                      initial={{ opacity: 0, x: -10 }}
                                      whileInView={{ opacity: 1, x: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: j * 0.1,
                                      }}
                                      viewport={{ once: true }}
                                      className="border-t border-white/10 bg-[#0a0a0a] hover:bg-[#141413] transition"
                                    >
                                      <td className="px-4 py-3 text-white/80 text-sm">
                                        {row[0]}
                                      </td>
                                      <td className="px-4 py-3 text-white/80 text-sm">
                                        {row[1]}
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </motion.div>
                          )}
                        </motion.div>

                        {/* Desktop Image - LARGER SIZE */}
                        <motion.div
                          className="flex-shrink-0 relative z-50 hidden md:flex items-center justify-center"
                          variants={imageVariants}
                          initial={imageInitial}
                          whileInView="show"
                          transition={{
                            duration: 0.6,
                            ease: [0.4, 0, 0.2, 1],
                            delay: 0.2,
                          }}
                          viewport={{
                            once: false,
                            amount: 0.35,
                            margin: "-15% 0% -15% 0%",
                          }}
                        >
                          <div className="relative w-80 h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] xl:w-[36rem] xl:h-[36rem]">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.alt}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 320px, (max-width: 1024px) 448px, (max-width: 1280px) 512px, 576px"
                            />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

         
        </section>

        {/* Common Mistakes Section */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <XCircle className="h-8 w-8 md:h-10 md:w-10 text-rose-400 shrink-0" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">
                Common Mistakes That Reduce Conversions
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="overflow-x-auto rounded-lg ring-1 ring-white/10 mb-8"
            >
              <table className="w-full border-collapse">
                <thead>
  <tr className="bg-primary">
    <th className="border border-zinc-800 px-4 py-3 text-left text-lg font-bold text-white">
      Mistake
    </th>
    <th className="border border-zinc-800 px-4 py-3 text-left text-lg font-bold text-white">
      Effect
    </th>
    <th className="border border-zinc-800 px-4 py-3 text-left text-lg font-bold text-white">
      Example
    </th>
  </tr>
</thead>

                <tbody>
                  {[
                    {
                      mistake: "Using desktop-designed website as landing page",
                      effect: "Tiny fonts / broken layout",
                      example: "Bounce immediately",
                    },
                    {
                      mistake: "Too much text & no visual breathing space",
                      effect: "Overwhelm",
                      example: "User feels effort → exit",
                    },
                    {
                      mistake: "No clear CTA",
                      effect: "User unsure → scroll → exit",
                      example: '"Contact us for details"',
                    },
                    {
                      mistake: "Slow loading images",
                      effect: "User abandons",
                      example: "90% drop-off on mobile",
                    },
                    {
                      mistake:
                        "Linking homepage instead of focused landing page",
                      effect: "No narrative direction",
                      example: "Scroll around → leave",
                    },
                  ].map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="hover:bg-black bg-black"
                    >
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.mistake}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.effect}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.example}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-primary/20 ring-1 ring-primary/40 rounded-lg p-4 md:p-5 flex items-center justify-center gap-3 text-center"
            >
              <AlertTriangle className="h-6 w-6 text-primary shrink-0" />
              <p className="text-base md:text-lg text-white/90 font-medium">
                <span className="font-bold text-white">Remember:</span> A
                confused user does nothing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Self-Test Section */}
    <section className="px-4 py-8 md:py-14">

  <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 md:p-10">

    {/* Top Heading + Tag */}
    <div className="mb-10">
      {/* Main Heading */}
      <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight text-left flex items-center gap-3">
        How to Self-Test Your Mobile Landing Page
      </h2>

      {/* Tag */}
      <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
  <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
  <p className="text-sm md:text-base text-white/70">
    No Tools Needed
  </p>
</div>

    </div>

    {/* GRID CONTENT */}
    <div className="grid md:grid-cols-2 gap-10 items-center">

      {/* LEFT SIDE — CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >

        {/* Steps */}
        <div className="space-y-6">
          {[
            {
              icon: Smartphone,
              text: "1. Open the landing page on your own phone.",
            },
            {
              icon: Eye,
              text: "2. Pretend you are seeing it for the first time.",
            },
            {
              icon: CheckCircle2,
              text: "3. You should be able to answer these in 3–5 seconds:",
              questions: [
                "What is being offered?",
                "Who is it for?",
                "Why should I trust it?",
                "What is the next step, and is it obvious?",
              ],
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-3"
              >
                <Icon className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-base md:text-lg text-white/80 mb-3">
                    {item.text}
                  </p>
                  {item.questions && (
                    <ul className="space-y-2 ml-4">
                      {item.questions.map((question, q) => (
                        <motion.li
                          key={q}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: q * 0.1 }}
                          viewport={{ once: true }}
                          className="text-base text-white/80 flex items-center gap-2"
                        >
                          <span className="text-primary">•</span>
                          {question}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 bg-primary/20 ring-1 ring-primary/40 rounded-lg p-5 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-1" />
          <p className="text-base md:text-lg text-white/80">
            If any of these take longer than 5 seconds, the page needs revision.
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE — IMAGE */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="flex justify-center"
      >
        <Image
          src={principle1}
          alt="Mobile landing page testing illustration"
          className="rounded-xl shadow-lg w-full max-w-md md:max-w-full object-cover"
        />
      </motion.div>

    </div>
  </div>
</section>



        {/* Final Summary Checklist Section */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6">
          {/* Heading Section */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
  className="flex flex-col items-start justify-start mb-6"
>

  {/* Icon + Heading */}
  <div className="flex items-center gap-3">
    <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
    <h2 className="text-2xl md:text-4xl font-bold text-white text-start">
      Final Summary Checklist
    </h2>
  </div>

  {/* Small Tag Below Heading */}
 <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
  <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
    <p className="text-sm md:text-base text-white/70">
      Copy-Paste Into Your Internal SOP
    </p>
  </div>

</motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black rounded-2xl p-6 md:p-8"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-base md:text-lg font-bold text-white">
                        Requirement
                      </th>
                      <th className="px-4 py-3 text-center text-base md:text-lg font-bold text-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      "Loads in under 3 seconds",
                      "Headline clear & benefit-focused",
                      "CTA visible above fold",
                      "Clean layout with readable text",
                      "Short, benefit-driven messaging",
                      "Uses social proof",
                      "Form fields kept minimal",
                      "Works perfectly on Android & iPhone",
                    ].map((requirement, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className="hover:bg-[#1f1f1f] transition-colors"
                      >
                        <td className="px-4 py-4 text-base text-white/80">
                          {requirement}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MobileFriendlyLandingPage;
