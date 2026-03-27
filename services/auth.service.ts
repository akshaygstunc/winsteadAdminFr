import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export const loginAdmin = async (data: {
  email: string;
  password: string;
}) => {
  const res = await axios.post(`${API_URL}/login`, data, {
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