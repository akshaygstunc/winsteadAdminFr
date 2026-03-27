import axios from "@/utils/axios";

const BASE_URL = "/inquiries";

// ✅ GET ALL
export const getInquiries = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const res = await axios.get(BASE_URL, { params });
  return res.data;
};

// ✅ GET ONE
export const getInquiryById = async (id: string) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

// ✅ UPDATE
export const updateInquiry = async (
  id: string,
  data: {
    status?: string;
    internalNotes?: string;
  }
) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, data);
  return res.data;
};

// ✅ DELETE
export const deleteInquiry = async (id: string) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};