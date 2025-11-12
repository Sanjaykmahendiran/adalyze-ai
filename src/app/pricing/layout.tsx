import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Adalyze AI Pricing | Flexible plans to scale your ad success",
  description: "Choose a flexible Adalyze AI pricing plan that fits your business needs. Scale smarter ad decisions at affordable rates.",
  keywords: "adalyze pricing, ai ad analysis plans, ad optimization software cost, ad analytics subscription, affordable ai tools, adalyze plans",
  openGraph: {
    title: "Adalyze AI Pricing | Flexible plans to scale your ad success",
    description: "Choose a flexible Adalyze AI pricing plan that fits your business needs. Scale smarter ad decisions at affordable rates.",
    url: "https://adalyze.app/pricing",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Pricing | Flexible plans to scale your ad success",
    description: "Choose a flexible Adalyze AI pricing plan that fits your business needs. Scale smarter ad decisions at affordable rates.",
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
