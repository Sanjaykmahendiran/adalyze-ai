// src/services/__tests__/resultsService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn() },
}));

import { axiosInstance } from "@/configs/axios";
import type {
  AdDetailData,
  AdDetailResponse,
  HeatmapGetResponse,
  HeatmapGenerateResponse,
  DeleteAdResponse,
} from "@/types/api";
import {
  getAdDetail,
  getHeatmap,
  generateHeatmap,
  deleteAd,
} from "@/services/resultsService";

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockAdDetailData: AdDetailData = {
  heatmapstatus: 1,
  platform_suits: [],
  platform_notsuits: [],
};

const mockAdDetailResponse: AdDetailResponse = {
  success: true,
  data: mockAdDetailData,
};

const mockHeatmapGetResponse: HeatmapGetResponse = {
  heatmap_json: '{"zones":[]}',
};

const mockHeatmapGenerateResponse: HeatmapGenerateResponse = {
  heatmap: { zones: [] },
};

const mockDeleteAdResponse: DeleteAdResponse = {
  response: "Ad deleted successfully",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeFetchOk = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);

const makeFetchFail = (status: number) =>
  Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) } as unknown as Response);

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── getAdDetail ─────────────────────────────────────────────────────────────

describe("getAdDetail", () => {
  it("test_getAdDetail_calls_correct_endpoint_and_params", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdDetailResponse } as never);
    await getAdDetail("123");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api.php");
    expect(config?.params).toMatchObject({ gofor: "addetail", ad_upload_id: "123" });
  });

  it("test_getAdDetail_includes_user_id_when_provided", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdDetailResponse } as never);
    await getAdDetail("123", "42");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).toMatchObject({ user_id: "42" });
  });

  it("test_getAdDetail_omits_user_id_when_undefined", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdDetailResponse } as never);
    await getAdDetail("123", undefined);
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).not.toHaveProperty("user_id");
  });

  it("test_getAdDetail_omits_user_id_when_empty_string", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdDetailResponse } as never);
    await getAdDetail("123", "");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).not.toHaveProperty("user_id");
  });

  it("test_getAdDetail_returns_unwrapped_data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAdDetailResponse } as never);
    const result = await getAdDetail("123");
    expect(result).toEqual(mockAdDetailData);
  });

  it("test_getAdDetail_throws_when_success_is_false", async () => {
    const errorResponse: AdDetailResponse = {
      success: false,
      message: "Ad not found",
      data: mockAdDetailData,
    };
    mockGet.mockResolvedValueOnce({ data: errorResponse } as never);
    await expect(getAdDetail("999")).rejects.toThrow("Ad not found");
  });

  it("test_getAdDetail_throws_with_fallback_message_when_no_message", async () => {
    const errorResponse: AdDetailResponse = {
      success: false,
      data: mockAdDetailData,
    };
    mockGet.mockResolvedValueOnce({ data: errorResponse } as never);
    await expect(getAdDetail("999")).rejects.toThrow("API returned error");
  });
});

// ─── getHeatmap ───────────────────────────────────────────────────────────────

describe("getHeatmap", () => {
  it("test_getHeatmap_calls_correct_endpoint_with_getheatmap_gofor", async () => {
    mockGet.mockResolvedValueOnce({ data: mockHeatmapGetResponse } as never);
    await getHeatmap("55");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api.php");
    expect(config?.params).toEqual({ gofor: "getheatmap", ad_upload_id: "55" });
  });

  it("test_getHeatmap_returns_response_data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockHeatmapGetResponse } as never);
    const result = await getHeatmap("55");
    expect(result).toEqual(mockHeatmapGetResponse);
  });
});

// ─── generateHeatmap — AP-008 regression ─────────────────────────────────────

describe("generateHeatmap — AP-008 regression", () => {
  it("test_generateHeatmap_uses_raw_fetch_not_axiosInstance", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockHeatmapGenerateResponse));
    await generateHeatmap(77);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("test_generateHeatmap_posts_to_heatmap_php", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockHeatmapGenerateResponse));
    await generateHeatmap(77);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/heatmap.php");
  });

  it("test_generateHeatmap_sends_content_type_application_json", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockHeatmapGenerateResponse));
    await generateHeatmap(77);
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("test_generateHeatmap_sends_ad_upload_id_as_number_in_body", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockHeatmapGenerateResponse));
    await generateHeatmap(77);
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    const parsed = JSON.parse((opts as RequestInit).body as string);
    expect(parsed.ad_upload_id).toBe(77);
    expect(typeof parsed.ad_upload_id).toBe("number");
  });

  it("test_generateHeatmap_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(500));
    await expect(generateHeatmap(77)).rejects.toThrow("generateHeatmap failed: 500");
  });
});

// ─── deleteAd ─────────────────────────────────────────────────────────────────

describe("deleteAd", () => {
  it("test_deleteAd_calls_correct_endpoint_with_deletead_gofor", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDeleteAdResponse } as never);
    await deleteAd("10");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api.php");
    expect(config?.params).toEqual({ gofor: "deletead", ad_upload_id: "10" });
  });

  it("test_deleteAd_returns_response_data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDeleteAdResponse } as never);
    const result = await deleteAd("10");
    expect(result).toEqual(mockDeleteAdResponse);
  });
});
