const UploadLoadingSkeleton = () => (
    <div className="max-w-6xl mx-auto">
<div className="bg-[#000000] border-none rounded-2xl sm:rounded-3xl shadow-2xl">
    <div className="py-2 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Skeleton for Ad Type Selection */}
        <div className="max-w-4xl mx-auto mb-2 sm:mb-4">
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:flex lg:items-center lg:justify-center lg:gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[#2b2b2b] animate-pulse">
                        <div className="w-6 h-6 bg-[#3d3d3d] rounded"></div>
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="h-4 bg-[#3d3d3d] rounded w-3/4"></div>
                            <div className="h-3 bg-[#3d3d3d] rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="block sm:hidden mt-6 mb-4">
                <div className="w-full bg-[#3d3d3d] h-14 rounded-lg animate-pulse"></div>
            </div>
        </div>

        {/* Skeleton for Ad Name and Brand Selection */}
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
                <div className="space-y-2 mb-6 w-full">
                    <div className="h-4 bg-[#3d3d3d] rounded w-20 animate-pulse"></div>
                    <div className="h-12 bg-[#3d3d3d] rounded w-full animate-pulse"></div>
                </div>
                <div className="space-y-2 mb-6 w-full">
                    <div className="h-4 bg-[#3d3d3d] rounded w-24 animate-pulse"></div>
                    <div className="h-12 bg-[#3d3d3d] rounded w-full animate-pulse"></div>
                </div>
            </div>

            {/* Skeleton for Upload Area */}
            <div className="mt-6 sm:mt-8">
                <div className="border-2 border-dashed border-[#3d3d3d] rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-[#3d3d3d] rounded-full mx-auto mb-4 animate-pulse"></div>
                    <div className="h-4 bg-[#3d3d3d] rounded w-48 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-[#3d3d3d] rounded w-32 mx-auto animate-pulse"></div>
                </div>
            </div>

            {/* Skeleton for Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 h-14 bg-[#3d3d3d] rounded-lg animate-pulse"></div>
                <div className="flex-1 h-14 bg-[#3d3d3d] rounded-lg animate-pulse"></div>
            </div>
        </div>
    </div>
</div>
</div>
)

export default UploadLoadingSkeleton