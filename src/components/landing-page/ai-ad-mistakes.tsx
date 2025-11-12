"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { trackEvent } from "@/lib/eventTracker";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Issue {
  issue_id: number;
  title: string;
  industry?: string;
  platform?: string;
  image_url?: string;
  issue_1?: string;
  issue_2?: string;
  issue_3?: string;
  predicted_ctr_change?: string;
  overall_score?: string;
  cta_text?: string;
  show_priority?: number;
  status?: number;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18, duration: 0.7 },
  },
  hover: { scale: 1.03 },
};

function SkeletonCard() {
  return (
    <motion.div
      className="overflow-hidden rounded-xl bg-black shadow-lg"
      variants={cardVariants}
    >
      <div className="relative w-full aspect-square bg-neutral-800 animate-pulse" />
    </motion.div>
  );
}

export default function AiAdMistakes({ category }: { category: string }) {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setError(null);
        const url = category
          ? `https://adalyzeai.xyz/App/api.php?gofor=issueslist&category=${encodeURIComponent(category)}`
          : `https://adalyzeai.xyz/App/api.php?gofor=issueslist`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = (await res.json()) as Issue[] | unknown;
        if (!active) return;
        setIssues(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load");
        setIssues([]);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const prepared = useMemo(() => {
    const list = Array.isArray(issues) ? issues : [];
    return list
      .filter((i) => (i.status ?? 1) === 1)
      .sort((a, b) => (a.show_priority ?? 999) - (b.show_priority ?? 999));
  }, [issues]);

  return (
    <section id="ai-ad-mistakes" className="py-14 relative overflow-hidden hidden lg:block">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center py-2 sm:py-3 mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 sm:mb-2 px-1">
            AI Caught These Ad Mistakes
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-lg sm:max-w-xl mx-auto px-1">
            These ads looked “perfect” to humans — until AI revealed the hidden
            flaws that cost thousands of clicks.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <AnimatePresence initial={false}>
            {issues === null &&
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={`s-${i}`} />
              ))}

            {issues !== null && prepared.length === 0 && !error && (
              <motion.div
                className="col-span-full text-center text-white/80"
                variants={cardVariants}
              >
                Nothing to show right now.
              </motion.div>
            )}

            {error && (
              <motion.div
                className="col-span-full text-center text-red-400"
                variants={cardVariants}
              >
                Failed to load issues — {error}
              </motion.div>
            )}

            {prepared.map((item, idx) => {
              const bullets = [item.issue_1, item.issue_2, item.issue_3].filter(
                Boolean
              ) as string[];
              const isFirst = idx === 0;
              const isActive =
                hoveredIndex === idx || (hoveredIndex === null && isFirst);

              return (
                <motion.div
                  key={item.issue_id ?? item.title ?? idx}
                  className="group relative overflow-hidden rounded-2xl bg-black shadow-md border border-zinc-800 hover:border-orange-500/40 transition-all duration-300"
                  variants={cardVariants}
                  whileHover="hover"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={
                        item.image_url && item.image_url.length > 0
                          ? item.image_url
                          : "/images/placeholder.jpg"
                      }
                      alt={item.title || "Ad sample"}
                      fill
                      priority={idx < 3}
                      className="object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />

                    {/* Bottom Slide-Up Text Container */}
                    <div
                      className={`absolute -bottom-1 -left-1 -right-1 p-5 text-white transition-all duration-500 ease-out backdrop-blur-md bg-black/60
                        ${isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-full opacity-0"
                        }
                      `}
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                        {item.title ?? "Ad — Issues Detected"}
                      </h3>

                      <ul className="space-y-1 text-sm text-white/90 leading-snug">
                        {bullets.map((b, i) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>

                      {(item.predicted_ctr_change || item.overall_score) && (
                        <div className="mt-3 bg-[#171717]/70 rounded-lg px-3 py-2 border border-white/10 text-sm text-white/90">
                          {item.predicted_ctr_change && (
                            <div className="flex justify-between">
                              <span>Estimated CTR</span>
                              <span className="font-bold text-primary">
                                {item.predicted_ctr_change}%
                              </span>
                            </div>
                          )}
                          {item.overall_score && (
                            <div className="flex justify-between">
                              <span>Score</span>
                              <span className="font-bold text-primary">
                                {item.overall_score}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* CTA Footer */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 14,
              delay: 0.3,
            }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.06, rotate: 1 }}
            whileTap={{ scale: 0.96 }}
            className="inline-block"
          >
            <Button
              onClick={() => {
                window.open("/register", "_blank", "noopener,noreferrer");
                trackEvent(
                  "LP_Let_AI_Review_My_Ad_button_clicked",
                  window.location.href
                );
              }}
              className="text-white cursor-pointer text-base sm:text-lg px-4 sm:px-6 py-5 sm:py-6"
            >
              Run a Free Ad Check
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
