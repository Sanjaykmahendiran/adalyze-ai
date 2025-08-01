"use client"

import React from "react"

export default function SupportPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-[#2b2b2b] rounded" />
        <div className="h-4 w-80 bg-[#2b2b2b] rounded" />
      </div>

      {/* Search bar & category buttons */}
      <div className="bg-black rounded-lg p-6 space-y-4">
        <div className="h-10 w-full bg-[#2b2b2b] rounded" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-[#2b2b2b] rounded" />
          ))}
        </div>
      </div>

      {/* Main content layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: FAQ cards */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-black rounded-lg p-6 space-y-3">
              <div className="h-4 w-3/4 bg-[#2b2b2b] rounded" />
              <div className="h-3 w-full bg-[#2b2b2b] rounded" />
              <div className="h-3 w-5/6 bg-[#2b2b2b] rounded" />
            </div>
          ))}
        </div>

        {/* Right column: Contact + Sections */}
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-black rounded-lg p-6 space-y-3">
              <div className="h-5 w-40 bg-[#2b2b2b] rounded" />
              <div className="h-4 w-3/4 bg-[#2b2b2b] rounded" />
              <div className="h-4 w-2/3 bg-[#2b2b2b] rounded" />
              <div className="h-10 w-full bg-[#2b2b2b] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
