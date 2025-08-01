"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import useLogout from "@/hooks/useLogout";
import { axiosInstance } from "@/configs/axios";

interface UserDetails {
  user_id: number;
  mobileno: string;
  password: string;
  otp: string | null;
  otp_status: string;
  email: string;
  name: string;
  city: string;
  role: string;
  imgname: string | null;
  company: string;
  source: string;
  package_id: string | null;
  coupon_id: string | null;
  payment_status: number;
  created_date: string;
  modified_date: string;
  register_level_status: string | null;
  emailver_status: number;
  status: number;
}

const useFetchUserDetails = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const pathname = usePathname();
  const logout = useLogout();
  const userId = Cookies.get("userId");

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Don't fetch if already loading or if userId hasn't changed
      if (loading || userId === currentUserId) {
        return;
      }

      if (!userId) {
        if (pathname !== "/register" && pathname !== "/") {
          logout();
        }
        setUserDetails(null);
        setCurrentUserId(null);
        return;
      }

      setLoading(true);
      setCurrentUserId(userId);

      const params = {
        gofor: "userget",
        user_id: userId,
      };

      try {
        const response = await axiosInstance.get<UserDetails>("", { params });

        if (!response.data || response.status !== 200) {
          logout();
          setCurrentUserId(null);
          return;
        }

        setUserDetails(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setCurrentUserId(null);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, pathname]); // Remove logout from dependencies to prevent recreation

  return { loading, userDetails };
};

export default useFetchUserDetails;