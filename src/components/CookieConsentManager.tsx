"use client";

import { useEffect } from "react";
import "cookieconsent/build/cookieconsent.min.css";
import { GTM_ID, GA4_MEASUREMENT_ID } from "@/lib/gtm";
import { sendCookieConsent, createConsentData, hasCookieId, hasExistingConsent, getExistingConsent } from "@/services/cookieConsentService";

export default function CookieConsentManager() {
  useEffect(() => {
    // Only import cookieconsent on client
    import("cookieconsent").then(async () => {
      if (typeof window !== "undefined" && (window as any).cookieconsent) {
        // First check if user has already made a choice (stored in localStorage)
        const savedConsent = localStorage.getItem("cookieConsent");
        if (savedConsent === "accepted" || savedConsent === "rejected") {
          // User has already made a choice, don't show banner
          // Load tracking scripts if they accepted
          if (savedConsent === "accepted") {
            loadTrackingScripts();
          }
          return;
        }

        // Check if cookie_id exists first
        if (!hasCookieId()) {
          // No cookie_id exists, show the banner
          initializeCookieBanner();
          return;
        }

        // Check if user has existing consent
        const hasConsent = await hasExistingConsent();
        if (!hasConsent) {
          // Has cookie_id but no consent, show banner
          initializeCookieBanner();
          return;
        }

        // Has cookie_id and consent, load tracking scripts
        const existingConsent = await getExistingConsent();
        if (existingConsent && (existingConsent.analytics === 1 || existingConsent.marketing === 1)) {
          loadTrackingScripts();
        }
      }
    });
  }, []);

  const initializeCookieBanner = () => {
    (window as any).cookieconsent.initialise({
      palette: {
        popup: { background: "#000000" },
        button: { background: "#db4900" },
        text: { color: "#ffffff" },
        borderRadius: { value: "5px" },
      },
      type: "opt-in",
      content: {
        message:
          "We use cookies to improve your experience, analyze traffic, and serve personalized ads.",
        allow: "Accept all",
        deny: "Reject all",
        link: "Learn more",
        href: "/cookie-policy",
      },
      onStatusChange: function (status: string, chosenBefore: boolean) {
        handleConsentChange(status, chosenBefore);
      },
    });
  };

  const handleConsentChange = async (status: string, chosenBefore: boolean) => {
    try {
      let consentData;
      
      if (status === "allow") {
        // User accepted all cookies
        consentData = createConsentData(true, true, true);
        loadTrackingScripts();
        localStorage.setItem("cookieConsent", "accepted");
      } else {
        // User rejected cookies - only necessary cookies
        consentData = createConsentData(true, false, false);
        localStorage.setItem("cookieConsent", "rejected");
      }

      // Send consent data to API
      await sendCookieConsent(consentData);
      console.log("Cookie consent sent to API successfully");
      
      // Hide the cookie banner after user makes a choice
      if (typeof window !== "undefined" && (window as any).cookieconsent) {
        (window as any).cookieconsent.eraseCookies();
      }
      
    } catch (error) {
      console.error("Failed to send cookie consent to API:", error);
      // Still save the consent locally even if API call fails
      if (status === "allow") {
        localStorage.setItem("cookieConsent", "accepted");
      } else {
        localStorage.setItem("cookieConsent", "rejected");
      }
      
      // Hide the cookie banner even if API call fails
      if (typeof window !== "undefined" && (window as any).cookieconsent) {
        (window as any).cookieconsent.eraseCookies();
      }
    }
  };

  const loadTrackingScripts = () => {
    // GTM Script
    const gtm = document.createElement("script");
    gtm.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM_ID}');
    `;
    document.head.appendChild(gtm);

    // GA4 Script
    const ga = document.createElement("script");
    ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    ga.async = true;
    document.head.appendChild(ga);

    const inline = document.createElement("script");
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: true });
    `;
    document.head.appendChild(inline);

    // Meta Pixel
    const fb = document.createElement("script");
    fb.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '2016397472454016');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(fb);
  };

  return null;
}
