import { axiosInstance } from "@/configs/axios";
import type {
  BrandWithStats,
  Brand,
  BrandMutationResponse,
  DeleteBrandResponse,
  AddBrandPayload,
  EditBrandPayload,
} from "@/types/api";

export const getBrands = async (
  userId: string | number
): Promise<BrandWithStats[]> => {
  try {
    const response = await axiosInstance.get<BrandWithStats[]>(
      "/api/brands",
      { params: { user_id: userId } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBrand = async (
  brandId: string | number
): Promise<Brand> => {
  try {
    const response = await axiosInstance.get<Brand>(
      `/api/brand/${brandId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addBrand = async (
  payload: AddBrandPayload
): Promise<BrandMutationResponse> => {
  try {
    const response = await axiosInstance.post<BrandMutationResponse>(
      "/api/brand",
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editBrand = async (
  payload: EditBrandPayload
): Promise<BrandMutationResponse> => {
  try {
    const response = await axiosInstance.put<BrandMutationResponse>(
      `/api/brand/${payload.brand_id}`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBrand = async (
  brandId: string | number
): Promise<DeleteBrandResponse> => {
  try {
    const response = await axiosInstance.delete<DeleteBrandResponse>(
      `/api/brand/${brandId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
