import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { Suspense } from "react";
import CookieConsentManager from "@/components/CookieConsentManager";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adalyze.app"),
  title: "Adalyze AI – Smart Ad Analysis for Agencies & Marketers",
  description:
    "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Adalyze AI – Smart Ad Analysis for Agencies & Marketers</title>
        <meta
          name="description"
          content="Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality."
        />

        <meta
          name="keywords"
          content="AI Ad Analysis Tool, Ad Performance Optimization, Digital Ad Analysis Platform, AI-Powered Ad Insights, Ad Optimization Platform for Agencies, Fix Low-Performing Ads, Ad Analytics Software for Marketers"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:url" content="https://adalyze.app/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Adalyze AI – Smart Ad Analysis for Agencies & Marketers"
        />
        <meta
          property="og:description"
          content="Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality."
        />
        <meta
          property="og:image"
          content="https://adalyze.app/uploads/ad-icon-logo.webp"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="adalyze.app" />
        <meta property="twitter:url" content="https://adalyze.app/" />
        <meta
          name="twitter:title"
          content="Adalyze AI – Smart Ad Analysis for Agencies & Marketers"
        />
        <meta
          name="twitter:description"
          content="Analyze, optimize, and enhance your ad creatives with AI using Adalyze."
        />
        <meta
          name="twitter:image"
          content="https://adalyze.app/uploads/ad-icon-logo.webp"
        />

        {/* Preload assets */}
        <link
          rel="preload"
          as="image"
          href="https://adalyze.app/uploads/thumbnail.webp"
        />
        <link
          rel="preload"
          as="image"
          href="https://adalyze.app/uploads/thumbnail-mobile.webp"
        />
        <link
          rel="preload"
          as="video"
          href="https://adalyze.app/uploads/video.mp4"
          type="video/mp4"
        />
      </head>

      <body className={`${poppins.variable} antialiased`}>
        <Suspense fallback={null}>
          <CookieConsentManager />
          <Providers />

          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: "#000000",
                color: "#f9fafb",
                fontFamily: "var(--font-poppins)",
                border: "1px solid #db4900",
              },
              success: {
                style: {
                  background: "#000000",
                  color: "#16a34a",
                  border: "1px solid #db4900",
                },
              },
              error: {
                style: {
                  background: "#000000",
                  color: "#dc2626",
                  border: "1px solid #db4900",
                },
              },
            }}
          />


          <GoogleOAuthProvider clientId="543832771103-mjordts3br5jlop5dj8q9m16nijjupuu.apps.googleusercontent.com">
            {children}
          </GoogleOAuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
