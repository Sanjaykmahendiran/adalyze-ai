import { axiosInstance } from "@/configs/axios";
import type {
  AbAdDetailResult,
  DeleteAbAdResponse,
} from "@/types/api";

export const getAbAdDetail = async (
  adUploadId1: string | number,
  adUploadId2: string | number
): Promise<AbAdDetailResult> => {
  const response = await axiosInstance.get<AbAdDetailResult>("/api.php", {
    params: {
      gofor: "abaddetail",
      ad_upload_id1: adUploadId1,
      ad_upload_id2: adUploadId2,
    },
  });
  return response.data;
};

export const deleteAbAd = async (
  adUploadIdA: string | number,
  adUploadIdB: string | number
): Promise<DeleteAbAdResponse> => {
  const response = await axiosInstance.get<DeleteAbAdResponse>("/api.php", {
    params: {
      gofor: "deleteabad",
      ad_upload_id_a: adUploadIdA,
      ad_upload_id_b: adUploadIdB,
    },
  });
  return response.data;
};
