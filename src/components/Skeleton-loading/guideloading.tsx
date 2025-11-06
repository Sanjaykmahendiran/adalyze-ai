// insert near top of file
const GuideLoadingSkeleton = () => (
  <div className="min-h-screen text-white p-6">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-[#2b2b2b] animate-pulse" />
          <div className="h-4 w-80 rounded bg-[#2b2b2b] animate-pulse" />
        </div>
        <div className="h-10 w-40 rounded bg-[#db4900]/70 animate-pulse" />
      </div>

      {/* Tab-like platform selector skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#121212] rounded-lg p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 flex items-center justify-center rounded-md bg-[#2b2b2b] animate-pulse" />
        ))}
      </div>

      {/* Anatomy Cards Skeleton */}
      <section>
        <div className="h-6 w-60 rounded bg-[#2b2b2b] animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-black rounded-lg p-6 shadow-lg border border-[#121212]">
              <div className="w-12 h-12 bg-[#2b2b2b] rounded mb-4 animate-pulse" />
              <div className="h-5 w-32 bg-[#2b2b2b] rounded mb-2 animate-pulse" />
              <div className="h-4 w-full bg-[#2b2b2b] rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div key={j} className="h-3 w-full bg-[#2b2b2b] rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Examples Skeleton */}
      <section className="mt-12">
        <div className="h-6 w-60 rounded bg-[#2b2b2b] animate-pulse mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-black rounded-lg p-6 shadow-lg border border-[#121212]">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-[#2b2b2b] rounded animate-pulse" />
                <div className="h-5 w-20 bg-[#2b2b2b] rounded animate-pulse" />
              </div>
              <div className="w-40 mx-auto mb-4">
                <div className="aspect-square bg-[#121212] rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="h-3 w-full bg-[#2b2b2b] rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Tutorials Skeleton */}
      <section className="mt-12">
        <div className="h-6 w-60 rounded bg-[#2b2b2b] animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-black rounded-lg overflow-hidden shadow-lg border border-[#121212] p-0">
              <div className="h-36 bg-[#121212] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-[#2b2b2b] rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-[#2b2b2b] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
)

export default GuideLoadingSkeleton;