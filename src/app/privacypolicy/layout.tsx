import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Privacy Policy | Data protection & user trust",
  description: "Understand how Adalyze AI protects your data and ensures complete privacy and transparency in every interaction.",
  keywords: "adalyze ai privacy policy, ai data protection, user privacy adalyze ai, advertising data security, ai analytics compliance, data transparency",
  openGraph: {
    title: "Adalyze AI Privacy Policy | Data protection & user trust",
    description: "Understand how Adalyze AI protects your data and ensures complete privacy and transparency in every interaction.",
    url: "https://adalyze.app/privacypolicy",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Privacy Policy | Data protection & user trust",
    description: "Understand how Adalyze AI protects your data and ensures complete privacy and transparency in every interaction.",
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
