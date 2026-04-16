import { axiosInstance } from "@/configs/axios";
import type { ImageUploadPayload, ImageUploadResponse } from "@/types/api";

export const uploadImage = async (
  payload: ImageUploadPayload
): Promise<ImageUploadResponse> => {
  try {
    const response = await axiosInstance.post<ImageUploadResponse>(
      "/api/upload/image",
      { imgname: payload.imgname, type: payload.type }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
