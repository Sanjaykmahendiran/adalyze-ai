import { axiosInstance } from "@/configs/axios";
import type {
  AdsListParams,
  AdsListResponse,
  AbAdPair,
} from "@/types/api";

/**
 * getAds — paginated ad list.
 * Pass brand_id for agency brand-detail view; omit for own-ads view.
 */
export const getAds = async (
  params: AdsListParams
): Promise<AdsListResponse> => {
  const response = await axiosInstance.get<AdsListResponse>("/api/ads", {
    params,
  });
  return response.data;
};

/**
 * getAbAds — returns all A/B ad pairs for a user.
 * Stateless — no load guard inside this function.
 * Callers apply their own guard before calling.
 */
export const getAbAds = async (
  userId: string | number
): Promise<AbAdPair[]> => {
  const response = await axiosInstance.get<AbAdPair[]>("/api/ab-tests", {
    params: { user_id: userId },
  });
  return response.data ?? [];
};
