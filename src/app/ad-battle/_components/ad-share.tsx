"use client"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

export default function AdShare() {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied!")
    } catch {
      toast.error("Failed to copy link")
    }
  }

  return (
    <div className="flex justify-center">
      <Button
        onClick={copyLink}
        className="bg-primary text-primary-foreground transition-transform duration-200 hover:scale-[1.02] hover:bg-primary/90 active:scale-95"
        aria-label="Copy battle link"
      >
        {"Share Battle 🔗"}
      </Button>
    </div>
  )
}
