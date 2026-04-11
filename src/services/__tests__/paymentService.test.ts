// src/services/__tests__/paymentService.test.ts

jest.mock("@/configs/axios", () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { axiosInstance } from "@/configs/axios";
import type {
  CreateOrderParams,
  CreateOrderResponse,
  VerifyPaymentParams,
  VerifyPaymentResponse,
  Transaction,
} from "@/types/api";
import { createOrder, verifyPayment, getPaymentHistory } from "@/services/paymentService";

const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;
const mockPost = axiosInstance.post as jest.MockedFunction<typeof axiosInstance.post>;

process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockCreateParams: CreateOrderParams = {
  user_id: "42",
  package_id: "1",
  ctype: "INR",
  period: "monthly",
  order_type: "new",
};

const mockCreateResponse: CreateOrderResponse = {
  order_id: "order_abc123",
};

const mockVerifyParams: VerifyPaymentParams = {
  razorpay_payment_id: "pay_xyz",
  razorpay_order_id: "order_abc123",
  razorpay_signature: "sig_def",
};

const mockVerifyResponse: VerifyPaymentResponse = {
  response: "Payment verified",
};

const mockTransactions: Transaction[] = [
  {
    id: "1",
    order_id: "ORD001",
    payment_id: "pay_001",
    razorpay_signature: "sig_001",
    package_id: 1,
    type: "new",
    amount: "999",
    base_price: "847",
    tax: 18,
    currency: "INR",
    date: "2026-01-01",
    order_status: 1,
    plan_name: "Starter",
  },
];

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

describe("createOrder — AP-003 regression", () => {
  it("test_createOrder_uses_raw_fetch_not_axiosInstance", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateResponse) } as Response)
    );
    await createOrder(mockCreateParams);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockPost).not.toHaveBeenCalled();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("test_createOrder_posts_to_razorpay_php", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateResponse) } as Response)
    );
    await createOrder(mockCreateParams);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/razorpay.php");
  });

  it("test_createOrder_sends_json_content_type", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateResponse) } as Response)
    );
    await createOrder(mockCreateParams);
    const [, opts] = fetchMock.mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("test_createOrder_sends_serialised_params_as_body", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateResponse) } as Response)
    );
    await createOrder(mockCreateParams);
    const [, opts] = fetchMock.mock.calls[0];
    expect((opts as RequestInit).body).toBe(JSON.stringify(mockCreateParams));
  });

  it("test_createOrder_returns_response_when_order_id_present", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockCreateResponse) } as Response)
    );
    const result = await createOrder(mockCreateParams);
    expect(result.order_id).toBe("order_abc123");
  });

  it("test_createOrder_throws_when_order_id_absent", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Insufficient funds" }) } as Response)
    );
    await expect(createOrder(mockCreateParams)).rejects.toThrow("Insufficient funds");
  });

  it("test_createOrder_throws_with_fallback_message_when_no_message_field", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response)
    );
    await expect(createOrder(mockCreateParams)).rejects.toThrow("Order creation failed");
  });

  it("test_createOrder_throws_on_non_ok_http_response", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 422 } as unknown as Response)
    );
    await expect(createOrder(mockCreateParams)).rejects.toThrow("createOrder failed: 422");
  });
});

describe("verifyPayment — AP-003 regression", () => {
  it("test_verifyPayment_uses_raw_fetch_not_axiosInstance", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockVerifyResponse) } as Response)
    );
    await verifyPayment(mockVerifyParams);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("test_verifyPayment_posts_to_verify_php", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockVerifyResponse) } as Response)
    );
    await verifyPayment(mockVerifyParams);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/verify.php");
  });

  it("test_verifyPayment_returns_response_body", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockVerifyResponse) } as Response)
    );
    const result = await verifyPayment(mockVerifyParams);
    expect(result).toEqual(mockVerifyResponse);
  });

  it("test_verifyPayment_throws_on_non_ok_http_response", async () => {
    fetchMock.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 400 } as unknown as Response)
    );
    await expect(verifyPayment(mockVerifyParams)).rejects.toThrow("verifyPayment failed: 400");
  });
});

describe("getPaymentHistory", () => {
  it("test_getPaymentHistory_calls_axiosInstance_not_fetch", async () => {
    mockGet.mockResolvedValueOnce({ data: mockTransactions } as never);
    await getPaymentHistory("42");
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("test_getPaymentHistory_sends_correct_params", async () => {
    mockGet.mockResolvedValueOnce({ data: mockTransactions } as never);
    await getPaymentHistory("42");
    const [url, config] = mockGet.mock.calls[0];
    expect(url).toBe("/api.php");
    expect(config?.params).toEqual({ gofor: "paymenthistory", user_id: "42" });
  });

  it("test_getPaymentHistory_returns_empty_array_on_null_data", async () => {
    mockGet.mockResolvedValueOnce({ data: null } as never);
    const result = await getPaymentHistory("42");
    expect(result).toEqual([]);
  });
});
