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

export const metadata: Metadata = {
  title: "Adalyze AI Case Studies | Real results from smart ad analysis",
  description: "See how top brands improved ad performance using Adalyze AI. Real data, real results — explore case studies now.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
            <head>
        <title> Adalyze AI Case Studies | Real results from smart ad analysis</title>
        <meta
          name="description"
          content="See how top brands improved ad performance using Adalyze AI. Real data, real results — explore case studies now."
        />

        <meta
          name="keywords"
          content="adalyze case studies, ai ad results, campaign performance success, digital ad case study, ai marketing analytics, ad performance insights"
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
