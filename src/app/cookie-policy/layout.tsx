import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze Cookie Policy | Understand our data practices",
  description: "Understand how Adalyze AI uses cookies to enhance your browsing experience and analyze site performance.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title> Adalyze Cookie Policy | Understand our data practices</title>
        <meta
          name="description"
          content="Understand how Adalyze AI uses cookies to enhance your browsing experience and analyze site performance."
        />

        <meta
          name="keywords"
          content="adalyze cookie policy, website cookies, ai analytics cookies, cookie consent, data tracking policy, adalyze privacy cookies"
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
