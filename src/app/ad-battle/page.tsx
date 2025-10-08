"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import AdBattleCard from "./_components/ad-battle-card"
import AdShare from "./_components/ad-share"

type VoteKey = "A" | "B"

function useCountdown(hours: number) {
  const [remaining, setRemaining] = React.useState(() => hours * 60 * 60 * 1000)
  React.useEffect(() => {
    const start = Date.now()
    const end = start + hours * 60 * 60 * 1000
    const tick = () => {
      const now = Date.now()
      setRemaining(Math.max(0, end - now))
    }
    const id = setInterval(tick, 1000)
    tick()
    return () => clearInterval(id)
  }, [hours])

  const totalMinutes = Math.floor(remaining / (60 * 1000))
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `⏱ ${pad(h)}h ${pad(m)}m remaining`
}

export default function AdBattlePage() {
  const [votesA, setVotesA] = React.useState<number>(52)
  const [votesB, setVotesB] = React.useState<number>(48)
  const [votedFor, setVotedFor] = React.useState<VoteKey | null>(null)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("adalyze-battle-voted")
      if (stored === "A" || stored === "B") setVotedFor(stored)
      const a = localStorage.getItem("adalyze-battle-votes-a")
      const b = localStorage.getItem("adalyze-battle-votes-b")
      if (a) setVotesA(Number.parseInt(a, 10))
      if (b) setVotesB(Number.parseInt(b, 10))
    } catch {}
  }, [])

  const handleVote = (key: VoteKey) => {
    if (votedFor) return
    if (key === "A") {
      setVotesA((v) => {
        const next = v + 1
        try {
          localStorage.setItem("adalyze-battle-votes-a", String(next))
        } catch {}
        return next
      })
    } else {
      setVotesB((v) => {
        const next = v + 1
        try {
          localStorage.setItem("adalyze-battle-votes-b", String(next))
        } catch {}
        return next
      })
    }
    setVotedFor(key)
    try {
      localStorage.setItem("adalyze-battle-voted", key)
    } catch {}
  }

  const total = votesA + votesB || 1
  const pctA = Math.round((votesA / total) * 100)
  const pctB = 100 - pctA

  const countdown = useCountdown(12)

  return (
    <main
      style={
        {
          "--background": "#0e0e0e",
          "--foreground": "#ffffff",
          "--muted-foreground": "#cccccc",
          "--primary": "#db4900",
          "--primary-foreground": "#ffffff",
          "--accent": "#ff8a3d",
          "--accent-foreground": "#0e0e0e",
          "--card": "#141414",
          "--card-foreground": "#ffffff",
          "--ring": "#ff8a3d",
          "--radius": "0.875rem",
        } as React.CSSProperties
      }
      className="min-h-[100svh] bg-background text-foreground"
      aria-labelledby="ad-battle-title"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-12">
        <header className="mb-8 md:mb-10">
          <h1 id="ad-battle-title" className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            {"🏁 Education Category Battle"}
          </h1>
          <p className="mt-1 text-muted-foreground">{"Which ad is more engaging and well-designed?"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-card px-3 py-1 text-sm text-foreground/90 ring-1 ring-border">
              {countdown}
            </span>
            <span className="text-sm text-muted-foreground">{"Anyone can vote once per device."}</span>
          </div>
        </header>

        <section className="relative grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Card A */}
          <AdBattleCard
            title="Uploader: Campus Creatives"
            mediaAlt="Education ad creative A"
            mediaSrc="/education-ad-creative-a.jpg"
            votes={votesA}
            onVote={() => handleVote("A")}
            hasVoted={!!votedFor}
          />

          {/* Center VS divider */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
            aria-hidden
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-base font-semibold text-foreground shadow-lg">
              {"VS"}
            </div>
          </div>

          {/* Card B */}
          <AdBattleCard
            title="Uploader: Learning Labs"
            mediaAlt="Education ad creative B"
            mediaSrc="/education-ad-creative-b.jpg"
            votes={votesB}
            onVote={() => handleVote("B")}
            hasVoted={!!votedFor}
          />

          {/* Mobile VS badge */}
          <div className="col-span-2 -mt-2 flex justify-center md:hidden" aria-hidden>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-foreground shadow">
              {"VS"}
            </div>
          </div>
        </section>

        {/* Live comparison bar */}
        <section className="mt-8 md:mt-10">
          <Card className="bg-card/60 shadow-sm">
            <CardContent className="p-4 md:p-5">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>{`A: ${pctA}% (${votesA} votes)`}</span>
                <span>{`B: ${pctB}% (${votesB} votes)`}</span>
              </div>
              <div
                className="relative h-3 w-full overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`Vote distribution: ${pctA}% for Ad A and ${pctB}% for Ad B`}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${pctA}%` }}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-accent transition-[width] duration-500 ease-out"
                  style={{ width: `${pctB}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Share + CTA */}
        <section className="mt-8 space-y-3 md:mt-10">
          <AdShare />
          <div className="text-center">
            <p className="text-pretty text-sm text-muted-foreground">{"Help me win! Vote for my ad 🔥"}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "Vote for my ad in the Adalyze Battle!",
                )}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X (Twitter)"
                className={cn(
                  "inline-flex h-8 items-center justify-center rounded-full bg-accent px-3 text-xs font-medium text-accent-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95",
                )}
              >
                {"X"}
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.href : "",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="inline-flex h-8 items-center justify-center rounded-full bg-accent px-3 text-xs font-medium text-accent-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                {"in"}
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Vote for my ad in the Adalyze Battle! ${typeof window !== "undefined" ? window.location.href : ""}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="inline-flex h-8 items-center justify-center rounded-full bg-accent px-3 text-xs font-medium text-accent-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                {"WA"}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
