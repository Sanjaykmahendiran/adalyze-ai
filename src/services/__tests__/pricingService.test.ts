// src/services/__tests__/pricingService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { axiosInstance } from "@/configs/axios";
import type { PricingPlan, AppConfig, FreeTrialResponse } from "@/types/api";
import { getPackages, getAppConfig, activateFreeTrial } from "@/services/pricingService";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeFetchOk = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);

const makeFetchFail = (status: number) =>
  Promise.resolve({ ok: false, status } as unknown as Response);

// ─── Fixtures ────────────────────────────────────────────────────────────────

const activePlans: PricingPlan[] = [
  {
    package_id: 1,
    type: 1,
    plan_name: "Starter",
    price_inr: 999,
    base_price: "847",
    tax: 18,
    ori_price_inr: 1200,
    ori_price_usd: 15,
    price_usd: "10",
    features: "[]",
    brands_count: 1,
    ads_limit: "50",
    valid_till: "monthly",
    status: 1,
  },
];

const mixedPlans: PricingPlan[] = [
  { ...activePlans[0], status: 1 },
  { ...activePlans[0], package_id: 2, plan_name: "Inactive", status: 0 },
];

const mockAppConfig: AppConfig = { rzpaykey: "rzp_test_abc123" };

// ─── Setup ───────────────────────────────────────────────────────────────────

let fetchMock: jest.Mock;

beforeEach(() => {
  global.fetch = jest.fn();
  fetchMock = global.fetch as jest.Mock;
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getPackages", () => {
  it("test_getPackages_fetches_correct_url", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk(activePlans));
    await getPackages();
    expect(global.fetch).toHaveBeenCalledWith("https://api.test/api.php?gofor=packages");
  });

  it("test_getPackages_filters_to_status_1_only", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk(mixedPlans));
    const result = await getPackages();
    expect(result).toHaveLength(1);
    expect(result[0].package_id).toBe(1);
    expect(result.every((p) => p.status === 1)).toBe(true);
  });

  it("test_getPackages_returns_empty_array_when_all_inactive", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk([{ ...activePlans[0], status: 0 }]));
    const result = await getPackages();
    expect(result).toEqual([]);
  });

  it("test_getPackages_throws_on_non_ok_response", async () => {
    fetchMock.mockReturnValueOnce(makeFetchFail(500));
    await expect(getPackages()).rejects.toThrow("packages failed: 500");
  });
});

describe("getAppConfig", () => {
  it("test_getAppConfig_fetches_correct_url", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk(mockAppConfig));
    await getAppConfig();
    expect(global.fetch).toHaveBeenCalledWith("https://api.test/api.php?gofor=config");
  });

  it("test_getAppConfig_returns_config_when_rzpaykey_present", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk(mockAppConfig));
    const result = await getAppConfig();
    expect(result.rzpaykey).toBe("rzp_test_abc123");
  });

  it("test_getAppConfig_throws_when_rzpaykey_absent", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk({ rzpaykey: "" }));
    await expect(getAppConfig()).rejects.toThrow("Razorpay key missing from config");
  });

  it("test_getAppConfig_throws_when_rzpaykey_missing", async () => {
    fetchMock.mockReturnValueOnce(makeFetchOk({}));
    await expect(getAppConfig()).rejects.toThrow("Razorpay key missing from config");
  });
});

describe("activateFreeTrial", () => {
  it("test_activateFreeTrial_calls_axiosInstance_not_fetch", async () => {
    mockGet.mockResolvedValueOnce({ data: { response: "Free Trial Activated" } } as never);
    await activateFreeTrial("42");
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("test_activateFreeTrial_normalises_success_response", async () => {
    mockGet.mockResolvedValueOnce({ data: { response: "Free Trial Activated" } } as never);
    const result = await activateFreeTrial("42");
    expect(result.activated).toBe(true);
    expect(result.message).toBe("Free Trial Activated");
  });

  it("test_activateFreeTrial_normalises_failure_response", async () => {
    mockGet.mockResolvedValueOnce({ data: { response: "Already activated" } } as never);
    const result = await activateFreeTrial("42");
    expect(result.activated).toBe(false);
    expect(result.message).toBe("Already activated");
  });
});
