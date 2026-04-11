import type {
  CaseStudy,
  Top10Ad,
  TrendingAdsResponse,
  FAQ,
  Testimonial,
} from "@/types/api";

export const getRecentCaseStudies = async (): Promise<CaseStudy[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=recentcslist`
  );
  if (!res.ok) throw new Error(`recentcslist failed: ${res.status}`);
  return res.json() as Promise<CaseStudy[]>;
};

export const getTop10Ads = async (): Promise<Top10Ad[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=top10ads`
  );
  if (!res.ok) throw new Error(`top10ads failed: ${res.status}`);
  return res.json() as Promise<Top10Ad[]>;
};

export const getTrendingAds = async (): Promise<TrendingAdsResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=trendingads`
  );
  if (!res.ok) throw new Error(`trendingads failed: ${res.status}`);
  return res.json() as Promise<TrendingAdsResponse>;
};

export const getFaqs = async (): Promise<FAQ[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=faqlist`
  );
  if (!res.ok) throw new Error(`faqlist failed: ${res.status}`);
  return res.json() as Promise<FAQ[]>;
};

export const getTestimonials = async (
  params?: { category?: string }
): Promise<Testimonial[]> => {
  let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=testilist`;
  if (params?.category) {
    url += `&category=${encodeURIComponent(params.category)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`testilist failed: ${res.status}`);
  return res.json() as Promise<Testimonial[]>;
};

export const getFaqsFiltered = async (
  category: string,
  search: string
): Promise<FAQ[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=faqlist&category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`
  );
  if (!res.ok) throw new Error(`faqlist (filtered) failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};
