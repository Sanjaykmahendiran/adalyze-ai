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

// ─── Sprint 2 additions ───────────────────────────────────────────────────────

/**
 * BrandWithStats — returned by GET /api/brands (brandslist).
 * Extends Brand with server-computed analytics stats.
 * website is NOT in the base Brand interface — added only here.
 */
export interface BrandWithStats extends Brand {
  website?: string;
  upload_count: number;
  average_score: number;
  latest_score: number;
  last_analysis_date: string;
  go_count: number;
  no_go_count: number;
}

/**
 * BrandMutationResponse — returned by POST /api/brand (addbrand)
 * and PUT /api/brand/{id} (editbrands).
 * Success: result?.success === true || result?.status === "success"
 * Failure reason is in result?.error, NOT result?.message.
 */
export interface BrandMutationResponse {
  success?: boolean;
  status?: string;
  message?: string;
  error?: string;
}

/**
 * DeleteBrandResponse — returned by DELETE /api/brand/{id}.
 * Success: result?.response === "Brand deleted successfully"
 * The field is named "response" — not "status" or "message".
 */
export interface DeleteBrandResponse {
  response?: string;
  message?: string;
}

/**
 * ImageUploadPayload — body for POST /api/upload/image.
 * imgname: raw base64 string — NO "data:image/...;base64," prefix.
 * type: passed as-is. Known values: "profile", "agency", "brand",
 *       "Brand", "checklist-evidence". Do NOT normalise casing.
 */
export interface ImageUploadPayload {
  imgname: string;
  type: string;
}

/**
 * ImageUploadResponse — returned by POST /api/upload/image.
 * The URL field name is inconsistent across backend responses.
 * Service returns the raw object. Callers own all field access.
 */
export interface ImageUploadResponse {
  success?: boolean;
  status?: string;
  url?: string;
  image_url?: string;
  message?: string;
  error?: string;
}

/**
 * EditProfilePayload — body for PUT /api/user/profile.
 * imgname is the uploaded image URL string (NOT base64).
 * Optional fields sent only when role is in rolesRequiringAdditionalFields
 * (client-side logic in MyProfile.tsx).
 */
export interface EditProfilePayload {
  user_id: string;
  mobileno: string;
  name: string;
  country: string;
  state: string;
  city: string;
  role: string;
  address: string;
  pincode: string;
  imgname: string;
  designation?: string;
  website_url?: string;
  gst_no?: string;
  team_members?: string;
}

/**
 * AgencyPayload — body for POST /api/user/agency and PUT /api/user/agency.
 * agency_id omitted on add, required on edit.
 */
export interface AgencyPayload {
  user_id: string;
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
  state: string;
  country: string;
  pincode: string;
  team_members: string;
  agency_id?: number;
}

/**
 * AgencyMutationResponse — returned by POST and PUT /api/user/agency.
 * Success: data.status === "success"
 */
export interface AgencyMutationResponse {
  status: string;
  message?: string;
}

/**
 * AddBrandPayload — body for POST /api/brand.
 * user_id is string (callers source from cookies/sessionStorage).
 */
export interface AddBrandPayload {
  user_id: string;
  brand_name: string;
  email: string;
  mobile: string;
  website: string;
  logo_url: string;
}

/**
 * EditBrandPayload — body for PUT /api/brand/{brand_id}.
 * brand_id is string (callers use .toString() explicitly).
 * brand_id also appears as URL path parameter.
 */
export interface EditBrandPayload extends AddBrandPayload {
  brand_id: string;
}
