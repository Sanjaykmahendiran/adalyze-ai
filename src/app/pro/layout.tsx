import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import UserLayout from "@/components/layouts/user-layout";

// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze AI Pro | Smart Ad Analysis for Agencies & Marketers",
  description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
  keywords: "adalyze ai pro, adalyze ai dashboard, adalyze ai insights, adalyze ai optimization, adalyze ai analytics, adalyze ai",
  openGraph: {
    title: "Adalyze AI Pro | Smart Ad Analysis for Agencies & Marketers",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
    url: "https://adalyze.app/pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Pro | Smart Ad Analysis for Agencies & Marketers",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
          <div className="bg-[#171717]">
            {children}
          </div>
      </body>
    </html>
  );
}
