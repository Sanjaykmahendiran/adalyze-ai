// src/services/__tests__/abService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn() },
}));

import { axiosInstance } from "@/configs/axios";
import type { AbAdDetailResult, DeleteAbAdResponse } from "@/types/api";
import { getAbAdDetail, deleteAbAd } from "@/services/abService";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockAbAdDetailResult: AbAdDetailResult = {
  recommended_ad: "ad_a",
  reason: "Higher contrast and stronger CTA placement.",
};

const mockDeleteAbAdResponse: DeleteAbAdResponse = {
  response: "A/B pair deleted successfully",
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── getAbAdDetail ────────────────────────────────────────────────────────────

describe("getAbAdDetail", () => {
  it("test_getAbAdDetail_calls_correct_endpoint_with_both_ids", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAbAdDetailResult } as never);
    await getAbAdDetail("10", "20");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api.php");
    expect(config?.params).toEqual({
      gofor: "abaddetail",
      ad_upload_id1: "10",
      ad_upload_id2: "20",
    });
  });

  it("test_getAbAdDetail_returns_response_data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAbAdDetailResult } as never);
    const result = await getAbAdDetail("10", "20");
    expect(result).toEqual(mockAbAdDetailResult);
  });

  it("test_getAbAdDetail_passes_numeric_ids", async () => {
    mockGet.mockResolvedValueOnce({ data: mockAbAdDetailResult } as never);
    await getAbAdDetail(10, 20);
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).toMatchObject({ ad_upload_id1: 10, ad_upload_id2: 20 });
  });
});

// ─── deleteAbAd ───────────────────────────────────────────────────────────────

describe("deleteAbAd", () => {
  it("test_deleteAbAd_calls_correct_endpoint_with_both_ids", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDeleteAbAdResponse } as never);
    await deleteAbAd("10", "20");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api.php");
    expect(config?.params).toEqual({
      gofor: "deleteabad",
      ad_upload_id_a: "10",
      ad_upload_id_b: "20",
    });
  });

  it("test_deleteAbAd_returns_response_data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDeleteAbAdResponse } as never);
    const result = await deleteAbAd("10", "20");
    expect(result).toEqual(mockDeleteAbAdResponse);
  });
});
