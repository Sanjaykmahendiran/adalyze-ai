import { axiosInstance } from "@/configs/axios";
import type {
  ChatLogEntry,
  AskAdalyzePayload,
  AskAdalyzeResponse,
} from "@/types/api";

export const getChatHistory = async (
  adUploadId: string | number
): Promise<ChatLogEntry[]> => {
  const response = await axiosInstance.get("/api.php", {
    params: { gofor: "getchathistory", ad_upload_id: adUploadId },
  });
  const raw = response.data;
  if (raw === 0 || raw === "0" || !Array.isArray(raw)) return [];
  return raw as ChatLogEntry[];
};

export const askAdalyze = async (
  payload: AskAdalyzePayload
): Promise<AskAdalyzeResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/askadalyze.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error(`askAdalyze failed: ${res.status}`);
  return res.json() as Promise<AskAdalyzeResponse>;
};
