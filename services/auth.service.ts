import instance from "@/utils/axios";
import axios from "axios";


export const loginAdmin = async (data: { email: string; password: string }) => {
  const res = await instance.post(`auth/login`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const getProfile = async (token: string) => {
  const res = await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
