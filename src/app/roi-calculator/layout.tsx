import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ad ROI Calculator | Measure & maximize your ad spend with AI",
  description: "Estimate your advertising ROI in seconds. Use Adalyze AI’s free ROI calculator to measure performance and maximize returns.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Ad ROI Calculator | Measure & maximize your ad spend with AI</title>
        <meta
          name="description"
          content="Estimate your advertising ROI in seconds. Use Adalyze AI’s free ROI calculator to measure performance and maximize returns."
        />

        <meta
          name="keywords"
          content="ad roi calculator, ai roi tool, ad performance roi, campaign roi analysis, digital marketing roi, ai advertising metrics"
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
