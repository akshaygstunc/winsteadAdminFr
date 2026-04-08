import { CmsConfig } from "@/lib/cms";

export const projectsCmsConfig: CmsConfig = {
  entity: "projects",
  title: "Projects",
  layout: "editor",
  subtitle: "Manage real estate project listings and detail page content",
  addLabel: "Add Project",
  searchPlaceholder: "Search projects...",
  groups: [
    { key: "basic", label: "Basic Information", column: "left" },
    { key: "hero", label: "Hero Section", column: "left" },
    { key: "specs", label: "Project Specifications", column: "left" },
    { key: "overview", label: "Overview Section", column: "left" },
    { key: "floorPlans", label: "Floor Plans", column: "left" },
    { key: "amenities", label: "Amenities", column: "left" },
    { key: "gallery", label: "Gallery", column: "left" },
    { key: "cta", label: "CTA Section", column: "left" },
    { key: "seo", label: "SEO", column: "right" },
    { key: "settings", label: "Settings", column: "right" },
  ],
  fields: [
    {
      key: "title",
      label: "Project Title",
      type: "text",
      group: "basic",
      column: "left",
      required: true,
    },
    {
      key: "slug",
      label: "Slug",
      type: "text",
      group: "basic",
      column: "left",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      group: "settings",
      column: "right",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
    {
      key: "signatureLabel",
      label: "Signature Label",
      type: "text",
      group: "basic",
      column: "left",
      placeholder: "Signature Residence",
    },

    /**
     * Dynamic API driven fields
     */
    {
      key: "propertyType",
      label: "Property Type",
      type: "relation-select",
      group: "basic",
      column: "left",
      relation: {
        entity: "content/property-types",
        labelKey: "name",
        valueKey: "_id",
      },
    },
    {
      key: "propertySubType",
      label: "Property Sub Type",
      type: "relation-select",
      group: "basic",
      column: "left",
      relation: {
        entity: "property-sub-types",
        labelKey: "name",
        valueKey: "_id",
      },
    },
    {
      key: "propertyCategories",
      label: "Property Categories",
      type: "relation-multiselect",
      group: "basic",
      column: "left",
      relation: {
        entity: "property-categories",
        labelKey: "name",
        valueKey: "_id",
      },
    },
    {
      key: "developer",
      label: "Developer",
      type: "relation-select",
      group: "basic",
      column: "left",
      relation: {
        entity: "content/developer-community",
        labelKey: "name",
        valueKey: "_id",
      },
    },

    {
      key: "image",
      label: "Hero Image",
      type: "image",
      group: "hero",
      column: "left",
    },
    {
      key: "propertyBanner",
      label: "Property Banner",
      type: "image",
      group: "hero",
      column: "left",
    },
    {
      key: "locationLabel",
      label: "Location",
      type: "text",
      group: "hero",
      column: "left",
      placeholder: "Downtown Dubai, Dubai",
    },
    {
      key: "shortDescription",
      label: "Hero Description",
      type: "textarea",
      group: "hero",
      column: "left",
    },
    {
      key: "startingPrice",
      label: "Starting Price",
      type: "text",
      group: "specs",
      column: "left",
      placeholder: "From AED 2.3M",
  },
    {
      key: "sizeRange",
      label: "Size Range",
      type: "text",
      group: "specs",
      column: "left",
      placeholder: "750 – 4,500 sq.ft.",
    },
    {
      key: "community",
      label: "Community / Area",
      type: "text",
      group: "specs",
      column: "left",
      placeholder: "Downtown Dubai",
    },
    {
      key: "handover",
      label: "Handover",
      type: "text",
      group: "specs",
      column: "left",
      placeholder: "Q4 2029",
    },

    /**
     * Overview
     */
    {
      key: "overviewHeading",
      label: "Overview Heading",
      type: "text",
      group: "overview",
      column: "left",
      defaultValue: "Project Overview",
    },
    {
      key: "overviewTitle",
      label: "Overview Title",
      type: "text",
      group: "overview",
      column: "left",
    },
    {
      key: "description",
      label: "Overview Description",
      type: "textarea",
      group: "overview",
      column: "left",
    },
    {
      key: "overviewPoints",
      label: "Overview Bullet Points",
      type: "repeater",
      group: "overview",
      column: "left",
      fields: [{ key: "text", label: "Point", type: "text" }],
    },
    {
      key: "highlightCards",
      label: "Highlight Cards",
      type: "repeater",
      group: "overview",
      column: "left",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
      ],
    },

    /**
     * Floor Plans
     */
    {
      key: "floorPlansHeading",
      label: "Floor Plans Heading",
      type: "text",
      group: "floorPlans",
      column: "left",
      defaultValue: "Floor Plans",
    },
    {
      key: "floorPlansDescription",
      label: "Floor Plans Description",
      type: "textarea",
      group: "floorPlans",
      column: "left",
    },
    {
      key: "floorPlans",
      label: "Floor Plans",
      type: "repeater",
      group: "floorPlans",
      column: "left",
      fields: [
        { key: "unitType", label: "Unit Type", type: "text" },
        { key: "title", label: "Plan Title", type: "text" },
        { key: "size", label: "Size", type: "text" },
        { key: "startingPrice", label: "Starting Price", type: "text" },
        { key: "image", label: "Floor Plan Image", type: "image" },
        { key: "alt", label: "Image Alt Text", type: "text" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
      ],
    },

    /**
     * Amenities
     */
    {
      key: "amenitiesHeading",
      label: "Amenities Heading",
      type: "text",
      group: "amenities",
      column: "left",
      defaultValue: "Amenities",
    },
    {
      key: "amenitiesDescription",
      label: "Amenities Description",
      type: "textarea",
      group: "amenities",
      column: "left",
    },
    {
      key: "amenities",
      label: "Amenities List",
      type: "repeater",
      group: "amenities",
      column: "left",
      fields: [
        { key: "icon", label: "Amenity Icon", type: "image" },
        { key: "title", label: "Amenity Title", type: "text" },
        { key: "description", label: "Amenity Description", type: "textarea" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
      ],
    },

    /**
     * Gallery
     */
    {
      key: "galleryHeading",
      label: "Gallery Heading",
      type: "text",
      group: "gallery",
      column: "left",
      defaultValue: "Gallery",
    },
    {
      key: "gallery",
      label: "Gallery Images",
      type: "repeater",
      group: "gallery",
      column: "left",
      fields: [
        { key: "image", label: "Image", type: "image" },
        { key: "alt", label: "Alt Text", type: "text" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
      ],
    },

    /**
     * CTA
     */
    {
      key: "ctaTitle",
      label: "CTA Title",
      type: "text",
      group: "cta",
      column: "left",
      defaultValue:
        "Let’s help you evaluate the right opportunity with more clarity",
    },
    {
      key: "ctaDescription",
      label: "CTA Description",
      type: "textarea",
      group: "cta",
      column: "left",
      defaultValue:
        "Speak with our team for brochure access, floor plans, pricing, availability, and personalized project guidance.",
    },
    {
      key: "primaryButtonLabel",
      label: "Primary Button Label",
      type: "text",
      group: "cta",
      column: "left",
      defaultValue: "Request Brochure",
    },
    {
      key: "secondaryButtonLabel",
      label: "Secondary Button Label",
      type: "text",
      group: "cta",
      column: "left",
      defaultValue: "Book Consultation",
    },

    /**
     * SEO
     */
    {
      key: "metaTitle",
      label: "Meta Title",
      type: "text",
      group: "seo",
      column: "right",
    },
    {
      key: "metaDescription",
      label: "Meta Description",
      type: "textarea",
      group: "seo",
      column: "right",
    },

    /**
     * Settings
     */
    {
      key: "sortOrder",
      label: "Sort Order",
      type: "number",
      group: "settings",
      column: "right",
      defaultValue: 0,
    },
  ],
};
