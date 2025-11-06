import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze FAQ | Answers about AI ad analytics & optimization",
  description: "Find answers about Adalyze AI — features, pricing, integrations, and how it helps optimize your ad campaigns.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title> Adalyze FAQ | Answers about AI ad analytics & optimization</title>
        <meta
          name="description"
          content="Find answers about Adalyze AI — features, pricing, integrations, and how it helps optimize your ad campaigns."
        />

        <meta
          name="keywords"
          content="adalyze faq, ai ad analysis help, ad performance questions, digital ad tool support, ai advertising faqs, campaign analytics guide"
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
