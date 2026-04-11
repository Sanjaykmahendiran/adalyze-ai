import type {
  SupportAd,
  SupportAdListResponse,
  SupportItem,
  FeedbackItem,
  ExpertTalkItem,
  UserListResponse,
  SupportRequestPayload,
  FeedbackPayload,
  ExpertCallPayload,
  GuestSupportPayload,
  ROIQueryPayload,
} from "@/types/api";

export const getFullAdsList = async (
  userId: string
): Promise<SupportAd[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=fulladsnamelist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`fulladsnamelist failed: ${res.status}`);
  const result: SupportAdListResponse = await res.json();
  if (result.status && Array.isArray(result.data)) {
    return result.data;
  }
  return [];
};

export const getUserHelpList = async (
  userId: string
): Promise<SupportItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userhelplist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`userhelplist failed: ${res.status}`);
  const result: UserListResponse<SupportItem> = await res.json();
  return Array.isArray(result.data) ? result.data : [];
};

export const getUserFeedbackList = async (
  userId: string
): Promise<FeedbackItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userfeedbacklist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`userfeedbacklist failed: ${res.status}`);
  const result: UserListResponse<FeedbackItem> = await res.json();
  return Array.isArray(result.data) ? result.data : [];
};

export const getUserExpertTalkList = async (
  userId: string
): Promise<ExpertTalkItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=userexptalkreqlist&user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`userexptalkreqlist failed: ${res.status}`);
  const result: UserListResponse<ExpertTalkItem> = await res.json();
  return Array.isArray(result.data) ? result.data : [];
};

export const getPrivacyPolicy = async (): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=privacypolicy`
  );
  if (!res.ok) throw new Error(`privacypolicy failed: ${res.status}`);
  return res.text();
};

export const getReturnPolicy = async (): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=returnpolicy`
  );
  if (!res.ok) throw new Error(`returnpolicy failed: ${res.status}`);
  return res.text();
};

export const getTermsAndConditions = async (): Promise<string> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php?gofor=termsandconditions`
  );
  if (!res.ok) throw new Error(`termsandconditions failed: ${res.status}`);
  return res.text();
};

export const submitSupportRequest = async (
  payload: SupportRequestPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "needhelp",
        ...payload,
        imgname: payload.imgname || "",
      }),
    }
  );
  if (!res.ok) throw new Error(`needhelp failed: ${res.status}`);
  return res;
};

export const submitFeedback = async (
  payload: FeedbackPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "feedback",
        ...payload,
      }),
    }
  );
  if (!res.ok) throw new Error(`feedback failed: ${res.status}`);
  return res;
};

export const submitExpertCallRequest = async (
  payload: ExpertCallPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "exptalkrequest",
        ...payload,
      }),
    }
  );
  if (!res.ok) throw new Error(`exptalkrequest failed: ${res.status}`);
  return res;
};

export const submitGuestSupportRequest = async (
  payload: GuestSupportPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "needhelp",
        ...payload,
      }),
    }
  );
  if (!res.ok) throw new Error(`needhelp (guest) failed: ${res.status}`);
  return res;
};

export const submitROIQuery = async (
  payload: ROIQueryPayload
): Promise<Response> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gofor: "sendquery",
        ...payload,
      }),
    }
  );
  if (!res.ok) throw new Error(`sendquery failed: ${res.status}`);
  return res;
};
