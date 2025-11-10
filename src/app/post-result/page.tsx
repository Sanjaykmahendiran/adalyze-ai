"use client";

import React, { useRef } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import AdPerformancePost from "../../components/share-result";
import logo from "@/assets/ad-logo.webp";

const ShareAdResult = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { width: 1000, height: 1000 });
    saveAs(dataUrl, "Adalyze_Ad_Performance.png");
  };

  const staticData = {
    logo: logo.src,
    confidenceScore: 0,
    performanceScore: 82,
    goStatus: "Go" as "Go" | "No Go",
    industry: "Marketing Technology",
    bestSuit: ["Facebook", "Instagram", "LinkedIn"],
    website: "www.adalyze.app",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 p-8">
      <div ref={ref}>
        <AdPerformancePost adImage={""} {...staticData} />
      </div>

      <button
        onClick={handleShare}
        className="bg-[#db4900] hover:bg-[#ff5c00] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
      >
        Share Ad Performance Post
      </button>
    </div>
  );
};

export default ShareAdResult;
