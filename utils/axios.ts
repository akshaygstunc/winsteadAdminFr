import axios from "axios";

export const instance = axios.create({
  baseURL: "https://winsteadglobal.com/api/",
});

instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
console.log(instance.defaults.baseURL);
  return config;
});

export default instance;