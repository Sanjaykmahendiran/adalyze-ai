import { axiosInstance } from "@/configs/axios";

export const login = async (payload: any) => {
  try {
    const response = await axiosInstance.get("", {
      params: {
        gofor: "login",
        ...(payload.nouptoken && { nouptoken: payload.nouptoken }),
        ...(payload.email && payload.password && { email: payload.email, password: payload.password }),
        ...(payload.google_token && { google_token: payload.google_token }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error); 
    throw new Error("Failed to login");
  }
};
