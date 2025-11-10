const DashboardLoadingSkeleton = () => (
    <div className="min-h-screen text-white p-4 sm:p-6">
        <div className="max-w-[1240px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2 w-full sm:w-auto">
                    <div className="h-8 w-40 sm:w-48 bg-[#2b2b2b] rounded animate-pulse" />
                    <div className="h-4 w-60 sm:w-80 bg-[#2b2b2b] rounded animate-pulse" />
                </div>
                <div className="h-10 w-full sm:w-40 bg-[#db4900]/70 rounded animate-pulse" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-[#121212] rounded-lg p-4 animate-pulse">
                        <div className="h-4 w-24 sm:w-32 bg-[#2b2b2b] rounded mb-2" />
                        <div className="h-8 w-20 sm:w-24 bg-[#2b2b2b] rounded mb-4" />
                        <div className="h-4 w-16 bg-[#2b2b2b] rounded" />
                    </div>
                ))}
            </div>

            {/* Recent Ads Skeleton */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2 w-full sm:w-auto">
                        <div className="h-6 w-28 sm:w-32 bg-[#2b2b2b] rounded animate-pulse" />
                        <div className="h-4 w-48 sm:w-64 bg-[#2b2b2b] rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-full sm:w-32 bg-[#db4900]/70 rounded animate-pulse" />
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
                            <div className="aspect-square rounded-lg bg-[#121212] animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-5 w-28 sm:w-32 bg-[#2b2b2b] rounded animate-pulse" />
                                <div className="h-4 w-full bg-[#2b2b2b] rounded animate-pulse" />
                                <div className="h-3 w-16 bg-[#2b2b2b] rounded animate-pulse" />
                                <div className="h-8 w-full bg-[#2b2b2b] rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Banner Skeleton */}
            <div className="bg-gradient-to-r from-[#db4900]/20 to-[#db4900]/20 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="h-12 w-12 bg-[#2b2b2b] rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-6 w-52 sm:w-64 bg-[#2b2b2b] rounded animate-pulse" />
                        <div className="h-4 w-full max-w-xs sm:max-w-md bg-[#2b2b2b] rounded animate-pulse" />
                    </div>
                </div>
                <div className="h-12 w-full sm:w-48 bg-[#db4900]/70 rounded animate-pulse" />
            </div>
        </div>
    </div>
);

export default DashboardLoadingSkeleton;
