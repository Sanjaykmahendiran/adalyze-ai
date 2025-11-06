const BrandsLoadingSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <div className="space-y-2">
        <div className="h-8 w-48 sm:w-64 bg-[#2b2b2b] rounded-md animate-pulse" />
        <div className="h-4 w-60 sm:w-80 bg-[#2b2b2b] rounded-md animate-pulse" />
      </div>
      <div className="h-10 w-32 sm:w-40 bg-[#db4900]/70 rounded-md animate-pulse self-start sm:self-auto" />
    </div>

    {/* Cards Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#121212] border border-[#2b2b2b] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          {/* Card Header */}
          <div className="flex items-center gap-4 p-4 relative">
            <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-[#2b2b2b] animate-pulse" />
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 w-32 sm:w-40 bg-[#2b2b2b] rounded-md animate-pulse" />
              <div className="h-4 w-24 sm:w-32 bg-[#2b2b2b] rounded-md animate-pulse" />
            </div>
          </div>

          {/* Card Content */}
          <div className="space-y-6 px-4 pb-5">
            {/* Row 1: Key Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-[#171717] border border-[#2b2b2b] rounded-xl p-3 flex flex-col items-center text-center"
                >
                  <div className="h-4 w-4 bg-[#db4900]/60 rounded-md animate-pulse mb-2" />
                  <div className="h-3 w-16 bg-[#2b2b2b] rounded-md animate-pulse mb-2" />
                  <div className="h-5 w-10 bg-[#2b2b2b] rounded-md animate-pulse" />
                </div>
              ))}
            </div>

            {/* Row 2: Go vs No-Go */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="bg-[#171717] border border-[#2b2b2b] rounded-xl p-3 flex flex-col items-center"
                >
                  <div className="h-4 w-4 bg-[#2b2b2b] rounded-md animate-pulse mb-2" />
                  <div className="h-3 w-14 bg-[#2b2b2b] rounded-md animate-pulse mb-2" />
                  <div className="h-5 w-10 bg-[#2b2b2b] rounded-md animate-pulse" />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-white/10">
              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <div className="h-3 w-40 bg-[#2b2b2b] rounded-md animate-pulse" />
                <div className="h-3 w-32 bg-[#2b2b2b] rounded-md animate-pulse" />
              </div>
              <div className="h-9 w-9 rounded-md bg-[#2b2b2b] animate-pulse self-end sm:self-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default BrandsLoadingSkeleton
