import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Terms & Conditions | User agreement & policies",
  description: "Review Adalyze AI's terms and conditions for using our platform and digital ad analysis services.",
  keywords: "adalyze ai terms, ai tool agreement, platform conditions, adalyze ai usage policy, legal policy, advertising analytics terms",
  openGraph: {
    title: "Adalyze AI Terms & Conditions | User agreement & policies",
    description: "Review Adalyze AI's terms and conditions for using our platform and digital ad analysis services.",
    url: "https://adalyze.app/termsandconditions",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Terms & Conditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Terms & Conditions | User agreement & policies",
    description: "Review Adalyze AI's terms and conditions for using our platform and digital ad analysis services.",
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
