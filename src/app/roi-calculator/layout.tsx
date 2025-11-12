import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad ROI Calculator | Measure & maximize your ad spend with AI",
  description: "Estimate your advertising ROI in seconds. Use Adalyze AI's free ROI calculator to measure performance and maximize returns.",
  keywords: "ad roi calculator, ai roi tool, ad performance roi, campaign roi analysis, digital marketing roi, ai advertising metrics",
  openGraph: {
    title: "Ad ROI Calculator | Measure & maximize your ad spend with AI",
    description: "Estimate your advertising ROI in seconds. Use Adalyze AI's free ROI calculator to measure performance and maximize returns.",
    url: "https://adalyze.app/roi-calculator",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Ad ROI Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ad ROI Calculator | Measure & maximize your ad spend with AI",
    description: "Estimate your advertising ROI in seconds. Use Adalyze AI's free ROI calculator to measure performance and maximize returns.",
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
