"use client";

import { ArrowRight, CuboidIcon, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import oldWay from "@/assets/old-way.jpg";
import newWay from "@/assets/New-way.jpg";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function OldWayNewWay() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  return (
    <section className="py-12 md:py-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="text-center mb-10 px-4"
      >
        <div className="inline-block bg-[#db4900]/20 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
          Why Adalyze?
        </div>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          Understand Your Ad Impact Instantly
          <br className="hidden sm:block" />
          <span className="mt-2 bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text text-transparent">
            with AI-Powered Analysis & Feedback
          </span>
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mt-3 text-base md:text-lg">
          Manual ad evaluation is slow and uncertain. Adalyze gives you instant performance insights, a clear score, and actionable recommendations so you can launch with confidence.
        </p>
      </motion.div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-10">
        {/* Old Way */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          custom={0}
          variants={fadeInUp}
          className="p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <CuboidIcon className="" size={24} />
            <h3 className="text-lg md:text-xl font-bold ">Before</h3>
          </div>
          <div className="relative flex-1">
            <Image
              src={oldWay}
              alt="Old ad evaluation process"
              width={600}
              height={450}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-xl shadow-md w-full h-auto object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {[
              { label: "Insight Delay", value: "Hours" },
              { label: "Creative Selection", value: "Guesswork" },
              { label: "Team Alignment", value: "Hard to Sync" },
              { label: "Outcome", value: "Unpredictable" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemFadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                className="text-center px-2 py-3"
              >
                <p className="text-sm text-gray-300 leading-tight">{item.label}</p>
                <p className="font-semibold text-sm sm:text-lg leading-tight">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New Way */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          custom={1}
          variants={fadeInUp}
          className="p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <Box className="text-primary" size={24} />
            <h3 className="text-lg md:text-xl font-bold text-primary">Now</h3>
          </div>
          <div className="relative flex-1">
            <Image
              src={newWay}
              alt="AI-driven ad optimization"
              width={600}
              height={450}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-xl shadow-md w-full h-auto object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
            {[
              { label: "Insight Delay", value: "< 1 Min" },
              { label: "Creative Selection", value: "Data-Driven" },
              { label: "Team Alignment", value: "Seamless" },
              { label: "Outcome", value: "Clear" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemFadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                className="bg-[#121212] px-2 py-3 rounded-xl shadow-sm text-center"
              >
                <p className="text-sm text-gray-300 leading-tight">{item.label}</p>
                <p className="font-semibold text-sm sm:text-lg font-semibold bg-gradient-to-r from-[#db4900] to-[#b71c1c] bg-clip-text text-transparent leading-tight">
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="flex flex-col items-center mt-8 px-4"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <div className="flex flex-col items-center space-y-2 sm:space-y-3 mt-4">
            <Button
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 px-8 py-8 text-white text-lg font-semibold rounded-lg transition-colors"
            >
              Try Adalyze Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-gray-500 text-xs md:text-sm">*Optimize every campaign.</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
