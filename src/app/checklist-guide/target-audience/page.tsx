'use client'

import React from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Users
} from 'lucide-react';

const TargetAudiencePage: React.FC = () => {
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
            Target Audience Verified
          </motion.h1>
          <p className="text-white/70 max-w-3xl mx-auto">
            Confirm that your target audience settings actually match your product, goal, and funnel stage. Even the best creative and landing page will fail if the wrong audience is seeing the ad.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto">
        {/* Why verification matters */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <p className="text-white/80">
              Validate: correct age, correct gender (if relevant), location matches reach & fulfillment, interests/behaviors align with category, audience size not too broad/narrow, and funnel stage matches objective. Most performance issues start with wrong audience selection.
            </p>

            <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">Why Audience Verification Matters</p>
              <ul className="text-white/80 space-y-1">
                <li>• Hair Growth Oil to teenagers → mismatch.</li>
                <li>• High-ticket skin clinic services to low-income audiences → mismatch.</li>
                <li>• Kids tuition program to single young professionals → mismatch.</li>
                <li>• A meditation course to people searching for action gaming content → mismatch.</li>
              </ul>
              <p className="text-white/80 mt-3">
                Even if your creative looks professional, CTR is high, and ad copy is clear, the conversion rate will be very low. Relevance beats creativity. You win by talking to the right people.
              </p>
            </div>
          </div>
        </section>

        {/* Three layers */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <p className="text-white font-semibold">Understand the Three Core Layers of Targeting</p>
            <ol className="list-decimal pl-5 text-white/80 space-y-3">
              <li>
                Who the audience is (Demographics)
                <ul className="mt-1 space-y-1">
                  <li>• Age range</li>
                  <li>• Gender</li>
                  <li>• Income level (indirectly)</li>
                  <li>• Region / city type (Urban / Tier 1 / Tier 2 / Tier 3)</li>
                </ul>
              </li>
              <li>
                What they care about (Interests / Behavior)
                <ul className="mt-1 space-y-1">
                  <li>• Hobbies</li>
                  <li>• Activities</li>
                  <li>• Purchase intent behaviors</li>
                  <li>• Apps they use</li>
                  <li>• Pages they follow</li>
                </ul>
              </li>
              <li>
                Where they are in the buying journey (Funnel Stage)
                <div className="overflow-x-auto rounded-lg ring-1 ring-white/10 mt-2">
                  <table className="w-full border-collapse">
                    <thead className="bg-black">
                      <tr>
                        <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Funnel Stage</th>
                        <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Audience Type</th>
                        <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Cold', 'People who don’t know your brand', 'New interest-based audience'],
                        ['Warm', 'Visitors, engagers, past leads', 'Retargeting'],
                        ['Hot', 'Cart abandoners, returning customers', 'Purchase-intent audiences'],
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
                <p className="text-white/80 mt-2">Your audience selection must match your campaign goal.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* Verify components */}
        <section className="px-4 py-8 md:py-10">
          <div className="space-y-6">
            <div className="bg-[#141413] rounded-2xl p-6 space-y-3">
              <p className="text-white font-semibold">1. Location</p>
              <ul className="text-white/80 space-y-1">
                <li>• Can you realistically deliver / serve customers from this location?</li>
                <li>• Are there regional language or cultural tone differences?</li>
              </ul>
              <p className="text-white/80 mt-2">Local clinic: start with 3–10 KM radius. Digital products: widen geography but ensure pricing and tone fit region.</p>
            </div>

            <div className="bg-[#141413] rounded-2xl p-6 space-y-3">
              <p className="text-white font-semibold">2. Age Range</p>
              <p className="text-white/80">Align with life needs & stage.</p>
              <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
                <table className="w-full border-collapse">
                  <thead className="bg-black">
                    <tr>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Product</th>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Suggested Age Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Hair fall treatment', '24–45'],
                      ['Investment coaching', '25–50'],
                      ['Baby products', 'Parents 22–40'],
                      ['Retirement planning', '45–65'],
                    ].map((row, i) => (
                      <tr key={i} className="bg-black">
                        <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                        <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-white/80 mt-2">Shortcut Rule: Market to the person with the pain or desire.</p>
            </div>

            <div className="bg-[#141413] rounded-2xl p-6 space-y-3">
              <p className="text-white font-semibold">3. Gender</p>
              <p className="text-white/80">Set gender when product is gender-specific or emotionally skewed.</p>
              <ul className="text-white/80 space-y-1">
                <li>• Women-oriented skincare → Female only</li>
                <li>• Beard growth oil → Male only</li>
                <li>• Couple counseling → Mixed, but messaging should reflect both</li>
              </ul>
              <p className="text-white/80 mt-2">Use past lead/customer data if available.</p>
            </div>

            <div className="bg-[#141413] rounded-2xl p-6">
              <p className="text-white font-semibold mb-2">4. Interest Targeting</p>
              <p className="text-white/80">Ask: What problem do we solve? Who feels it strongly? What do they search/follow/watch?</p>
              <p className="text-white/80 mt-2">Product: Hair Regrowth Serum</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-[#0d0d0c] rounded-lg p-4 ring-1 ring-white/10">
                  <p className="text-rose-400 font-semibold mb-2">Wrong Targeting:</p>
                  <ul className="text-white/80 space-y-1">
                    <li>• “Beauty”</li>
                    <li>• “Fashion”</li>
                    <li>• “Lifestyle Bloggers”</li>
                  </ul>
                </div>
                <div className="bg-[#0d0d0c] rounded-lg p-4 ring-1 ring-white/10">
                  <p className="text-emerald-400 font-semibold mb-2">Correct Targeting:</p>
                  <ul className="text-white/80 space-y-1">
                    <li>• “Hair loss”</li>
                    <li>• “Alopecia”</li>
                    <li>• “Ayurveda”</li>
                    <li>• “Hair care routines”</li>
                    <li>• “Scalp health”</li>
                    <li>• “Home remedies for hair fall”</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#141413] rounded-2xl p-6">
              <p className="text-white font-semibold mb-2">5. Audience Size</p>
              <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
                <table className="w-full border-collapse">
                  <thead className="bg-black">
                    <tr>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Audience Size</th>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Problem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Too Broad (>10M)', 'Waste spend, low relevance'],
                      ['Too Narrow (<50K)', 'Limited reach, expensive CPL'],
                    ].map((row, i) => (
                      <tr key={i} className="bg-black">
                        <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                        <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="text-white/80 space-y-1 mt-2">
                <li>• Cold audience: 500K – 3M</li>
                <li>• Warm audience: 10K – 300K</li>
                <li>• Hot audience: 1K – 20K</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Matching funnel + examples */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <p className="text-white font-semibold">Matching Audience to Funnel Stage (Critical)</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Audience Type</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Campaign Objective</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Cold', 'Awareness / Video View / Leads'],
                    ['Warm', 'Conversion / Lead Detail Capture'],
                    ['Hot', 'Retargeting / Purchase / Closing Offers'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Funnel Stage</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Example Messaging</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Cold', '“Struggling With Hair Fall? Try This Free Diagnosis”', 'Good lead cost, mixed lead quality'],
                    ['Warm', '“Continue Your Hair Recovery — Book Your Consultation”', 'Lower CPL, higher conversion'],
                    ['Hot', '“Exclusive 10% Off — Complete Your Treatment Plan Today”', 'Highest ROI'],
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

            <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">Examples of Audience Verification in Real Campaigns</p>
              <ul className="text-white/80 space-y-2">
                <li>
                  <span className="text-white font-medium">Skin Clinic (Dermatology): </span>
                  Location: 5–10 km radius around clinic; Age: 22–45; Gender: Male/Female depending on service; Interests: Hair loss, dermatologist, PRP, anti-aging care; Funnel: Cold → Lead → Retarget with before/after proof
                </li>
                <li>
                  <span className="text-white font-medium">Coaching / Consulting: </span>
                  Location: Country / Language group; Age: 24–45; Interests: Personal development, business training, mentorship; Funnel: Webinar / Free Call → Follow-up → Close
                </li>
                <li>
                  <span className="text-white font-medium">E-commerce Beauty Brand: </span>
                  Cold: Interest + Lookalike audiences; Warm: Website visitors + Add to Cart; Hot: Purchase retargeting + discount triggers
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Mistakes, self-check, SOP */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <div className="bg-[#0d0d0c] rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">Common Audience Mistakes to Avoid</p>
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
                      ['Selecting too broad interests', 'Low relevance → bad lead quality', 'Narrow down based on problem'],
                      ['Targeting all of India', 'High wastage', 'Localize or segment by income/city type'],
                      ['Ignoring funnel stage', 'Wrong messaging → no conversion', 'Match offer to awareness level'],
                      ['Using “beauty & fashion” for every product', 'Weak purchase intent', 'Use problem and solution based interests'],
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

            <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">Self-Check Before Launch</p>
              <ol className="list-decimal pl-5 text-white/80 space-y-1">
                <li>Will this audience immediately understand the problem my product solves?</li>
                <li>Does this audience have the ability and willingness to pay?</li>
                <li>Is my message appropriate for their stage in the awareness funnel?</li>
                <li>Is the audience size balanced (not too broad / not too narrow)?</li>
                <li>Is there alignment between creative tone and audience identity?</li>
              </ol>
              <p className="text-white/80 mt-2">If any answer is “No” → Fix targeting first.</p>
            </div>

            <div className="bg-[#0d0d0c] rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">Quick SOP Summary (Copy-Paste Ready)</p>
              <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
                <table className="w-full border-collapse">
                  <thead className="bg-black">
                    <tr>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Requirement</th>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Correct Geography Selected', '✅'],
                      ['Age & Gender aligned with product', '✅'],
                      ['Interests reflect pain/desire, not generic categories', '✅'],
                      ['Matching Funnel Stage Audience Selected', '✅'],
                      ['Audience Size Balanced (500K–3M for Cold)', '✅'],
                      ['Tested Variants A/B (at least 2 audiences)', '✅'],
                    ].map((row, i) => (
                      <tr key={i} className="bg-black">
                        <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                        <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-white/80 mt-3">
                When this checklist item is properly executed: → Lead Quality improves → Conversion Rates increase → Cost per Lead drops → Retargeting performs stronger → Scaling becomes predictable and profitable.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TargetAudiencePage;
