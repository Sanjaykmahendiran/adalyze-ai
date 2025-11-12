import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Adalyze AI Case Studies | Real results from smart AI ad analysis",
  description: "See how top brands improved ad performance using Adalyze AI. Real data, real results — explore case studies now.",
  keywords: "adalyze ai case studies, ai ad results, campaign performance success, digital ad case study, ai marketing analytics, ad performance insights",
  openGraph: {
    title: "Adalyze AI Case Studies | Real results from smart AI ad analysis",
    description: "See how top brands improved ad performance using Adalyze AI. Real data, real results — explore case studies now.",
    url: "https://adalyze.app/case-study",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Case Studies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Case Studies | Real results from smart AI ad analysis",
    description: "See how top brands improved ad performance using Adalyze AI. Real data, real results — explore case studies now.",
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
      <Suspense>
        {children}
      </Suspense>
    </div>
  );
}
