import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze Affiliate Program | Earn by promoting AI ad insights",
  description: "Join the Adalyze Affiliate Program. Earn rewards by promoting AI-powered ad performance tools to your network.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
            <head>
        <title> Adalyze Affiliate Program | Earn by promoting AI ad insights</title>
        <meta
          name="description"
          content="Join the Adalyze Affiliate Program. Earn rewards by promoting AI-powered ad performance tools to your network."
        />

        <meta
          name="keywords"
          content="adalyze affiliate program, earn with ai, promote adalyze, ai referral program, affiliate marketing ai, adalyze partner program"
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
