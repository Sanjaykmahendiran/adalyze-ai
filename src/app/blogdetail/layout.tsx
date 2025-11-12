import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Convert slug to title case with fallback
  const slug = params?.slug || 'blog-post';
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const metaTitle = `${title} | Adalyze AI Blog`;
  const metaDescription = `Learn how ${title.toLowerCase()} is transforming digital ad campaigns with AI-powered insights, real-time optimization, and smarter creative decisions.`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: "ai ad campaigns, ai transforms advertising, digital ad optimization, campaign performance analytics, ai marketing impact, adalyze blog",
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://adalyze.app/blogdetail/${slug}`,
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
