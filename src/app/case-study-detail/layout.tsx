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
  const slug = params?.slug || 'case-study';
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | Adalyze AI`,
    description: `Discover how ${title.toLowerCase()} transforms ad campaigns with Adalyze AI. Real-world results, AI-powered insights, and optimization strategies to boost ROI.`,
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
  const slug = params?.slug || 'case-study';
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <html lang="en">
      <head>
        <title>{title} | Adalyze AI</title>
        <meta
          name="description"
          content={`Discover how ${title.toLowerCase()} transforms ad campaigns with Adalyze AI. Real-world results, AI-powered insights, and optimization strategies to boost ROI.`}
        />
        <meta
          name="keywords"
          content="edtech ad case study, youtube ad recall, ai campaign optimization, ai ad performance, video ad analytics, adalyze case study"
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
