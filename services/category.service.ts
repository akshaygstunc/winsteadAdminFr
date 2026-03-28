import instance from "@/utils/axios";
import axios from "@/utils/axios";

const BASE_URL = "/categories";

// ✅ GET ALL CATEGORIES
export const getCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}) => {
  console.log("Fetching categories with params:", params);
  const res = await instance.get("categories", { params });
  return res.data;
};

// ✅ CREATE CATEGORY
export const createCategory = async (data: {
  name: string;
  type: string;
  badgeColor: string;
  displayOrder?: number;
  status?: string;
}) => {
  const res = await instance.post("categories", data);
  return res.data;
};

// ✅ UPDATE CATEGORY
export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    type?: string;
    badgeColor?: string;
    displayOrder?: number;
    status?: string;
  },
) => {
  const res = await instance.patch(`categories/${id}`, data);
  return res.data;
};

// ✅ DELETE CATEGORY
export const deleteCategory = async (id: string) => {
  const res = await instance.delete(`${BASE_URL}/${id}`);
  return res.data;
};

// ✅ GET DROPDOWN LIST
export const getCategoryDropdown = async (params?: { type?: string }) => {
  const res = await instance.get(`${BASE_URL}/dropdown/list`, { params });
  return res.data;
};
