/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageContent, PageKey } from "@/types/pageContent";
import instance from "@/utils/axios";
import { getProjects } from "./projects.service";


export async function getPageContentByKey(pageKey: PageKey): Promise<any> {
  try {
    const res = await instance.get(`/page-contents/${pageKey}`);
    console.log("Page content response:", res.data.data);
    return res?.data?.data;
  } catch (error) {
    console.error(`Failed to load page content for ${pageKey}`, error);
    return null;
  }
}

export async function savePageContent(payload: PageContent): Promise<any> {
  try {
    const res = await instance.post("page-contents", payload);
    return res.data;
  } catch (e) {
    return e;
  }
}

export async function getSourceItems(
  entity: string,
): Promise<{ label: string; value: string }[]> {
  try {
    switch (entity) {
      case "projects":
        const res = await getProjects();
        console.log(res?.data);
        const projects = res?.data.map((project: any) => {
          return {
            label: project.name,
            value: project._id,
          };
        });
        return projects || [];
      case "testimonials":
        return [];
      case "social-posts":
        return [];
      case "team":
        return [];
      case "blogs":
        return [];
      default:
        return [];
    }
  } catch (error) {
    console.error(`Failed to load source items for ${entity}`, error);
    return [];
  }
}

/**
 * Update this endpoint as per your backend upload API.
 * Example supported endpoints:
 * POST /upload
 * POST /upload/image
 * POST /media/upload
 */
export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await instance.post("page-contents/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // if (!res.ok) {
  //   throw new Error(res?.data?.message || "Failed to upload image");
  // }

  return (
    res?.data?.url ||
    res?.data?.data?.url ||
    res?.data?.fileUrl ||
    res?.data?.data?.fileUrl ||
    res?.data?.location ||
    ""
  );
}
