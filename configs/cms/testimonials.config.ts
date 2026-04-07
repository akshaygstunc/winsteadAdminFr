import { CmsConfig } from "@/lib/cms";

export const testimonialsCmsConfig: any = {
  entity: "testimonials",
  title: "Testimonials",
  subtitle: "Manage client testimonials, ratings, and feedback",
  addLabel: "Add Testimonial",
  searchPlaceholder: "Search testimonials...",

  groups: [
    { key: "basic", label: "Basic Information", column: "left" },
    { key: "content", label: "Content", column: "left" },
    { key: "media", label: "Media", column: "left" },

    { key: "settings", label: "Settings", column: "right" },
    { key: "meta", label: "Meta", column: "right" },
  ],

  fields: [
    // ---------------- BASIC ----------------
    {
      key: "title",
      label: "Internal Title",
      type: "text",
      group: "basic",
      required: true,
      note: "Used internally in CMS",
    },
    {
      key: "slug",
      label: "Slug",
      type: "text",
      group: "basic",
      note: "Auto-generated from title",
    },
    {
      key: "name",
      label: "Client Name",
      type: "text",
      group: "basic",
      required: true,
    },
    {
      key: "designation",
      label: "Designation",
      type: "text",
      group: "basic",
    },
    {
      key: "company",
      label: "Company",
      type: "text",
      group: "basic",
    },

    // ---------------- CONTENT ----------------
    {
      key: "quote",
      label: "Testimonial Quote",
      type: "textarea",
      group: "content",
      required: true,
      note: "Main testimonial text",
    },

    // ---------------- MEDIA ----------------
    {
      key: "image",
      label: "Client Image",
      type: "image",
      group: "media",
    },

    // ---------------- SETTINGS ----------------
    {
      key: "rating",
      label: "Rating",
      type: "number",
      group: "settings",
      note: "Value between 1 to 5",
      defaultValue: 5,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      group: "settings",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
    {
      key: "sortOrder",
      label: "Sort Order",
      type: "number",
      group: "settings",
      defaultValue: 0,
    },
    {
      key: "isFeatured",
      label: "Featured",
      type: "boolean",
      group: "settings",
      defaultValue: false,
    },

    // ---------------- META ----------------
    {
      key: "data",
      label: "Extra JSON Data",
      type: "textarea",
      group: "meta",
      note: "Optional additional metadata",
    },
  ],
};
