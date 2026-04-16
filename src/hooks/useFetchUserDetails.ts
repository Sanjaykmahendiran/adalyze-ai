"use client";
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import useLogout from "@/hooks/useLogout";
import { getProfile } from "@/services/userService";
import type { UserProfile } from "@/types/api";

const useFetchUserDetails = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null);

  const pathname = usePathname();
  const logout = useLogout();
  const userId = Cookies.get("userId");

  const fetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isFetchingRef.current) return;
      if (userId === fetchedUserIdRef.current && userDetails) return;

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

      if (userId !== fetchedUserIdRef.current) {
        isFetchingRef.current = true;
        setLoading(true);

        try {
          const response = await getProfile(userId);

          if (!response.data || response.status !== "success") {
            logout();
            fetchedUserIdRef.current = null;
            return;
          }

          setUserDetails(response.data);
          fetchedUserIdRef.current = userId;
        } catch (err: unknown) {
          console.error("Error fetching user details:", err);
          fetchedUserIdRef.current = null;
          // Only force-logout on a real 401 (expired / invalid session).
          // Network errors (CORS, timeout, 5xx) must NOT kill a valid session —
          // a transient backend failure should never log the user out.
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 401) {
            logout();
          }
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    };

    fetchUserDetails();
  }, [userId]);

  return { loading, userDetails };
};

export default useFetchUserDetails;
