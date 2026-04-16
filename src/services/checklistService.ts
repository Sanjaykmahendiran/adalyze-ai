import { axiosInstance } from "@/configs/axios";
import type {
  ChecklistItem,
  MarkChecklistDonePayload,
  ChecklistMutationResult,
} from "@/types/api";

/**
 * getChecklist — returns flat ChecklistItem array.
 * Unwraps { status, data } envelope; returns [] on failure.
 */
export const getChecklist = async (
  adUploadId: string | number
): Promise<ChecklistItem[]> => {
  const response = await axiosInstance.get<{
    status: boolean;
    data: ChecklistItem[];
  }>("/api/checklist", {
    params: { ad_upload_id: adUploadId },
  });
  if (response.data?.status && Array.isArray(response.data?.data)) {
    return response.data.data;
  }
  return [];
};

/**
 * markChecklistDone — POST; normalises three raw backend response shapes into one.
 */
export const markChecklistDone = async (
  payload: MarkChecklistDonePayload
): Promise<ChecklistMutationResult> => {
  const response = await axiosInstance.post<{
    status?: boolean;
    message?: string;
    success?: boolean;
  }>("/api/checklist/mark-done", payload);
  const raw = response.data;
  const success =
    (raw.status === true &&
      raw.message === "Checklist Created successfully.") ||
    raw.status === true ||
    raw.success === true;
  return { success, message: raw.message };
};
