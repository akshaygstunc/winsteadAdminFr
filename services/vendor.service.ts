import instance from "@/utils/axios";
import axios from "@/utils/axios";

const BASE_URL = "/vendors";

// ✅ GET ALL
export const getVendors = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  featured?: string;
}) => {
  const res = await axios.get("vendors", { params });
  return res.data;
};

// ✅ CREATE
export const createVendor = async (data: any) => {
  const res = await instance.post("vendors", data);
  return res.data;
};

// ✅ UPDATE
export const updateVendor = async (id: string, data: any) => {
  const res = await instance.patch(`${BASE_URL}/${id}`, data);
  return res.data;
};

// ✅ DELETE
export const deleteVendor = async (id: string) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};