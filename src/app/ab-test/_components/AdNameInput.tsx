"use client"

import { memo } from "react"
import { Label } from "@/components/ui/label"

interface AdNameInputProps {
  value: string
  onChange: (value: string) => void
}

const AdNameInput = memo(({ value, onChange }: AdNameInputProps) => {
  return (
    <div className="w-full mx-auto mb-6">
      <div className="space-y-2">
        <Label className="text-white/70 font-semibold text-base">Ad Name</Label>
        <input
          type="text"
          placeholder="Enter ad name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-[#3d3d3d] bg-[#171717] px-3 py-3 text-base text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#db4900] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  )
})

AdNameInput.displayName = "AdNameInput"

export default AdNameInput