  import { Poppins } from "next/font/google";
import { Suspense } from "react";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Adalyze AI My Account | Manage your account",
  description: "Adalyze AI My Account | Manage your account",
  keywords: "adalyze ai my account, adalyze ai dashboard, adalyze ai insights, adalyze ai optimization, adalyze ai analytics, adalyze ai",
  openGraph: {
    title: "Adalyze AI My Account | Manage your account",
    description: "Adalyze AI My Account | Manage your account",
    url: "https://adalyze.app/myaccount",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI My Account | Manage your account",
    description: "Adalyze AI My Account | Manage your account",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}