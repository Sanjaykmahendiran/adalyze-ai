"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Brain, Wrench, Star } from "lucide-react"
import Header from "@/components/landing-page/header"
import LandingPageFooter from "@/components/landing-page/landing-page-footer"

export default function SingleBrandPage() {
  const [activeTab, setActiveTab] = useState("free")

  return (
    <div className="min-h-screen ">
      <Header />

      {/* Hero Section */}
      <section className="py-20  mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="">
              <div className="inline-block mb-4 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary font-medium">
                Trusted by 1,200+ marketers
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Unlimited AI Ad Audits — For One Brand.
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Fix ad issues before you spend. Upload your ad, get instant AI suggestions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-hover">
                  Start Free Report
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  Compare Plans
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">No credit card to start</p>
            </div>
            <div className=" slide-in-bottom" style={{ animationDelay: "0.2s" }}>
              <div className="bg-card border border-border rounded-xl p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">AI Report Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Bullets */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className=" transition-all duration-300 hover:-translate-y-1 bg-black p-4 rounded-xl hover:shadow-lg hover:shadow-primary/20">
              <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant AI Score & Heatmap</h3>
              <p className="text-muted-foreground">
                Get real-time analysis of your ad performance with visual heatmaps.
              </p>
            </div>
            <div
              className=" transition-all duration-300 hover:-translate-y-1 bg-black p-4 rounded-xl hover:shadow-lg hover:shadow-primary/20"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Platform-Specific Fixes</h3>
              <p className="text-muted-foreground">Tailored recommendations for Facebook, Instagram, and Google Ads.</p>
            </div>
            <div
              className=" transition-all duration-300 hover:-translate-y-1 bg-black p-4 rounded-xl hover:shadow-lg hover:shadow-primary/20"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Actionable 1-Click Fixes</h3>
              <p className="text-muted-foreground">Apply suggested improvements directly to your ads instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center ">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload your ad", desc: "Share your ad creative or paste the URL" },
              { step: "2", title: "Receive instant report preview", desc: "Get AI analysis in less than 60 seconds" },
              {
                step: "3",
                title: "Unlock full report or upgrade",
                desc: "Access detailed insights and recommendations",
              },
            ].map((item, i) => (
              <div
                key={i}
                className=" transition-all duration-300 hover:-translate-y-1 bg-black p-4 rounded-xl p-8 hover:shadow-lg hover:shadow-primary/20"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg mb-4 flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Before/After */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center ">See the Difference</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="">
              <div className="bg-card border border-border rounded-xl p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Before</p>
                  <p className="text-lg font-semibold">Ad with Issues</p>
                </div>
              </div>
            </div>
            <div className=" slide-in-bottom" style={{ animationDelay: "0.2s" }}>
              <div className="bg-card border border-primary/50 rounded-xl p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-primary mb-2">After</p>
                  <p className="text-lg font-semibold">CTR ↑ 42%</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-8 " style={{ animationDelay: "0.3s" }}>
            "Adalyze helped us identify critical issues we missed. Highly recommended!" - Sarah M.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center ">Loved by Marketers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Johnson",
                company: "Digital Co",
                rating: 5,
                quote: "Game-changing tool for ad optimization.",
              },
              {
                name: "Maria Garcia",
                company: "Growth Labs",
                rating: 5,
                quote: "Saved us thousands in wasted ad spend.",
              },
              {
                name: "James Chen",
                company: "Marketing Pro",
                rating: 5,
                quote: "The best ad audit tool on the market.",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className=" transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 bg-background border border-border rounded-xl p-6"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 ">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center ">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "How many brands can I add?",
                a: "One brand only on the Single Brand plan. Upgrade to our Agency plan to manage multiple brands.",
              },
              {
                q: "How fast is the report?",
                a: "Less than 60 seconds. Our AI analyzes your ad and generates insights instantly.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className=" bg-card border border-border rounded-xl p-6"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 ">Ready to Audit Your Ads?</h2>
          <p className="text-xl text-muted-foreground mb-8 " style={{ animationDelay: "0.1s" }}>
            Start with a free report. No credit card required.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 glow-hover "
            style={{ animationDelay: "0.2s" }}
          >
            Start Free Report
          </Button>
        </div>
      </section>

      {/* Footer */}
      <LandingPageFooter />
    </div>
  )
}
