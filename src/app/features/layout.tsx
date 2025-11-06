import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze AI Features | Analyze, optimize & boost ad performance",
  description: "Discover Adalyze AI’s powerful features to analyze, optimize, and improve your ad quality, performance, and conversions effortlessly.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Adalyze AI Features | Analyze, optimize & boost ad performance</title>
        <meta
          name="description"
          content="Discover Adalyze AI’s powerful features to analyze, optimize, and improve your ad quality, performance, and conversions effortlessly."
        />

        <meta
          name="keywords"
          content="adalyze features, ai ad optimization, ad performance tool, creative analytics, campaign improvement, ai ad analyzer"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <div className="bg-[#171717]">
          {children}
        </div>
      </body>
    </html>
  );
}
