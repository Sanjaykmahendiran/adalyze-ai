'use client'

import React from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  FileText,
  AlertTriangle,
  MousePointerClick,
  Settings2,
  Eye,
  Check,
  XCircle,
  Target,
  CheckCircle2
} from 'lucide-react';

const PixelGtmPage: React.FC = () => {
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
            Pixel / GTM Installed
          </motion.h1>
          <p className="text-white/70 max-w-3xl mx-auto">
            In digital marketing, running ads without proper tracking is like flying a plane with no radar. You may see movement, but you won’t know where you’re heading or what’s working. Installing Pixel (Meta Pixel) or Google Tag Manager (GTM) ensures that your campaigns can measure, optimize, and scale profitably. This checklist item confirms that your tracking foundation is correctly set before launching any ads.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto">
        {/* What is Pixel / GTM */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">What is Pixel / GTM?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">Meta Pixel</p>
                <p className="text-white/80 mb-3">A small piece of code installed on your website or landing page that:</p>
                <ul className="space-y-2 text-white/80">
                  <li>• Tracks actions people take (visits, leads, add to cart, purchases)</li>
                  <li>• Helps Meta optimize ads towards people most likely to convert</li>
                  <li>• Enables remarketing (show ads to people who visited your site)</li>
                </ul>
              </div>
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">Google Tag Manager (GTM)</p>
                <p className="text-white/80 mb-3">
                  A container system that allows you to install and manage tracking codes without needing a developer each time.
                </p>
                <p className="text-white/80">
                  Instead of pasting Pixel, Google Analytics, Hotjar, etc. separately, you place just one GTM script, and manage the rest inside it.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">So:</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Without GTM</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">With GTM</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Multiple codes installed everywhere', 'One container manages all'],
                    ['Hard to update tracking', 'Easy to update, no code editing'],
                    ['Risk of breaking website layouts', 'Safe & controlled'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/70">—</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-black rounded-lg p-4 ring-1 ring-primary/40">
              <p className="text-white/90">
                Recommended Setup: <span className="font-semibold text-primary">Place GTM → Add Pixel, GA, events inside GTM.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Why Pixel / GTM critical */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Why Pixel / GTM Is Critical Before Running Ads</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-lg font-semibold text-rose-400 mb-3">Without Pixel/GTM:</p>
                <ul className="space-y-2 text-white/80">
                  <li>• You cannot track conversions.</li>
                  <li>• Meta will optimize ads blindly.</li>
                  <li>• Retargeting becomes impossible.</li>
                  <li>• You're forced to guess targeting decisions.</li>
                  <li>• Scaling becomes riskier and expensive.</li>
                </ul>
              </div>
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-lg font-semibold text-emerald-400 mb-3">With Pixel/GTM:</p>
                <ul className="space-y-2 text-white/80">
                  <li>• You know which campaigns produce leads or sales.</li>
                  <li>• Meta’s algorithm learns and brings better traffic over time.</li>
                  <li>• You can retarget: website visitors, viewers who scrolled, people who added to cart but didn’t buy.</li>
                  <li>• You build Lookalike Audiences of your best customers.</li>
                  <li>• Scaling becomes scientific and profitable.</li>
                </ul>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-5 ring-1 ring-primary/30">
              <p className="text-white">
                Bottom line: <span className="text-primary font-semibold">Pixel/GTM transforms your ads from luck-based marketing → data-driven marketing.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Where to place the pixel */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <MousePointerClick className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Where to Place the Pixel</h2>
            </div>

            <div className="space-y-3 text-white/80">
              <p>There are two steps:</p>
              <p className="text-white font-semibold">Step 1: Add Base Code Site-Wide</p>
              <p>The base Pixel code must go into the &lt;head&gt; section on every page of your site.</p>
              <ul className="space-y-1">
                <li>• If using GTM:</li>
                <li>  - Place the GTM container on every page</li>
                <li>  - Add Pixel inside GTM → no need to paste Pixel manually</li>
              </ul>
              <p className="text-white font-semibold mt-2">Step 2: Add Event Tracking</p>
              <p>Events tell Pixel what meaningful action occurred.</p>
            </div>

            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Event Name</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PageView', 'Someone visited the page'],
                    ['Lead', 'Someone submitted a form'],
                    ['AddToCart', 'User added product to cart'],
                    ['Purchase', 'Transaction completed'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">If your campaign goal is Lead Generation:</p>
                <ul className="text-white/80 space-y-1">
                  <li>• Configure Lead event on the "Thank You" page</li>
                </ul>
              </div>
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">If your goal is E-commerce Sales:</p>
                <ul className="text-white/80 space-y-1">
                  <li>• ViewContent → product page</li>
                  <li>• AddToCart → cart action</li>
                  <li>• InitiateCheckout → checkout start</li>
                  <li>• Purchase → completed order</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pixel setup simplified */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Settings2 className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Pixel Setup Simplified (No Technical Skill Needed)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">If Using WordPress</p>
                <p className="text-white/80">Install plugin:</p>
                <ul className="text-white/80 space-y-1 mt-2">
                  <li>• “PixelYourSite”</li>
                  <li>• Login → Paste Pixel ID → Enable tracking → Save</li>
                </ul>
              </div>
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">If Using Shopify</p>
                <p className="text-white/80">Go to: Sales Channels → Facebook → Settings → Connect</p>
                <p className="text-white/80 mt-2">Shopify auto-installs Pixel perfectly.</p>
              </div>
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">If Using Webflow / Custom Sites</p>
                <p className="text-white/80">Use Google Tag Manager (recommended).</p>
              </div>
            </div>
          </div>
        </section>

        {/* GTM power */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Google Tag Manager — Why It’s Powerful</h2>
            </div>

            <p className="text-white/80">GTM acts as your control center. Inside GTM you define:</p>
            <ul className="text-white/80 space-y-1">
              <li>• Tags (Pixel, GA, Hotjar, etc.)</li>
              <li>• Triggers (when should they fire)</li>
              <li>• Variables (dynamic values like purchase amount)</li>
            </ul>
            <p className="text-white/80 mt-2">This means:</p>
            <ul className="text-white/80 space-y-1">
              <li>• You can add/remove/modify tracking without touching website code</li>
              <li>• You prevent tracking errors</li>
              <li>• You work faster and cleaner</li>
            </ul>
          </div>
        </section>

        {/* Testing Pixel / GTM */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Testing Whether Pixel / GTM Works</h2>
            </div>

            <p className="text-white/80">You must test before launching campaigns.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold">✅ Meta Pixel Helper (Chrome Extension)</p>
                <p className="text-white/80 mt-2">It shows:</p>
                <ul className="text-white/80 space-y-1">
                  <li>• Pixel installed or not</li>
                  <li>• Events firing correctly or not</li>
                  <li>• Any errors</li>
                </ul>
              </div>
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold">✅ Google Tag Assistant</p>
                <p className="text-white/80 mt-2">Tests GTM and GA tracking.</p>
                <p className="text-white/80">If events are not firing → Fix before running ads.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Event quality */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Check className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Understanding Event Quality</h2>
            </div>

            <p className="text-white/80">It’s not enough for events to fire — they must be high-quality signals.</p>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Low Quality Pixel Setup</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">High Quality Pixel Setup</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['All events fire on every page', 'Events fire only on meaningful actions'],
                    ['No event parameters', 'Events include value, currency, product details'],
                    ['Algorithm learns nothing', 'Algorithm learns who is likely to convert'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-white/90">
              Meaning: <span className="text-primary font-semibold">Better data → Better optimization → Cheaper conversions.</span>
            </p>
          </div>
        </section>

        {/* Fail reasons & retargeting */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-rose-400" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Why Most Campaigns Fail Without Pixel</h2>
            </div>
            <ul className="text-white/80 space-y-1">
              <li>• Meta doesn’t know who converted</li>
              <li>• It keeps sending traffic that looks cheap, but never converts</li>
            </ul>
            <p className="text-white/80">This leads to: Fake leads, Irrelevant clicks, Poor purchase rates, Rising CPC and CPL over time.</p>

            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h3 className="text-xl md:text-2xl font-bold text-white">Retargeting & Lookalike Benefits</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">Retarget:</p>
                <ul className="text-white/80 space-y-1">
                  <li>• People who visited landing page but didn’t submit</li>
                  <li>• People who watched 75% of my video ads</li>
                  <li>• Add to cart but didn’t checkout</li>
                </ul>
                <p className="text-white/80 mt-2">These audiences convert 3–10× better than cold traffic.</p>
              </div>
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-white font-semibold mb-2">Lookalikes:</p>
                <p className="text-white/80">Based on: Website Visitors, Leads, Purchasers</p>
                <p className="text-white/80 mt-2">This is how scaling becomes profitable without increasing risk.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Common pixel mistakes */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-8 w-8 text-rose-400" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Common Mistakes to Avoid</h2>
            </div>
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
                    ['Only PageView event installed', 'No conversion optimization', 'Add proper events'],
                    ['Fake conversion events (firing before action)', 'Leads get worse over time', 'Fire event only after success page'],
                    ['Pixel installed on landing page but not checkout', 'Purchase journey breaks', 'Track full funnel'],
                    ['Using too many pixels', 'Conflicts, slow site', 'Use only one main pixel'],
                    ['Not verifying triggers', 'Wrong data → wrong decisions', 'Always test with Pixel Helper'],
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

        {/* Final pixel checklist */}
        <section className="px-4 py-4 md:py-6">
          <div className="bg-[#141413] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-white">Final Quick SOP Checklist</h2>
            </div>
            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-black">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Task</th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-white font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['GTM Installed Site-wide', '✅'],
                    ['Meta Pixel Added via GTM', '✅'],
                    ['Key Events Set (Lead/Purchase/AddToCart)', '✅'],
                    ['Events Tested with Pixel Helper', '✅'],
                    ['Retargeting Custom Audiences Created', '✅'],
                    ['Lookalike Audiences Ready for Scaling', '✅'],
                  ].map((row, i) => (
                    <tr key={i} className="bg-black">
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[0]}</td>
                      <td className="border border-zinc-800 px-4 py-3 text-white/80">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-white/80 mt-4">
              When this checklist item is DONE correctly, your campaigns stop relying on luck and start improving automatically as data accumulates — which is how consistent, profitable scaling is achieved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PixelGtmPage;
