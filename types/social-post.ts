export enum SocialPlatform {
  INSTAGRAM = "instagram",
  LINKEDIN = "linkedin",
  FACEBOOK = "facebook",
  YOUTUBE = "youtube",
  X = "x",
}

export enum SocialMediaType {
  IMAGE = "image",
  VIDEO = "video",
  CAROUSEL = "carousel",
  EMBED = "embed",
}

export interface SocialPost {
  _id: string;
  platform: SocialPlatform;
  mediaType: SocialMediaType;
  thumbnail: string | null;
  mediaUrl: string | null;
  caption: string | null;
  postLink: string | null;
  handle: string | null;
  publishDate: string | null;
  isFeatured: boolean;
  status: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSocialPostDto {
  platform: SocialPlatform;
  mediaType: SocialMediaType;
  thumbnail?: string | null;
  mediaUrl?: string | null;
  caption?: string | null;
  postLink?: string | null;
  handle?: string | null;
  publishDate?: string | null;
  isFeatured?: boolean;
  status?: boolean;
  displayOrder?: number;
}

export type UpdateSocialPostDto = Partial<CreateSocialPostDto>
