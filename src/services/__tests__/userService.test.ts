// Jest setup required before running: see src/hooks/__tests__/useFetchUserDetails.test.ts for setup instructions

import type {
  ApiResponse,
  UserProfile,
  EditProfilePayload,
  AgencyPayload,
  AgencyMutationResponse,
} from "@/types/api";

// --- Mocks must be declared before imports that use them ---

jest.mock("@/configs/axios", () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { axiosInstance } from "@/configs/axios";
import {
  getProfile,
  editProfile,
  addUserAgency,
  editUserAgency,
} from "@/services/userService";

// Convenience typed mocks
const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;
const mockPost = axiosInstance.post as jest.MockedFunction<typeof axiosInstance.post>;
const mockPut = axiosInstance.put as jest.MockedFunction<typeof axiosInstance.put>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUserProfile: UserProfile = {
  user_id: 1,
  email: "test@test.com",
  name: "Test User",
  mobileno: "9876543210",
  password: "",
  otp: null,
  otp_status: "0",
  brands_count: 2,
  city: "Mumbai",
  role: "user",
  type: "free",
  imgname: null,
  company: "Test Co",
  source: "web",
  package_id: null,
  coupon_id: null,
  payment_status: 0,
  created_date: "2024-01-01",
  modified_date: "2024-06-01",
  register_level_status: null,
  emailver_status: 1,
  fretra_status: 0,
  status: 1,
  ads_limit: 5,
  valid_till: "2025-01-01",
  brand: false,
  agency: false,
};

const mockEditProfilePayload: EditProfilePayload = {
  user_id: "1",
  mobileno: "9876543210",
  name: "Updated Name",
  country: "India",
  state: "Maharashtra",
  city: "Mumbai",
  role: "user",
  address: "123 Main St",
  pincode: "400001",
  imgname: "https://cdn.example.com/profile.png",
};

const mockAgencyPayload: AgencyPayload = {
  user_id: "1",
  agency_name: "Test Agency",
  agency_logo: "https://cdn.example.com/agency-logo.png",
  contact_person: "Jane Doe",
  designation: "CEO",
  business_email: "jane@agency.com",
  business_phone: "9876543210",
  website_url: "https://agency.com",
  gst_no: "22AAAAA0000A1Z5",
  address: "456 Agency Lane",
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  pincode: "560001",
  team_members: "10",
};

const mockAgencyMutationSuccess: AgencyMutationResponse = {
  status: "success",
  message: "Agency saved successfully",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getProfile ────────────────────────────────────────────────────────────

  describe("getProfile", () => {
    it("calls GET /api/user with user_id as a query param", async () => {
      const mockResponse: ApiResponse<UserProfile> = {
        status: "success",
        data: mockUserProfile,
      };
      mockGet.mockResolvedValueOnce({ data: mockResponse });

      await getProfile(1);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/api/user", { params: { user_id: 1 } });
    });

    it("returns ApiResponse<UserProfile> (the wrapper is NOT unwrapped by the service)", async () => {
      const mockResponse: ApiResponse<UserProfile> = {
        status: "success",
        data: mockUserProfile,
      };
      mockGet.mockResolvedValueOnce({ data: mockResponse });

      const result = await getProfile(1);

      // getProfile returns the ApiResponse wrapper — callers check result.status
      expect(result).toBe(mockResponse);
      expect(result.status).toBe("success");
      expect(result.data).toBe(mockUserProfile);
    });

    it("re-throws when axiosInstance.get rejects", async () => {
      mockGet.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(getProfile(1)).rejects.toThrow("Unauthorized");
    });
  });

  // ─── editProfile ───────────────────────────────────────────────────────────

  describe("editProfile", () => {
    it("calls PUT /api/user/profile with the payload as request body", async () => {
      mockPut.mockResolvedValueOnce({ data: mockUserProfile });

      await editProfile(mockEditProfilePayload);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith("/api/user/profile", mockEditProfilePayload);
    });

    it("returns UserProfile directly — NOT wrapped in ApiResponse", async () => {
      mockPut.mockResolvedValueOnce({ data: mockUserProfile });

      const result = await editProfile(mockEditProfilePayload);

      // Unlike getProfile, editProfile returns UserProfile directly (no .data wrapper)
      expect(result).toBe(mockUserProfile);
      // Confirm callers do NOT need to unwrap .data or .status
      expect((result as unknown as ApiResponse).status).toBeUndefined();
    });

    it("re-throws when axiosInstance.put rejects", async () => {
      mockPut.mockRejectedValueOnce(new Error("Validation error"));

      await expect(editProfile(mockEditProfilePayload)).rejects.toThrow("Validation error");
    });
  });

  // ─── addUserAgency ─────────────────────────────────────────────────────────

  describe("addUserAgency", () => {
    it("calls POST /api/user/agency with the agency payload", async () => {
      mockPost.mockResolvedValueOnce({ data: mockAgencyMutationSuccess });

      await addUserAgency(mockAgencyPayload);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/api/user/agency", mockAgencyPayload);
    });

    it("returns AgencyMutationResponse from response.data", async () => {
      mockPost.mockResolvedValueOnce({ data: mockAgencyMutationSuccess });

      const result = await addUserAgency(mockAgencyPayload);

      expect(result).toBe(mockAgencyMutationSuccess);
      expect(result.status).toBe("success");
    });

    it("payload does NOT include agency_id — this is an add operation, not edit", async () => {
      mockPost.mockResolvedValueOnce({ data: mockAgencyMutationSuccess });

      // addUserAgency accepts AgencyPayload (agency_id optional field omitted)
      const payloadWithoutId: AgencyPayload = { ...mockAgencyPayload };
      delete payloadWithoutId.agency_id;

      await addUserAgency(payloadWithoutId);

      const [, body] = mockPost.mock.calls[0];
      expect((body as AgencyPayload).agency_id).toBeUndefined();
    });

    it("re-throws when axiosInstance.post rejects", async () => {
      mockPost.mockRejectedValueOnce(new Error("Conflict"));

      await expect(addUserAgency(mockAgencyPayload)).rejects.toThrow("Conflict");
    });
  });

  // ─── editUserAgency ────────────────────────────────────────────────────────

  describe("editUserAgency", () => {
    const editPayload: AgencyPayload & { agency_id: number } = {
      ...mockAgencyPayload,
      agency_id: 55,
    };

    it("calls PUT /api/user/agency with the payload (NOT a path-parameterised URL)", async () => {
      mockPut.mockResolvedValueOnce({ data: mockAgencyMutationSuccess });

      await editUserAgency(editPayload);

      expect(mockPut).toHaveBeenCalledTimes(1);
      const [url] = mockPut.mock.calls[0];
      // Edit uses PUT /api/user/agency — agency_id goes in the body, not the URL
      expect(url).toBe("/api/user/agency");
    });

    it("sends agency_id as a number in the request body", async () => {
      mockPut.mockResolvedValueOnce({ data: mockAgencyMutationSuccess });

      await editUserAgency(editPayload);

      const [, body] = mockPut.mock.calls[0];
      expect(typeof (body as typeof editPayload).agency_id).toBe("number");
      expect((body as typeof editPayload).agency_id).toBe(55);
    });

    it("returns AgencyMutationResponse from response.data", async () => {
      mockPut.mockResolvedValueOnce({ data: mockAgencyMutationSuccess });

      const result = await editUserAgency(editPayload);

      expect(result).toBe(mockAgencyMutationSuccess);
    });

    it("re-throws when axiosInstance.put rejects", async () => {
      mockPut.mockRejectedValueOnce(new Error("Not Found"));

      await expect(editUserAgency(editPayload)).rejects.toThrow("Not Found");
    });
  });
});
