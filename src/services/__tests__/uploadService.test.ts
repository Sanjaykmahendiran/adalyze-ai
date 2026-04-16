// Jest setup required before running: see src/hooks/__tests__/useFetchUserDetails.test.ts for setup instructions

import type { ImageUploadPayload, ImageUploadResponse } from "@/types/api";

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
import { uploadImage } from "@/services/uploadService";

// Convenience typed mock
const mockPost = axiosInstance.post as jest.MockedFunction<typeof axiosInstance.post>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// Raw base64 string — no data-URI prefix (as per ImageUploadPayload spec)
const rawBase64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U";

const mockSuccessResponse: ImageUploadResponse = {
  success: true,
  url: "https://cdn.example.com/uploads/brand-logo.png",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("uploadService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── uploadImage ───────────────────────────────────────────────────────────

  describe("uploadImage", () => {
    it("calls POST /api/upload/image", async () => {
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      const payload: ImageUploadPayload = { imgname: rawBase64, type: "brand" };
      await uploadImage(payload);

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [url] = mockPost.mock.calls[0];
      expect(url).toBe("/api/upload/image");
    });

    it("sends JSON body { imgname, type } — NOT FormData", async () => {
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      const payload: ImageUploadPayload = { imgname: rawBase64, type: "brand" };
      await uploadImage(payload);

      const [, body] = mockPost.mock.calls[0];
      // Body must be a plain object, not a FormData instance
      expect(body).not.toBeInstanceOf(FormData);
      expect(typeof body).toBe("object");
      expect(body).toEqual({ imgname: rawBase64, type: "brand" });
    });

    it("sends imgname as the raw base64 string passed in — no transformation applied", async () => {
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      const payload: ImageUploadPayload = { imgname: rawBase64, type: "profile" };
      await uploadImage(payload);

      const [, body] = mockPost.mock.calls[0];
      expect((body as ImageUploadPayload).imgname).toBe(rawBase64);
    });

    it("passes type as-is when lowercase — 'brand' is not upcased or modified", async () => {
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      await uploadImage({ imgname: rawBase64, type: "brand" });

      const [, body] = mockPost.mock.calls[0];
      expect((body as ImageUploadPayload).type).toBe("brand");
    });

    it("passes type as-is when uppercase — 'Brand' is not lowercased or modified", async () => {
      // The backend distinguishes casing for some paths (e.g. brand vs Brand).
      // The service must never normalise casing.
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      await uploadImage({ imgname: rawBase64, type: "Brand" });

      const [, body] = mockPost.mock.calls[0];
      expect((body as ImageUploadPayload).type).toBe("Brand");
    });

    it("works with all known type values without modification", async () => {
      const knownTypes = ["profile", "agency", "brand", "Brand", "checklist-evidence"];

      for (const type of knownTypes) {
        jest.clearAllMocks();
        mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

        await uploadImage({ imgname: rawBase64, type });

        const [, body] = mockPost.mock.calls[0];
        expect((body as ImageUploadPayload).type).toBe(type);
      }
    });

    it("returns ImageUploadResponse from response.data directly", async () => {
      mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      const result = await uploadImage({ imgname: rawBase64, type: "brand" });

      expect(result).toBe(mockSuccessResponse);
    });

    it("returned object may contain url or image_url — service returns raw object, callers own field access", async () => {
      const responseWithImageUrl: ImageUploadResponse = {
        success: true,
        image_url: "https://cdn.example.com/uploads/profile.png",
      };
      mockPost.mockResolvedValueOnce({ data: responseWithImageUrl });

      const result = await uploadImage({ imgname: rawBase64, type: "profile" });

      expect(result.image_url).toBe("https://cdn.example.com/uploads/profile.png");
      // url may be absent — service does not normalise the field name
      expect(result.url).toBeUndefined();
    });

    it("re-throws when axiosInstance.post rejects", async () => {
      mockPost.mockRejectedValueOnce(new Error("413 Payload Too Large"));

      await expect(
        uploadImage({ imgname: rawBase64, type: "brand" })
      ).rejects.toThrow("413 Payload Too Large");
    });
  });
});
