// src/services/__tests__/referenceDataService.test.ts

import type { LocationResult } from "@/types/api";
import { getIndustries, getLocations } from "@/services/referenceDataService";

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockIndustries = [
  { id: "1", name: "Technology" },
  { id: "2", name: "Finance" },
];

const mockLocations: LocationResult[] = [
  { id: "loc_1", name: "Mumbai" },
  { id: "loc_2", name: "Delhi" },
];

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

// ─── getIndustries ────────────────────────────────────────────────────────────

describe("getIndustries", () => {
  it("test_getIndustries_uses_raw_fetch_not_axiosInstance", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockIndustries));
    await getIndustries();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("test_getIndustries_fetches_correct_url_with_industrylist_gofor", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockIndustries));
    await getIndustries();
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/api.php?gofor=industrylist");
  });

  it("test_getIndustries_returns_parsed_json", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockIndustries));
    const result = await getIndustries();
    expect(result).toEqual(mockIndustries);
  });

  it("test_getIndustries_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(503));
    await expect(getIndustries()).rejects.toThrow("getIndustries failed: 503");
  });
});

// ─── getLocations ─────────────────────────────────────────────────────────────

describe("getLocations", () => {
  it("test_getLocations_uses_raw_fetch_not_axiosInstance", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockLocations));
    await getLocations("Mumbai");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("test_getLocations_fetches_hardcoded_techades_url_not_api_test", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockLocations));
    await getLocations("Mumbai");
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("https://techades.com/App/api.php");
    expect(url).not.toContain("api.test");
  });

  it("test_getLocations_appends_gofor_locationlist_and_search_param", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockLocations));
    await getLocations("Mumbai");
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://techades.com/App/api.php?gofor=locationlist&search=Mumbai");
  });

  it("test_getLocations_applies_encodeURIComponent_to_search_term", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockLocations));
    await getLocations("New Delhi");
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(
      `https://techades.com/App/api.php?gofor=locationlist&search=${encodeURIComponent("New Delhi")}`
    );
  });

  it("test_getLocations_returns_location_results", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockLocations));
    const result = await getLocations("Mumbai");
    expect(result).toEqual(mockLocations);
  });

  it("test_getLocations_throws_on_non_ok_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(404));
    await expect(getLocations("Unknown")).rejects.toThrow("getLocations failed: 404");
  });
});
