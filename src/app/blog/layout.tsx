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
  title: "Adalyze Blog | AI-Powered advertising tips & insights",
  description: "Read the latest insights, tips, and AI trends in advertising. Stay ahead with Adalyze AI’s expert marketing blog.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title> Adalyze Blog | AI-Powered advertising tips & insights</title>
        <meta
          name="description"
          content="Read the latest insights, tips, and AI trends in advertising. Stay ahead with Adalyze AI’s expert marketing blog."
        />

        <meta
          name="keywords"
          content="ai advertising blog, adalyze insights, ad performance tips, digital marketing blog, ai ad trends, campaign optimization ideas"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <div className="">
          <Suspense>
            {children}
          </Suspense>
        </div>
      </body>
    </html>
  );
}
