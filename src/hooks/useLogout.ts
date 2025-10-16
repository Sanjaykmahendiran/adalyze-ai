import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const useLogout = () => {
  const router = useRouter();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const logout = () => {
    Cookies.remove("userId", { path: basePath });
    Cookies.remove("email", { path: basePath });
    router.push("/");
  };

  return logout;
};

export default useLogout;
