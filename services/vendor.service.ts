/* eslint-disable @typescript-eslint/no-explicit-any */

import instance from "@/utils/axios";

export interface VendorPayload {
  name: string;
  slug: string;
  logo?: string | null;
  bannerImage?: string | null;
  description?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  categoryId?: string | null;
  isFeatured?: boolean;
  status?: "active" | "inactive";
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
}

export const getVendors = async (params?: Record<string, any>) => {
  const res = await instance.get("/vendors", { params });
  return res.data;
};

export const getVendorById = async (id: string) => {
  const res = await instance.get(`/vendors/${id}`);
  return res.data;
};

export const createVendor = async (payload: VendorPayload) => {
  const res = await instance.post("/vendors", payload);
  return res.data;
};

export const updateVendor = async (id: string, payload: VendorPayload) => {
  const res = await instance.patch(`/vendors/${id}`, payload);
  return res.data;
};

export const deleteVendor = async (id: string) => {
  const res = await instance.delete(`/vendors/${id}`);
  return res.data;
};
