import { axiosInstance } from "@/configs/axios";
import type { ApiResponse, UserProfile } from "@/types/api";

export const getProfile = async (
  userId: string | number
): Promise<ApiResponse<UserProfile>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>(
      "/api/user",
      { params: { user_id: userId } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
