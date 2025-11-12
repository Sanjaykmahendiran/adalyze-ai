import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Adalyze AI Blog | AI-Powered advertising tips & insights",
  description: "Read the latest insights, tips, and AI trends in advertising. Stay ahead with Adalyze AI's expert marketing blog.",
  keywords: "ai advertising blog, adalyze insights, ad performance tips, digital marketing blog, ai ad trends, campaign optimization ideas",
  openGraph: {
    title: "Adalyze AI Blog | AI-Powered advertising tips & insights",
    description: "Read the latest insights, tips, and AI trends in advertising. Stay ahead with Adalyze AI's expert marketing blog.",
    url: "https://adalyze.app/blog",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Blog | AI-Powered advertising tips & insights",
    description: "Read the latest insights, tips, and AI trends in advertising. Stay ahead with Adalyze AI's expert marketing blog.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="">
      <Suspense>
        {children}
      </Suspense>
    </div>
  );
}
