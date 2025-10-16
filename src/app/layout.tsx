import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import { Providers } from "./providers";
import { GTM_ID } from "@/lib/gtm";
import { Suspense } from "react";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adalyze - Nextgen AI Tool for your Creativity",
  description: "Adalyze - Nextgen AI Tool for your Creativity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload LCP resources for better performance */}
        <link
          rel="preload"
          as="image"
          href="https://adalyze.app/uploads/thumbnail.webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="https://adalyze.app/uploads/thumbnail-mobile.webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="video"
          href="https://adalyze.app/uploads/video.mp4"
          type="video/mp4"
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        {/* ✅ Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
        {/* ✅ Google Analytics 4 */}
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-NP47DV1XRN"
        />
        <Script
          id="ga4-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-NP47DV1XRN', { send_page_view: true });
    `,
          }}
        />

        {/* ✅ Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* ✅ Pageview Tracker */}
        <Suspense fallback={null}>
          <Providers />

        {/* ✅ Toast Notifications */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#000000",
              color: "#f9fafb",
              fontFamily: "var(--font-poppins)",
            },
            success: {
              style: { background: "#000000", color: "#16a34a" },
            },
            error: {
              style: { background: "#000000", color: "#dc2626" },
            },
          }}
        />

        {/* ✅ Google OAuth Provider */}
        <GoogleOAuthProvider clientId="543832771103-mjordts3br5jlop5dj8q9m16nijjupuu.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
