import { useRouter } from "next/navigation";
import { logoutService } from "@/services/logoutService";

const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    logoutService();
    router.push("/login");
  };

  return logout;
};

export default useLogout;
