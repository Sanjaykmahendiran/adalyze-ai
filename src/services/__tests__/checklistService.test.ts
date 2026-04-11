// src/services/__tests__/checklistService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { axiosInstance } from "@/configs/axios";
import type { ChecklistItem, MarkChecklistDonePayload, ChecklistMutationResult } from "@/types/api";
import { getChecklist, markChecklistDone } from "@/services/checklistService";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;
const mockPost = axiosInstance.post as jest.MockedFunction<typeof axiosInstance.post>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockChecklistItems: ChecklistItem[] = [
  {
    checklist_id: 1,
    slug: "contrast-ratio",
    title: "Check contrast",
    description: "Ensure 4.5:1 ratio",
    status: "open",
    evidence_url: "",
    format: "SCREENSHOT",
  },
];

const mockPayload: MarkChecklistDonePayload = {
  ad_upload_id: "upload_1",
  checklist_id: "1",
  status: "done",
  updated_by: "42",
  evidence_url: "https://cdn.test/evidence.png",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getChecklist — envelope unwrap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test_getChecklist_calls_correct_endpoint_with_param", async () => {
    mockGet.mockResolvedValueOnce({ data: { status: true, data: mockChecklistItems } } as never);
    await getChecklist("upload_1");
    const [url] = mockGet.mock.calls[0];
    expect(url).toBe("/api/checklist");
    const [, config] = mockGet.mock.calls[0];
    expect(config?.params).toEqual({ ad_upload_id: "upload_1" });
  });

  it("test_getChecklist_unwraps_envelope_and_returns_flat_array", async () => {
    mockGet.mockResolvedValueOnce({ data: { status: true, data: mockChecklistItems } } as never);
    const result = await getChecklist("upload_1");
    expect(result).toBe(mockChecklistItems);
    expect(Array.isArray(result)).toBe(true);
  });

  it("test_getChecklist_returns_empty_array_when_status_false", async () => {
    mockGet.mockResolvedValueOnce({ data: { status: false, data: mockChecklistItems } } as never);
    const result = await getChecklist("upload_1");
    expect(result).toEqual([]);
  });

  it("test_getChecklist_returns_empty_array_when_data_not_array", async () => {
    mockGet.mockResolvedValueOnce({ data: { status: true, data: null } } as never);
    const result = await getChecklist("upload_1");
    expect(result).toEqual([]);
  });

  it("test_getChecklist_returns_empty_array_when_response_data_is_null", async () => {
    mockGet.mockResolvedValueOnce({ data: null } as never);
    const result = await getChecklist("upload_1");
    expect(result).toEqual([]);
  });
});

describe("markChecklistDone — 3-shape normalisation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("test_markChecklistDone_shape1_status_true_with_exact_message", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: true, message: "Checklist Created successfully." },
    } as never);
    const result = await markChecklistDone(mockPayload);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Checklist Created successfully.");
  });

  it("test_markChecklistDone_shape2_status_true_without_exact_message", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: true, message: "Updated" },
    } as never);
    const result = await markChecklistDone(mockPayload);
    expect(result.success).toBe(true);
  });

  it("test_markChecklistDone_shape3_success_true_field", async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true } } as never);
    const result = await markChecklistDone(mockPayload);
    expect(result.success).toBe(true);
  });

  it("test_markChecklistDone_returns_false_for_all_fields_absent", async () => {
    mockPost.mockResolvedValueOnce({ data: {} } as never);
    const result = await markChecklistDone(mockPayload);
    expect(result.success).toBe(false);
  });

  it("test_markChecklistDone_returns_false_when_status_false_and_no_success", async () => {
    mockPost.mockResolvedValueOnce({
      data: { status: false, message: "Not found" },
    } as never);
    const result = await markChecklistDone(mockPayload);
    expect(result.success).toBe(false);
    expect(result.message).toBe("Not found");
  });

  it("test_markChecklistDone_posts_to_correct_endpoint_with_payload", async () => {
    mockPost.mockResolvedValueOnce({ data: { status: true } } as never);
    await markChecklistDone(mockPayload);
    const [url] = mockPost.mock.calls[0];
    expect(url).toBe("/api/checklist/mark-done");
    const [, body] = mockPost.mock.calls[0];
    expect(body).toEqual(mockPayload);
  });
});
