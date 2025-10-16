const MyAccountLoadingSkeleton = () => (
    <>
        {/* Desktop View */}
        <div className="hidden md:flex min-h-screen max-w-7xl mx-auto flex-col md:flex-row">
            {/* Sidebar Skeleton */}
            <aside className="fixed h-screen w-[350px] p-4 space-y-2">
                <div className="h-8 w-32 rounded bg-[#2b2b2b] animate-pulse mb-4" />
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-[#1a1a1a] p-3 rounded-lg h-auto w-full animate-pulse"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#2b2b2b]" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-24 bg-[#2b2b2b] rounded" />
                                <div className="h-3 w-40 bg-[#2b2b2b] rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </aside>

            {/* Main Content Skeleton */}
            <main className="w-full md:ml-[360px] p-4">
                <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-[#2b2b2b]" />
                            <div className="flex-1 space-y-2">
                                <div className="h-6 w-48 bg-[#2b2b2b] rounded" />
                                <div className="h-4 w-64 bg-[#2b2b2b] rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Content Cards */}
                    <div className="grid gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-[#1a1a1a] rounded-lg p-6 space-y-3 animate-pulse"
                            >
                                <div className="h-5 w-32 bg-[#2b2b2b] rounded" />
                                <div className="h-4 w-full bg-[#2b2b2b] rounded" />
                                <div className="h-4 w-3/4 bg-[#2b2b2b] rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>

        {/* Mobile View */}
        <div className="md:hidden min-h-screen pb-16 text-white px-4 py-3">
            <div className="h-6 w-32 rounded bg-[#2b2b2b] animate-pulse mb-3" />

            {/* User Profile Overview Skeleton */}
            <div className="mb-3 bg-[#db4900]/20 rounded-lg p-3 text-center animate-pulse">
                <div className="h-6 w-40 bg-[#2b2b2b] rounded mx-auto mb-2" />
                <div className="h-4 w-48 bg-[#2b2b2b] rounded mx-auto" />
            </div>

            {/* Menu Cards Skeleton */}
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-[#1a1a1a] p-3 rounded-lg h-auto w-full animate-pulse"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#2b2b2b]" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-24 bg-[#2b2b2b] rounded" />
                                <div className="h-3 w-40 bg-[#2b2b2b] rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </>
)

export default MyAccountLoadingSkeleton

