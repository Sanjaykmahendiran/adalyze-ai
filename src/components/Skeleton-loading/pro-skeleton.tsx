"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function StaticProSkeleton() {
  return (
    <div className="min-h-screen text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Skeleton className="w-40 h-10 mx-auto" />
          <Skeleton className="w-3/4 h-8 mx-auto" />
          <Skeleton className="w-1/2 h-6 mx-auto" />
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#121212] rounded-lg p-6 border border-[#2a2a2a] space-y-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[#121212] rounded-lg p-8 border border-[#2a2a2a] space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 mx-auto" />
          <div className="flex gap-6 overflow-x-auto scrollbar-hide px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#121212] rounded-lg p-6 w-[320px] border border-[#2a2a2a] space-y-3 flex-shrink-0">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-6 w-1/3 mx-auto" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#121212] rounded-lg p-6 border border-[#2a2a2a] space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
