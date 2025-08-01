const ResultsPageLoadingSkeleton = () => (
     <div className="min-h-screen bg-black text-white">
        <main className="container mx-auto px-6 py-12 space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="text-center space-y-2">
            <div className="h-8 w-1/3 mx-auto bg-[#121212] rounded"></div>
            <div className="h-4 w-1/2 mx-auto bg-[#2b2b2b] rounded"></div>
          </div>

          {/* Ad Overview Skeleton */}
          <div className="bg-[#121212] rounded-3xl p-8 grid lg:grid-cols-3 gap-8">
            {/* Image Skeleton */}
            <div className="aspect-square bg-[#121212] rounded-2xl w-full" />
            
            {/* Text Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-[#2b2b2b] w-2/3 rounded" />
              <div className="h-4 bg-[#2b2b2b] w-1/3 rounded" />
              <div className="h-4 bg-[#121212] w-1/4 rounded" />

              <div className="space-y-3 pt-4">
                <div className="h-5 bg-[#2b2b2b] w-1/2 rounded" />
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-[#121212] rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issues & Suggestions Skeleton */}
          <div className="grid lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-[#121212] p-6 rounded-2xl space-y-3">
                <div className="h-5 w-2/3 bg-[#2b2b2b] rounded" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-4 w-full bg-[#121212] rounded" />
                ))}
              </div>
            ))}
          </div>

          {/* Performance Insight Skeleton */}
          <div className="bg-[#121212] p-8 rounded-3xl space-y-4">
            <div className="h-6 w-1/2 bg-[#2b2b2b] rounded" />
            <div className="grid lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-5 w-1/3 bg-[#2b2b2b] rounded" />
                  <div className="h-3 w-full bg-[#121212] rounded" />
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-3 w-full bg-[#121212] rounded" />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Ad Copy Generator Skeleton */}
          <div className="bg-[#121212] p-8 rounded-3xl space-y-6">
            <div className="h-6 w-1/2 bg-[#2b2b2b] rounded" />
            <div className="h-10 w-48 bg-[#121212] rounded" />
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-[#121212] rounded-xl" />
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="h-10 w-48 bg-[#121212] rounded-xl" />
            <div className="h-10 w-48 bg-[#121212] rounded-xl" />
          </div>
        </main>
      </div>
    );
    
export default ResultsPageLoadingSkeleton;