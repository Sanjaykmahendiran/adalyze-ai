"use client";

import {
  Check,
  Smartphone,
  AlertTriangle,
  Zap,
  Type,
  MousePointerClick,
  Gauge,
  Users,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import IntroImage from "@/assets/checklist/lp-intro-section.webp";
import ChecklistHeade from "../header/page";
import { motion } from "framer-motion";
import dashboard from "@/assets/Landing-page/agencies.webp";
import utm from "@/assets/Landing-page/step1.png";

const MobileFriendlyLandingPage: React.FC = () => {
  return (
    <main className="w-full bg-black antialiased ">
      <ChecklistHeade />

      <div className="max-w-7xl mx-auto">
        {/* Intro copy */}
        <section className="px-4 py-3 md:py-5 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto space-y-6 bg-[#141413] rounded-2xl p-6"
          >
            <div className="flex flex-col items-center text-center justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl md:text-5xl font-bold mb-2 leading-tight"
              >
                UTM Tracking Added
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-base md:text-lg leading-relaxed text-gray-200"
            >
              When you run paid campaigns, it’s not enough to just bring traffic
              to your website or landing page. You need to measure where that
              traffic came from, which ad or audience performed better, and what
              finally converted. Without proper tracking, your marketing becomes
              guesswork. That’s where UTM parameters come in.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-base md:text-lg leading-relaxed text-gray-200 text-left"
            >
              <p className="mb-4">UTM tags allow you to identify:</p>

              {/* Badge Row */}
              <div className="flex flex-wrap justify-start gap-3 mb-4">
                {[
                  "Which campaign",
                  "Which ad creative",
                  "Which audience",
                  "Which platform",
                  "Which placement",
                ].map((item) => (
                  <span
                    key={item}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm md:text-base font-medium ring-1 ring-white/20 hover:bg-white/20 transition"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <p className="mt-2 max-w-2xl">
                is actually generating traffic, leads, and conversions. This
                ensures you spend more money on what works and cut what doesn't
                — which is exactly how profitable campaigns are scaled.
              </p>
            </motion.div>

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

        {/* What are UTMs */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-2"
            >
              <FileText className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                What Are UTM Parameters?
              </h2>
            </motion.div>

            <p className="text-base md:text-lg text-white/80">
              UTM stands for Urchin Tracking Module, originally created by
              Google. They are small text snippets added to the end of your URL
              to help track traffic in analytics tools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-sm text-white/60 mb-2">
                  Example of a URL without UTM:
                </p>
                <pre className="text-white/90 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                  https://yourwebsite.com/product-page
                </pre>
              </div>
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-sm text-white/60 mb-2">Example with UTM:</p>
                <pre className="text-white/90 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                  https://yourwebsite.com/product-page?utm_source=facebook&amp;utm_medium=cpc&amp;utm_campaign=summer_sale&amp;utm_content=ad1
                </pre>
              </div>
            </div>
            <p className="text-base md:text-lg text-white/80">
              Both links lead to the same page, but the second one carries
              tracking data.
            </p>
          </div>
        </section>

        {/* Why UTMs matter */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Why UTM Tags Matter in Digital Marketing
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-lg font-semibold text-rose-400 mb-3">
                  Without UTMs:
                </p>
                <ul className="space-y-2 text-white/80">
                  <li>• You won't know which ads brought the clicks.</li>
                  <li>
                    • Google Analytics will show all traffic as "Direct" or
                    "Unassigned".
                  </li>
                  <li>• You will guess instead of optimize.</li>
                  <li>• You waste budget.</li>
                </ul>
              </div>
              <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                <p className="text-lg font-semibold text-emerald-400 mb-3">
                  With UTMs:
                </p>
                <ul className="space-y-2 text-white/80">
                  <li>
                    • You understand exactly which campaigns are converting.
                  </li>
                  <li>
                    • You can compare creatives, audiences, and placements.
                  </li>
                  <li>
                    • Scaling decisions become data-driven, not emotional.
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-black rounded-lg p-6 ring-1 ring-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
                {/* Left Side — Text + List */}
                <div>
                  <p className="text-lg font-semibold text-primary mb-4">
                    This is especially critical when running:
                  </p>

                  <ul className="space-y-2 text-white/80">
                    <li>• Meta Ads (Facebook/Instagram)</li>
                    <li>• Google Search & Display ads</li>
                    <li>• LinkedIn Lead Gen ads</li>
                    <li>• YouTube ads</li>
                    <li>• Influencer campaigns</li>
                  </ul>
                </div>

                {/* Right Side — Image */}
                <div className="flex justify-center lg:justify-end">
                  <Image
                    src={dashboard}
                    alt="Tracking Dashboard"
                    className="w-full max-w-sm "
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key UTM Parameters */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-start gap-2 mb-6"
            >
              {/* Icon + Heading */}
              <div className="flex items-center gap-3">
                <Type className="h-8 w-8 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Key UTM Parameters
                </h2>
              </div>

              {/* Tag */}
              <div className="mt-2 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <p className="text-sm md:text-base text-white/70">
                  You Only Need These 3–5
                </p>
              </div>
            </motion.div>

            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-primary">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Parameter
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Required
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Meaning
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      p: "utm_source",
                      req: "✅",
                      meaning: "Platform sending traffic",
                      ex: "facebook, google, instagram",
                    },
                    {
                      p: "utm_medium",
                      req: "✅",
                      meaning: "Marketing type",
                      ex: "cpc, email, display, referral",
                    },
                    {
                      p: "utm_campaign",
                      req: "✅",
                      meaning: "Campaign Name",
                      ex: "diwali_offer, summer_sale",
                    },
                    {
                      p: "utm_content",
                      req: "Optional",
                      meaning: "Creative Version",
                      ex: "ad1, video_ad, carousel_2",
                    },
                    {
                      p: "utm_term",
                      req: "Optional",
                      meaning: "Keyword (Google Search)",
                      ex: "hair fall oil online",
                    },
                  ].map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className="bg-black"
                    >
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.p}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.req}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.meaning}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.ex}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-white/80 mt-4">
              You don’t need to use all 5 every time just enough to track
              meaningful differences.
            </p>
          </div>
        </section>

        {/* Create UTM links easily */}
        <section className="px-4 py-3 md:py-10">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <ExternalLink className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                How to Create UTM Links Easily
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <Image
                  src={utm}
                  alt="UTM Link Builder Guide"
                  className="rounded-xl shadow-lg w-full max-w-md object-cover"
                />
              </motion.div>

              {/* Right Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-black rounded-lg p-5 ring-1 ring-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a
                      href="https://ga-dev-tools.google/ga4/campaign-url-builder/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-words"
                    >
                      https://ga-dev-tools.google/ga4/campaign-url-builder/
                    </a>
                  </div>

                  <ol className="list-decimal pl-5 space-y-2 text-white/80">
                    <li>Website URL</li>
                    <li>Source: facebook</li>
                    <li>Medium: cpc</li>
                    <li>Campaign: brand-awareness</li>
                    <li>Content: carousel_1</li>
                  </ol>

                  <div className="flex items-center gap-2 text-white/80">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Click Copy URL.</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Paste this URL into your Ad Destination Link.</span>
                  </div>

                  <p className="text-white/80">Done.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Naming UTMs properly */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-start mb-6"
            >
            
              {/* Icon + Heading */}
              <div className="flex items-center gap-3">
                 <Type className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                How to Name Your UTMs Properly
              </h2>
              </div>
            
              {/* Small Tag Below Heading */}
             <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <p className="text-sm md:text-base text-white/70">
                  Save Time Later
                </p>
              </div>
            
            </motion.div>
            <p className="text-white/80">
              Consistent naming prevents confusion when analyzing data. Use
              lowercase with hyphens like:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white/80">utm_source=facebook</p>
                <p className="text-white/80">utm_medium=cpc</p>
                <p className="text-white/80">
                  utm_campaign=hairfall-oil-leads-nov
                </p>
                <p className="text-white/80">utm_content=video-v1</p>
              </div>
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-rose-400 font-medium mb-2">Avoid:</p>
                <p className="text-white/80">UTM_Source=FB</p>
                <p className="text-white/80">utm_campaign=Test123</p>
              </div>
            </div>
            <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
              <p className="text-white/80 mb-2">Because:</p>
              <ul className="space-y-2 text-white/80">
                <li>• Capitalization creates separate rows in analytics</li>
                <li>• Random names make analysis impossible later</li>
              </ul>
            </div>
          </div>
        </section>

        {/* UTM Naming Template */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <FileText className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                UTM Naming Template
              </h2>
            </motion.div>

            <div className="overflow-x-auto rounded-lg ring-1 ring-white/10">
              <table className="w-full border-collapse">
                <thead className="bg-primary">
                  <tr>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Component
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Template
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Campaign", "product-goal-month", "hair-oil-leads-feb"],
                    [
                      "Content",
                      "creative-type-version",
                      "carousel-v3, video-v1",
                    ],
                  ].map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className="bg-black"
                    >
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row[0]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row[1]}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row[2]}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
              <p className="text-white/80 mb-2">Example Final URL</p>
              <pre className="text-white/90 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                https://brand.com/lp?utm_source=facebook&amp;utm_medium=cpc&amp;utm_campaign=hair-oil-leads-feb&amp;utm_content=video-v2
              </pre>
            </div>
          </div>
        </section>

        {/* Where you will see UTM data */}
        <section className="px-4 py-3 md:py-10">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 md:p-10">
            {/* Title */}
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             viewport={{ once: true }}
             className="flex flex-col items-start justify-start mb-6"
           >
           
             {/* Icon + Heading */}
             <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Where You Will See UTM Data
              </h2>
             </div>
           
             {/* Small Tag Below Heading */}
            <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
             <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
               <p className="text-sm md:text-base text-white/70">
                 Important
               </p>
             </div>
           
           </motion.div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* LEFT CONTENT */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Info Boxes */}
                <div className="space-y-4">
                  {/* GA4 */}
                  <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                    <p className="text-white font-semibold mb-2">
                      1. Google Analytics (GA4)
                    </p>
                    <p className="text-white/80">
                      Navigate to: Reports → Acquisition → Traffic Acquisition
                    </p>
                    <p className="text-white/80">
                      You will see: Source/Medium, Campaign names, Conversions
                      per campaign
                    </p>
                  </div>

                  {/* Meta Ads Manager */}
                  <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                    <p className="text-white font-semibold mb-2">
                      2. Meta Ads Manager
                    </p>
                    <p className="text-white/80">
                      If your landing page has GA4 + Pixel installed, you can
                      cross-check lead quality.
                    </p>
                  </div>

                  {/* CRM / Lead System */}
                  <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                    <p className="text-white font-semibold mb-2">
                      3. CRM or Lead System
                    </p>
                    <p className="text-white/80">
                      If you’re passing UTMs into forms (highly recommended),
                      you will know which specific campaign brought each lead.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT IMAGE */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <Image
                  src={utm}
                  alt="Where You See UTM Data"
                  className="rounded-xl shadow-lg w-full max-w-md object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pass UTMs into form */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-start mb-4"
            >
              {/* Icon + Heading */}
              <div className="flex items-center gap-3">
                <MousePointerClick className="h-8 w-8 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  How to Pass UTMs Into Your Lead Form
                </h2>
              </div>

              {/* Small Tag Below Heading */}
              <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <p className="text-sm md:text-base text-white/70">Must Do</p>
              </div>
            </motion.div>

            <p className="text-white/80">Most marketers forget this part.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white/80 mb-2">
                  If your landing page form has fields like:
                </p>
                <ul className="space-y-1 text-white/80">
                  <li>• Name</li>
                  <li>• Phone</li>
                  <li>• Email</li>
                </ul>
              </div>
              <div className="bg-black rounded-lg p-4 ring-1 ring-white/10">
                <p className="text-white/80 mb-2">Add hidden fields like:</p>
                <ul className="space-y-1 text-white/80">
                  <li>• utm_source</li>
                  <li>• utm_medium</li>
                  <li>• utm_campaign</li>
                  <li>• utm_content</li>
                </ul>
              </div>
            </div>
            <p className="text-white/80">
              Then store them in your lead database. This allows you to see:
              "Which ads created real customers, not just clicks."
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-2 bg-primary/20 ring-1 ring-primary/40 rounded-lg p-4 flex items-start gap-3"
            >
              <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-base md:text-lg text-primary font-medium">
                This is where scaling magic happens.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Common UTM mistakes */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <XCircle className="h-8 w-8 md:h-10 md:w-10 text-rose-400 shrink-0" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Common UTM Mistakes to Avoid
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="overflow-x-auto rounded-lg ring-1 ring-white/10 mb-8"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary">
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Mistake
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Impact
                    </th>
                    <th className="border border-zinc-800 px-4 py-3 text-left text-base font-bold text-white">
                      Fix
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      mistake: "Using inconsistent names",
                      impact: "Hard to track performance",
                      fix: "Create naming rules",
                    },
                    {
                      mistake: "Forgetting UTM content on multiple creatives",
                      impact: "Fail to compare which ad worked",
                      fix: "Ensure utm_content changes per ad",
                    },
                    {
                      mistake: "Using uppercase randomly",
                      impact: "Creates duplicate campaign rows",
                      fix: "Use lowercase only",
                    },
                    {
                      mistake: "Adding UTMs AFTER the ad has run",
                      impact: "You lose early data",
                      fix: "Always add UTMs before launch",
                    },
                    {
                      mistake: "Using homepage as landing page",
                      impact: "No message continuity",
                      fix: "Always use campaign-specific page",
                    },
                  ].map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="hover:bg-black bg-black"
                    >
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.mistake}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.impact}
                      </td>
                      <td className="border border-zinc-800 px-4 py-3 text-gray-200 text-base">
                        {row.fix}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* Why critical before launch */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6 md:p-10 space-y-8">
            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <AlertTriangle className="h-8 w-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Why This Checklist Item Is Critical Before Launch
              </h2>
            </motion.div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left Side — Two Cards */}
              <div className="space-y-6">
                <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                  <p className="text-lg font-semibold text-rose-400 mb-3">
                    If UTMs are not added:
                  </p>
                  <ul className="space-y-2 text-white/80">
                    <li>• You will not know which ad is wasting money.</li>
                    <li>• Optimization becomes opinion-based.</li>
                    <li>• Scaling becomes dangerous and expensive.</li>
                    <li>• Your monthly reporting becomes guesswork.</li>
                  </ul>
                </div>

                <div className="bg-black rounded-lg p-5 ring-1 ring-white/10">
                  <p className="text-lg font-semibold text-emerald-400 mb-3">
                    If UTMs are added:
                  </p>
                  <ul className="space-y-2 text-white/80">
                    <li>• You easily find best performing ads</li>
                    <li>• You cut losers and scale winners</li>
                    <li>• You stop wasting money</li>
                    <li>
                      • You look like someone who truly understands data-driven
                      marketing
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Side — Image */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex justify-center lg:justify-end"
              >
                <Image
                  src={utm}
                  alt="UTM Tracking Dashboard"
                  className="w-full max-w-md "
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final checklist */}
        <section className="px-4 py-3 md:py-5">
          <div className="max-w-7xl mx-auto bg-[#141413] rounded-2xl p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-start justify-start mb-6"
            >
              {/* Icon + Heading */}
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Quick Final Checklist
                </h2>
              </div>

              {/* Small Tag Below Heading */}
              <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 ring-1 ring-primary/40 rounded-full px-4 py-1">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <p className="text-sm md:text-base text-white/70">
                  Copy-Paste to Internal SOP
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black rounded-2xl p-6 md:p-8 "
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-base md:text-lg font-bold text-white">
                        Question
                      </th>
                      <th className="px-4 py-3 text-center text-base md:text-lg font-bold text-white">
                        Yes/No
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      "Are UTM parameters added to the destination link? ✅",
                      "Are all UTMs lowercase and consistent? ✅",
                      "Does utm_content change for each creative? ✅",
                      "Are UTMs being captured into CRM (if leads)? ✅",
                      "Have UTM links been tested on mobile? ✅",
                    ].map((q, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="hover:bg-[#1f1f1f] transition-colors"
                      >
                        <td className="px-4 py-4 text-base text-white/80">
                          {q}
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

export default MobileFriendlyLandingPage;
