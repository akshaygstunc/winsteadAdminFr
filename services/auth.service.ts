import instance from "@/utils/axios";


export const loginAdmin = async (data: {
  email: string;
  password: string;
}) => {
  const res = await instance.post(`/auth/login`, data);
  return res.data;
};

export const getProfile = async () => {
  const res = await instance.get("/auth/me");
  return res.data;
};
