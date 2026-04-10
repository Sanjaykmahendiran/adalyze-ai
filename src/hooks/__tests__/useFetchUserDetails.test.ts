/**
 * Tests for useFetchUserDetails hook
 *
 * Sprint 1 bug fixed: replaced axiosInstance.get("", params) with userService.getProfile(userId),
 * and checks response.status !== "success" (string) rather than HTTP status code.
 *
 * Test infrastructure note: This project has no jest.config or vitest.config yet.
 * Install and configure Jest with the following devDependencies before running:
 *   jest, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom,
 *   ts-jest (or babel-jest with babel-preset-next), @types/jest, identity-obj-proxy
 * Create jest.config.js:
 *   const nextJest = require('next/jest');
 *   const createJestConfig = nextJest({ dir: './' });
 *   module.exports = createJestConfig({ testEnvironment: 'jsdom', moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' } });
 * Create jest.setup.ts:
 *   import '@testing-library/jest-dom';
 */

import { renderHook, waitFor } from "@testing-library/react";

// --- Mocks must be declared before imports that use them ---

jest.mock("js-cookie");
jest.mock("next/navigation");
jest.mock("@/hooks/useLogout");
jest.mock("@/services/userService");

import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import useLogout from "@/hooks/useLogout";
import * as userService from "@/services/userService";
import type { UserProfile } from "@/types/api";

// Convenience typed mocks
const mockGetProfile = userService.getProfile as jest.MockedFunction<typeof userService.getProfile>;
const mockCookiesGet = Cookies.get as jest.MockedFunction<typeof Cookies.get>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseLogout = useLogout as jest.MockedFunction<typeof useLogout>;

// A minimal UserProfile that satisfies the type
const mockUser: UserProfile = {
  user_id: 1,
  email: "test@test.com",
  name: "Test User",
  mobileno: "0000000000",
  password: "",
  otp: null,
  otp_status: "0",
  brands_count: 0,
  city: "",
  role: "user",
  type: "free",
  imgname: null,
  company: "",
  source: "",
  package_id: null,
  coupon_id: null,
  payment_status: 0,
  created_date: "2024-01-01",
  modified_date: "2024-01-01",
  register_level_status: null,
  emailver_status: 1,
  fretra_status: 0,
  status: 1,
  ads_limit: 5,
  valid_till: "2025-01-01",
  brand: false,
  agency: false,
};

const mockLogoutFn = jest.fn();

// Import the hook after mocks are established
// eslint-disable-next-line import/first
import useFetchUserDetails from "@/hooks/useFetchUserDetails";

describe("useFetchUserDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseLogout.mockReturnValue(mockLogoutFn);
  });

  describe("when userId cookie exists", () => {
    beforeEach(() => {
      mockCookiesGet.mockReturnValue("42");
    });

    it("calls userService.getProfile with the userId from the cookie", async () => {
      mockGetProfile.mockResolvedValueOnce({ status: "success", data: mockUser });

      renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(mockGetProfile).toHaveBeenCalledTimes(1);
        expect(mockGetProfile).toHaveBeenCalledWith("42");
      });
    });

    it("does NOT call axiosInstance.get directly — all fetches go through userService", async () => {
      // Confirm that no raw axios call bypasses the service layer.
      // We verify this by ensuring getProfile is the only call path —
      // if the hook called axiosInstance.get directly it would not resolve
      // through this mock and userDetails would remain null.
      mockGetProfile.mockResolvedValueOnce({ status: "success", data: mockUser });

      const { result } = renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(result.current.userDetails).not.toBeNull();
      });

      // axiosInstance is not directly used in the hook; only userService.getProfile
      expect(mockGetProfile).toHaveBeenCalledTimes(1);
    });

    it("sets userDetails when getProfile returns status 'success'", async () => {
      mockGetProfile.mockResolvedValueOnce({ status: "success", data: mockUser });

      const { result } = renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(result.current.userDetails).toEqual(mockUser);
      });

      expect(result.current.loading).toBe(false);
      expect(mockLogoutFn).not.toHaveBeenCalled();
    });

    it("calls logout() when response.status is 'error' (string check, not HTTP 200)", async () => {
      mockGetProfile.mockResolvedValueOnce({ status: "error", data: undefined });

      renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(mockLogoutFn).toHaveBeenCalledTimes(1);
      });
    });

    it("calls logout() when response.status is empty string", async () => {
      mockGetProfile.mockResolvedValueOnce({ status: "" });

      renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(mockLogoutFn).toHaveBeenCalledTimes(1);
      });
    });

    it("calls logout() when response has no data even if status is 'success'", async () => {
      // Branch: !response.data || response.status !== "success"
      mockGetProfile.mockResolvedValueOnce({ status: "success", data: undefined });

      renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(mockLogoutFn).toHaveBeenCalledTimes(1);
      });
    });

    it("calls logout() and does not set userDetails when getProfile throws", async () => {
      mockGetProfile.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(mockLogoutFn).toHaveBeenCalledTimes(1);
      });

      expect(result.current.userDetails).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it("returns loading: true while the request is in-flight", async () => {
      let resolveProfile!: (value: Awaited<ReturnType<typeof userService.getProfile>>) => void;
      const pendingPromise = new Promise<Awaited<ReturnType<typeof userService.getProfile>>>(
        (res) => { resolveProfile = res; }
      );
      mockGetProfile.mockReturnValueOnce(pendingPromise);

      const { result } = renderHook(() => useFetchUserDetails());

      // loading should become true once the effect fires
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve and confirm loading drops to false
      resolveProfile({ status: "success", data: mockUser });
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("when userId cookie is absent", () => {
    beforeEach(() => {
      mockCookiesGet.mockReturnValue(undefined as unknown as string);
    });

    it("does not call getProfile", async () => {
      renderHook(() => useFetchUserDetails());

      // Allow a tick for the effect to run
      await waitFor(() => {
        expect(mockGetProfile).not.toHaveBeenCalled();
      });
    });

    it("calls logout() when the current path is a protected route", async () => {
      mockUsePathname.mockReturnValue("/dashboard");

      renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(mockLogoutFn).toHaveBeenCalledTimes(1);
      });
    });

    it("does NOT call logout() when on public paths (/, /login, /register, /pricing, /results, /emailconfrimation)", async () => {
      const publicPaths = ["/", "/login", "/register", "/pricing", "/results", "/emailconfrimation"];

      for (const path of publicPaths) {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue(path);
        mockUseLogout.mockReturnValue(mockLogoutFn);
        mockCookiesGet.mockReturnValue(undefined as unknown as string);

        renderHook(() => useFetchUserDetails());

        await waitFor(() => {
          expect(mockGetProfile).not.toHaveBeenCalled();
        });

        expect(mockLogoutFn).not.toHaveBeenCalled();
      }
    });

    it("sets userDetails to null", async () => {
      const { result } = renderHook(() => useFetchUserDetails());

      await waitFor(() => {
        expect(result.current.userDetails).toBeNull();
      });
    });
  });
});
