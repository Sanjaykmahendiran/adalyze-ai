"use client"

import { useState } from "react"
import { AnalyzeDialog } from "./_components/analyze-dialog"
import {
  BadgeCheck,
  ClipboardList,
  CheckCircle2,
  FileSearch,
  Sparkles,
  UserPlus,
  Upload,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface FAQ {
  faq_id: number
  question: string
  answer: string
}
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
      className={`rounded-2xl transition-all duration-300 ${isOpen ? "bg-[#3d3d3d]" : "bg-black hover:bg-[#121212]"
        }`}
    >
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between px-6 py-6 cursor-pointer"
        onClick={onClick}
      >
        <h3
          className={`text-base md:text-lg font-semibold transition-colors ${isOpen ? "text-[#db4900]" : "text-white"
            }`}
        >
          {question}
        </h3>
        {isOpen ? (
          <ArrowUpIcon className="w-5 h-5 text-[#db4900]" />
        ) : (
          <ArrowRightIcon className="w-5 h-5 text-[#db4900]" />
        )}
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
            <div className="px-6 pb-6 text-sm text-white/80 leading-relaxed">{answer}</div>
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
      <main className="max-w-7xl mx-auto">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Hero Section */}
          <header className="py-16 md:py-16">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Campaign Coach
                </h1>
                <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-lg">
                  AI analyzes. Experts optimize. Get real-world feedback before your campaign goes live.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={openAnalyze}
                    className="px-6 py-5 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Get a Campaign Coach Now
                  </Button>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#db4900]/10 px-3 py-1 text-xs text-[#db4900]">
                    <Sparkles className="h-4 w-4" />
                    Human + AI insight
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/70">
                  <FileSearch className="h-4 w-4 text-[#db4900]" />
                  <span>Pre-launch review to avoid costly mistakes</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full max-h-96 rounded-2xl overflow-hidden"
              >
                <img
                  src={HeroImage.src}
                  alt="Marketing expert reviewing an ad creative"
                  className="w-full h-full rounded-2xl border border-[#2b2b2b] shadow-xl object-cover"
                />
              </motion.div>
            </div>
          </header>

          {/* Why Section */}
          <section className="text-center space-y-10 py-16">
            <h2 className="text-3xl md:text-4xl font-bold">Why Campaign Coach?</h2>
            <Card className="mx-auto bg-black border-none max-w-5xl rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-white/90 leading-relaxed">
                  Your ad deserves more than AI scores. Campaign Coach connects you with marketing experts
                  who give detailed improvement tips and real strategies to boost performance.
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-4 md:grid-cols-3">
                  {[
                    "Avoid ad mistakes before spending money.",
                    "Get fresh creative ideas from top marketers.",
                    "Blend human insight with AI analytics.",
                  ].map(item => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-left justify-center md:justify-start"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#db4900]" />
                      <span className="text-sm text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section className="space-y-12 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-sm md:text-base text-white/60 max-w-md mx-auto">
              Simple steps to get started — quick, clear, and efficient.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ n, title, desc, Icon }, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="relative bg-black border-none rounded-2xl hover:border-[#db4900]/50 transition-all duration-300 hover:-translate-y-1 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#db4900]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                    <CardHeader className="flex items-center gap-4 px-6 pt-6">
                      <div className="w-12 h-12 bg-[#db4900] rounded-lg flex items-center justify-center shadow-md">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-left">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 text-left">
                      <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Packages Section */}
          <section className="py-16 space-y-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Packages</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {tiers.map(t => {
                const featured = t.name === "Deep Campaign Review"
                return (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`bg-black border-none rounded-2xl hover:shadow-lg hover:border-[#db4900]/60 transition-all duration-300 ${featured ? "ring-1 ring-[#db4900]" : ""
                        }`}
                    >
                      <CardHeader className="relative">
                        {featured && (
                          <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-xs rounded-full bg-[#db4900] text-white px-3 py-1 font-semibold">
                            Most Popular
                          </span>
                        )}

                        <CardTitle className="text-lg">{t.name}</CardTitle>
                        <div className="text-sm text-white/70">{t.meta}</div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-white/80">{t.desc}</p>
                        <div className="text-xl font-semibold text-white">{t.price}</div>
                        <Button onClick={openAnalyze} className="w-full">
                          Get a Campaign Coach Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Coaches Section */}
          <section className="space-y-10 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Who Are the Coaches?</h2>
            <ul className="mx-auto list-disc space-y-2 pl-5 text-sm text-white/80 max-w-md text-left">
              <li>Verified digital marketing professionals</li>
              <li>5+ years experience in Meta, Google, or Branding</li>
              <li>Rated & reviewed by Adalyze users</li>
              <li>Handpicked for each ad category</li>
            </ul>

            <div className="grid gap-6 md:grid-cols-3">
              {coaches.map(c => (
                <Card
                  key={c.name}
                  className="bg-black border-none  hover:border-[#db4900]/50 rounded-2xl transition-all hover:-translate-y-1 duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">{c.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <img
                      src={CoachImage.src}
                      alt={c.imgAlt}
                      className="w-full rounded-lg border-none bg-[#1a1a1a]"
                    />
                    <p className="text-sm text-white/70">{c.specialties}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Sample Report Section */}
          <section className="space-y-10 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Sample Expert Report</h2>
            <motion.figure
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto"
            >
              <img
                src={ReportImage.src}
                alt="Blurred preview of expert review report"
                className="w-full rounded-2xl border border-[#2b2b2b] shadow-lg object-cover"
              />
              <figcaption className="mt-3 text-sm text-white/70">
                Here’s how your Campaign Coach feedback looks — clear, actionable, and personalized.
              </figcaption>
            </motion.figure>
          </section>

          {/* FAQ Section */}
          <section className="py-16 space-y-10">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-4">
                <span className="inline-block w-[60px] text-sm font-semibold bg-[#db4900]/20 text-[#db4900] px-3 py-1 rounded-full mb-4">
                  FAQS
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                  Adalyze AI
                  <br />
                  User FAQs
                </h3>
              </div>
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
          </section>

          {/* CTA */}
          <div className="flex justify-center py-12">
            <Button
              onClick={openAnalyze}
              className="px-6 py-4 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Get My Campaign Coach Now
            </Button>
          </div>
        </div>

        <AnalyzeDialog open={analyzeOpen} onOpenChange={v => (v ? openAnalyze() : closeAnalyze())} />
      </main>
    </UserLayout>
  )
}
