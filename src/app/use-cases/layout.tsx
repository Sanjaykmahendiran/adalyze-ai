import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Adalyze AI Use Cases | Smarter ad insights for every industry",
  description: "Explore how Adalyze AI enhances ad performance across industries. Get smarter insights for better ROI on every digital campaign.",
  keywords: "adalyze ai use cases, ai ad analysis, ad optimization examples, digital ad insights, industry ad analytics, ai marketing tool",
  openGraph: {
    title: "Adalyze AI Use Cases | Smarter ad insights for every industry",
    description: "Explore how Adalyze AI enhances ad performance across industries. Get smarter insights for better ROI on every digital campaign.",
    url: "https://adalyze.app/use-cases",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Use Cases",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Use Cases | Smarter ad insights for every industry",
    description: "Explore how Adalyze AI enhances ad performance across industries. Get smarter insights for better ROI on every digital campaign.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      {children}
    </Suspense>
  );
}
