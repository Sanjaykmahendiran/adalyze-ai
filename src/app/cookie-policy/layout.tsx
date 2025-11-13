import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Cookie Policy | Understand our data practices",
  description: "Understand how Adalyze AI uses cookies to enhance your browsing experience and analyze site performance.",
  keywords: "adalyze cookie policy, website cookies, ai analytics cookies, cookie consent, data tracking policy, adalyze privacy cookies",
  openGraph: {
    title: "Adalyze AI Cookie Policy | Understand our data practices",
    description: "Understand how Adalyze AI uses cookies to enhance your browsing experience and analyze site performance.",
    url: "https://adalyze.app/cookie-policy",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Cookie Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Cookie Policy | Understand our data practices",
    description: "Understand how Adalyze AI uses cookies to enhance your browsing experience and analyze site performance.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
