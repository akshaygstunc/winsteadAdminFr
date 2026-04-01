export type BlogStatus = "draft" | "published" | "scheduled";
export type SeoIndexStatus = "index" | "noindex";

export interface BlogSeo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  indexStatus?: SeoIndexStatus;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  tags: string[];
  seo: BlogSeo;
  status: BlogStatus;
  isFeatured: boolean;
  showOnHomepage: boolean;
  enableComments: boolean;
  publishedAt: string | null;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogListResponse {
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  tags: string[];
  seo?: BlogSeo;
  status: BlogStatus;
  isFeatured?: boolean;
  showOnHomepage?: boolean;
  enableComments?: boolean;
  publishedAt?: string;
}
