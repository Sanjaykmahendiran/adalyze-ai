"use client"

import { Sparkles } from "lucide-react"
import { FixedResult } from "../type"

interface FixedAdPanelProps {
  result: FixedResult
  originalImageUrl?: string
  originalScore?: number
}

export default function FixedAdPanel({
  result,
  originalImageUrl,
  originalScore,
}: FixedAdPanelProps) {
  const isGo = result.newGoNoGo === "Go"

  const formattedDate = (() => {
    try {
      return new Date(result.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return result.createdAt
    }
  })()

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#111111] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-primary flex-shrink-0" />
        <span className="text-white font-semibold text-sm">Fixed Version</span>
        <span className="ml-auto text-white/40 text-xs">
          Fixed on {formattedDate}
        </span>
      </div>

      {/* Before / After grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Before column */}
        <div className="space-y-2">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider text-center">
            Before
          </p>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
            {originalImageUrl && (
              <img
                src={originalImageUrl}
                alt="Original ad"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
          {originalScore !== undefined && (
            <p className="text-center">
              <span className="text-red-400 font-bold text-xl">
                {originalScore}
              </span>
              <span className="text-white/40 text-xs ml-1">/ 100</span>
            </p>
          )}
        </div>

        {/* After column */}
        <div className="space-y-2">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider text-center">
            After
          </p>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a]">
            <img
              src={result.generatedImageUrl}
              alt="Fixed ad"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
          {result.newScore !== null && (
            <p className="text-center">
              <span
                className={`font-bold text-xl ${
                  isGo ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.newScore}
              </span>
              <span className="text-white/40 text-xs ml-1">/ 100</span>
            </p>
          )}
          {result.newGoNoGo !== null && (
            <p
              className={`text-center text-xs font-semibold ${
                isGo ? "text-green-400" : "text-red-400"
              }`}
            >
              {result.newGoNoGo}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
