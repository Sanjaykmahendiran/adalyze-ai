import type { Metadata } from "next";
import { Poppins } from "next/font/google";


// Import Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze Terms & Conditions | User agreement & policies",
  description: "Review Adalyze AI’s terms and conditions for using our platform and digital ad analysis services.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
            <head>
        <title>  Adalyze Terms & Conditions | User agreement & policies</title>
        <meta
          name="description"
          content="Review Adalyze AI’s terms and conditions for using our platform and digital ad analysis services."
        />

        <meta
          name="keywords"
          content="adalyze terms, ai tool agreement, platform conditions, adalyze usage policy, legal policy, advertising analytics terms"
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
