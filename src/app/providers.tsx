// app/providers.tsx (update)
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/gtm";
import { trackEvent } from "@/lib/eventTracker";
import { getSessionId, clearSessionId } from "@/lib/sessionManager";
import Cookies from "js-cookie";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ensure dark theme is applied on initial mount and prevent system theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const storedTheme = localStorage.getItem('adalyze-theme');
      
      // If no theme is stored, default to dark and apply it
      if (!storedTheme) {
        localStorage.setItem('adalyze-theme', 'dark');
        root.classList.add('dark');
      } else if (storedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Ensure system theme preference is ignored
      root.setAttribute('data-theme', storedTheme || 'dark');
    }
  }, []);

  // create session id on first render (per tab) and clear on tab close
  useEffect(() => {
    // Defer session management to improve FCP
    const initSession = () => {
      // create if not present
      getSessionId();

      const handleBeforeUnload = () => {
        // clear only if you truly want to remove session on tab close
        clearSessionId();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
    };

    // Defer after initial render
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        const id = (window as any).requestIdleCallback(initSession, { timeout: 1000 });
        return () => {
          window.removeEventListener("beforeunload", () => clearSessionId());
          if (id) (window as any).cancelIdleCallback(id);
        };
      } else {
        const timeoutId = setTimeout(initSession, 50);
        return () => {
          clearTimeout(timeoutId);
          window.removeEventListener("beforeunload", () => clearSessionId());
        };
      }
    }
  }, []);

  // page view tracking: keep GTM as-is and also send API Page_View
  useEffect(() => {
    if (pathname) {
      const url = `${window.location.origin}${pathname}${searchParams?.toString() ? `?${searchParams}` : ""
        }`;

      // keep GTM pageview (your existing code)
      pageview(url);

      // List of pages that should track Page_View event
      const pagesToTrack = [
        "/",
        "/login",
        "/register",
        "/pricing",
        "/blog",
        "/case-study",
        "/affiliate-program",
        "/aboutus",
        "/cookie-policy",
        "/termsandconditions",
        "/returnpolicy",
        "/privacypolicy",
        "/agency",
        "/use-cases",
        "/features",
        "/roi-calculator",
        "/faq",
      ];

      // Only call trackEvent for specific pages
      if (pagesToTrack.includes(pathname)) {
        // Detect if device is mobile or desktop
        const isMobile = () => {
          // Check user agent for mobile devices
          const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
          const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
          const isMobileUserAgent = mobileRegex.test(userAgent);

          // Also check window width (mobile if width <= 768px)
          const isMobileWidth = typeof window !== "undefined" && window.innerWidth <= 768;

          return isMobileUserAgent || isMobileWidth;
        };

        const deviceType = isMobile() ? "Mobile" : "Desktop";
        const eventName = `Page_View_${deviceType}`;

        trackEvent(eventName, url, Cookies.get("email") || null);
      }
    }
  }, [pathname, searchParams]);

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="adalyze-theme"
      themes={['light', 'dark']}
      forcedTheme={undefined}
    >
      {children}
    </ThemeProvider>
  );
}
