"use client"

import { useEffect } from "react"
import { X, Upload, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnalyzeDialog({ open, onOpenChange }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analyze-title"
      className="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <div className="absolute inset-0 bg-foreground/60" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-card text-card-foreground shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="analyze-title" className="text-base font-semibold">
            {"Start Campaign Coach Review"}
          </h2>
          <button
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="p-4 md:p-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onOpenChange(false)
            // In a real app, submit to your analyze route/server action
          }}
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {"Contact Email"}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  required
                  type="email"
                  placeholder="you@company.com"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{"We'll notify you when the expert review is ready."}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium">
              {"Upload Ad Creative (optional)"}
            </label>
            <label
              htmlFor="file"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-4 py-6 text-sm text-muted-foreground hover:bg-accent"
            >
              <Upload className="h-4 w-4" />
              {"Drag & drop or click to upload"}
              <input id="file" type="file" className="sr-only" />
            </label>
            <p className="text-xs text-muted-foreground">{"Supported: PNG, JPG, MP4, GIF"}</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md px-4 py-2 text-sm hover:bg-accent"
            >
              {"Cancel"}
            </button>
            <Button type="submit" className="px-5">
              {"Start Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
