import { axiosInstance } from "@/configs/axios";
import { trackEvent } from "@/lib/eventTracker";
import type { ApiResponse } from "@/types/api";

export const addIdentifier = async (payload: {
  cookie_id: string;
  user_id?: number;
  identifier_type: string;
  identifier_value: string;
}): Promise<ApiResponse<unknown>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      "/api/tracking/identifier",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const recordEvent = (
  eventName: string,
  pageUrl: string,
  email?: string | null,
  currency?: string | null,
  eventValue?: number | null
): void => {
  trackEvent(eventName, pageUrl, email, currency, eventValue);
};
