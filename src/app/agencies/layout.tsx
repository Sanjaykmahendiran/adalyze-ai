import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI for Agencies | Smart ad analysis & optimization platform",
  description: "Boost your agency's ad performance with Adalyze AI, smart analysis, insights, and real-time optimization to scale faster.",
  keywords: "ad analysis for agencies, agency ad optimization, agency advertising analytics tool, ad campaign intelligence for agencies, agency marketing automation platform, advertising analytics software for agencies",
  openGraph: {
    title: "Adalyze AI for Agencies | Smart ad analysis & optimization platform",
    description: "Boost your agency's ad performance with Adalyze AI, smart analysis, insights, and real-time optimization to scale faster.",
    url: "https://adalyze.app/agencies",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI for Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI for Agencies | Smart ad analysis & optimization platform",
    description: "Boost your agency's ad performance with Adalyze AI, smart analysis, insights, and real-time optimization to scale faster.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      {children}
  );
}
