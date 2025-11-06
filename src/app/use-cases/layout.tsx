import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import UserLayout from "@/components/layouts/user-layout";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";

// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze AI Use Cases | Smarter ad insights for every industry",
  description: "Explore how Adalyze AI enhances ad performance across industries. Get smarter insights for better ROI on every digital campaign.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Adalyze AI Use Cases | Smarter ad insights for every industry</title>
        <meta
          name="description"
          content="Explore how Adalyze AI enhances ad performance across industries. Get smarter insights for better ROI on every digital campaign."
        />

        <meta
          name="keywords"
          content="adalyze ai use cases, ai ad analysis, ad optimization examples, digital ad insights, industry ad analytics, ai marketing tool"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
