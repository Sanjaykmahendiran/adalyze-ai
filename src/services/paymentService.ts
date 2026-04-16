import { axiosInstance } from "@/configs/axios";
import type {
  CreateOrderParams,
  CreateOrderResponse,
  VerifyPaymentParams,
  VerifyPaymentResponse,
  Transaction,
} from "@/types/api";

/**
 * createOrder — POST to /razorpay.php.
 * Uses raw fetch — NOT axiosInstance (401 interceptor unsafe in Razorpay modal callback).
 */
export const createOrder = async (
  params: CreateOrderParams
): Promise<CreateOrderResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/razorpay.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );
  if (!res.ok) throw new Error(`createOrder failed: ${res.status}`);
  const data: CreateOrderResponse = await res.json();
  if (!data.order_id) throw new Error(data.message ?? "Order creation failed");
  return data;
};

/**
 * verifyPayment — POST to /verify.php.
 * Uses raw fetch — NOT axiosInstance.
 */
export const verifyPayment = async (
  params: VerifyPaymentParams
): Promise<VerifyPaymentResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/verify.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );
  if (!res.ok) throw new Error(`verifyPayment failed: ${res.status}`);
  return res.json() as Promise<VerifyPaymentResponse>;
};

/**
 * getPaymentHistory — user-scoped; axiosInstance for 401 redirect.
 * Returns data || [] — null-safe.
 */
export const getPaymentHistory = async (
  userId: string | number
): Promise<Transaction[]> => {
  const response = await axiosInstance.get<Transaction[]>("/api.php", {
    params: { gofor: "paymenthistory", user_id: userId },
  });
  return response.data || [];
};
