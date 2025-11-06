import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze Privacy Policy | Data protection & user trust",
  description: "Understand how Adalyze AI protects your data and ensures complete privacy and transparency in every interaction.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title> Adalyze Privacy Policy | Data protection & user trust</title>
        <meta
          name="description"
          content="Understand how Adalyze AI protects your data and ensures complete privacy and transparency in every interaction."
        />

        <meta
          name="keywords"
          content="adalyze privacy policy, ai data protection, user privacy adalyze, advertising data security, ai analytics compliance, data transparency"
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
