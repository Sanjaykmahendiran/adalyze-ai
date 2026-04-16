// -----------------------------------------------------------------------
// IMPORTANT: This service uses Pattern B only (unauthenticated raw fetch).
// Do NOT add axiosInstance or authenticated calls to this file.
// -----------------------------------------------------------------------

import type {
  FAQItem,
  Guide,
  BlogPost,
  BannerData,
  Client,
  ApiMenuItem,
  AgencyUseCaseResponse,
  VersionData,
  IssueItem,
  ROIParams,
  ROIResult,
  CaseStudy,
} from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── HTML endpoints (AP-009: .text() not .json()) ───────────────────────

export const getAboutUs = async (): Promise<string> => {
  const res = await fetch(`${BASE}/api.php?gofor=about`);
  if (!res.ok) throw new Error(`about failed: ${res.status}`);
  return res.text();
};

export const getCookiePolicy = async (): Promise<string> => {
  const res = await fetch(`${BASE}/api.php?gofor=cookiepolicy`);
  if (!res.ok) throw new Error(`cookiepolicy failed: ${res.status}`);
  return res.text();
};

// ── JSON list endpoints ────────────────────────────────────────────────

export const getFaqList = async (
  params?: { category?: string }
): Promise<FAQItem[]> => {
  let url = `${BASE}/api.php?gofor=prefaqlist`;
  if (params?.category) {
    url += `&category=${encodeURIComponent(params.category)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`prefaqlist failed: ${res.status}`);
  return res.json() as Promise<FAQItem[]>;
};

export const getGuides = async (): Promise<Guide[]> => {
  const res = await fetch(`${BASE}/api.php?gofor=guideslist`);
  if (!res.ok) throw new Error(`guideslist failed: ${res.status}`);
  return res.json() as Promise<Guide[]>;
};

export const getBlogs = async (
  options?: { cache?: RequestCache }
): Promise<BlogPost[]> => {
  const res = await fetch(`${BASE}/api.php?gofor=blogslist`, {
    ...(options?.cache ? { cache: options.cache } : {}),
  });
  if (!res.ok) throw new Error(`blogslist failed: ${res.status}`);
  return res.json() as Promise<BlogPost[]>;
};

export const getBlogBySlug = async (
  slug: string,
  options?: { cache?: RequestCache }
): Promise<BlogPost> => {
  const res = await fetch(
    `${BASE}/api.php?gofor=getblog&slug=${encodeURIComponent(slug)}`,
    {
      ...(options?.cache ? { cache: options.cache } : {}),
    }
  );
  if (!res.ok) throw new Error(`getblog failed: ${res.status}`);
  return res.json() as Promise<BlogPost>;
};

export const getCaseStudies = async (
  params?: { category?: string; cache?: RequestCache }
): Promise<CaseStudy[]> => {
  let url = `${BASE}/api.php?gofor=casestudylist`;
  if (params?.category) {
    url += `&category=${encodeURIComponent(params.category)}`;
  }
  const res = await fetch(url, {
    ...(params?.cache ? { cache: params.cache } : {}),
  });
  if (!res.ok) throw new Error(`casestudylist failed: ${res.status}`);
  return res.json() as Promise<CaseStudy[]>;
};

export const getCaseStudyBySlug = async (
  slug: string,
  options?: { cache?: RequestCache }
): Promise<CaseStudy> => {
  const res = await fetch(
    `${BASE}/api.php?gofor=getcasestudy&slug=${encodeURIComponent(slug)}`,
    {
      ...(options?.cache ? { cache: options.cache } : {}),
    }
  );
  if (!res.ok) throw new Error(`getcasestudy failed: ${res.status}`);
  return res.json() as Promise<CaseStudy>;
};

export const getAgencyUseCases = async (): Promise<AgencyUseCaseResponse[]> => {
  const res = await fetch(`${BASE}/api.php?gofor=agusecaselist`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`agusecaselist failed: ${res.status}`);
  return res.json() as Promise<AgencyUseCaseResponse[]>;
};

export const getLiveBanner = async (
  params?: { variant?: string }
): Promise<BannerData> => {
  let url = `${BASE}/api.php?gofor=livebanner`;
  if (params?.variant && params.variant !== "default") {
    url += `&variant=${encodeURIComponent(params.variant)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`livebanner failed: ${res.status}`);
  return res.json() as Promise<BannerData>;
};

export const getPricingVersions = async (): Promise<VersionData[]> => {
  const res = await fetch(`${BASE}/api.php?gofor=versionlist`);
  if (!res.ok) throw new Error(`versionlist failed: ${res.status}`);
  return res.json() as Promise<VersionData[]>;
};

export const getClients = async (
  params?: { category?: string }
): Promise<Client[]> => {
  let url = `${BASE}/api.php?gofor=clientslist`;
  if (params?.category) {
    url += `&category=${encodeURIComponent(params.category)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`clientslist failed: ${res.status}`);
  return res.json() as Promise<Client[]>;
};

export const getMenuItems = async (): Promise<ApiMenuItem[]> => {
  const res = await fetch(`${BASE}/api.php?gofor=menulist`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`menulist failed: ${res.status}`);
  return res.json() as Promise<ApiMenuItem[]>;
};

export const getIssues = async (
  params?: { category?: string; cache?: RequestCache }
): Promise<IssueItem[]> => {
  let url = `${BASE}/api.php?gofor=issueslist`;
  if (params?.category) {
    url += `&category=${encodeURIComponent(params.category)}`;
  }
  const res = await fetch(url, {
    ...(params?.cache ? { cache: params.cache } : {}),
  });
  if (!res.ok) throw new Error(`issueslist failed: ${res.status}`);
  return res.json() as Promise<IssueItem[]>;
};

export const calculateROI = async (
  params: ROIParams
): Promise<ROIResult> => {
  const res = await fetch(
    `${BASE}/api.php?gofor=calculateROI&country=${encodeURIComponent(String(params.country))}&users=${encodeURIComponent(String(params.users))}&weekly_range=${encodeURIComponent(String(params.weekly_range))}`
  );
  if (!res.ok) throw new Error(`calculateROI failed: ${res.status}`);
  return res.json() as Promise<ROIResult>;
};
