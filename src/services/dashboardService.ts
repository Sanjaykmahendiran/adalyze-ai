import { axiosInstance } from "@/configs/axios";
import type {
  Dashboard1Response,
  Dashboard2Response,
  ExpertTalkPayload,
} from "@/types/api";

/**
 * getDashboard1 — user KPI aggregation.
 * brandId optional; omit for personal accounts, supply for agency view.
 */
export const getDashboard1 = async (
  userId: string | number,
  brandId?: string | number
): Promise<Dashboard1Response> => {
  const params: Record<string, unknown> = { user_id: userId };
  if (brandId !== undefined && brandId !== "" && brandId !== "All Clients") {
    params.brand_id = brandId;
  }
  const response = await axiosInstance.get<Dashboard1Response>(
    "/api/dashboard",
    { params }
  );
  return response.data;
};

/**
 * getDashboard2 — monthly breakdown.
 * month: caller must compute and pass (e.g. "APR"). Service does not derive it.
 */
export const getDashboard2 = async (
  userId: string | number,
  month: string,
  brandId?: string | number
): Promise<Dashboard2Response> => {
  const params: Record<string, unknown> = { user_id: userId, month };
  if (brandId !== undefined && brandId !== "" && brandId !== "All Clients") {
    params.brand_id = brandId;
  }
  const response = await axiosInstance.get<Dashboard2Response>(
    "/api/dashboard/monthly",
    { params }
  );
  return response.data;
};

/**
 * requestExpertTalk — POST expert consultation request.
 * Returns raw backend result string; callers pass to toast.success().
 */
export const requestExpertTalk = async (
  payload: ExpertTalkPayload
): Promise<string> => {
  const response = await axiosInstance.post<string>(
    "/api/dashboard/expert-talk",
    payload
  );
  return response.data;
};
