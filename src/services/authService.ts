import { axiosInstance } from "@/configs/axios";
import type {
  ApiResponse,
  AuthLoginResponse,
  ForgotPasswordOtpResponse,
  VerifyOtpResponse,
  UpdatePasswordResponse,
  ReferralUserResponse,
} from "@/types/api";

export const login = async (payload: {
  email?: string;
  password?: string;
  google_token?: string;
  nouptoken?: string;
}): Promise<ApiResponse<AuthLoginResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<AuthLoginResponse>>(
      "/api/auth/login",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 1 registration: reserve email and obtain user_id.
 * Endpoint: POST /api/auth/register/email
 * Returns: { user_id } on success; { status: "error", message } on failure.
 */
export const emailRegister = async (payload: {
  email: string;
}): Promise<{ user_id?: number; status?: string; message?: string }> => {
  try {
    const response = await axiosInstance.post<{
      user_id?: number;
      status?: string;
      message?: string;
    }>("/api/auth/register/email", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 2 registration: complete profile using the user_id from Step 1.
 * Endpoint: POST /api/auth/register
 */
export const register = async (payload: {
  user_id: string | number;
  name: string;
  password: string;
  type: string;
  city: string;
  source?: string;
  referred_by?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  [key: string]: unknown;
}): Promise<ApiResponse<AuthLoginResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<AuthLoginResponse>>(
      "/api/auth/register",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Link cookie tracking identifier to the newly registered user.
 * Pattern B — posts to old backend (NEXT_PUBLIC_API_BASE_URL/api.php).
 * Non-blocking: callers should catch and continue on failure.
 */
export const addRegistrationIdentifier = async (payload: {
  cookie_id: string;
  user_id: number | string;
  email: string;
  phone?: string;
}): Promise<{ status?: string; message?: string }> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gofor: "addidentifier", ...payload }),
  });
  return response.json();
};

export const forgotPasswordOtp = async (payload: {
  email: string;
}): Promise<ApiResponse<ForgotPasswordOtpResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<ForgotPasswordOtpResponse>>(
      "/api/auth/forgot-password",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (payload: {
  email: string;
  otp: string;
}): Promise<ApiResponse<VerifyOtpResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<VerifyOtpResponse>>(
      "/api/auth/verify-otp",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (payload: {
  email: string;
  password: string;
  confirmpassword: string;
}): Promise<ApiResponse<UpdatePasswordResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<UpdatePasswordResponse>>(
      "/api/auth/reset-password",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (payload: {
  email: string;
  oldpassword: string;
  password: string;
}): Promise<ApiResponse<UpdatePasswordResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<UpdatePasswordResponse>>(
      "/api/auth/change-password",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserByReferral = async (
  code: string
): Promise<ApiResponse<ReferralUserResponse>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<ReferralUserResponse>>(
      `/api/auth/referral/${code}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
