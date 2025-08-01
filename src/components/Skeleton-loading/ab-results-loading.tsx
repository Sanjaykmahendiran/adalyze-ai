const AbResultsLoadingSkeleton = () => {
    const pill = "bg-[#2b2b2b] rounded-full h-6 w-32"
    const card = "bg-[#1a1a1a] rounded-2xl p-6"
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="text-center mb-8 space-y-2">
                    <div className="mx-auto h-8 w-64 rounded-md bg-[#2b2b2b] animate-pulse" />
                    <div className="mx-auto mt-2 h-4 w-96 rounded-md bg-gray-600 animate-pulse" />
                </div>

                {/* Comparison Header Skeleton */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {[0, 1].map((i) => (
                        <div key={i} className={`rounded-3xl shadow-lg border border-[#121212] ${i === 0 ? "" : ""}`}>
                            <div className="p-6 relative space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="h-6 w-48 rounded-md bg-[#2b2b2b] animate-pulse" />
                                    <div className="space-y-1 text-right">
                                        <div className="h-8 w-16 rounded-md bg-[#2b2b2b] animate-pulse mx-auto" />
                                        <div className="h-3 w-20 rounded-md bg-gray-600 animate-pulse" />
                                    </div>
                                </div>
                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                    <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                                </div>
                                <div className="bg-[#121212] rounded-2xl p-4 border border-[#121212]">
                                    <div className="flex justify-between mb-3">
                                        <div className="h-5 w-40 rounded-md bg-[#2b2b2b] animate-pulse" />
                                        <div className="h-8 w-20 rounded-md bg-[#2b2b2b] animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <div className="h-4 w-24 rounded-md bg-[#2b2b2b] animate-pulse mb-2" />
                                                <div className="h-3 w-full rounded-md bg-gray-600 animate-pulse" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-4 w-24 rounded-md bg-[#2b2b2b] animate-pulse mb-2" />
                                                <div className="h-3 w-full rounded-md bg-gray-600 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="bg-black rounded-2xl p-2 mb-8 border border-[#121212] inline-flex">
                    <div className="px-6 py-3 rounded-xl bg-primary text-white shadow-lg w-32 h-10 animate-pulse" />
                    <div className="px-6 py-3 rounded-xl text-gray-400 w-32 h-10 ml-2 animate-pulse" />
                </div>

                {/* Issues/Suggestions Skeleton */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className={`${card} animate-pulse`}>
                        <div className="space-y-4">
                            <div className="h-6 w-60 rounded-md bg-[#2b2b2b]" />
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="h-4 w-4 rounded-full bg-red-600" />
                                    <div className="h-4 w-full rounded-md bg-gray-600" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`${card} animate-pulse`}>
                        <div className="space-y-4">
                            <div className="h-6 w-60 rounded-md bg-[#2b2b2b]" />
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="h-4 w-4 rounded-full bg-blue-600" />
                                    <div className="h-4 w-full rounded-md bg-gray-600" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance Insights Skeleton */}
                <div className={`${card} animate-pulse`}>
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between mb-6">
                            <div className="h-6 w-64 rounded-md bg-[#2b2b2b]" />
                            <div className="h-6 w-32 rounded-md bg-[#2b2b2b]" />
                        </div>
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-4 w-32 rounded-md bg-[#2b2b2b]" />
                                    <div className="h-8 w-20 rounded-md bg-[#2b2b2b]" />
                                </div>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-32 rounded-md bg-[#2b2b2b]" />
                                            <div className="h-4 w-12 rounded-md bg-[#2b2b2b]" />
                                        </div>
                                        <div className="h-2 w-full rounded-md bg-gray-600" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-4 w-32 rounded-md bg-[#2b2b2b]" />
                                    <div className="h-8 w-20 rounded-md bg-[#2b2b2b]" />
                                </div>
                                <div className="h-3 w-full rounded-md bg-gray-600" />
                                <div className="h-3 w-full rounded-md bg-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons skeleton */}
                <div className="flex justify-center gap-4 flex-wrap">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 w-44 rounded-xl bg-[#2b2b2b] animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AbResultsLoadingSkeleton;