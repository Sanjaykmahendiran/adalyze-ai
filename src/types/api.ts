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

// ─── Sprint 3 additions ───────────────────────────────────────────────────────

// ── Ad service ───────────────────────────────────────────────────────────────

/**
 * Ad — single ad record returned by adslist.
 * platforms: JSON-encoded array OR comma-separated string — callers own parsing.
 */
export interface Ad {
  ads_type: string;
  ad_id: number;
  ads_name: string;
  image_path: string;
  industry: string;
  score: number;
  platforms: string;
  uploaded_on: string;
  go_nogo?: string;
}

/**
 * AdsListParams — query params for GET adslist.
 * brand_id is optional: omit for own-ads, supply for brand-detail view.
 */
export interface AdsListParams {
  user_id: string | number;
  offset: number;
  limit: number;
  brand_id?: string | number;
  platform?: string;
  score?: string;
  ad_type?: string;
}

/**
 * AdsListResponse — paginated wrapper from adslist.
 */
export interface AdsListResponse {
  total: number;
  limit: number;
  offset: number;
  ads: Ad[];
}

/**
 * AbAdItem — one side of an A/B pair.
 * go_nogoA / go_nogoB are backend aliases — callers normalise to go_nogo.
 */
export interface AbAdItem extends Ad {
  go_nogoA?: string;
  go_nogoB?: string;
}

/**
 * AbAdPair — one A/B comparison record from abadslist.
 */
export interface AbAdPair {
  ad_a: AbAdItem;
  ad_b: AbAdItem;
}

// ── Dashboard service ─────────────────────────────────────────────────────────

/** RecentAd — item inside Dashboard1Response.recentads. */
export interface RecentAd {
  ads_type: string;
  estimated_ctr: number;
  ad_id: number;
  ads_name: string | null;
  image_path: string;
  industry: string;
  score: number;
  platforms: string;
  uploaded_on: string;
}

/** Dashboard1Response — KPI aggregation from /api/dashboard. */
export interface Dashboard1Response {
  AdAnalysed: number;
  "A/BTested": number;
  AccountType: string;
  AverageScore: number;
  TopPlatform: string;
  TotalSuggestions: number;
  CommonIssue: string;
  CommonFeedback: string;
  LastAnalysedOn: string;
  TotalGos: number;
  recentads: RecentAd[];
}

/** GlobalInsight — item inside Dashboard2Response.global_insights. */
export interface GlobalInsight {
  id: number;
  content: string;
  source: string;
}

/** Dashboard2Response — monthly breakdown from /api/dashboard/monthly. */
export interface Dashboard2Response {
  viral_potential_score: number;
  predicted_reach: number;
  estimated_ctr: number;
  conversion_probability: number;
  scroll_stoppower: number;
  latest_feedbacks: string[];
  global_insights: GlobalInsight[];
}

/**
 * ExpertTalkPayload — body for POST exptalkrequest.
 */
export interface ExpertTalkPayload {
  user_id: number;
  prefdate: string;
  preftime: string;
  comments: string;
}

// ── Content service ───────────────────────────────────────────────────────────

/** CaseStudy — item from recentcslist. */
export interface CaseStudy {
  cs_id: number;
  title: string;
  slug: string;
  banner_title: string;
  client_name: string;
  challenge: string;
  insight: string;
  action_taken: string;
  outcome: string;
  status: number;
  created_at: string;
  banner_subtitle: string;
  banner_image_url: string;
  banner_cta_label: string;
  banner_cta_url: string;
  industry: string;
  platform: string;
  region: string;
  timeframe: string;
  objectives: string;
  strategy: string;
  results_summary: string;
  kpi_primary_label: string;
  kpi_primary_value: string;
  sidebar_metrics: string;
  metrics_json: string;
  testimonial_quote: string;
  testimonial_name: string;
  testimonial_role: string;
  read_time_minutes: number;
  order_index: number;
  thumbnail_url: string;
  tags: string;
}

/** Top10Ad — item from top10ads. */
export interface Top10Ad {
  ad_id: number;
  ads_name: string | null;
  image_path: string;
  ads_type: string;
  industry: string;
  score: number;
  confidence: number;
  match_score: string;
  uniqueness: string;
  platforms: string;
  top_platform?: string;
  uploaded_on: string;
  weighted_rank: number;
  user_id: number;
}

/** TrendingAd — item inside TrendingAdsResponse.trending_ads. */
export interface TrendingAd {
  ad_id: number;
  ads_name: string | null;
  ads_type: string;
  image_path: string;
  industry: string;
  score: number;
  confidence: number;
  match_score: string;
  uniqueness: string;
  platforms: string;
  uploaded_on: string;
  weighted_rank: number;
  user_id: number;
}

/** TrendingAdsResponse — from trendingads. */
export interface TrendingAdsResponse {
  trending_ads: TrendingAd[];
  time_frame: string;
}

/** Testimonial — item from testilist. */
export interface Testimonial {
  testi_id: number;
  content: string;
  name: string;
  role: string;
  status: number;
  created_date: string;
}

// ── Pricing service ───────────────────────────────────────────────────────────

/** PricingPlan — item from packages. Service returns only status:1 plans. */
export interface PricingPlan {
  package_id: number;
  type: number;
  plan_name: string;
  price_inr: number;
  base_price: string;
  tax: number;
  ori_price_inr: number;
  ori_price_usd: number;
  price_usd: string;
  features: string;
  brands_count: number;
  ads_limit: string;
  valid_till: string;
  status: number;
}

/** FAQ — item from faqlist. */
export interface FAQ {
  faq_id: number;
  question: string;
  answer: string;
  category: string;
  status: number;
  created_date: string;
}

/** AppConfig — from config gofor. */
export interface AppConfig {
  rzpaykey: string;
  [key: string]: unknown;
}

/** FreeTrialResponse — normalised return from activateFreeTrial. */
export interface FreeTrialResponse {
  activated: boolean;
  message: string;
}

// ── Payment service ───────────────────────────────────────────────────────────

/** CreateOrderParams — body for POST /razorpay.php. */
export interface CreateOrderParams {
  user_id: string;
  package_id: string;
  ctype: "INR" | "USD";
  period: "monthly" | "half-yearly" | "yearly";
  order_type: "new" | "upgrade" | "downgrade" | "agency";
}

/** CreateOrderResponse — from /razorpay.php. */
export interface CreateOrderResponse {
  order_id: string;
  message?: string;
}

/** VerifyPaymentParams — body for POST /verify.php. */
export interface VerifyPaymentParams {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/** VerifyPaymentResponse — from /verify.php. */
export interface VerifyPaymentResponse {
  response: string;
  message?: string;
}

/** Transaction — item from paymenthistory. order_status: 0=Failed, 1=Completed, 2=Processing. */
export interface Transaction {
  id: string;
  order_id: string;
  payment_id: string;
  razorpay_signature: string;
  package_id: number;
  type: string;
  amount: string;
  base_price: string;
  tax: number;
  currency: string;
  date: string;
  order_status: number;
  plan_name: string;
}

// ── Checklist service ─────────────────────────────────────────────────────────

/** EvidenceFormat — the three supported evidence kinds. */
export type EvidenceFormat = "SCREENSHOT" | "URL" | "MESSAGE BOX";

/** ChecklistItem — item from prechecklistlist response.data. */
export interface ChecklistItem {
  checklist_id: number;
  slug: string;
  title: string;
  description: string;
  status: "done" | "open";
  evidence_url: string;
  format: EvidenceFormat;
}

/** MarkChecklistDonePayload — body for POST markchecklistdone. */
export interface MarkChecklistDonePayload {
  ad_upload_id: string;
  checklist_id: string;
  status: "done";
  updated_by: string;
  evidence_url: string;
}

/** ChecklistMutationResult — normalised return from markChecklistDone. */
export interface ChecklistMutationResult {
  success: boolean;
  message?: string;
}

// ── Sprint 4 additions ───────────────────────────────────────────────────────

// ── Results service ──────────────────────────────────────────────────────────

export interface AdDetailResponse {
  success: boolean;
  message?: string;
  data: AdDetailData;
}

export interface AdDetailData {
  heatmapstatus: number;
  platform_suits?: unknown[];
  platform_notsuits?: unknown[];
  [key: string]: unknown;
}

export interface HeatmapGetResponse {
  heatmap_json: string;
}

export interface HeatmapGenerateResponse {
  heatmap: {
    zones: unknown[];
  };
}

export interface DeleteAdResponse {
  response: string;
}

// ── Chat service ─────────────────────────────────────────────────────────────

export interface ChatLogEntry {
  al_id: number;
  ad_upload_id: number;
  user_id: number;
  question: string;
  answer: string;
  created_date: string;
}

export interface AskAdalyzePayload {
  ad_upload_id: number;
  question: string;
}

export interface AskAdalyzeResponse {
  answer?: string;
  suggested_questions?: string[];
  ask_count?: number;
  ask_limit?: number;
  askCount?: number;
  askLimit?: number;
  limit_reached?: boolean;
  limitReached?: boolean;
  error?: string;
}

// ── A/B service ──────────────────────────────────────────────────────────────

export interface AbAdDetailResult {
  recommended_ad: string;
  reason: string;
  [key: string]: unknown;
}

export interface DeleteAbAdResponse {
  response: string;
}

// ── Reference data service ───────────────────────────────────────────────────

export interface LocationResult {
  id: string;
  name: string;
  [key: string]: unknown;
}
