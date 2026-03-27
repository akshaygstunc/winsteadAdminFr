import axios from "@/utils/axios";

const BASE_URL = "/projects";

export const getProjects = async (params?: any) => {
  const res = await axios.get(BASE_URL, { params });
  return res.data;
};

export const getProjectById = async (id: string) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

export const createProject = async (data: any) => {
  const res = await axios.post(BASE_URL, data);
  return res.data;
};

export const updateProject = async (id: string, data: any) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, data);
  return res.data;
};

export const deleteProject = async (id: string) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};

export const getProjectDropdown = async (params?: any) => {
  const res = await axios.get(`${BASE_URL}/dropdown/list`, { params });
  return res.data;
};