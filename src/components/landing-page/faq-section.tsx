"use client"

import { useState } from "react"
import { ArrowRightIcon, ArrowUpIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: "What is Adalyze AI?",
    answer:
      "Adalyze AI is a smart ad analysis tool that evaluates your creatives and provides actionable insights using AI.",
  },
  {
    question: "Who can use Adalyze AI?",
    answer: "Anyone who runs ads — marketers, designers, startups, and agencies — can benefit from Adalyze AI.",
  },
  {
    question: "Do I need any technical skills to use Adalyze?",
    answer: "No. Adalyze is built to be simple and user-friendly for everyone.",
  },
  {
    question: "Which ad formats are supported?",
    answer: "Currently, we support image creatives in formats like JPG, PNG, and JPEG.",
  },
  {
    question: "Is there a free plan available?",
    answer: "Yes. You can start with our Free plan which includes up to 5 uploads per month and basic AI analysis.",
  },
  // {
  //   question: "What is the cost of the Pro plan?",
  //   answer:
  //     "Our Pro plan costs ₹499/month or $7/month with extended features and 25 uploads.",
  // },
  // {
  //   question: "Do you offer yearly billing?",
  //   answer:
  //     "We currently support only monthly billing. Yearly plans are coming soon.",
  // },
]

const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${isOpen ? "bg-[#212121]" : "bg-[#121212]"}
        `}
    >
      <div className="flex items-center justify-between px-6 py-8 cursor-pointer" onClick={onClick}>
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
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 text-sm text-white">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-20 items-stretch">
          {/* Title */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex flex-col h-full">
              <span className="inline-block w-[60px] text-sm font-semibold bg-[#db4900]/20 text-primary px-3 py-1 rounded-full mb-4">
                FAQS
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                Adalyze AI
                <br />
                User FAQs
              </h2>
            </div>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-8 space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
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
  )
}
