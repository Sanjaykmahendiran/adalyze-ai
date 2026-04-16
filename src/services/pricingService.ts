import { axiosInstance } from "@/configs/axios";
import type {
  PricingPlan,
  AppConfig,
  FreeTrialResponse,
} from "@/types/api";

/**
 * getPackages — returns active pricing plans (status === 1 filtered in service).
 */
export const getPackages = async (): Promise<PricingPlan[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=packages`
  );
  if (!res.ok) throw new Error(`packages failed: ${res.status}`);
  const data = (await res.json()) as PricingPlan[];
  return data.filter((plan) => plan.status === 1);
};

/**
 * getAppConfig — fetches app config including Razorpay public key.
 * Throws if rzpaykey is absent.
 */
export const getAppConfig = async (): Promise<AppConfig> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=config`
  );
  if (!res.ok) throw new Error(`config failed: ${res.status}`);
  const data = (await res.json()) as AppConfig;
  if (!data.rzpaykey) throw new Error("Razorpay key missing from config");
  return data;
};

/**
 * activateFreeTrial — user-scoped; uses axiosInstance for 401 redirect.
 * Normalises raw { response: string } into { activated: boolean; message: string }.
 */
export const activateFreeTrial = async (
  userId: string | number
): Promise<FreeTrialResponse> => {
  const response = await axiosInstance.get<{ response: string }>("/api.php", {
    params: { gofor: "fretra", user_id: userId },
  });
  const raw = response.data;
  return {
    activated: raw.response === "Free Trial Activated",
    message: raw.response,
  };
};
