export interface DashboardData {
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

export interface Dashboard2Data {
  viral_potential_score: number;
  predicted_reach: number;
  estimated_ctr: number;
  conversion_probability: number;
  scroll_stoppower: number;
  latest_feedbacks: string[];
}

export interface RecentAd {
  ads_type: string;
  estimated_ctr: number
  ad_id: number;
  ads_name: string;
  image_path: string;
  industry: string;
  score: number;
  platforms: string;
  uploaded_on: string;
}

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

export interface BlogPost {
  blogs_id: number;
  title: string;
  slug: string;
  banner: string;
  outline: string;
  content: string;
  reading_time: string;
  key_takeaways: string;
  status: number;
  created_at: string;
}

export interface Top10Ad {
  ad_id: number
  ads_name: string
  ads_type: string
  image_path: string
  industry: string
  score: number
  confidence: number
  match_score: string
  uniqueness: string
  platforms: string
  uploaded_on: string
  weighted_rank: number
}

export interface TrendingAd {
  ad_id: number
  ads_name: string
  ads_type: string
  image_path: string
  industry: string
  score: number
  confidence: number
  match_score: string
  uniqueness: string
  platforms: string
  uploaded_on: string
  weighted_rank: number
}

export interface TrendingAdsResponse {
  time_frame: string
  total_ads_considered: number
  trending_ads: TrendingAd[]
}