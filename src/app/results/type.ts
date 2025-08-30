export interface AdCopy {
  platform: string
  tone: string
  copy_text: string
}

export interface ApiResponse {
  ad_id: number
  title: string
  images: string[] // Changed from 'image' to 'images' array
  ad_type: string
  video: string
  uploaded_on: string
  industry: string
  score_out_of_100: number
  platform_suits: string[] | string
  platform_notsuits: string[] | string
  issues: string[]
  suggestions: string[]
  feedback_designer: string[]
  feedback_digitalmark: string[]
  visual_clarity: string
  emotional_appeal: string
  text_visual_balance: string
  cta_visibility: string
  color_harmony: number
  brand_alignment: number
  text_readability: number
  image_quality: number
  scroll_stoppower: string
  estimated_ctr: string
  conversion_probability: string
  budget_level: string
  expected_cpm: string
  confidence_score: number
  match_score: string
  top_audience: string
  industry_audience: string
  mismatch_warnings: string[]
  roi_min: string
  roi_max: string
  dominant_colors: string
  ad_copies: AdCopy[]
}