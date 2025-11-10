'use client'

import React from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Target,
  Check,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ConversionEventPage: React.FC = () => {
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
            Conversion Event Set
          </motion.h1>
          <p className="text-white/70 max-w-3xl mx-auto">
            Define, track, and optimize for the right conversion event. If you don’t set which event matters, platforms optimize for the wrong action, causing low-quality leads, high costs, irrelevant traffic, and poor revenue outcomes.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto">
        {/* What is a conversion event */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">What Is a Conversion Event?</h2>
            </div>
            <p className="text-white/80">
              A conversion event is a trackable action a user performs after clicking your ad — an action that indicates progress toward your business goal.
            </p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Business Type</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Conversion Event</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Why It Matters</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Service Business (e.g., clinic, marketing agency)', 'Lead (form submission or call)', 'Conversions = potential clients'],
                    ['Coaching / Courses', 'Sign-up for webinar or trial', 'Builds pipeline for nurturing'],
                    ['E-commerce', 'Purchase', 'Direct revenue measurement'],
                    ['Real Estate', 'Site Visit Booking / Lead', 'High-value lead qualification'],
                    ['App / SaaS', 'Free Trial Start / Signup', 'Entry into product conversion journey'],
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

            <div className="bg-black rounded-lg p-5 ring-1 ring-white/10 space-y-3">
              <p className="text-white font-semibold">Why This Step Is Critical</p>
              <p className="text-white/80">
                When you choose a conversion event, the ad platform does not just track it — it learns who is more likely to perform that event and optimizes delivery accordingly.
              </p>
              <ul className="text-white/80 space-y-1">
                <li>• If you optimize for Traffic → The platform finds people who click a lot, not buyers.</li>
                <li>• If you optimize for Landing Page Views → It finds people who like to browse, not act.</li>
                <li>• If you optimize for Leads → It finds people who actually submit forms.</li>
                <li>• If you optimize for Purchases → It finds people with purchase intent.</li>
              </ul>
              <p className="text-white/90">
                Meaning: <span className="text-primary font-semibold">Your optimization event determines the quality of your results.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Choosing the right event */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6">
            <p className="text-white font-semibold mb-3">Choosing the Right Conversion Event (Simple Rule)</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Stage of Funnel</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Best Conversion Event</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">When to Use</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Cold Audiences (new users)', 'Lead / Add to Cart / View Content', 'When testing awareness & broad traffic'],
                    ['Warm Audiences (visited or engaged before)', 'Initiate Checkout / Add to Cart', 'When nurturing mid-intent buyers'],
                    ['Hot Audiences (already high intent)', 'Purchase', 'When pushing for final conversion'],
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
            <p className="text-white/80 mt-3">
              If you choose an event that is too advanced too early (e.g., Purchase on a brand-new site with no history), the algorithm has no data → results will be expensive and inconsistent. Start with an event where you can get at least 50 events per week — this is the minimum learning signal threshold recommended by Meta & Google.
            </p>
          </div>
        </section>

        {/* How to configure */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-3">
            <p className="text-white font-semibold">How to Configure the Conversion Event</p>
            <ol className="list-decimal pl-5 text-white/80 space-y-2">
              <li>Ensure Pixel / GA / GTM Is Installed (Completed in Checklist #3)</li>
              <li>
                Decide the exact conversion trigger
                <div className="mt-2">
                  <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
                    <table className="w-full border-collapse">
                      <thead className="bg-black">
                        <tr>
                          <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Desired Action</th>
                          <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Where the Event Should Fire</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Lead Form Submit', 'On the Thank You page'],
                          ['Purchase', 'After order success page loads'],
                          ['Book Call', 'When user reaches confirmation screen'],
                          ['Contact Form', 'On form success popup / redirect'],
                        ].map((row, i) => (
                          <tr key={i} className="bg-black">
                            <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                            <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-white/80 mt-2">Never attach the conversion event to the landing page itself. This leads to fake conversions and completely ruins optimization.</p>
                </div>
              </li>
              <li>
                Set the Event in Meta Ads Manager
                <ul className="text-white/80 mt-2 space-y-1">
                  <li>• Go to Events Manager</li>
                  <li>• Click Aggregated Event Measurement (iOS14+ requirements)</li>
                  <li>• Select your domain</li>
                  <li>• Assign your Primary Conversion Event (Lead, Purchase, etc.)</li>
                  <li>• Verify domain if required</li>
                </ul>
              </li>
              <li>
                For Google Ads:
                <ul className="text-white/80 mt-2 space-y-1">
                  <li>• Go to Tools & Settings</li>
                  <li>• Select Conversions</li>
                  <li>• Create Conversion Action (Lead, Purchase, etc.)</li>
                  <li>• Import from GA4 if needed</li>
                  <li>• Choose Bidding Optimization = Max Conversions / Target CPA / ROAS</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        {/* Testing and mistakes */}
        <section className="px-4 py-8 md:py-10">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <div>
              <p className="text-white font-semibold mb-2">Testing Conversion Events (Do NOT Skip)</p>
              <ul className="text-white/80 space-y-1">
                <li>✔ Fire only when the conversion truly happens</li>
                <li>✔ Be visible inside Pixel Helper or Tag Assistant</li>
                <li>✔ Register in Events Manager / GA4 data</li>
                <li>✔ Match the event selected in the campaign</li>
              </ul>
              <p className="text-white/80 mt-3 font-semibold">Simple Testing Procedure:</p>
              <ol className="list-decimal pl-5 text-white/80 space-y-1">
                <li>Open landing page in incognito</li>
                <li>Complete the action (form submit, purchase, etc.)</li>
                <li>Watch Pixel/Tag debugger</li>
                <li>Confirm that Lead/Purchase fires after success page loads</li>
                <li>Check if event appears in dashboard within 5 minutes</li>
              </ol>
              <p className="text-white/80 mt-2">If it fires before the user submits → Fix immediately.</p>
            </div>

            <div className="bg-[#0d0d0c] rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">Common Mistakes & Their Effects</p>
              <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
                <table className="w-full border-collapse">
                  <thead className="bg-black">
                    <tr>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Mistake</th>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Result</th>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Why It's Bad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Conversion event fires too early', 'Fake leads / wasted budget', 'Algorithm learns wrong behavior'],
                      ['Event not set at all', 'Optimization stuck at Awareness level', 'Very low lead/purchase rate'],
                      ['Using Traffic objective while wanting leads', 'High CTR but no conversions', 'Platform sends “clickers”, not buyers'],
                      ['Event firing multiple times', 'Inflated conversion count', 'Can kill optimization accuracy'],
                      ['Optimizing for wrong event (e.g., ViewContent instead of Purchase)', 'Poor ROAS', 'Wrong audience targeting learning'],
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
              <p className="text-white font-semibold mb-2">Real Example of How Conversion Events Change Results</p>
              <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
                <table className="w-full border-collapse">
                  <thead className="bg-black">
                    <tr>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Campaign Setup</th>
                      <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Optimized for Clicks', 'Many visits, very few leads'],
                      ['Optimized for Landing Page Views', 'Slightly better, still weak lead quality'],
                      ['Optimized for Lead', '3× higher quality and lower CPL'],
                      ['Optimized for Qualified Lead (custom event)', 'Best lead-to-client conversion ratio'],
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
                Choosing the right event is the difference between expensive, unqualified leads and high-converting, ready buyers.
              </p>
            </div>

            <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">When to Change Conversion Events</p>
              <ul className="text-white/80 space-y-1">
                <li>• If your campaign is new: Start with Lead event until you collect data.</li>
                <li>• After 200–500 quality leads, switch to: Qualified Lead or Purchase.</li>
              </ul>
              <p className="text-white/80 mt-2">Your tracking maturity grows in stages, not instantly.</p>
            </div>

            <div className="bg-[#0d0d0c] rounded-lg p-5 ring-1 ring-white/10">
              <p className="text-white font-semibold mb-2">Final Quick SOP Checklist</p>
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
                      ['Conversion event defined by business goal', '✅'],
                      ['Event fires only at true success step', '✅'],
                      ['Pixel / GTM configured properly', '✅'],
                      ['Event tested using debugger tools', '✅'],
                      ['Event selected in Ads Manager campaign setup', '✅'],
                      ['Algorithm receiving at least 50 events/week', '✅'],
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
                When this checklist item is fully implemented, your campaigns stop chasing vanity metrics (clicks, views) and begin optimizing for real business outcomes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ConversionEventPage;
