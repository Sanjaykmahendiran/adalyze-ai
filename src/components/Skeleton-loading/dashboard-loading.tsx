const DashboardLoadingSkeleton = () => (
    <div className="min-h-screen text-white p-6">
        <div className="max-w-[1240px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-48 rounded bg-[#2b2b2b] animate-pulse" />
                    <div className="h-4 w-80 rounded bg-[#2b2b2b] animate-pulse" />
                </div>
                <div className="h-10 w-40 rounded bg-[#db4900]/70 animate-pulse" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-[#121212] rounded-lg p-4 animate-pulse">
                        <div className="h-4 w-32 bg-[#2b2b2b] rounded mb-2" />
                        <div className="h-8 w-24 bg-[#2b2b2b] rounded mb-4" />
                        <div className="h-4 w-16 bg-[#2b2b2b] rounded" />
                    </div>
                ))}
            </div>

            {/* Recent Ads Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-[#2b2b2b] rounded animate-pulse" />
                        <div className="h-4 w-64 bg-[#2b2b2b] rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-32 bg-[#db4900]/70 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
                            <div className="aspect-square rounded-lg bg-[#121212] animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-5 w-32 bg-[#2b2b2b] rounded animate-pulse" />
                                <div className="h-4 w-full bg-[#2b2b2b] rounded animate-pulse" />
                                <div className="h-3 w-20 bg-[#2b2b2b] rounded animate-pulse" />
                                <div className="h-8 w-full bg-[#2b2b2b] rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Banner Skeleton */}
            <div className="bg-gradient-to-r from-[#db4900]/20 to-[#db4900]/20 rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-[#2b2b2b] rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-6 w-64 bg-[#2b2b2b] rounded animate-pulse" />
                        <div className="h-4 w-full max-w-xs sm:max-w-md bg-[#2b2b2b] rounded animate-pulse" />
                    </div>
                </div>
                <div className="h-12 w-48 bg-[#db4900]/70 rounded animate-pulse" />
            </div>
        </div>
    </div>
)

export default DashboardLoadingSkeleton;