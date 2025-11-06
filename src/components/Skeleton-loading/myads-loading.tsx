const MyAdsSkeleton = () => (
  <div className="w-full min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <div className="h-8 w-48 bg-[#2b2b2b] rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-[#2b2b2b] rounded animate-pulse" />
      </div>
      <div className="h-10 w-full sm:w-40 bg-[#db4900]/80 rounded animate-pulse" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="h-10 bg-[#121212] border border-[#2b2b2b] rounded animate-pulse" />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-black rounded-lg overflow-hidden border border-[#121212] shadow-lg shadow-white/5 animate-pulse">
          <div className="w-full aspect-square bg-[#121212]" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 bg-[#2b2b2b] rounded" />
            <div className="h-3 w-1/2 bg-[#2b2b2b] rounded" />
            <div className="h-3 w-2/3 bg-[#2b2b2b] rounded" />
            <div className="flex gap-2 mt-2">
              <div className="h-8 w-16 bg-[#2b2b2b] rounded" />
              <div className="h-8 w-16 bg-[#2b2b2b] rounded" />
              <div className="h-8 w-8 bg-[#2b2b2b] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default MyAdsSkeleton;
