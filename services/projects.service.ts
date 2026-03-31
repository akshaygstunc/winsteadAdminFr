import instance from "@/utils/axios";
import axios from "@/utils/axios";

const BASE_URL = "/projects";
export const uploadBrochure = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await instance.post(`projects/upload/brochure`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadFloorPlan = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await instance.post(`projects/upload/floor-plan`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadDeveloperLogo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await instance.post(`projects/upload/developer-logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const getProjects = async (params?: any) => {
  const res = await instance.get("projects", { params });
  return res.data;
};

export const getProjectById = async (id: string) => {
  const res = await instance.get(`projects/${id}`);
  return res.data;
};

export const createProject = async (data: any) => {
  try {
    const res = await instance.post("projects", data);
    return res.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
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
