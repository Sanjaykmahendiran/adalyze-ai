"use client"

import { useState } from "react"
import { AnalyzeDialog } from "./_components/analyze-dialog"
import { Button } from "@/components/ui/button"
import { BadgeCheck, ClipboardList, CheckCircle2, FileSearch, Sparkles, UserPlus, Upload, ArrowRightIcon, ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserLayout from "@/components/layouts/user-layout"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import { motion, AnimatePresence } from "framer-motion"
import HeroImage from "@/assets/campaign-coach/expert-reviewing-ad-creative-illustration.jpg"
import CoachImage from "@/assets/campaign-coach/coach-profile-headshot.jpg"
import ReportImage from "@/assets/campaign-coach/blurred-expert-ad-review-report-screenshot.jpg"

const steps = [
  { n: 1, title: "Upload Your Ad", desc: "Upload your creative for AI analysis.", Icon: Upload },
  { n: 2, title: "Add a Campaign Coach", desc: "Choose a review package (Quick, Deep, or Strategy Call).", Icon: UserPlus },
  { n: 3, title: "Expert Review", desc: "Your ad is assigned to a verified marketing expert.", Icon: BadgeCheck },
  { n: 4, title: "Get Actionable Insights", desc: "Receive a detailed report and tips inside your Adalyze dashboard.", Icon: ClipboardList },
]

const tiers = [
  { name: "Quick Review", meta: "24 hrs", desc: "Short audit + top 3 recommendations", price: "₹999" },
  { name: "Deep Campaign Review", meta: "48 hrs", desc: "Full expert analysis + actionable strategy", price: "₹4,999" },
  { name: "1-on-1 Strategy Call", meta: "60 mins", desc: "Personalized consult with top expert", price: "—" },
]

const coaches = [
  { name: "Aarav Shah", specialties: "Meta Ads, DTC", imgAlt: "Coach Aarav" },
  { name: "Meera Iyer", specialties: "Google Search, SaaS", imgAlt: "Coach Meera" },
  { name: "Rohan Kapoor", specialties: "Branding, Video Ads", imgAlt: "Coach Rohan" },
]

// Inline FAQ data (no API)
type FAQ = { faq_id: number; question: string; answer: string }
const faqs: FAQ[] = [
  {
    faq_id: 1,
    question: "Do I have to get a Campaign Coach for every ad?",
    answer: "No, it’s optional — available for deeper insights.",
  },
  {
    faq_id: 2,
    question: "When will I receive feedback?",
    answer: "Usually within 24–48 hours, depending on your chosen package.",
  },
  {
    faq_id: 3,
    question: "How are experts selected?",
    answer: "Based on your ad type, category, and availability.",
  },
  {
    faq_id: 4,
    question: "Is my ad kept private?",
    answer: "Yes, your ad and analysis are only visible to the assigned expert and you.",
  },
]

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
  index,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`rounded-2xl transition-all duration-300 ${isOpen ? "bg-[#212121]" : "bg-[#121212]"}`}
    >
      <div
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
        className="flex items-center justify-between px-6 py-8 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded-2xl"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
      >
        <h3 className={`text-base md:text-lg font-bold ${isOpen ? " text-[#db4900]" : "text-white"}`}>{question}</h3>
        <div className="ml-4">
          {isOpen ? (
            <ArrowUpIcon className="w-5 h-5 text-primary transition-transform rotate-180" />
          ) : (
            <ArrowRightIcon className="w-5 h-5 text-primary hover:text-[#db4900] transition-colors" />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 pb-6 text-sm text-white">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CampaignCoachPage() {
  const { userDetails } = useFetchUserDetails()
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState<number>(0)

  const openAnalyze = () => setAnalyzeOpen(true)
  const closeAnalyze = () => setAnalyzeOpen(false)

  return (
    <UserLayout userDetails={userDetails}>
      <main>
        {/* Unified container wrapper for consistent centering and horizontal padding */}
        <div className="container mx-auto max-w-7xl px-4">
          {/* Hero */}
          <header className="py-12 md:py-20">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="space-y-6">
                <h1 className="text-pretty text-4xl font-bold leading-tight md:text-5xl">{"Campaign Coach"}</h1>
                <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                  {"AI analyzes. Experts optimize. Get real-world feedback before your campaign goes live."}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={openAnalyze} className="px-5">
                    {"Get a Campaign Coach Now"}
                  </Button>
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
                    <Sparkles className="h-4 w-4" />
                    {"Human + AI insight"}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <FileSearch className="h-4 w-4" />
                  {"Pre-launch review to avoid costly mistakes"}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                <img
                  src={HeroImage.src}
                  alt="Illustration of a marketing expert reviewing an ad creative"
                  className="w-full rounded-xl border border-border bg-card shadow-sm object-cover"
                />
              </motion.div>
            </div>
          </header>

          <div className="space-y-16 md:space-y-24 py-12 md:py-16">
            {/* Why */}
            <section aria-labelledby="why-title" className="space-y-6">
              <div className="text-center">
                <h2 id="why-title" className="text-2xl font-semibold md:text-3xl">
                  Why Campaign Coach?
                </h2>
              </div>

              <Card className="mx-auto bg-black border-none ">
                <CardHeader>
                  <CardTitle className="text-balance text-lg md:text-xl">
                    Your ad deserves more than AI scores. Campaign Coach connects you with experienced digital marketers who review your ad creatives, give detailed improvement tips, and share actionable recommendations to boost performance.
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3 md:grid-cols-3">
                    {[
                      "Avoid ad mistakes before spending money.",
                      "Get fresh creative ideas from top marketers.",
                      "Blend human insight with AI analytics.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* How it works */}
            <section aria-labelledby="how-title" className="space-y-6">
              <div className="text-center">
                <h2 id="how-title" className="text-2xl font-semibold md:text-3xl">
                  How It Works
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {steps.map(({ n, title, desc, Icon }, i) => (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                  >
                    <Card className="relative transition-shadow hover:shadow-md bg-black border-none group focus-within:ring-2 focus-within:ring-primary">
                      <CardHeader className="space-y-2">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {n}
                          </span>
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Packages */}
            <section aria-labelledby="packages-title" className="space-y-6">
              <div className="text-center">
                <h2 id="packages-title" className="text-2xl font-semibold md:text-3xl">
                  Packages
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {tiers.map((t) => {
                  const featured = t.name === "Deep Campaign Review"
                  return (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`transition-shadow hover:shadow-md bg-black border-none ${featured ? "ring-1 ring-primary" : ""}`}>
                        <CardHeader className="relative">
                          {featured && (
                            <span className="absolute -top-3 right-4 text-xs rounded-full bg-primary/10 text-primary px-3 py-1">
                              Most Popular
                            </span>
                          )}
                          <CardTitle className="text-lg">{t.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">{t.meta}</div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm">{t.desc}</p>
                          <div className="text-xl font-semibold">{t.price}</div>
                          <Button onClick={openAnalyze} className="w-full">
                            Get a Campaign Coach Now
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={openAnalyze}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Get a Campaign Coach Now
                </button>
              </div>
            </section>

            {/* Coaches */}
            <section aria-labelledby="coaches-title" className="space-y-6">
              <div className="text-center">
                <h2 id="coaches-title" className="text-2xl font-semibold md:text-3xl">
                  Who Are the Coaches?
                </h2>
              </div>

              <ul className="mx-auto  list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Verified digital marketing professionals</li>
                <li>5+ years experience in Meta, Google, or Branding</li>
                <li>Rated & reviewed by Adalyze users</li>
                <li>Handpicked for each ad category</li>
              </ul>

              <div className="grid gap-4 md:grid-cols-3">
                {coaches.map((c) => (
                  <Card key={c.name} className="transition-shadow hover:shadow-md bg-black border-none hover:-translate-y-0.5 will-change-transform">
                    <CardHeader>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <img
                        src={CoachImage.src}
                        alt={c.imgAlt}
                        className="w-full rounded-lg border border-border bg-card"
                      />
                      <p className="text-sm text-muted-foreground">{c.specialties}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Sample report */}
            <section aria-labelledby="sample-title" className="space-y-6">
              <div className="text-center">
                <h2 id="sample-title" className="text-2xl font-semibold md:text-3xl">
                  Sample Expert Report
                </h2>
              </div>

              <motion.figure
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.25 }}
                className="mx-auto "
              >
                <img
                  src={ReportImage.src}
                  alt="Blurred preview of expert review report"
                  className="w-full rounded-xl border border-border bg-card shadow-sm object-cover"
                />
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  Here’s how your Campaign Coach feedback looks — clear, actionable, and personalized.
                </figcaption>
              </motion.figure>
            </section>

            {/* FAQ - inline data, animated, no API */}
            <section aria-labelledby="faq-title" className="space-y-6">
              <div className="text-center">
                <h2 id="faq-title" className="text-2xl font-semibold md:text-3xl">
                  FAQ
                </h2>
              </div>

              <div className="max-w-7xl mx-auto px-0 sm:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-20 items-stretch">
                  {/* Title */}
                  <div className="lg:col-span-4 flex flex-col">
                    <div className="flex flex-col h-full">
                      <span className="inline-block w-[60px] text-sm font-semibold bg-[#db4900]/20 text-primary px-3 py-1 rounded-full mb-4">
                        FAQS
                      </span>
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                        Adalyze AI
                        <br />
                        User FAQs
                      </h3>
                    </div>
                  </div>

                  {/* FAQs */}
                  <div className="lg:col-span-8 space-y-3">
                    {faqs.map((faq, index) => (
                      <FAQItem
                        key={faq.faq_id}
                        index={index}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === index}
                        onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-center">
              <button
                onClick={openAnalyze}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                🔥 Get My Campaign Coach Now
              </button>
            </div>
          </div>
        </div>

        <AnalyzeDialog open={analyzeOpen} onOpenChange={(v) => (v ? openAnalyze() : closeAnalyze())} />
      </main>
    </UserLayout>
  )
}
