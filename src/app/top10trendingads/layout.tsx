import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top 10 Trending Ads | Latest ad trends with Adalyze AI",
  description: "Explore the top 10 trending ads analyzed by Adalyze AI. Stay ahead with insights on what's working now in digital advertising.",
  openGraph: {
    title: "Top 10 Trending Ads | Latest ad trends with Adalyze AI",
    description: "Explore the top 10 trending ads analyzed by Adalyze AI. Stay ahead with insights on what's working now in digital advertising.",
    url: "https://adalyze.app/top10trendingads",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Top 10 Trending Ads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Top 10 Trending Ads | Latest ad trends with Adalyze AI",
    description: "Explore the top 10 trending ads analyzed by Adalyze AI. Stay ahead with insights on what's working now in digital advertising.",
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
