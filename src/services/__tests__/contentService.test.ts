// src/services/__tests__/contentService.test.ts

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

import type { CaseStudy, Top10Ad, TrendingAdsResponse, FAQ, Testimonial } from "@/types/api";
import {
  getRecentCaseStudies,
  getTop10Ads,
  getTrendingAds,
  getFaqs,
  getTestimonials,
} from "@/services/contentService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeFetchOk = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);

const makeFetchFail = (status: number) =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) } as unknown as Response);

// ─── Setup ───────────────────────────────────────────────────────────────────

let fetchMock: jest.Mock;

beforeEach(() => {
  global.fetch = jest.fn();
  fetchMock = global.fetch as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getRecentCaseStudies", () => {
  it("test_getRecentCaseStudies_fetches_correct_url", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk([]));
    await getRecentCaseStudies();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test/api.php?gofor=recentcslist"
    );
  });

  it("test_getRecentCaseStudies_returns_json_body", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk([{ cs_id: 1 }]));
    const result = await getRecentCaseStudies();
    expect(result).toEqual([{ cs_id: 1 }]);
  });

  it("test_getRecentCaseStudies_throws_on_non_ok_response", async () => {
    fetchMock.mockReturnValueOnce(makeFetchFail(500));
    await expect(getRecentCaseStudies()).rejects.toThrow("recentcslist failed: 500");
  });
});

describe("getTop10Ads", () => {
  it("test_getTop10Ads_fetches_correct_url", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk([]));
    await getTop10Ads();
    expect(global.fetch).toHaveBeenCalledWith("https://api.test/api.php?gofor=top10ads");
  });

  it("test_getTop10Ads_throws_on_non_ok_response", async () => {
    fetchMock.mockReturnValueOnce(makeFetchFail(404));
    await expect(getTop10Ads()).rejects.toThrow("top10ads failed: 404");
  });
});

describe("getTrendingAds", () => {
  it("test_getTrendingAds_fetches_correct_url", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk({ trending_ads: [], time_frame: "7d" }));
    await getTrendingAds();
    expect(global.fetch).toHaveBeenCalledWith("https://api.test/api.php?gofor=trendingads");
  });

  it("test_getTrendingAds_returns_response_body", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk({ trending_ads: [], time_frame: "7d" }));
    const result = await getTrendingAds();
    expect(result).toEqual({ trending_ads: [], time_frame: "7d" });
  });
});

describe("getFaqs", () => {
  it("test_getFaqs_fetches_correct_url", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk([]));
    await getFaqs();
    expect(global.fetch).toHaveBeenCalledWith("https://api.test/api.php?gofor=faqlist");
  });

  it("test_getFaqs_throws_on_non_ok_response", async () => {
    fetchMock.mockReturnValueOnce(makeFetchFail(503));
    await expect(getFaqs()).rejects.toThrow("faqlist failed: 503");
  });
});

describe("getTestimonials", () => {
  it("test_getTestimonials_fetches_correct_url", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk([]));
    await getTestimonials();
    expect(global.fetch).toHaveBeenCalledWith("https://api.test/api.php?gofor=testilist");
  });

  it("test_getTestimonials_returns_json_body", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk([{ testi_id: 1, name: "A" }]));
    const result = await getTestimonials();
    expect(result).toEqual([{ testi_id: 1, name: "A" }]);
  });

  it("test_getTestimonials_throws_on_non_ok_response", async () => {
    fetchMock.mockReturnValueOnce(makeFetchFail(403));
    await expect(getTestimonials()).rejects.toThrow("testilist failed: 403");
  });
});
