"use client";

import { useEffect } from "react";
import { GTM_ID, GA4_MEASUREMENT_ID } from "@/lib/gtm";
import { sendCookieConsent, createConsentData, getExistingConsent } from "@/services/cookieConsentService";

export default function CookieConsentManager() {
  useEffect(() => {
    // Defer all non-critical operations to improve FCP
    // Use requestIdleCallback or setTimeout to defer after initial render
    const initCookieConsent = () => {
      // Load cookieconsent CSS asynchronously to prevent render blocking
      // Use media='print' trick to load CSS without blocking render
      if (!document.getElementById('cookieconsent-css')) {
        const link = document.createElement('link');
        link.id = 'cookieconsent-css';
        link.rel = 'stylesheet';
        // Load from node_modules path (Next.js will handle this)
        link.href = 'https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.css';
        link.media = 'print';
        link.onload = () => { 
          if (link.media) link.media = 'all'; 
        };
        document.head.appendChild(link);
      }

      // Defer GA4/GTM scripts loading to reduce initial HTTP requests
      // Load after page is interactive to improve performance
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadTrackingScriptsCookieLess, { timeout: 3000 });
      } else {
        setTimeout(loadTrackingScriptsCookieLess, 2000);
      }

      // Only import cookieconsent on client
      import("cookieconsent").then(async () => {
      if (typeof window !== "undefined" && (window as any).cookieconsent) {
        // First check if user has already made a choice via API (getExistingConsent)
        // This is the primary source of truth
        const existingConsent = await getExistingConsent();
        if (existingConsent) {
          // User has already given consent (accepted or rejected), don't show banner
          // If they accepted cookies, reload scripts with full cookie support
          if (existingConsent.analytics === 1 || existingConsent.marketing === 1) {
            loadTrackingScripts();
          }
          return;
        }

        // Fallback: Check if user has already made a choice (stored in localStorage)
        const savedConsent = localStorage.getItem("cookieConsent");
        if (savedConsent === "accepted" || savedConsent === "rejected") {
          // User has already made a choice, don't show banner
          // If they accepted cookies, reload scripts with full cookie support
          if (savedConsent === "accepted") {
            loadTrackingScripts();
          }
          return;
        }

        // No existing consent found, show the banner
        initializeCookieBanner();
      }
    });
    };

    // Defer initialization to improve FCP - wait for page to be interactive
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        // Use requestIdleCallback if available (better for performance)
        (window as any).requestIdleCallback(initCookieConsent, { timeout: 2000 });
      } else {
        // Fallback to setTimeout for browsers without requestIdleCallback
        setTimeout(initCookieConsent, 100);
      }
    }
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

      // Reload the page to apply consent changes immediately
      if (typeof window !== "undefined") {
        window.location.reload();
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

      // Reload the page even if API call fails so the choice applies
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  /**
   * Load GA4/GTM scripts with cookie-less configuration
   * This ensures tracking works without cookies for privacy compliance
   */
  const loadTrackingScriptsCookieLess = () => {
    // Check if scripts are already loaded to avoid duplicates
    if (typeof window === "undefined") return;
    if (document.getElementById('ga4-script-cookieless') || document.getElementById('ga4-script')) {
      return;
    }

    // GTM Script (cookie-less mode)
    if (GTM_ID && !document.getElementById('gtm-script-cookieless')) {
      const gtm = document.createElement("script");
      gtm.id = 'gtm-script-cookieless';
      gtm.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `;
      document.head.appendChild(gtm);
    }

    // GA4 Script (cookie-less mode)
    if (!document.getElementById('ga4-script-cookieless')) {
      const ga = document.createElement("script");
      ga.id = 'ga4-script-cookieless';
      ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
      ga.async = true;
      ga.defer = true;
      document.head.appendChild(ga);

      const inline = document.createElement("script");
      inline.id = 'ga4-inline-cookieless';
      inline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA4_MEASUREMENT_ID}', { 
          send_page_view: false,
          anonymize_ip: true,
          cookie_flags: 'SameSite=None;Secure',
          storage: 'none',
          client_storage: 'none'
        });
      `;
      document.head.appendChild(inline);
    }
  };

  /**
   * Load tracking scripts with full cookie support (when user accepts cookies)
   */
  const loadTrackingScripts = () => {
    // Remove cookie-less scripts first
    const cookielessScripts = [
      'gtm-script-cookieless',
      'ga4-script-cookieless',
      'ga4-inline-cookieless'
    ];
    cookielessScripts.forEach(id => {
      const script = document.getElementById(id);
      if (script) {
        script.remove();
      }
    });

    // GTM Script (with cookies)
    if (GTM_ID && !document.getElementById('gtm-script')) {
      const gtm = document.createElement("script");
      gtm.id = 'gtm-script';
      gtm.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `;
      document.head.appendChild(gtm);
    }

    // GA4 Script (with cookies)
    if (!document.getElementById('ga4-script')) {
      const ga = document.createElement("script");
      ga.id = 'ga4-script';
      ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
      ga.async = true;
      ga.defer = true;
      document.head.appendChild(ga);

      const inline = document.createElement("script");
      inline.id = 'ga4-inline';
      inline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: true });
      `;
      document.head.appendChild(inline);
    }

    // Meta Pixel (only load when cookies are accepted)
    // Check if script already exists or fbq is already initialized to prevent duplicate initialization
    if (typeof window === 'undefined') return;
    
    const win = window as any;
    const scriptExists = document.getElementById('meta-pixel-script');
    const fbqExists = win.fbq && typeof win.fbq === 'function';
    
    // Only load if script doesn't exist and fbq is not already initialized
    if (!scriptExists && !fbqExists) {
      const fb = document.createElement("script");
      fb.id = 'meta-pixel-script';
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
    }
  };

  return null;
}
