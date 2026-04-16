import { axiosInstance } from "@/configs/axios";
import type {
  AdDetailResponse,
  AdDetailData,
  HeatmapGetResponse,
  HeatmapGenerateResponse,
  DeleteAdResponse,
} from "@/types/api";

export const getAdDetail = async (
  adUploadId: string | number,
  userId?: string | number
): Promise<AdDetailData> => {
  const params: Record<string, string | number> = {
    gofor: "addetail",
    ad_upload_id: adUploadId,
  };
  if (userId !== undefined && userId !== "" && userId !== null) {
    params.user_id = userId;
  }
  const response = await axiosInstance.get<AdDetailResponse>("/api.php", {
    params,
  });
  if (!response.data.success) {
    throw new Error(response.data.message || "API returned error");
  }
  return response.data.data;
};

export const getHeatmap = async (
  adUploadId: string | number
): Promise<HeatmapGetResponse> => {
  const response = await axiosInstance.get<HeatmapGetResponse>("/api.php", {
    params: { gofor: "getheatmap", ad_upload_id: adUploadId },
  });
  return response.data;
};

export const generateHeatmap = async (
  adUploadId: number
): Promise<HeatmapGenerateResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/heatmap.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_upload_id: adUploadId }),
    }
  );
  if (!res.ok) throw new Error(`generateHeatmap failed: ${res.status}`);
  return res.json() as Promise<HeatmapGenerateResponse>;
};

export const deleteAd = async (
  adUploadId: string | number
): Promise<DeleteAdResponse> => {
  const response = await axiosInstance.get<DeleteAdResponse>("/api.php", {
    params: { gofor: "deletead", ad_upload_id: adUploadId },
  });
  return response.data;
};
