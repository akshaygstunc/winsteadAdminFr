import {
  SocialPost,
  CreateSocialPostDto,
  UpdateSocialPostDto,
} from "@/types/social-post";
import instance from "@/utils/axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  const res = await instance.get("/social-posts");

  return res.data;
}

export async function getSocialPostById(id: string): Promise<SocialPost> {
  const res = await instance.get(`/social-posts/${id}`);

  return res.data;
}

export async function createSocialPost(
  payload: CreateSocialPostDto,
): Promise<SocialPost> {
  const res = await instance.post("/social-posts", payload);

  return res.data;
}

export async function updateSocialPost(
  id: string,
  payload: UpdateSocialPostDto,
): Promise<SocialPost> {
  const res = await instance.patch(`/social-posts/${id}`, payload);

  return res.data;
}

export async function deleteSocialPost(
  id: string,
): Promise<{ success: boolean }> {
  const res = await instance.delete(`/social-posts/${id}`);

  return res.data;
}
