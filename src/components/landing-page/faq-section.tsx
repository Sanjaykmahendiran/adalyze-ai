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
    question: "What is Suggesto, and how does it work?",
    answer:
      "Suggesto is an AI-powered movie discovery platform that helps you find the perfect film based on your mood, preferences, and watch history. It learns your taste to suggest better titles every time.",
  },
  {
    question: "Can I use Suggesto with friends or family?",
    answer:
      "Yes! Suggesto lets you create shared watchlists and group recommendations. Everyone votes, and the AI picks something you’ll all enjoy together.",
  },
  {
    question: "Is Suggesto free to use?",
    answer:
      "Suggesto offers a free version with core features like smart recommendations and personal watchlists. Premium plans unlock advanced filters, synced devices, and exclusive content insights.",
  },
  {
    question: "How are recommendations generated?",
    answer:
      "Our AI analyzes your viewing history, genre preferences, mood inputs, and trending data to suggest films that feel personal—like a movie buddy who *really* knows you.",
  },
  {
    question: "Can I track what I’ve watched?",
    answer:
      "Absolutely! Suggesto helps you log watched content automatically, rate films, and organize your movie journey across time and platforms.",
  },
  {
    question: "Does Suggesto support multiple streaming services?",
    answer:
      "Yes. Suggesto pulls data and listings from major platforms like Netflix, Prime Video, Disney+, and more—so you can discover and jump straight into a movie from anywhere.",
  },
  {
    question: "Is there a mobile app for Suggesto?",
    answer:
      "Yes! You can download Suggesto from the Google Play Store or App Store to enjoy on-the-go recommendations and group movie nights wherever you are.",
  },
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
      className={`rounded-2xl transition-all duration-300 ${isOpen ? "bg-[#212121]" : "bg-[#121212]"
        }`}
    >
      <div
        className="flex items-center justify-between px-6 py-8 cursor-pointer"
        onClick={onClick}
      >
        <h3
          className={`text-base md:text-lg font-bold ${isOpen
              ? " text-[#db4900]"
              : "text-white"
            }`}
        >
          {question}
        </h3>
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
    <section className="py-24" id="faq">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-stretch">
          {/* Title */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex flex-col h-full">
              <span className="inline-block w-[60px] text-sm font-semibold bg-[#db4900]/20 text-primary px-3 py-1 rounded-full mb-4">
                FAQS
              </span>
              <h2 className="text-5xl font-bold  leading-tight mb-6">
                Suggesto
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
