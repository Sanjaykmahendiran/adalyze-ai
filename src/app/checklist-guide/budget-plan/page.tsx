"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2,} from "lucide-react";
import ChecklistHeade from "../header/page";
import Image from "next/image";
import IntroImage from "@/assets/checklist/lp-intro-section.webp";
import principle1 from "@/assets/Landing-page/step1.webp";

const BudgetPlanPage: React.FC = () => {
  return (
    <main className="w-full bg-black antialiased">
      <ChecklistHeade />
      {/* Hero */}
      <section className="px-4 py-3 md:py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto space-y-6 bg-[#141413] rounded-2xl p-6"
        >
          {/* Heading */}
          <div className="flex flex-col items-center text-center justify-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl md:text-5xl font-bold mb-2 leading-tight text-white"
            >
              Budget Plan Ready
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-base md:text-lg leading-relaxed text-gray-200"
          >
            One of the most common reasons ad campaigns fail is not the
            creative, not the audience, not even the landing page — but the
            absence of a clear, structured budget strategy. Running ads without
            a planned budget approach often leads to overspending early, scaling
            too fast, killing campaigns before learning completes, inconsistent
            flow, and unclear insights.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-base md:text-lg leading-relaxed text-gray-200"
          >
            This checklist item ensures that before launching a campaign, you
            have decided: how much you will spend, how long you will run it,
            what signals you will monitor, when to scale, and when to stop or
            adjust. This is called a Budget Plan — and it is the difference
            between Random Ads → Systematic Marketing Strategy.
          </motion.p>

          {/* Image Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-full mt-4 md:mt-10 h-64 md:h-80 flex items-center justify-center"
          >
            <Image
              src={IntroImage}
              alt="UTM Tracking"
              width={1000}
              height={1000}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto">
        {/* Why a budget plan is necessary */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white/80">
              Platforms like Meta and Google do not optimize instantly. They
              require time + data to understand which users are most likely to
              convert.
            </p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10 mt-4">
              <table className="w-full border-collapse">
                <thead className="bg-primary">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Phase
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Meaning
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Typical Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Learning Phase",
                      "System tests different user profiles",
                      "3–7 days",
                    ],
                    [
                      "Optimization Phase",
                      "System starts refining targeting",
                      "7–21 days",
                    ],
                    [
                      "Scaling Phase",
                      "Best segments are identified & expanded",
                      "21+ days",
                    ],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[0]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[1]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              Do not judge a campaign in the first 2–4 days. Judge it after
              patterns appear — usually around Day 7 to Day 14.
            </p>
          </div>
        </section>

        {/* The 3-Stage Budget Strategy */}
        <section className="px-4 py-14">
  <div className="bg-[#141413] rounded-3xl p-10 md:p-14 shadow-[0_0_40px_rgba(0,0,0,0.35)]">

    <h2 className="text-white text-3xl md:text-4xl font-semibold mb-10 tracking-tight">
      The 3-Stage Budget Strategy
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* Step 1 */}
      <div className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 shadow-xl">
        <div className="flex items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg group-hover:bg-white/20 transition">
            1
          </div>
          <p className="text-white font-semibold text-xl ml-4">
            Testing Budget  
          </p>
        </div>

        <p className="text-white/50 text-sm mb-4">Days 1–5</p>

        <ul className="text-white/70 space-y-2 leading-relaxed">
          <li>• Gather initial performance data</li>
          <li>• Identify strong creatives & audiences early</li>
          <li>• Leads → ₹500–₹1500/day</li>
          <li>• E-commerce → ₹1000–₹2500/day</li>
          <li>• High-ticket → ₹1500–₹4000/day</li>
          <li>• Don’t kill ads too early</li>
        </ul>
      </div>

      {/* Step 2 */}
      <div className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 shadow-xl">
        <div className="flex items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg group-hover:bg-white/20 transition">
            2
          </div>
          <p className="text-white font-semibold text-xl ml-4">
            Learning & Optimization
          </p>
        </div>

        <p className="text-white/50 text-sm mb-4">Days 6–14</p>

        <ul className="text-white/70 space-y-2 leading-relaxed">
          <li>• Pause weak creatives</li>
          <li>• Keep the profitable ones running</li>
          <li>• Improve landing page / messaging</li>
          <li>• Increase spend on winners, decrease losers</li>
        </ul>
      </div>

      {/* Step 3 */}
      <div className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 shadow-xl">
        <div className="flex items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg group-hover:bg-white/20 transition">
            3
          </div>
          <p className="text-white font-semibold text-xl ml-4">
            Scaling Stage
          </p>
        </div>

        <p className="text-white/50 text-sm mb-4">Day 15+</p>

        <ul className="text-white/70 space-y-2 leading-relaxed">
          <li>• Scale gradually & steadily</li>
          <li>• Increase by 10–25% at a time</li>
          <li>• Only increase every 48 hours</li>
          <li>• Avoid signal reset by scaling slowly</li>
          <li>• Never double budgets abruptly</li>
        </ul>
      </div>

    </div>
  </div>
</section>


        {/* Budget Allocation Framework */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white font-semibold mb-2">
              Budget Allocation Framework
            </p>
            <p className="text-white/80">Example Monthly Budget: ₹60,000</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10 mt-3">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Stage
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      % Allocation
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Amount
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Testing", "30%", "₹18,000", "Days 1–5"],
                    ["Optimization", "40%", "₹24,000", "Days 6–14"],
                    ["Scaling", "30%", "₹18,000", "Day 15+"],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[0]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[1]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[2]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[3]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              This ensures enough time to learn, enough volume to optimize, and
              controlled scaling for profitability.
            </p>
          </div>
        </section>

        {/* Daily budget by goal */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white font-semibold mb-2">
              How to Decide Daily Budget Based on Goal
            </p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Campaign Goal
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Recommended Daily Budget
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Awareness / Traffic",
                      "₹300–₹800/day",
                      "You’re not seeking conversions",
                    ],
                    [
                      "Lead Generation (Normal)",
                      "₹600–₹1500/day",
                      "Enough to hit learning signal threshold",
                    ],
                    [
                      "High-Intent Lead / Booking",
                      "₹1500–₹4000/day",
                      "Higher value leads need more stable data",
                    ],
                    [
                      "E-commerce Purchases",
                      "₹1000–₹3000/day",
                      "Purchase algorithms require higher signal volume",
                    ],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[0]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[1]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              General Principle: Spend enough to generate 20–50 conversion
              signals per week. This is the bare minimum for stable
              optimization.
            </p>
          </div>
        </section>

        {/* Pause/Scale guidance */}
        <section className="px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* LEFT SIDE */}
            <div className="space-y-6">
              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-2xl md:text-4xl font-bold text-white leading-tight"
              >
                Budget Control Rules
              </motion.h2>

              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-black/40 ring-1 ring-white/10 rounded-xl p-6"
              >
                <p className="text-white font-semibold mb-2">
                  When to Pause / Adjust Ads
                </p>
                <ul className="text-white/80 space-y-1">
                  <li>• Do NOT pause based on 24 hour results</li>
                  <li>• Evaluate performance trends over 3–7 days</li>
                  <li>
                    • Pause only if cost/result is 50–100% higher than target
                    AND quality is weak AND no improving trend
                  </li>
                </ul>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                viewport={{ once: true }}
                className="bg-black/40 ring-1 ring-white/10 rounded-xl p-6"
              >
                <p className="text-white font-semibold mb-2">When to Scale</p>
                <ul className="text-white/80 space-y-1">
                  <li>• Cost per result is stable or falling</li>
                  <li>• Lead/purchase quality is strong</li>
                  <li>
                    • Frequency is manageable (&lt; 2.5–3 for cold audiences)
                  </li>
                  <li>• Increase budgets 10–25% every 48 hours</li>
                </ul>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-black/40 ring-1 ring-white/10 rounded-xl p-6"
              >
                <p className="text-white font-semibold mb-2">
                  Never Split Budget Too Thin
                </p>
                <ul className="text-white/80 space-y-1">
                  <li>• 10 ad sets at ₹100/day → None will exit learning</li>
                  <li>
                    • 1 ad set at ₹1000/day → Reliable learning and improvement
                  </li>
                  <li>
                    • More data in fewer campaigns → Faster learning & better
                    optimization
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* RIGHT SIDE IMAGE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex justify-center items-center"
            >
              <Image
                src={principle1} // replace with your actual image import
                alt="Budget Strategy Illustration"
                className="rounded-xl shadow-lg w-full max-w-md md:max-w-full object-contain"
              />
            </motion.div>
          </div>
        </section>

        {/* Mistakes */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#0d0d0c] rounded-2xl p-6 ring-1 ring-white/10">
            <p className="text-white font-semibold mb-2">
              Budget Planning Mistakes to Avoid
            </p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Mistake
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Result
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Fix
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Starting with low daily budgets (<₹300/day)",
                      "Slow learning → poor performance",
                      "Start with required minimum",
                    ],
                    [
                      "Scaling too fast",
                      "Algorithm resets → lead cost spikes",
                      "Scale gradually (10–25% increments)",
                    ],
                    [
                      "Stopping ads after 2–3 days",
                      "System never finds converting pocket",
                      "Let learning phase complete",
                    ],
                    [
                      "No testing structure",
                      "No improvement over time",
                      "Test creatives & audiences systematically",
                    ],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[0]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[1]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white font-semibold mb-2">
              Tools for Budget Monitoring
            </p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Tool
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Meta Ads Manager",
                      "Daily performance and trend analysis",
                    ],
                    ["Google Analytics", "Traffic and conversion flow"],
                    ["CRM", "Lead quality verification"],
                    [
                      "Meta Breakdown Reports",
                      "Creative & audience comparison",
                    ],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[0]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">
                        {row[1]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              Always observe: Cost per Result, Conversion Quality, Frequency,
              Relevance Signals (CTR, Hook Rate, Landing Page Views).
            </p>
          </div>
        </section>

        {/* Quick SOP Summary */}
        <section className="px-4 py-8 md:py-10">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6">
            {/* Heading + Tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-start mb-6"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Budget Plan Checklist
                </h2>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <p className="text-sm md:text-base text-white/70">
                  Copy-Paste to Internal SOP
                </p>
              </div>
            </motion.div>

            {/* TABLE */}
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
                        SOP Step
                      </th>
                      <th className="px-4 py-3 text-center text-base md:text-lg font-bold text-white">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {[
                      "Decide campaign goal clearly",
                      "Set testing budget for first 5 days",
                      "Allow ads to pass learning phase before judging",
                      "Cut only clear losers (50–100% above acceptable CPL)",
                      "Identify top performing creative + audience combo",
                      "Scale slowly (10–25% increments every 48 hours)",
                      "Monitor lead/purchase quality, not just cost",
                    ].map((item, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="hover:bg-[#1f1f1f] transition-colors"
                      >
                        <td className="px-4 py-4 text-base text-white/80">
                          {item}
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

export default BudgetPlanPage;
