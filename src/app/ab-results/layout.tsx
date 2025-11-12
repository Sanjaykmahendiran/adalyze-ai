import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AB Results | Adalyze AI",
  description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
  openGraph: {
    title: "AB Results | Adalyze AI",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
    url: "https://adalyze.app/ab-results",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "AB Results | Adalyze AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AB Results | Adalyze AI",
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
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
          <Suspense>
          <div className="bg-[#171717]">
            {children}
          </div>
          </Suspense>
      </body>
    </html>
  );
}
