import { axiosInstance } from "@/configs/axios";
import type {
  ApiResponse,
  UserProfile,
  EditProfilePayload,
  AgencyPayload,
  AgencyMutationResponse,
} from "@/types/api";

export const getProfile = async (
  userId: string | number
): Promise<ApiResponse<UserProfile>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<UserProfile> | UserProfile>(
      "/api/user",
      { params: { user_id: userId } }
    );
    const raw = response.data as Record<string, unknown>;

    // New backend returns a flat UserProfile directly: { user_id, email, name, ... }
    // Old/expected shape: { status: "success", data: { user_id, ... } }
    // Detect by: flat if has `user_id` at root AND no `data` key.
    if (raw && typeof raw === "object" && "user_id" in raw && !("data" in raw)) {
      return { status: "success", data: raw as unknown as UserProfile };
    }

    return raw as unknown as ApiResponse<UserProfile>;
  } catch (error) {
    throw error;
  }
};

export const editProfile = async (
  payload: EditProfilePayload
): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.put<UserProfile>(
      "/api/user/profile",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addUserAgency = async (
  payload: AgencyPayload
): Promise<AgencyMutationResponse> => {
  try {
    const response = await axiosInstance.post<AgencyMutationResponse>(
      "/api/user/agency",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editUserAgency = async (
  payload: AgencyPayload & { agency_id: number }
): Promise<AgencyMutationResponse> => {
  try {
    const response = await axiosInstance.put<AgencyMutationResponse>(
      "/api/user/agency",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
