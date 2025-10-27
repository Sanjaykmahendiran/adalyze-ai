"use client";
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import useLogout from "@/hooks/useLogout";
import { axiosInstance } from "@/configs/axios";

interface Brand {
  brand_id: number;
  user_id: number;
  brand_name: string;
  email: string;
  mobile: string;
  logo_url: string;
  logo_hash: string;
  verified: number;
  locked: number;
  status: number;
  created_date: string;
  modified_date: string | null;
}

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
  type: string;
  imgname: string | null;
  company: string;
  source: string;
  package_id: number | null;
  coupon_id: string | null;
  payment_status: number;
  created_date: string;
  modified_date: string;
  register_level_status: string | null;
  emailver_status: number;
  fretra_status: number;
  status: number;
  ads_limit: number;
  valid_till: string;
  brand: Brand | false;
}

const useFetchUserDetails = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  
  const pathname = usePathname();
  const logout = useLogout();
  const userId = Cookies.get("userId");
  
  // Use refs to track if we've already fetched for this userId
  const fetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) {
        return;
      }

      // Don't fetch if we already have data for this userId
      if (userId === fetchedUserIdRef.current && userDetails) {
        return;
      }

      if (!userId) {
        if (
          pathname !== "/" &&
          pathname !== "/login" &&
          pathname !== "/register" &&
          pathname !== "/emailconfrimation" &&
          pathname !== "/pricing" &&
          pathname !== "/results"
        ) {
          logout();
        }
        setUserDetails(null);
        fetchedUserIdRef.current = null;
        return;
      }

      // If userId changed, reset and fetch
      if (userId !== fetchedUserIdRef.current) {
        isFetchingRef.current = true;
        setLoading(true);

        const params = {
          gofor: "userget",
          user_id: userId,
        };

        try {
          const response = await axiosInstance.get<UserDetails>("", { params });

          if (!response.data || response.status !== 200) {
            logout();
            fetchedUserIdRef.current = null;
            return;
          }

          setUserDetails(response.data);
          fetchedUserIdRef.current = userId;
        } catch (err) {
          console.error("Error fetching user details:", err);
          fetchedUserIdRef.current = null;
          logout();
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    };

    fetchUserDetails();
  }, [userId]); // Removed pathname from dependencies

  return { loading, userDetails };
};

export default useFetchUserDetails;