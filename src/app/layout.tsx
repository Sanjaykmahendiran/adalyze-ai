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
  weight: ["400", "500", "600", "700"], // Reduced from 5 to 4 weights - remove 300 (light) if not critical
  display: "swap", // Prevents render blocking - shows fallback font immediately
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"], // Better fallback for faster FCP
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adalyze.app"),
  title: "Adalyze AI | Smart Ad Analysis for Agencies & Marketers",
  description:
    "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
  alternates: {
    canonical: "https://adalyze.app",
  },
  openGraph: {
    title: "Adalyze AI | Smart Ad Analysis for Agencies & Marketers",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
    url: "https://adalyze.app",
    type: "website",
    images: [
      {
        url: "https://adalyze.app/uploads/ad-icon-logo.webp",
        width: 1200,
        height: 630,
        alt: "Adalyze AI | Smart Ad Analysis for Agencies & Marketers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adalyze AI | Smart Ad Analysis for Agencies & Marketers",
    description: "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
    images: ["https://adalyze.app/uploads/ad-icon-logo.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Adalyze AI | Smart Ad Analysis for Agencies & Marketers</title>
        <meta
          name="description"
          content="Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality."
        />

        <meta
          name="keywords"
          content="AI Ad Analysis Tool, Ad Performance Optimization, Digital Ad Analysis Platform, AI-Powered Ad Insights, Ad Optimization Platform for Agencies, Fix Low-Performing Ads, Ad Analytics Software for Marketers"
        />

        {/* Canonical URL - ensures www and non-www resolve to same URL */}
        <link rel="canonical" href="https://adalyze.app" />

        {/* Open Graph / Facebook */}
        <meta property="og:url" content="https://adalyze.app/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Adalyze AI | Smart Ad Analysis for Agencies & Marketers"
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
          content="Adalyze AI | Smart Ad Analysis for Agencies & Marketers"
        />
        <meta
          name="twitter:description"
          content="Analyze, optimize, and enhance your ad creatives with AI using Adalyze."
        />
        <meta
          name="twitter:image"
          content="https://adalyze.app/uploads/ad-icon-logo.webp"
        />

        {/* Preload critical LCP image - highest priority */}
        <link
          rel="preload"
          as="image"
          href="https://adalyze.app/uploads/thumbnail.webp"
          fetchPriority="high"
          imageSrcSet="https://adalyze.app/uploads/thumbnail.webp 1920w"
          imageSizes="100vw"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="image"
          href="https://adalyze.app/uploads/thumbnail-mobile.webp"
          fetchPriority="high"
          crossOrigin="anonymous"
        />

        {/* Preconnect to image/video CDN for faster LCP */}
        <link rel="preconnect" href="https://adalyze.app" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://adalyze.app" />

        {/* Preconnect to API domain for faster data fetching */}
        <link rel="preconnect" href="https://adalyzeai.xyz" />
        <link rel="dns-prefetch" href="https://adalyzeai.xyz" />

        {/* Preconnect to external domains - defer to improve FCP */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Critical CSS - inlined to prevent render blocking */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical above-the-fold styles - prevents FOUC */
            html { font-family: system-ui, -apple-system, sans-serif; }
            body { 
              margin: 0; 
              background: #171717; 
              color: #f9fafb; 
              font-family: var(--font-poppins, system-ui, -apple-system, sans-serif);
            }
            .bg-background { background-color: #171717; }
            /* Prevent layout shift during font load */
            * { box-sizing: border-box; }
          `
        }} />

        {/* Normalize www and non-www URLs - redirect www to non-www - deferred to prevent blocking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  // Defer execution to prevent render blocking
                  setTimeout(function() {
                    var host = window.location.hostname;
                    var protocol = window.location.protocol;
                    var path = window.location.pathname;
                    var search = window.location.search;
                    var hash = window.location.hash;
                    
                    // Redirect www.adalyze.app to adalyze.app
                    if (host === 'www.adalyze.app') {
                      var newUrl = protocol + '//adalyze.app' + path + search + hash;
                      window.location.replace(newUrl);
                    }
                  }, 0);
                }
              })();
            `,
          }}
        />

        {/* Structured Data (JSON-LD) for SEO - injected after initial render to prevent blocking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  // Defer JSON-LD injection to prevent render blocking
                  setTimeout(function() {
                    const schemas = [
                      ${JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Adalyze AI",
              "url": "https://adalyze.app",
              "logo": "https://adalyze.app/uploads/ad-icon-logo.webp",
              "description": "Adalyze AI helps marketers and agencies analyze, optimize, and improve ad performance with smart AI insights to boost ROI and creative quality.",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "url": "https://adalyze.app/faq"
              }
            })},
                      ${JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Adalyze AI",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "AI-powered ad analysis tool that helps marketers and agencies analyze, optimize, and improve ad performance with smart insights to boost ROI and creative quality.",
              "url": "https://adalyze.app",
              "screenshot": "https://adalyze.app/uploads/ad-icon-logo.webp",
              "featureList": [
                "AI-Powered Ad Analysis",
                "Performance Optimization",
                "Creative Quality Assessment",
                "ROI Insights",
                "Ad Comparison",
                "Target Audience Analysis"
              ]
            })},
                      ${JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Adalyze AI",
              "url": "https://adalyze.app",
              "description": "Smart Ad Analysis for Agencies & Marketers",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://adalyze.app/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })},
                      ${JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Ad Analysis and Optimization",
              "provider": {
                "@type": "Organization",
                "name": "Adalyze AI"
              },
              "areaServed": "Worldwide",
              "description": "AI-powered ad analysis and optimization services for digital marketers and agencies"
            })}
                    ];
                    
                    schemas.forEach(function(schema) {
                      const script = document.createElement('script');
                      script.type = 'application/ld+json';
                      script.text = JSON.stringify(schema);
                      document.head.appendChild(script);
                    });
                  }, 0);
                }
              })();
            `,
          }}
        />
      </head>

      <body className={`${poppins.variable} antialiased`}>
        {/* Critical content renders first */}
        <Suspense fallback={null}>
          <GoogleOAuthProvider clientId="543832771103-mjordts3br5jlop5dj8q9m16nijjupuu.apps.googleusercontent.com">
            {children}
          </GoogleOAuthProvider>

          {/* Non-critical components load after initial render */}

          <CookieConsentManager />
          <Providers />


          {/* Toaster loads after page is interactive */}
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
        </Suspense>
      </body>
    </html>
  );
}
