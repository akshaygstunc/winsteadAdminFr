import { CmsConfig } from "@/lib/cms";

export const featureIconsCmsConfig: any = {
  entity: "feature-icons",
  title: "Feature Icons",
  subtitle: "Manage feature icons used across property and page sections",
  addLabel: "Add Feature Icon",
  searchPlaceholder: "Search feature icons...",

  groups: [
    {
      key: "basic",
      label: "Basic Information",
      column: "left",
    },
    {
      key: "content",
      label: "Content",
      column: "left",
    },
    {
      key: "settings",
      label: "Settings",
      column: "right",
    },
  ],

  fields: [
    // BASIC
    {
      key: "title",
      label: "Title",
      type: "text",
      group: "basic",
      column: "left",
      required: true,
      note: "Example: Swimming Pool, Gym, Parking",
    },
    {
      key: "slug",
      label: "Slug",
      type: "text",
      group: "basic",
      column: "left",
      note: "Auto-generated if left empty.",
    },
    {
      key: "icon",
      label: "Icon",
      type: "icon",
      group: "basic",
      column: "left",
      required: true,
      note: "Select icon used in frontend.",
    },

    // CONTENT
    {
      key: "description",
      label: "Description",
      type: "textarea",
      group: "content",
      column: "left",
      note: "Optional short explanation for admin use.",
    },

    // SETTINGS
    {
      key: "status",
      label: "Status",
      type: "select",
      group: "settings",
      column: "right",
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      key: "sortOrder",
      label: "Sort Order",
      type: "number",
      group: "settings",
      column: "right",
      defaultValue: 0,
      note: "Lower number appears first.",
    },
  ],
};
