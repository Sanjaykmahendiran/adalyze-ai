'use client'

import React from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Wallet
} from 'lucide-react';

const BudgetPlanPage: React.FC = () => {
  return (
    <main className="w-full bg-black antialiased">
      {/* Hero */}
      <section className="px-4 py-12 md:py-16 bg-gradient-to-b from-zinc-900 to-black border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 mb-5 ring-1 ring-white/10"
          >
            <Gauge className="h-4 w-4 text-primary" />
            <p className="text-sm md:text-base font-medium">Tracking & Launch Checklist</p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-5xl font-bold mb-2 leading-tight"
          >
            Budget Plan Ready
          </motion.h1>
          <p className="text-white/70 max-w-3xl mx-auto">
            One of the most common reasons ad campaigns fail is not the creative, not the audience, not even the landing page — but the absence of a clear, structured budget strategy. Running ads without a planned budget approach often leads to overspending early, scaling too fast, killing campaigns before learning completes, inconsistent flow, and unclear insights.
          </p>
          <p className="text-white/70 max-w-3xl mx-auto mt-3">
            This checklist item ensures that before launching a campaign, you have decided: how much you will spend, how long you will run it, what signals you will monitor, when to scale, and when to stop or adjust. This is called a Budget Plan — and it is the difference between Random Ads → Systematic Marketing Strategy.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto">
        {/* Why a budget plan is necessary */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white/80">
              Platforms like Meta and Google do not optimize instantly. They require time + data to understand which users are most likely to convert.
            </p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10 mt-4">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Phase</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Meaning</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Typical Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Learning Phase', 'System tests different user profiles', '3–7 days'],
                    ['Optimization Phase', 'System starts refining targeting', '7–21 days'],
                    ['Scaling Phase', 'Best segments are identified & expanded', '21+ days'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              Do not judge a campaign in the first 2–4 days. Judge it after patterns appear — usually around Day 7 to Day 14.
            </p>
          </div>
        </section>

        {/* The 3-Stage Budget Strategy */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <p className="text-white font-semibold">The 3-Stage Budget Strategy</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-1">Stage 1: Testing Budget (Days 1–5)</p>
                <ul className="text-white/80 space-y-1">
                  <li>• Gather initial performance data</li>
                  <li>• Identify which creatives & audiences show early signal</li>
                  <li>• Leads → ₹500–₹1500/day</li>
                  <li>• E-commerce → ₹1000–₹2500/day</li>
                  <li>• High-ticket services → ₹1500–₹4000/day</li>
                  <li>• Do not kill ads too soon</li>
                </ul>
              </div>
              <div className="rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-1">Stage 2: Learning & Optimization (Days 6–14)</p>
                <ul className="text-white/80 space-y-1">
                  <li>• Pause the clearly underperforming creatives</li>
                  <li>• Keep the average and good performers running</li>
                  <li>• Adjust landing page / messaging based on feedback</li>
                  <li>• Reduce spend on losers; maintain or slightly increase winners</li>
                </ul>
              </div>
              <div className="rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-1">Stage 3: Scaling (Day 15+)</p>
                <ul className="text-white/80 space-y-1">
                  <li>• Scale slowly and controlled</li>
                  <li>• Increase budget by 10–25% at a time</li>
                  <li>• Not more than once every 48 hours</li>
                  <li>• Scaling too fast → algorithm resets → performance drops</li>
                  <li>• Never double budgets abruptly</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Budget Allocation Framework */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white font-semibold mb-2">Budget Allocation Framework</p>
            <p className="text-white/80">Example Monthly Budget: ₹60,000</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10 mt-3">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Stage</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">% Allocation</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Amount</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Testing', '30%', '₹18,000', 'Days 1–5'],
                    ['Optimization', '40%', '₹24,000', 'Days 6–14'],
                    ['Scaling', '30%', '₹18,000', 'Day 15+'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[2]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              This ensures enough time to learn, enough volume to optimize, and controlled scaling for profitability.
            </p>
          </div>
        </section>

        {/* Daily budget by goal */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white font-semibold mb-2">How to Decide Daily Budget Based on Goal</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Campaign Goal</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Recommended Daily Budget</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Awareness / Traffic', '₹300–₹800/day', 'You’re not seeking conversions'],
                    ['Lead Generation (Normal)', '₹600–₹1500/day', 'Enough to hit learning signal threshold'],
                    ['High-Intent Lead / Booking', '₹1500–₹4000/day', 'Higher value leads need more stable data'],
                    ['E-commerce Purchases', '₹1000–₹3000/day', 'Purchase algorithms require higher signal volume'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              General Principle: Spend enough to generate 20–50 conversion signals per week. This is the bare minimum for stable optimization.
            </p>
          </div>
        </section>

        {/* Pause/Scale guidance */}
        <section className="px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141413] rounded-2xl p-6">
              <p className="text-white font-semibold mb-2">When to Pause / Adjust Ads</p>
              <ul className="text-white/80 space-y-1">
                <li>• Do NOT pause based on 24 hour results</li>
                <li>• Evaluate performance trends over 3–7 days</li>
                <li>• Pause only if cost/result is 50–100% higher than target AND lead/purchase quality is weak AND no improving trend</li>
              </ul>
            </div>
            <div className="bg-[#141413] rounded-2xl p-6">
              <p className="text-white font-semibold mb-2">When to Scale</p>
              <ul className="text-white/80 space-y-1">
                <li>• Cost per result is stable or falling</li>
                <li>• Lead/purchase quality is strong</li>
                <li>• Frequency is manageable (&lt; 2.5–3 for cold audiences)</li>
                <li>• Increase budgets 10–25% every 48 hours</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Avoid splitting too thin */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white font-semibold mb-2">Never Split Budget Too Thin</p>
            <ul className="text-white/80 space-y-1">
              <li>• 10 ad sets at ₹100/day each → None will exit learning.</li>
              <li>• 1 ad set at ₹1000/day → Reliable learning and improvement.</li>
              <li>• More data in fewer campaigns → Faster learning, higher quality optimization, predictable performance.</li>
            </ul>
          </div>
        </section>

        {/* Mistakes */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#0d0d0c] rounded-2xl p-6 ring-1 ring-white/10">
            <p className="text-white font-semibold mb-2">Budget Planning Mistakes to Avoid</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Mistake</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Result</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Fix</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Starting with low daily budgets (<₹300/day)', 'Slow learning → poor performance', 'Start with required minimum'],
                    ['Scaling too fast', 'Algorithm resets → lead cost spikes', 'Scale gradually (10–25% increments)'],
                    ['Stopping ads after 2–3 days', 'System never finds converting pocket', 'Let learning phase complete'],
                    ['No testing structure', 'No improvement over time', 'Test creatives & audiences systematically'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[2]}</td>
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
            <p className="text-white font-semibold mb-2">Tools for Budget Monitoring</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Tool</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Meta Ads Manager', 'Daily performance and trend analysis'],
                    ['Google Analytics', 'Traffic and conversion flow'],
                    ['CRM', 'Lead quality verification'],
                    ['Meta Breakdown Reports', 'Creative & audience comparison'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-2">
              Always observe: Cost per Result, Conversion Quality, Frequency, Relevance Signals (CTR, Hook Rate, Landing Page Views).
            </p>
          </div>
        </section>

        {/* Quick SOP Summary */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#0d0d0c] rounded-2xl p-6 ring-1 ring-white/10">
            <p className="text-white font-semibold mb-2">Quick SOP Summary (Copy &amp; Paste)</p>
            <ul className="text-white/80 space-y-1">
              <li>✔ Decide campaign goal clearly</li>
              <li>✔ Set testing budget for first 5 days</li>
              <li>✔ Allow ads to pass learning phase before judging</li>
              <li>✔ Cut only clear losers (50–100% above acceptable CPL)</li>
              <li>✔ Identify top performing creative + audience combo</li>
              <li>✔ Scale slowly (10–25% increments every 48 hours)</li>
              <li>✔ Monitor lead/purchase quality, not just cost</li>
            </ul>
            <p className="text-white/80 mt-3">
              When this checklist item is done correctly, your campaigns perform more consistently, produce high-quality, affordable leads, generate predictable revenue, and scale without chaos — transitioning from Experiment → Engine.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default BudgetPlanPage;
