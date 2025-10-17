import { axiosInstance } from "@/configs/axios";

export const login = async (payload : any) => {
  try {
    const response = await axiosInstance.get("https://adalyzeai.xyz/App/api.php", {
      params: {
        gofor: "login",
        ...(payload.email && payload.password && {
          email: payload.email,
          password: payload.password,
        }),
        ...(payload.facebook_token && { facebook_token: payload.facebook_token }),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw new Error("Failed to login");
  }
};
