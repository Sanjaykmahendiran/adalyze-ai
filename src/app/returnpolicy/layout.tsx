import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze Return Policy | Refund & subscription terms",
  description: "Read Adalyze AI’s return and refund policy. Know your rights and the terms for subscription cancellations.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title> Adalyze Return Policy | Refund & subscription terms</title>
        <meta
          name="description"
          content="Read Adalyze AI’s return and refund policy. Know your rights and the terms for subscription cancellations."
        />

        <meta
          name="keywords"
          content="adalyze return policy, ai software refund, subscription cancellation, ad analysis return, refund terms, adalyze refund policy"
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
