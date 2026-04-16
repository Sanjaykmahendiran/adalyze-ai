// src/services/__tests__/dashboardService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { axiosInstance } from "@/configs/axios";
import type { Dashboard1Response, Dashboard2Response, ExpertTalkPayload } from "@/types/api";
import { getDashboard1, getDashboard2, requestExpertTalk } from "@/services/dashboardService";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;
const mockPost = axiosInstance.post as jest.MockedFunction<typeof axiosInstance.post>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockDashboard1: Dashboard1Response = {
  AdAnalysed: 10,
  "A/BTested": 2,
  AccountType: "Pro",
  AverageScore: 75,
  TopPlatform: "Instagram",
  TotalSuggestions: 5,
  CommonIssue: "Low contrast",
  CommonFeedback: "Good layout",
  LastAnalysedOn: "2026-01-01",
  TotalGos: 3,
  recentads: [],
};

const mockDashboard2: Dashboard2Response = {
  viral_potential_score: 80,
  predicted_reach: 5000,
  estimated_ctr: 3.2,
  conversion_probability: 12.5,
  scroll_stoppower: 7.1,
  latest_feedbacks: ["Good"],
  global_insights: [],
};

const mockExpertTalkPayload: ExpertTalkPayload = {
  user_id: 42,
  prefdate: "2026-05-01",
  preftime: "10:00",
  comments: "Please call",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getDashboard1", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test_getDashboard1_calls_correct_endpoint", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard1 } as never);
    await getDashboard1("42");
    const [url] = mockGet.mock.calls[0];
    expect(url).toBe("/api/dashboard");
  });

  it("test_getDashboard1_sends_user_id_param", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard1 } as never);
    await getDashboard1("42");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params.user_id).toBe("42");
  });

  it("test_getDashboard1_includes_brand_id_when_valid", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard1 } as never);
    await getDashboard1("42", "7");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params.brand_id).toBe("7");
  });

  it("test_getDashboard1_omits_brand_id_for_all_clients_sentinel", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard1 } as never);
    await getDashboard1("42");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).not.toHaveProperty("brand_id");
  });

  it("test_getDashboard1_omits_brand_id_for_empty_string", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard1 } as never);
    await getDashboard1("42");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).not.toHaveProperty("brand_id");
  });

  it("test_getDashboard1_returns_response_data", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard1 } as never);
    const result = await getDashboard1("42");
    expect(result).toBe(mockDashboard1);
  });
});

describe("getDashboard2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test_getDashboard2_sends_user_id_and_month", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard2 } as never);
    await getDashboard2("42", "APR");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api/dashboard/monthly");
    expect(config?.params).toMatchObject({ user_id: "42", month: "APR" });
  });

  it("test_getDashboard2_omits_brand_id_for_all_clients_sentinel", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard2 } as never);
    await getDashboard2("42", "APR");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).not.toHaveProperty("brand_id");
  });

  it("test_getDashboard2_includes_brand_id_when_valid", async () => {
    mockGet.mockResolvedValueOnce({ data: mockDashboard2 } as never);
    await getDashboard2("42", "APR", "9");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params.brand_id).toBe("9");
  });
});

describe("requestExpertTalk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test_requestExpertTalk_posts_to_correct_endpoint", async () => {
    mockPost.mockResolvedValueOnce({ data: "Request received" } as never);
    await requestExpertTalk(mockExpertTalkPayload);
    const [url] = mockPost.mock.calls[0];
    expect(url).toBe("/api/dashboard/expert-talk");
  });

  it("test_requestExpertTalk_sends_payload_as_body", async () => {
    mockPost.mockResolvedValueOnce({ data: "Request received" } as never);
    await requestExpertTalk(mockExpertTalkPayload);
    const [, body] = mockPost.mock.calls[0];
    expect(body).toEqual(mockExpertTalkPayload);
  });

  it("test_requestExpertTalk_returns_string_response", async () => {
    mockPost.mockResolvedValueOnce({ data: "Request received" } as never);
    const result = await requestExpertTalk(mockExpertTalkPayload);
    expect(result).toBe("Request received");
  });
});
