// app/providers.tsx (update)
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/gtm";
import { trackEvent } from "@/lib/eventTracker";
import { getSessionId, clearSessionId } from "@/lib/sessionManager";
import Cookies from "js-cookie";

export function Providers() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // create session id on first render (per tab) and clear on tab close
  useEffect(() => {
    // create if not present
    getSessionId();

    const handleBeforeUnload = () => {
      // clear only if you truly want to remove session on tab close
      clearSessionId();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // page view tracking: keep GTM as-is and also send API Page_View
  useEffect(() => {
    if (pathname) {
      const url = `${window.location.origin}${pathname}${
        searchParams?.toString() ? `?${searchParams}` : ""
      }`;

      // keep GTM pageview (your existing code)
      pageview(url);

      // also call our events API for Page_View
      // trackEvent("Page_View", url, Cookies.get("email") || null);
    }
  }, [pathname, searchParams]);

  return null;
}
