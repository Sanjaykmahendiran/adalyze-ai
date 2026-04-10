// src/types/api.ts

export interface ApiResponse<T = unknown> {
  status: "success" | "error" | "empty" | string;
  data?: T;
  user?: T;       // backend uses 'user' key for auth endpoints (login, register)
  message?: string;
}

// AuthLoginResponse: backend returns the full user profile on login/register
// (same shape as UserProfile — defined as alias below after UserProfile)

export interface Brand {
  brand_id: number;
  user_id: number;
  brand_name: string;
  email: string;
  mobile: string;
  logo_url: string;
  logo_hash: string;
  verified: number;
  locked: number;
  status: number;
  created_date: string;
  modified_date: string | null;
}

export interface Agency {
  agency_id: number;
  user_id: number;
  agency_name: string;
  agency_logo: string;
  contact_person: string;
  designation: string;
  business_email: string;
  business_phone: string;
  website_url: string;
  gst_no: string;
  address: string;
  city: string;
  country: string;
  team_members: number;
}

export interface UserProfile {
  user_id: number;
  mobileno: string;
  password: string;
  otp: string | null;
  otp_status: string;
  brands_count: number;
  email: string;
  name: string;
  city: string;
  role: string;
  type: string;
  imgname: string | null;
  company: string;
  source: string;
  package_id: number | null;
  coupon_id: string | null;
  payment_status: number;
  created_date: string;
  modified_date: string;
  register_level_status: number | null;  // backend returns 0, 1, 2 (enum)
  emailver_status: number;
  fretra_status: number;
  status: number;
  ads_limit: number;
  valid_till: string;
  brand: Brand | false;   // NOTE: false literal, not null
  agency: Agency | false; // NOTE: false literal, not null
}

// Login and register both return the full user profile object
export type AuthLoginResponse = UserProfile & { token?: string };

export interface TrackingConsentData {
  necessary: number;  // 1 or 0
  analytics: number;
  marketing: number;
}

export interface ForgotPasswordOtpResponse {
  user_id?: number;
  message?: string;
  status?: string;
}

export interface VerifyOtpResponse {
  message: string;
  status?: string;
}

export interface UpdatePasswordResponse {
  message: string;
  status?: string;
}

export interface ReferralUserResponse {
  user_id?: number;
  name?: string;
  email?: string;
  status?: string;
  message?: string;
}
