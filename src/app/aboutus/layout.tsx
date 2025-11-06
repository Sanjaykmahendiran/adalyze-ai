import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "About Adalyze | AI platform for smarter digital advertising",
  description: "Learn about Adalyze AI — our mission to empower advertisers with smart insights, automation, and performance analytics.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
            <head>
        <title> About Adalyze | AI platform for smarter digital advertising</title>
        <meta
          name="description"
          content="Learn about Adalyze AI — our mission to empower advertisers with smart insights, automation, and performance analytics."
        />

        <meta
          name="keywords"
          content="about adalyze, ai advertising platform, adalyze company, ad optimization firm, digital marketing ai, adalyze mission"
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
