// src/services/__tests__/adService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { axiosInstance } from "@/configs/axios";
import type { AdsListParams, AdsListResponse, AbAdPair } from "@/types/api";
import { getAds, getAbAds } from "@/services/adService";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseParams: AdsListParams = { user_id: "42", offset: 0, limit: 10 };

const paramsWithBrand: AdsListParams = { user_id: "42", offset: 0, limit: 10, brand_id: "7" };

const mockAdsListResponse: AdsListResponse = {
  total: 1,
  limit: 10,
  offset: 0,
  ads: [
    {
      ads_type: "Image",
      ad_id: 1,
      ads_name: "Test Ad",
      image_path: "/img/test.png",
      industry: "Tech",
      score: 80,
      platforms: "Instagram",
      uploaded_on: "2026-01-01",
    },
  ],
};

const mockAbAdPairs: AbAdPair[] = [
  {
    ad_a: { ads_type: "Image", ad_id: 1, ads_name: "A1", image_path: "/a1.png", industry: "Tech", score: 70, platforms: "FB", uploaded_on: "2026-01-01" },
    ad_b: { ads_type: "Image", ad_id: 2, ads_name: "B1", image_path: "/b1.png", industry: "Tech", score: 75, platforms: "FB", uploaded_on: "2026-01-01" },
  },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getAds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test_getAds_calls_correct_endpoint", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdsListResponse } as never);
    await getAds(baseParams);
    expect(mockGet).toHaveBeenCalledTimes(1);
    const [url] = mockGet.mock.calls[0];
    expect(url).toBe("/api/ads");
  });

  it("test_getAds_passes_params_object", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdsListResponse } as never);
    await getAds(baseParams);
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).toEqual(baseParams);
  });

  it("test_getAds_includes_brand_id_when_provided", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdsListResponse } as never);
    await getAds(paramsWithBrand);
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params.brand_id).toBe("7");
  });

  it("test_getAds_omits_brand_id_when_absent", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdsListResponse } as never);
    await getAds(baseParams);
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).not.toHaveProperty("brand_id");
  });

  it("test_getAds_returns_response_data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdsListResponse } as never);
    const result = await getAds(baseParams);
    expect(result).toBe(mockAdsListResponse);
  });

  it("test_getAds_rethrows_on_error", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network error"));
    await expect(getAds(baseParams)).rejects.toThrow("Network error");
  });
});

describe("getAbAds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test_getAbAds_calls_correct_endpoint_with_user_id", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAbAdPairs } as never);
    await getAbAds("99");
    const [url] = mockGet.mock.calls[0];
    expect(url).toBe("/api/ab-ads");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).toEqual({ user_id: "99" });
  });

  it("test_getAbAds_returns_empty_array_when_data_is_null", async () => {
    mockGet.mockResolvedValueOnce({ data: null } as never);
    const result = await getAbAds("99");
    expect(result).toEqual([]);
  });
});
