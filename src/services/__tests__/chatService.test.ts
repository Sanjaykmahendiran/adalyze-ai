// src/services/__tests__/chatService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn() },
}));

import { axiosInstance } from "@/configs/axios";
import type { ChatLogEntry, AskAdalyzePayload, AskAdalyzeResponse } from "@/types/api";
import { getChatHistory, askAdalyze } from "@/services/chatService";

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockChatLog: ChatLogEntry[] = [
  {
    al_id: 1,
    ad_upload_id: 42,
    user_id: 7,
    question: "What is the score?",
    answer: "The score is 85.",
    created_date: "2026-04-11",
  },
];

const mockAskPayload: AskAdalyzePayload = {
  ad_upload_id: 42,
  question: "Why is this ad effective?",
};

const mockAskResponse: AskAdalyzeResponse = {
  answer: "The ad uses strong contrast.",
  suggested_questions: ["What platform suits this?"],
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

// ─── getChatHistory ───────────────────────────────────────────────────────────

describe("getChatHistory", () => {
  it("test_getChatHistory_calls_correct_endpoint", async () => {
    mockGet.mockResolvedValueOnce({ data: mockChatLog } as never);
    await getChatHistory("42");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api.php");
    expect(config?.params).toEqual({ gofor: "getchathistory", ad_upload_id: "42" });
  });

  it("test_getChatHistory_returns_array_when_response_is_array", async () => {
    mockGet.mockResolvedValueOnce({ data: mockChatLog } as never);
    const result = await getChatHistory("42");
    expect(result).toEqual(mockChatLog);
    expect(Array.isArray(result)).toBe(true);
  });

  it("test_getChatHistory_returns_empty_array_when_response_is_string_zero", async () => {
    mockGet.mockResolvedValueOnce({ data: "0" } as never);
    const result = await getChatHistory("42");
    expect(result).toEqual([]);
  });

  it("test_getChatHistory_returns_empty_array_when_response_is_numeric_zero", async () => {
    mockGet.mockResolvedValueOnce({ data: 0 } as never);
    const result = await getChatHistory("42");
    expect(result).toEqual([]);
  });

  it("test_getChatHistory_returns_empty_array_when_response_is_non_array", async () => {
    mockGet.mockResolvedValueOnce({ data: { message: "no history" } } as never);
    const result = await getChatHistory("42");
    expect(result).toEqual([]);
  });
});

// ─── askAdalyze — AP-008 regression ──────────────────────────────────────────

describe("askAdalyze — AP-008 regression", () => {
  it("test_askAdalyze_uses_raw_fetch_not_axiosInstance", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockAskResponse));
    await askAdalyze(mockAskPayload);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("test_askAdalyze_posts_to_askadalyze_php", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockAskResponse));
    await askAdalyze(mockAskPayload);
    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.test/askadalyze.php");
  });

  it("test_askAdalyze_sends_correct_content_type", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockAskResponse));
    await askAdalyze(mockAskPayload);
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("test_askAdalyze_serializes_payload_as_body", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockAskResponse));
    await askAdalyze(mockAskPayload);
    const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect((opts as RequestInit).body).toBe(JSON.stringify(mockAskPayload));
  });

  it("test_askAdalyze_returns_parsed_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchOk(mockAskResponse));
    const result = await askAdalyze(mockAskPayload);
    expect(result).toEqual(mockAskResponse);
  });

  it("test_askAdalyze_throws_on_non_ok_http_response", async () => {
    (global.fetch as jest.Mock).mockReturnValueOnce(makeFetchFail(403));
    await expect(askAdalyze(mockAskPayload)).rejects.toThrow("askAdalyze failed: 403");
  });
});
