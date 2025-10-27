const BrandsLoadingSkeleton = () => (
  <div className="container max-w-7xl mx-auto p-6">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-[#2b2b2b] rounded animate-pulse" />
        <div className="h-4 w-80 bg-[#2b2b2b] rounded animate-pulse" />
      </div>
      <div className="h-10 w-32 bg-[#db4900]/70 rounded animate-pulse" />
    </div>

    {/* Table Skeleton */}
    <div className="border-none bg-black rounded-lg">
      <div className="p-6">
        {/* Table Header */}
        <div className="bg-[#171717] rounded-t-lg p-4">
          <div className="grid grid-cols-8 gap-4">
            <div className="h-4 w-4 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-12 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[#2b2b2b] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[#2b2b2b] rounded animate-pulse" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-8 gap-4 items-center py-3">
              {/* Index */}
              <div className="h-4 w-4 bg-[#2b2b2b] rounded animate-pulse" />
              
              {/* Logo */}
              <div className="h-16 w-16 bg-[#2b2b2b] rounded-full animate-pulse" />
              
              {/* Brand Name */}
              <div className="h-4 w-24 bg-[#2b2b2b] rounded animate-pulse" />
              
              {/* Email */}
              <div className="h-4 w-32 bg-[#2b2b2b] rounded animate-pulse" />
              
              {/* Mobile */}
              <div className="h-4 w-24 bg-[#2b2b2b] rounded animate-pulse" />
              
              {/* Status */}
              <div className="h-6 w-16 bg-[#2b2b2b] rounded-full animate-pulse" />
              
              {/* Created Date */}
              <div className="h-4 w-20 bg-[#2b2b2b] rounded animate-pulse" />
              
              {/* Actions */}
              <div className="h-8 w-16 bg-[#2b2b2b] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default BrandsLoadingSkeleton
