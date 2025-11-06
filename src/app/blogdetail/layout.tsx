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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Convert slug to title case with fallback
  const slug = params?.slug || 'blog-post';
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | Adalyze Blog`,
    description: `Learn how ${title.toLowerCase()} is transforming digital ad campaigns with AI-powered insights, real-time optimization, and smarter creative decisions.`,
  };
}

export default function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { slug: string };
}>) {
  // Convert slug to title case with fallback
  const slug = params?.slug || 'blog-post';
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <html lang="en">
      <head>
        <title>{title} | Adalyze Blog</title>
        <meta
          name="description"
          content={`Learn how ${title.toLowerCase()} is transforming digital ad campaigns with AI-powered insights, real-time optimization, and smarter creative decisions.`}
        />

        <meta
          name="keywords"
          content="ai ad campaigns, ai transforms advertising, digital ad optimization, campaign performance analytics, ai marketing impact, adalyze blog"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <div className="bg-[#171717]">
          <Suspense>
            {children}
          </Suspense>
        </div>
      </body>
    </html>
  );
}
