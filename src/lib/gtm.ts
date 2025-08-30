// lib/gtm.ts
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

export const pageview = (url: string) => {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "pageview",
      page: url,
    });
  }
};

// 🔹 New: Track custom events
export const event = (eventName: string, params: object = {}) => {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: eventName,
      ...params,
    });
  }
};
