import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Convert slug to title case with fallback
  const slug = params?.slug || 'case-study';
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const metaTitle = `${title} | Adalyze AI`;
  const metaDescription = `Discover how ${title.toLowerCase()} transforms ad campaigns with Adalyze AI. Real-world results, AI-powered insights, and optimization strategies to boost ROI.`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: "edtech ad case study, youtube ad recall, ai campaign optimization, ai ad performance, video ad analytics, adalyze case study",
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://adalyze.app/case-study-detail/${slug}`,
      type: "article",
      images: [
        {
          url: "https://adalyze.app/uploads/ad-icon-logo.webp",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
    },
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { slug: string };
}>) {
  return (  
      <Suspense>
        {children}
      </Suspense>
  );
}
