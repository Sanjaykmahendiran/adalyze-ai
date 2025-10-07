export interface AdCopy {
    platform: string;
    tone: string;
    copy_text: string;
}

export interface ApiResponse {
    ad_id: number;
    title: string;
    images: string[];
    ad_type: string;
    video: string;
    uploaded_on: string;
    industry: string;
    score_out_of_100: number;
    platform_suits: string[] | string;
    platform_notsuits: string[] | string;
    issues: string[];
    suggestions: string[];
    feedback_designer: string[];
    feedback_digitalmark: string[];
    visual_clarity: number | string;
    emotional_appeal: number | string;
    primary_emotion?: string;
    emotional_alignment?: string;
    emotional_boost_suggestions?: string[];
    text_visual_balance: number | string;
    cta_visibility: number | string;
    color_harmony: number;
    color_harmony_feedback?: string;
    brand_alignment: number;
    text_readability: number;
    image_quality: number;
    scroll_stoppower: string;
    estimated_ctr: string;
    conversion_probability: string;
    budget_level: string;
    expected_cpm: string;
    confidence_score: number;
    match_score: number | string;
    top_audience?: string[] | string;
    industry_audience?: string[] | string;
    mismatch_warnings?: string[];
    roi_min: number | string;
    roi_max: number | string;
    dominant_colors: string[] | string;
    suggested_colors?: string[];
    font_feedback?: string;
    layout_symmetry_score?: number;
    predicted_reach?: number;
    spend_efficiency?: string;
    faces_detected?: number;
    logo_visibility_score?: number;
    text_percentage_score?: number;
    urgency_trigger_score?: number;
    fomo_score?: number;
    trust_signal_score?: number;
    engagement_score?: number;
    viral_potential_score?: number;
    budget_utilization_score?: number;
    quick_win_tip?: string;
    shareability_comment?: string;
    ad_copies: AdCopy[];
}

export interface ABTestResult {
  abtest_id: number;
  user_id: number;
  ads_name: string;
  industry: string;
  platform: string;
  image_path_a: string;
  image_path_b: string;
  ad_upload_id_a: number;
  ad_upload_id_b: number;
  recommended_ad: "A" | "B";
  reason: string;
  status: number;
  created_date: string;
}