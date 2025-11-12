import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Support | Get help with AI ad analysis",
  description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
  openGraph: {
    title: "Adalyze AI Support | Get help with AI ad analysis",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
    url: "https://adalyze.app/support",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Support | Get help with AI ad analysis",
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
    <div className="bg-[#171717]">
      {children}
    </div>
  );
}
