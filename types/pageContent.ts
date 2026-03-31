export type PageKey =
  | "home"
  | "about-us"
  | "projects"
  | "our-services"
  | "our-team"
  | "news-media";

export interface SeoData {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  ogImage?: string | null;
}

export interface PageOption {
  key: PageKey;
  name: string;
  slug: string;
}

export type CMSFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "image"
  | "select"
  | "multiselect"
  | "json";

export interface CMSFieldOption {
  label: string;
  value: string;
}

export interface CMSField {
  id: string;
  key: string;
  label: string;
  type: CMSFieldType;
  value: any;
  placeholder?: string;
  options?: CMSFieldOption[];
}

export type CMSSectionSourceMode = "manual" | "latest" | "filter";

export type CMSSectionSourceEntity =
  | "projects"
  | "testimonials"
  | "social-posts"
  | "team"
  | "blogs";

export interface CMSSectionSource {
  entity?: CMSSectionSourceEntity;
  mode?: CMSSectionSourceMode;
  selectedIds?: string[];
  limit?: number;
  filters?: Record<string, any>;
}

export interface CMSSection {
  id: string;
  type: string;
  name: string;
  order: number;
  enabled: boolean;
  fields: CMSField[];
  source?: CMSSectionSource;
  config?: Record<string, any>;
}

export interface PageContent {
  _id?: string;
  pageKey: PageKey;
  pageName: string;
  slug: string;
  status: boolean;
  sections: CMSSection[];
  seo: SeoData;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionDefinition {
  type: string;
  label: string;
  description?: string;
  supportsSource?: boolean;
  sourceEntity?: CMSSectionSourceEntity;
  defaultFields: Omit<CMSField, "id">[];
  defaultConfig?: Record<string, any>;
  allowedExtraFields?: boolean;
}
