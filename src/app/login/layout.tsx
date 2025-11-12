import type { Metadata } from "next";
import { Suspense } from "react";


export const metadata: Metadata = {
  title: "Adalyze AI Login | Log in to your account",
  description: "Log in to Adalyze AI to access your ad analysis dashboard and optimize your campaigns with AI-powered insights.",
  keywords: "adalyze ai login, adalyze ai dashboard, adalyze ai insights, adalyze ai optimization, adalyze ai analytics, adalyze ai",
  openGraph: {
    title: "Adalyze AI Login | Log in to your account",
    description: "Log in to Adalyze AI to access your ad analysis dashboard and optimize your campaigns with AI-powered insights.",
    url: "https://adalyze.app/login",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Login | Log in to your account",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Login | Log in to your account",
    description: "Log in to Adalyze AI to access your ad analysis dashboard and optimize your campaigns with AI-powered insights.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}
