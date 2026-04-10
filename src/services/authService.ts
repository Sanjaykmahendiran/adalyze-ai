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

export const register = async (payload: {
  email: string;
  password: string;
  name: string;
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

export const emailRegister = async (payload: {
  email: string;
  password: string;
  name: string;
  [key: string]: unknown;
}): Promise<ApiResponse<AuthLoginResponse>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<AuthLoginResponse>>(
      "/api/auth/register/email",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
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
