import Cookies from "js-cookie";

export function logoutService() {
  Cookies.remove("authToken");
  Cookies.remove("refreshToken");
  Cookies.remove("userId");
  Cookies.remove("email");

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
