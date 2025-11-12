import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Affiliate Program | Earn by promoting AI ad insights",
  description: "Join the Adalyze AI Affiliate Program. Earn rewards by promoting AI-powered ad performance tools to your network.",
  keywords: "adalyze ai affiliate program, earn with ai, promote adalyze ai, ai referral program, affiliate marketing ai, adalyze ai partner program",
  openGraph: {
    title: "Adalyze AI Affiliate Program | Earn by promoting AI ad insights",
    description: "Join the Adalyze AI Affiliate Program. Earn rewards by promoting AI-powered ad performance tools to your network.",
    url: "https://adalyze.app/affiliate-program",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Affiliate Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Affiliate Program | Earn by promoting AI ad insights",
    description: "Join the Adalyze AI Affiliate Program. Earn rewards by promoting AI-powered ad performance tools to your network.",
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
