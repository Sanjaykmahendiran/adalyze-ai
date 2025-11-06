import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze AI – Smart Ad Analysis for Agencies & Marketers",
  description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
                  <head>
        <title> Adalyze AI for Agencies | Smart ad analysis & optimization platform </title>
        <meta
          name="description"
          content="Boost your agency’s ad performance with Adalyze AI, smart analysis, insights, and real-time optimization to scale faster."
        />

        <meta
          name="keywords"
          content="ad analysis for agencies, agency ad optimization,agency advertising analytics tool,ad campaign intelligence for agencies, agency marketing automation platform, advertising analytics software for agencies"
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
