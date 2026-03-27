import axios from "axios";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "http://localhost:5000/api/upload",
    formData
  );

  return res.data.url; // cloudinary URL
};