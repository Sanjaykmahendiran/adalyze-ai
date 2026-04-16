// Jest setup required before running: see src/hooks/__tests__/useFetchUserDetails.test.ts for setup instructions

import type {
  BrandWithStats,
  Brand,
  BrandMutationResponse,
  DeleteBrandResponse,
  AddBrandPayload,
  EditBrandPayload,
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
  getBrands,
  getBrand,
  addBrand,
  editBrand,
  deleteBrand,
} from "@/services/brandService";

// Convenience typed mocks
const mockGet = axiosInstance.get as jest.MockedFunction<typeof axiosInstance.get>;
const mockPost = axiosInstance.post as jest.MockedFunction<typeof axiosInstance.post>;
const mockPut = axiosInstance.put as jest.MockedFunction<typeof axiosInstance.put>;
const mockDelete = axiosInstance.delete as jest.MockedFunction<typeof axiosInstance.delete>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockBrandWithStats: BrandWithStats = {
  brand_id: 10,
  user_id: 42,
  brand_name: "Acme Corp",
  email: "acme@test.com",
  mobile: "9876543210",
  logo_url: "https://cdn.example.com/acme.png",
  logo_hash: "abc123",
  verified: 1,
  locked: 0,
  status: 1,
  created_date: "2024-01-01",
  modified_date: null,
  website: "https://acme.com",
  upload_count: 5,
  average_score: 78.4,
  latest_score: 82,
  last_analysis_date: "2024-06-01",
  go_count: 3,
  no_go_count: 2,
};

const mockBrand: Brand = {
  brand_id: 10,
  user_id: 42,
  brand_name: "Acme Corp",
  email: "acme@test.com",
  mobile: "9876543210",
  logo_url: "https://cdn.example.com/acme.png",
  logo_hash: "abc123",
  verified: 1,
  locked: 0,
  status: 1,
  created_date: "2024-01-01",
  modified_date: null,
};

const mockAddPayload: AddBrandPayload = {
  user_id: "42",
  brand_name: "New Brand",
  email: "newbrand@test.com",
  mobile: "1234567890",
  website: "https://newbrand.com",
  logo_url: "https://cdn.example.com/new.png",
};

const mockEditPayload: EditBrandPayload = {
  ...mockAddPayload,
  brand_id: "10",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("brandService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getBrands ─────────────────────────────────────────────────────────────

  describe("getBrands", () => {
    it("calls GET /api/brands with user_id as a query param", async () => {
      mockGet.mockResolvedValueOnce({ data: [mockBrandWithStats] });

      await getBrands(42);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/api/brands", { params: { user_id: 42 } });
    });

    it("accepts user_id as a string", async () => {
      mockGet.mockResolvedValueOnce({ data: [mockBrandWithStats] });

      await getBrands("42");

      expect(mockGet).toHaveBeenCalledWith("/api/brands", { params: { user_id: "42" } });
    });

    it("returns the response.data array directly — not unwrapped further", async () => {
      const brands: BrandWithStats[] = [mockBrandWithStats];
      mockGet.mockResolvedValueOnce({ data: brands });

      const result = await getBrands(42);

      expect(result).toBe(brands);
    });

    it("returns an empty array when the API returns an empty list", async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      const result = await getBrands(42);

      expect(result).toEqual([]);
    });

    it("re-throws when axiosInstance.get rejects", async () => {
      const networkError = new Error("Network error");
      mockGet.mockRejectedValueOnce(networkError);

      await expect(getBrands(42)).rejects.toThrow("Network error");
    });
  });

  // ─── getBrand ──────────────────────────────────────────────────────────────

  describe("getBrand", () => {
    it("calls GET /api/brand/{brandId} with the id interpolated in the path", async () => {
      mockGet.mockResolvedValueOnce({ data: mockBrand });

      await getBrand(10);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/api/brand/10");
    });

    it("accepts brandId as a string", async () => {
      mockGet.mockResolvedValueOnce({ data: mockBrand });

      await getBrand("10");

      expect(mockGet).toHaveBeenCalledWith("/api/brand/10");
    });

    it("returns the raw Brand object from response.data", async () => {
      mockGet.mockResolvedValueOnce({ data: mockBrand });

      const result = await getBrand(10);

      expect(result).toBe(mockBrand);
    });

    it("re-throws when axiosInstance.get rejects", async () => {
      const notFound = new Error("404 Not Found");
      mockGet.mockRejectedValueOnce(notFound);

      await expect(getBrand(999)).rejects.toThrow("404 Not Found");
    });
  });

  // ─── addBrand ──────────────────────────────────────────────────────────────

  describe("addBrand", () => {
    it("calls POST /api/brand with the full payload as request body", async () => {
      const mockResponse: BrandMutationResponse = { success: true };
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      await addBrand(mockAddPayload);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/api/brand", mockAddPayload);
    });

    it("returns BrandMutationResponse from response.data", async () => {
      const mockResponse: BrandMutationResponse = { success: true, status: "success" };
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      const result = await addBrand(mockAddPayload);

      expect(result).toBe(mockResponse);
    });

    it("re-throws when axiosInstance.post rejects", async () => {
      mockPost.mockRejectedValueOnce(new Error("Server error"));

      await expect(addBrand(mockAddPayload)).rejects.toThrow("Server error");
    });
  });

  // ─── editBrand ─────────────────────────────────────────────────────────────

  describe("editBrand", () => {
    it("calls PUT /api/brand/{brand_id} using brand_id from the payload as the URL path segment", async () => {
      const mockResponse: BrandMutationResponse = { success: true };
      mockPut.mockResolvedValueOnce({ data: mockResponse });

      await editBrand(mockEditPayload);

      expect(mockPut).toHaveBeenCalledTimes(1);
      // brand_id "10" from payload.brand_id must be the URL path param
      expect(mockPut).toHaveBeenCalledWith("/api/brand/10", mockEditPayload);
    });

    it("uses the correct brand_id in the URL path — not a generic /api/brand endpoint", async () => {
      const payload: EditBrandPayload = { ...mockEditPayload, brand_id: "77" };
      mockPut.mockResolvedValueOnce({ data: { success: true } });

      await editBrand(payload);

      const [url] = mockPut.mock.calls[0];
      expect(url).toBe("/api/brand/77");
    });

    it("returns BrandMutationResponse from response.data", async () => {
      const mockResponse: BrandMutationResponse = { success: true };
      mockPut.mockResolvedValueOnce({ data: mockResponse });

      const result = await editBrand(mockEditPayload);

      expect(result).toBe(mockResponse);
    });

    it("re-throws when axiosInstance.put rejects", async () => {
      mockPut.mockRejectedValueOnce(new Error("Conflict"));

      await expect(editBrand(mockEditPayload)).rejects.toThrow("Conflict");
    });
  });

  // ─── deleteBrand ───────────────────────────────────────────────────────────

  describe("deleteBrand", () => {
    it("calls DELETE /api/brand/{brandId} with the id interpolated in the path", async () => {
      const mockResponse: DeleteBrandResponse = { response: "Brand deleted successfully" };
      mockDelete.mockResolvedValueOnce({ data: mockResponse });

      await deleteBrand(10);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith("/api/brand/10");
    });

    it("accepts brandId as a string", async () => {
      mockDelete.mockResolvedValueOnce({ data: { response: "Brand deleted successfully" } });

      await deleteBrand("10");

      expect(mockDelete).toHaveBeenCalledWith("/api/brand/10");
    });

    it("success is confirmed by result.response === 'Brand deleted successfully' (field is 'response', not 'status' or 'message')", async () => {
      const mockResponse: DeleteBrandResponse = { response: "Brand deleted successfully" };
      mockDelete.mockResolvedValueOnce({ data: mockResponse });

      const result = await deleteBrand(10);

      // The success field is 'response' — callers MUST check result.response, not result.status/message
      expect(result.response).toBe("Brand deleted successfully");
    });

    it("response field is absent (or different) when deletion fails — callers must not assume truthy response", async () => {
      const failResponse: DeleteBrandResponse = { message: "Brand not found" };
      mockDelete.mockResolvedValueOnce({ data: failResponse });

      const result = await deleteBrand(999);

      expect(result.response).toBeUndefined();
      expect(result.message).toBe("Brand not found");
    });

    it("re-throws when axiosInstance.delete rejects", async () => {
      mockDelete.mockRejectedValueOnce(new Error("Forbidden"));

      await expect(deleteBrand(10)).rejects.toThrow("Forbidden");
    });
  });
});
