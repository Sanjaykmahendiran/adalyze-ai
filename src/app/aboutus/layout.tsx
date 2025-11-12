import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Adalyze AI | AI platform for smarter digital advertising",
  description: "Learn about Adalyze AI — our mission to empower advertisers with smart insights, automation, and performance analytics.",
  keywords: "about adalyze, ai advertising platform, adalyze company, ad optimization firm, digital marketing ai, adalyze mission",
  openGraph: {
    title: "About Adalyze AI | AI platform for smarter digital advertising",
    description: "Learn about Adalyze AI — our mission to empower advertisers with smart insights, automation, and performance analytics.",
    url: "https://adalyze.app/aboutus",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "About Adalyze AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Adalyze AI | AI platform for smarter digital advertising",
    description: "Learn about Adalyze AI — our mission to empower advertisers with smart insights, automation, and performance analytics.",
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
