import instance from "@/utils/axios";
import { Blog, BlogListResponse, BlogPayload } from "../types/blog";

const API_BASE_URL = "http://localhost:4000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

export async function getBlogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tag?: string;
}) {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  if (params?.tag) query.append("tag", params.tag);

  const response = await instance.get(`blogs?${query.toString()}`, {
    method: "GET",
  });

  return response.data;
}

export async function getBlogById(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return handleResponse<Blog>(response);
}

export async function createBlog(payload: BlogPayload) {
  const response = await instance.post("blogs", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function updateBlog(id: string, payload: Partial<BlogPayload>) {
  const response = await instance.patch(`blogs/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function deleteBlog(id: string) {
  const response = await instance.delete(`blogs/${id}`);

  return response.data;
}

export async function updateBlogStatus(
  id: string,
  payload: {
    status: "draft" | "published" | "scheduled";
    publishedAt?: string;
  },
) {
  const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Blog>(response);
}
