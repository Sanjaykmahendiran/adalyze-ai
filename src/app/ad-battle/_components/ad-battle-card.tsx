"use client"

import Image from "next/image"
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Props = {
  title: string
  mediaSrc: string
  mediaAlt: string
  votes: number
  onVote: () => void
  hasVoted: boolean
}

export default function AdBattleCard({
  title,
  mediaSrc,
  mediaAlt,
  votes,
  onVote,
  hasVoted,
}: Props) {
  return (
    <Card className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
      <CardContent className="p-0">
        {/* Media */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={mediaSrc || "/placeholder.svg"}
            alt={mediaAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03]"
            priority
          />
          <div className="pointer-events-none absolute inset-0 rounded-t-xl ring-1 ring-inset ring-border/30" />
        </div>

        {/* Meta + Action */}
        <div className="space-y-3 p-4 md:p-5">
          <h3 className="text-pretty text-lg font-medium tracking-tight">{title}</h3>

          <div className="flex items-center justify-between">
            <p
              className="text-sm text-muted-foreground"
              aria-live="polite"
              aria-atomic="true"
            >
              {`Votes: ${votes}`}
            </p>

            {!hasVoted ? (
              <Button
                onClick={onVote}
                className="bg-primary text-primary-foreground shadow-sm transition-transform duration-200 hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
              >
                {"👍 Vote for this Ad"}
              </Button>
            ) : (
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {"✅ Thanks! Your vote is counted."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {"Login to earn coins for voting."}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
