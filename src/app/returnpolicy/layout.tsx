import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI Return Policy | Refund & subscription terms",
  description: "Read Adalyze AI's return and refund policy. Know your rights and the terms for subscription cancellations.",
  keywords: "adalyze ai return policy, ai software refund, subscription cancellation, ad analysis return, refund terms, adalyze ai refund policy",
  openGraph: {
    title: "Adalyze AI Return Policy | Refund & subscription terms",
    description: "Read Adalyze AI's return and refund policy. Know your rights and the terms for subscription cancellations.",
    url: "https://adalyze.app/returnpolicy",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI Return Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI Return Policy | Refund & subscription terms",
    description: "Read Adalyze AI's return and refund policy. Know your rights and the terms for subscription cancellations.",
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
