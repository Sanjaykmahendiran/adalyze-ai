import React from "react";
import shareBg from "@/assets/share-ad-result-bg.jpg";

interface ShareAdResultProps {
    logo: string;
    confidenceScore: number;
    performanceScore: number;
    goStatus: "Go" | "No Go";
    industry: string;
    bestSuit: string[];
    website: string;
    adImage: string;
}

const ShareAdResult: React.FC<ShareAdResultProps> = ({
    logo,
    confidenceScore,
    performanceScore,
    goStatus,
    industry,
    bestSuit,
    website,
    adImage,
}) => {
    const isGo = goStatus === "Go";
    const goColor = isGo ? "#00ff66" : "#ff4444";

    return (
        <div
            id="ad-performance-card"
            className="w-[1080px] h-[1080px] relative flex flex-col items-center justify-start pt-12 pb-8"
            style={{
                backgroundImage: `url(${shareBg.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-3 mb-8">
                <img src={logo} alt="Logo" className="w-80 h-20 object-contain" />
            </div>

            {/* Title Section */}
            <div className="text-center mb-12">
                <h2 className="text-5xl font-bold text-white">
                    Unlock Real-Time
                </h2>
                <h3 className="text-5xl font-bold mt-1 text-white">
                    AI Ad <span className="text-primary">Performance Results</span>
                </h3>
            </div>

            {/* Ad Preview & Score Cards */}
            <div className="relative w-[450px] mb-16">
                {/* Main Ad with Orange Border */}
                <div
                    className="bg-[#171717] rounded-3xl overflow-hidden shadow-2xl border border-[#db4900]">
                    <img
                        src={adImage}
                        alt="Ad Preview"
                        className="w-full h-[450px] object-cover"
                    />
                </div>

                {/* Go / No Go Card - Top Left */}
                <div
                    className="absolute -left-24 top-12 bg-[#171717] border border-[#db4900] rounded-2xl p-5 w-[180px] h-[180px] flex flex-col items-center justify-center text-white">
                    <p className="text-gray-400 text-xs mb-3 font-light">Go / No Go</p>
                    <p className="text-gray-500 text-[10px] mb-2 leading-tight text-center px-2">
                        Indicates if your ad is ready to run or needs improvement
                    </p>
                    <h3
                        className="text-6xl font-extrabold mb-2"
                        style={{ color: goColor }}
                    >
                        {goStatus === "Go" ? "GO" : "NO GO"}
                    </h3>
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={goColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                </div>

                {/* Confidence Score - Top Right */}
                <div
                    className="absolute -right-20 top-4 bg-[#171717] border border-[#db4900] rounded-2xl p-4 w-[180px] h-[110px] text-center"
                >
                    <div className="flex items-center justify-center mb-2">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#00ff66"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-300 text-xs mb-1">Confidence Score</p>
                    <p className="text-[#00ff66] text-3xl font-bold">
                        {confidenceScore}<span className="text-white">/100</span>
                    </p>
                </div>

                {/* Performance Score - Bottom Right */}
                <div
                    className="absolute -right-24 bottom-4 bg-[#171717] border border-[#db4900] rounded-2xl p-4 w-[190px] h-[110px] text-center"
                >
                    <div className="flex items-center justify-center mb-2">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#00ff66"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 3v18h18"></path>
                            <path d="m19 9-5 5-4-4-3 3"></path>
                        </svg>
                    </div>
                    <p className="text-gray-300 text-xs mb-1">Performance Score</p>
                    <p className="text-[#00ff66] text-3xl font-bold">
                        {performanceScore}<span className="text-white">/100</span>
                    </p>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="w-full flex flex-col items-center justify-center px-8">
                <div
                    className="flex items-center justify-center gap-8 py-4 px-10 rounded-full"
                    style={{
                        background: "rgba(20, 20, 20, 0.8)",
                        border: "1px solid #333"
                    }}
                >
                    <div className="flex items-center gap-3 text-white text-base">
                        <span className="opacity-70">Industry:</span>
                        <span
                            className="px-4 py-1.5 rounded-lg font-medium"
                            style={{
                                background: "rgba(59, 130, 246, 0.15)",
                                color: "#60a5fa",
                                border: "1px solid rgba(59, 130, 246, 0.3)"
                            }}
                        >
                            {industry}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-white text-base">
                        <span className="opacity-70">Best Suit for:</span>
                        <div className="flex gap-2">
                            {bestSuit.map((platform) => {
                                const platformConfig = {
                                    Facebook: { bg: "#00ff66", icon: "✓" },
                                    Instagram: { bg: "#00ff66", icon: "✓" },
                                    LinkedIn: { bg: "#ff9500", icon: "⚠" },
                                };
                                const config = platformConfig[platform as keyof typeof platformConfig] || { bg: "#999", icon: "" };

                                return (
                                    <span
                                        key={platform}
                                        className="px-3 py-1.5 rounded-lg text-black font-semibold text-sm flex items-center gap-1.5"
                                        style={{
                                            backgroundColor: config.bg,
                                        }}
                                    >
                                        <span>{config.icon}</span>
                                        <span>{platform}</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <p className="text-white text-xl mt-8 text-center">
                    Want to see how your ad performs ?{" "}
                    <span style={{ color: "#ff6b35", fontWeight: 600 }}>Check @ {website}</span>
                </p>
            </div>
        </div>
    );
};

export default ShareAdResult;
