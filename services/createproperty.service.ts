import axios from "axios";

const API_URL = "http://localhost:5000/api/properties";

// ✅ AXIOS INSTANCE (with token)
const api = axios.create({
  baseURL: API_URL,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or from zustand

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ✅ CREATE PROPERTY (with image support)
export const createProperty = async (data: any) => {
  try {
    let payload;

    // 👉 if file exists → use FormData
    if (data.images) {
      payload = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "images") {
          data.images.forEach((file: File) => {
            payload.append("images", file);
          });
        } else {
          payload.append(key, data[key]);
        }
      });
    } else {
      payload = data;
    }

    const res = await api.post("/", payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (error: any) {
    console.error("Create Property Error:", error.response?.data || error.message);
    throw error;
  }
};


// ✅ GET ALL PROPERTIES
export const getAllProperties = async () => {
  try {
    const res = await api.get("/");
    return res.data;
  } catch (error: any) {
    console.error("Fetch Properties Error:", error.response?.data || error.message);
    throw error;
  }
};


// ✅ GET SINGLE PROPERTY
export const getPropertyById = async (id: string) => {
  try {
    const res = await api.get(`/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Fetch Property Error:", error.response?.data || error.message);
    throw error;
  }
};


// ✅ UPDATE PROPERTY (with optional images)
export const updateProperty = async (id: string, data: any) => {
  try {
    let payload;

    if (data.images) {
      payload = new FormData();

      Object.keys(data).forEach((key) => {
        if (key === "images") {
          data.images.forEach((file: File) => {
            payload.append("images", file);
          });
        } else {
          payload.append(key, data[key]);
        }
      });
    } else {
      payload = data;
    }

    const res = await api.put(`/${id}`, payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (error: any) {
    console.error("Update Property Error:", error.response?.data || error.message);
    throw error;
  }
};


// ✅ DELETE PROPERTY
export const deleteProperty = async (id: string) => {
  try {
    const res = await api.delete(`/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Delete Property Error:", error.response?.data || error.message);
    throw error;
  }
};