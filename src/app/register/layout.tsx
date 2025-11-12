
import { Suspense } from "react";
import Spinner from "@/components/overlay";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Adalyze AI Register | Register to your account",
  description: "Register to Adalyze AI to access your ad analysis dashboard and optimize your campaigns with AI-powered insights.",
  keywords: "adalyze ai register, adalyze ai dashboard, adalyze ai insights, adalyze ai optimization, adalyze ai analytics, adalyze ai",
  openGraph: {
    title: "Adalyze AI Register | Register to your account",
    description: "Register to Adalyze AI to access your ad analysis dashboard and optimize your campaigns with AI-powered insights.",
    url: "https://adalyze.app/register",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Register | Register to your account",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Register | Register to your account",
    description: "Register to Adalyze AI to access your ad analysis dashboard and optimize your campaigns with AI-powered insights.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Spinner />}>
      {children}</Suspense>
  );
}
