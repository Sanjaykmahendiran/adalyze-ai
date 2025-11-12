import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Features | Analyze, optimize & boost ad performance",
  description: "Discover Adalyze AI's powerful features to analyze, optimize, and improve your ad quality, performance, and conversions effortlessly.",
  keywords: "adalyze features, ai ad optimization, ad performance tool, creative analytics, campaign improvement, ai ad analyzer",
  openGraph: {
    title: "Adalyze AI Features | Analyze, optimize & boost ad performance",
    description: "Discover Adalyze AI's powerful features to analyze, optimize, and improve your ad quality, performance, and conversions effortlessly.",
    url: "https://adalyze.app/features",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Features",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Features | Analyze, optimize & boost ad performance",
    description: "Discover Adalyze AI's powerful features to analyze, optimize, and improve your ad quality, performance, and conversions effortlessly.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#171717]">
      {children}
    </div>
  );
}
