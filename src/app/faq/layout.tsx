import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adalyze AI FAQ | Answers about AI ad analytics & optimization",
  description: "Find answers about Adalyze AI — features, pricing, integrations, and how it helps optimize your ad campaigns.",
  keywords: "adalyze faq, ai ad analysis help, ad performance questions, digital ad tool support, ai advertising faqs, campaign analytics guide",
  openGraph: {
    title: "Adalyze AI FAQ | Answers about AI ad analytics & optimization",
    description: "Find answers about Adalyze AI — features, pricing, integrations, and how it helps optimize your ad campaigns.",
    url: "https://adalyze.app/faq",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI FAQ | Answers about AI ad analytics & optimization",
    description: "Find answers about Adalyze AI — features, pricing, integrations, and how it helps optimize your ad campaigns.",
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
