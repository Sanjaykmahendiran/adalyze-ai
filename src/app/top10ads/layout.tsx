import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top 10 Ads | Best performing ads analyzed by Adalyze AI",
  description: "Discover the top 10 performing ads analyzed by Adalyze AI. Learn what makes them successful and apply insights to your campaigns.",
  openGraph: {
    title: "Top 10 Ads | Best performing ads analyzed by Adalyze AI",
    description: "Discover the top 10 performing ads analyzed by Adalyze AI. Learn what makes them successful and apply insights to your campaigns.",
    url: "https://adalyze.app/top10ads",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Top 10 Ads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Top 10 Ads | Best performing ads analyzed by Adalyze AI",
    description: "Discover the top 10 performing ads analyzed by Adalyze AI. Learn what makes them successful and apply insights to your campaigns.",
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
