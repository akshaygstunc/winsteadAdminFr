import {
  CMSField,
  CMSFieldType,
  CMSSection,
  PageContent,
  PageKey,
  PageOption,
  SectionDefinition,
} from "@/types/pageContent";

export const PAGE_OPTIONS: PageOption[] = [
  { key: "home", name: "Home", slug: "/" },
  { key: "about-us", name: "About Us", slug: "/about-us" },
  { key: "projects", name: "Projects", slug: "/projects" },
  { key: "our-services", name: "Our Services", slug: "/our-services" },
  { key: "our-team", name: "Our Team", slug: "/our-team" },
  { key: "news-media", name: "News & Media", slug: "/news-media" },
];

export const FIELD_TYPE_OPTIONS: { label: string; value: CMSFieldType }[] = [
  { label: "Text", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Image URL", value: "image" },
  { label: "Select", value: "select" },
  { label: "Multi Select", value: "multiselect" },
  { label: "JSON", value: "json" },
];

export const SOURCE_ENTITY_OPTIONS = [
  { label: "Projects", value: "projects" },
  { label: "Testimonials", value: "testimonials" },
  { label: "Social Posts", value: "social-posts" },
  { label: "Team", value: "team" },
  { label: "Blogs / News", value: "blogs" },
];

export const SOURCE_MODE_OPTIONS = [
  { label: "Manual Selection", value: "manual" },
  { label: "Latest Items", value: "latest" },
  { label: "Filter Based", value: "filter" },
];

export const SECTION_DEFINITIONS: Record<string, SectionDefinition> = {
  hero: {
    type: "hero",
    label: "Hero Section",
    description: "Banner, heading, subheading and CTAs",
    supportsSource: false,
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
        placeholder: "Enter main heading",
      },
      {
        key: "subheading",
        label: "Subheading",
        type: "textarea",
        value: "",
        placeholder: "Enter subheading",
      },
      {
        key: "ctaText",
        label: "CTA Text",
        type: "text",
        value: "",
        placeholder: "Enter CTA text",
      },
      {
        key: "ctaLink",
        label: "CTA Link",
        type: "text",
        value: "",
        placeholder: "Enter CTA link",
      },
      {
        key: "bannerImage",
        label: "Banner Image",
        type: "image",
        value: "",
        placeholder: "Paste image URL",
      },
    ],
    defaultConfig: {
      theme: "dark",
      fullWidth: true,
      overlay: true,
    },
  },

  "content-block": {
    type: "content-block",
    label: "Content Block",
    description: "Simple heading, description and CTA content block",
    supportsSource: false,
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
      {
        key: "ctaText",
        label: "CTA Text",
        type: "text",
        value: "",
      },
      {
        key: "ctaLink",
        label: "CTA Link",
        type: "text",
        value: "",
      },
    ],
    defaultConfig: {
      layout: "default",
    },
  },

  "image-content": {
    type: "image-content",
    label: "Image + Content",
    description: "Image and content section",
    supportsSource: false,
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
      {
        key: "image",
        label: "Image",
        type: "image",
        value: "",
      },
      {
        key: "ctaText",
        label: "CTA Text",
        type: "text",
        value: "",
      },
      {
        key: "ctaLink",
        label: "CTA Link",
        type: "text",
        value: "",
      },
    ],
    defaultConfig: {
      imagePosition: "right",
    },
  },

  stats: {
    type: "stats",
    label: "Stats Section",
    description: "Counters or stat cards",
    supportsSource: false,
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "items",
        label: "Stats Items JSON",
        type: "json",
        value: [
          { label: "Projects", value: "120+" },
          { label: "Clients", value: "50+" },
        ],
        placeholder: '[{"label":"Projects","value":"120+"}]',
      },
    ],
    defaultConfig: {
      columns: 4,
    },
  },

  "image-with-cards": {
    type: "image-with-cards",
    label: "Image with Cards",
    description: "Banner/image plus card items",
    supportsSource: false,
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
      {
        key: "image",
        label: "Image",
        type: "image",
        value: "",
      },
      {
        key: "cards",
        label: "Cards JSON",
        type: "json",
        value: [
          { title: "Card 1", description: "Card 1 description" },
          { title: "Card 2", description: "Card 2 description" },
        ],
        placeholder:
          '[{"title":"Card 1","description":"Card description","image":"https://..."}]',
      },
    ],
    defaultConfig: {
      cardsPerRow: 3,
      imagePosition: "left",
    },
  },

  "featured-projects": {
    type: "featured-projects",
    label: "Featured Projects",
    description: "Project cards with manual or dynamic source selection",
    supportsSource: true,
    sourceEntity: "projects",
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
    ],
    defaultConfig: {
      cardsPerRow: 3,
      showCategoryTabs: true,
      showVendorFilter: true,
      showPrice: true,
      showBedrooms: true,
      showArea: true,
    },
  },

  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Manual or latest testimonials section",
    supportsSource: true,
    sourceEntity: "testimonials",
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
    ],
    defaultConfig: {
      layout: "slider",
      itemsPerView: 3,
      showRating: true,
    },
  },

  "social-posts": {
    type: "social-posts",
    label: "Social Posts",
    description: "Display curated social posts",
    supportsSource: true,
    sourceEntity: "social-posts",
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
    ],
    defaultConfig: {
      layout: "grid",
      cardsPerRow: 3,
      showPlatformIcon: true,
      showDate: true,
    },
  },

  "team-grid": {
    type: "team-grid",
    label: "Team Grid",
    description: "Display selected or latest team members",
    supportsSource: true,
    sourceEntity: "team",
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
    ],
    defaultConfig: {
      cardsPerRow: 4,
      showDesignation: true,
      showSocialLinks: true,
    },
  },

  "news-list": {
    type: "news-list",
    label: "News / Blogs",
    description: "Show news or blog cards",
    supportsSource: true,
    sourceEntity: "blogs",
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
    ],
    defaultConfig: {
      cardsPerRow: 3,
      showDate: true,
      showExcerpt: true,
    },
  },

  "cta-banner": {
    type: "cta-banner",
    label: "CTA Banner",
    description: "CTA banner with image and action",
    supportsSource: false,
    allowedExtraFields: true,
    defaultFields: [
      {
        key: "heading",
        label: "Heading",
        type: "text",
        value: "",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        value: "",
      },
      {
        key: "ctaText",
        label: "CTA Text",
        type: "text",
        value: "",
      },
      {
        key: "ctaLink",
        label: "CTA Link",
        type: "text",
        value: "",
      },
      {
        key: "bannerImage",
        label: "Banner Image",
        type: "image",
        value: "",
      },
    ],
    defaultConfig: {
      theme: "dark",
    },
  },
};

export const SECTION_TYPE_OPTIONS = Object.values(SECTION_DEFINITIONS).map(
  (section) => ({
    label: section.label,
    value: section.type,
  }),
);

export const generateId = (prefix: string = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;

export const slugifyKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getDefaultValueByType = (type: CMSFieldType) => {
  switch (type) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "multiselect":
      return [];
    case "json":
      return {};
    default:
      return "";
  }
};

export const createField = (
  field: Omit<CMSField, "id"> & { id?: string },
): CMSField => ({
  ...field,
  id: field.id || generateId("fld"),
});

export const createSectionFromType = (type: string): CMSSection => {
  const definition = SECTION_DEFINITIONS[type];

  if (!definition) {
    return {
      id: generateId("sec"),
      type: "custom",
      name: "Custom Section",
      order: 0,
      enabled: true,
      fields: [],
      source: {
        mode: "manual",
        selectedIds: [],
      },
      config: {},
    };
  }

  return {
    id: generateId("sec"),
    type: definition.type,
    name: definition.label,
    order: 0,
    enabled: true,
    fields: definition.defaultFields.map((field) => createField(field)),
    source: definition.supportsSource
      ? {
          entity: definition.sourceEntity,
          mode: "manual",
          selectedIds: [],
          limit: 6,
          filters: {},
        }
      : undefined,
    config: definition.defaultConfig || {},
  };
};

export const createCustomField = (): CMSField => ({
  id: generateId("fld"),
  key: "",
  label: "",
  type: "text",
  value: "",
  placeholder: "",
});

export const createDefaultPageData = (pageKey: PageKey): PageContent => {
  const pageMeta = PAGE_OPTIONS.find((page) => page.key === pageKey)!;

  return {
    pageKey,
    pageName: pageMeta.name,
    slug: pageMeta.slug,
    status: true,
    sections: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      ogImage: "",
    },
  };
};
