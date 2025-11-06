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
  title: "Adalyze AI Pricing | Flexible plans to scale your ad success",
  description: "Choose a flexible Adalyze AI pricing plan that fits your business needs. Scale smarter ad decisions at affordable rates.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title> Adalyze AI Pricing | Flexible plans to scale your ad success</title>
        <meta
          name="description"
          content="Choose a flexible Adalyze AI pricing plan that fits your business needs. Scale smarter ad decisions at affordable rates."
        />

        <meta
          name="keywords"
          content="adalyze pricing, ai ad analysis plans, ad optimization software cost, ad analytics subscription, affordable ai tools, adalyze plans"
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
