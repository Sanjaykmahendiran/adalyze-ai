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
  title: "Adalyze - Nextgen AI Tool for your Creativity",
  description: "Adalyze - Nextgen AI Tool for your Creativity",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <div className="bg-[#0a0a0a]">
          <Suspense>
          {children}
          </Suspense>
        </div>
      </body>
    </html>
  );
}
