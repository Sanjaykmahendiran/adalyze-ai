const BrandDetailSkeleton = () => (
  <div className="w-full min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-28 pt-0 text-white">
    {/* Header */}
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-black p-2 rounded-full h-10 w-10 animate-pulse" />
          <div className="flex flex-col text-left gap-2">
            <div className="h-7 w-48 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-64 bg-[#2b2b2b] rounded animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="h-10 w-full sm:w-40 bg-red-500/40 rounded animate-pulse" />
          <div className="h-10 w-full sm:w-48 bg-[#db4900]/70 rounded animate-pulse" />
        </div>
      </div>
    </div>

    {/* Stat Cards (3 + 2) */}
    <div className="space-y-6 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-[#121212] border border-[#2b2b2b] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-[#121212] border border-[#2b2b2b] animate-pulse" />
        ))}
      </div>
    </div>

    {/* Filters */}
    <div className="bg-black rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-[#3d3d3d]">
      <div className="flex flex-col gap-4 mb-4">
        <div className="h-10 bg-[#171717] border border-[#3d3d3d] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 bg-[#171717] border border-[#3d3d3d] rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-4 border-t border-[#3d3d3d]">
        <div className="h-6 w-28 bg-[#2b2b2b] rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-6 w-24 bg-[#2b2b2b] rounded animate-pulse" />
        ))}
        <div className="h-6 w-16 bg-[#2b2b2b] rounded animate-pulse" />
      </div>
    </div>

    {/* Ads Grid - 12 items */}
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-black rounded-lg overflow-hidden border border-[#121212] shadow-lg shadow-white/5 animate-pulse">
          <div className="w-full aspect-square bg-[#121212]" />
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 bg-[#2b2b2b] rounded" />
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, k) => (
                  <div key={k} className="h-4 w-4 bg-[#db4900]/60 rounded" />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-[#2b2b2b] rounded" />
              <div className="h-3 w-16 bg-[#2b2b2b] rounded" />
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-9 bg-[#2b2b2b] rounded" />
              <div className="h-8 w-20 bg-[#2b2b2b] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default BrandDetailSkeleton;


