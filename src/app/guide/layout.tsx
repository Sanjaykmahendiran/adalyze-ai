import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Guide | Learn AI-powered ad optimization",
  description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
  openGraph: {
    title: "Adalyze AI Guide | Learn AI-powered ad optimization",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
    url: "https://adalyze.app/guide",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Guide | Learn AI-powered ad optimization",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
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
