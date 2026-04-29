export type CmsFieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "boolean"
  | "image"
  | "date"
  | "video"
  | "multiselect"
  | "icon"
  | "relation-select"
  | "editor"
  | "gallery"
  | "password"
  | "podcast"
  | "faq"
  | "address";

export type CmsField = {
  key: string;
  label: string;
  type: CmsFieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  section?: string;
  note?: string;
  multiple?: boolean;
  accept?: string;
};

export type CmsConfig = {
  title: string;
  subtitle: string;
  entity: string;
  mode?: "collection" | "singleton";
  layout?: "cards" | "editor" | "crm" | "locations";
  addLabel?: string;
  searchPlaceholder?: string;
  fields: CmsField[];
  cardMeta?: string[];
  routeKind?: "default" | "sales" | "clients" | "relationship-manager";
};

export type CmsItem = {
  _id?: string;
  entity?: string;
  title: string;
  subtitle?: string;
  slug?: string;
  status?: string;
  image?: string;
  description?: string;
  sortOrder?: number;
  data?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const boolStatus = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

const textArea: CmsField = {
  key: "description",
  label: "Description",
  type: "editor",
};

const textArea2 = (label = "Content"): CmsField => ({
  key: "description",
  label,
  type: "editor",
});


const DEFAULT_IMAGE_DIMENSION_NOTE =
  "Note: Please upload image in the recommended dimensions/aspect ratio for best quality.";

const DEFAULT_VIDEO_DIMENSION_NOTE =
  "Note: Please upload video in the recommended dimensions/aspect ratio for best quality.";

const withAssetDimensionNote = (
  field: CmsField,
  assetType?: "image" | "video",
  dimensionHint?: string,
): CmsField => {
  const isImage = assetType === "image" || field.type === "image";
  const isVideo = assetType === "video" || field.type === "video";

  if (!isImage && !isVideo) return field;

  const baseNote = field.note?.trim();
  const dimensionNote = dimensionHint
    ? `Note: Recommended ${isImage ? "image" : "video"} dimensions: ${dimensionHint}.`
    : isImage
      ? DEFAULT_IMAGE_DIMENSION_NOTE
      : DEFAULT_VIDEO_DIMENSION_NOTE;

  return {
    ...field,
    note: baseNote ? `${baseNote} ${dimensionNote}` : dimensionNote,
  };
};

export const imageField = (
  label = "Image",
  key = "image",
  dimensionHint = "1920x500",
): CmsField =>
  withAssetDimensionNote(
    {
      key,
      label,
      type: "image",
    },
    "image",
    dimensionHint,
  );

export const videoField = (
  label = "Video",
  key = "videoUrl",
  dimensionHint = "",
): CmsField =>
  withAssetDimensionNote(
    {
      key,
      label,
      type: "video",
    },
    "video",
    dimensionHint,
  );

export const bannerField = (
  label = "Banner Image",
  key = "bannerImage",
  dimensionHint = "1920x500",
): CmsField =>
  withAssetDimensionNote(
    {
      key,
      label,
      type: "image",
    },
    "image",
    dimensionHint,
  );

export const galleryField = (
  label = "Gallery",
  key = "media",
  note = "Upload multiple images and videos for this event.",
): CmsField => ({
  key,
  label,
  type: "gallery",
  multiple: true,
  accept: "image/*,video/*",
  note: `${note} Note: Please ensure uploaded images/videos follow the recommended dimensions/aspect ratio for best quality.`,
});
const searchMeta = (...keys: string[]) => keys;

const collection = (
  title: string,
  entity: string,
  subtitle: string,
  layout?: "cards" | "editor" | "crm" | "locations" | undefined,
  fields: CmsField[],
  cardMeta: string[] = [],
): CmsConfig => ({
  title,
  subtitle,
  layout,
  entity,
  addLabel: `Add ${title.replace(/s$/, "")}`,
  searchPlaceholder: `Search ${title.toLowerCase()}`,
  fields,
  cardMeta,
});

const singleton = (
  title: string,
  entity: string,
  subtitle: string,
  fields: CmsField[],
): CmsConfig => ({
  title,
  subtitle,
  entity,
  mode: "singleton",
  addLabel: `Save ${title}`,
  fields,
});

export const EditorConfigs: Record<string, CmsConfig> = {
  "property-features": collection(
    "Property Features",
    "property-features",
    "Property-linked feature rows with icon, distance, and description.",
    "editor",
    [
      { key: "title", label: "Feature Name", type: "text" },
      {
        key: "subtitle",
        label: "Property Name",
        type: "text",
        note: "Bind this row to the property title.",
      },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      {
        key: "icon",
        label: "Feature Icon",
        type: "icon",
        note: "Use the visual icon picker used in the source screens.",
      },
      { key: "iconName", label: "Feature Label", type: "text" },
      { key: "distance", label: "Distance", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      textArea,
    ],
    searchMeta("iconName", "distance", "sortOrder"),
  ),

  "property-landmarks": collection(
    "Property Landmarks",
    "property-landmarks",
    "Nearby places and landmark distances for each property.",
    [
      { key: "title", label: "Landmark Name", type: "text" },
      { key: "subtitle", label: "Property Name", type: "text" },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      {
        key: "category",
        label: "Category",
        type: "select",
        options: [
          { label: "School", value: "school" },
          { label: "Hospital", value: "hospital" },
          { label: "Mall", value: "mall" },
          { label: "Metro", value: "metro" },
          { label: "Beach", value: "beach" },
        ],
      },
      { key: "distance", label: "Distance", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      textArea,
    ],
    searchMeta("category", "distance", "sortOrder"),
  ),

  "property-faqs": collection(
    "Property FAQs",
    "property-faqs",
    "Property-specific FAQs shown on the listing detail page.",
    [
      { key: "title", label: "Question", type: "text" },
      { key: "subtitle", label: "Property Name", type: "text" },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      textArea,
    ],
    searchMeta("sortOrder", "status"),
  ),

  "property-floor-plans": collection(
    "Property Floor Plans",
    "property-floor-plans",
    "Floor plan cards with image, title, and size meta.",
    [
      { key: "title", label: "Plan Title", type: "text" },
      { key: "subtitle", label: "Property Name", type: "text" },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      {
        key: "unitType",
        label: "Unit Type",
        type: "select",
        options: [
          { label: "Studio", value: "studio" },
          { label: "1 BR", value: "1br" },
          { label: "2 BR", value: "2br" },
          { label: "3 BR", value: "3br" },
          { label: "Penthouse", value: "penthouse" },
        ],
      },
      { key: "sizeLabel", label: "Size Label", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      imageField("Floor Plan Image"),
      textArea,
    ],
    searchMeta("unitType", "sizeLabel", "sortOrder"),
  ),

  "contact-query": collection(
    "Contact Query",
    "contact-query",
    "Website contact enquiries with owner, priority, and response notes.",
    undefined,
    [
      // ✅ CONTACT
      { key: "contact.fullName", label: "Lead Name", type: "text" },
      { key: "contact.email", label: "Email", type: "text" },
      { key: "contact.phone", label: "Phone", type: "text" },
      { key: "contact.location", label: "Contact Location", type: "text" },

      // ✅ INQUIRY
      { key: "query", label: "Query", type: "textarea" },
      { key: "inquiryType", label: "Inquiry Type", type: "text" },

      // ✅ PROPERTY (UPDATED STRUCTURE)
      { key: "property.propertyTitle", label: "Property Title", type: "text" },
      { key: "property.projectName", label: "Project Name", type: "text" },
      { key: "property.location", label: "Property Location", type: "text" },
      { key: "property.unitLabel", label: "Unit", type: "text" },
      { key: "property.configuration", label: "Configuration", type: "text" },
      { key: "property.area", label: "Area", type: "text" },
      { key: "property.price", label: "Price", type: "number" },
      { key: "property.currency", label: "Currency", type: "text" }, // ✅ NEW
      { key: "property.propertyUrl", label: "Property URL", type: "text" },

      // ✅ SOURCE
      { key: "sourcePage", label: "Source Page", type: "text" },
      { key: "referrer", label: "Referrer", type: "text" },

      // ✅ DEVICE (UPDATED)
      { key: "device.deviceType", label: "Device Type", type: "text" },
      { key: "device.os", label: "Operating System", type: "text" },
      { key: "device.browser", label: "Browser", type: "text" },
      { key: "device.browserVersion", label: "Browser Version", type: "text" }, // ✅ NEW
      { key: "device.ipAddress", label: "IP Address", type: "text" },
      { key: "device.userAgent", label: "User Agent", type: "textarea" }, // ✅ NEW (important)

      // ✅ FLAGS (NEW)
      { key: "isAppQuery", label: "From App", type: "toggle" },
      { key: "isDeleted", label: "Deleted", type: "toggle" },

      // ✅ ADMIN
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "New", value: "new" },
          { label: "Open", value: "open" },
          { label: "Resolved", value: "resolved" },
        ],
      },
      { key: "assignedTo", label: "Assigned To", type: "text" },
      { key: "adminNotes", label: "Admin Notes", type: "textarea" },

      // ✅ DATES
      { key: "createdAt", label: "Created At", type: "date" },
      { key: "updatedAt", label: "Updated At", type: "date" },
    ],

    // ✅ SEARCH META FIX (important)
    searchMeta(
      "contact.email",
      "contact.phone",
      "contact.location",
      "property.propertyTitle",
    ),
  ),

  "app-contact-query": collection(
    "App Contact Query",
    "app-contact-query",
    "App contact requests with query type, property, RM, and scheduled time.",
    [
      { key: "title", label: "User Name", type: "text" },
      { key: "subtitle", label: "Issue / Intent", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "New", value: "new" },
          { label: "In Review", value: "review" },
          { label: "Closed", value: "closed" },
        ],
      },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "queryType", label: "Query Type", type: "text" },
      { key: "propertyName", label: "Property", type: "text" },
      { key: "scheduledTime", label: "Scheduled Time", type: "text" },
      { key: "assignedRm", label: "Assigned RM", type: "text" },
      textArea,
    ],
    searchMeta("queryType", "propertyName", "scheduledTime", "assignedRm"),
  ),

  "app-call-request": collection(
    "App Call Request",
    "app-call-request",
    "Callback requests captured from app CTAs.",
    [
      { key: "title", label: "Customer Name", type: "text" },
      { key: "subtitle", label: "Requirement", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Booked", value: "booked" },
          { label: "Done", value: "done" },
        ],
      },
      { key: "phone", label: "Phone", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "preferredTime", label: "Preferred Time", type: "text" },
      { key: "assignedTo", label: "Assigned To", type: "text" },
      { key: "source", label: "Source", type: "text" },
      textArea,
    ],
    searchMeta("phone", "preferredTime", "city", "assignedTo"),
  ),

  "review-request": collection(
    "Review Request",
    "review-request",
    "Review collection and moderation workflow.",
    [
      { key: "title", label: "Reviewer Name", type: "text" },
      { key: "subtitle", label: "Headline", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      { key: "rating", label: "Rating", type: "number" },
      { key: "propertyName", label: "Property", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "assignedTo", label: "Managed By", type: "text" },
      imageField("Avatar / Image"),
      textArea,
    ],
    searchMeta("rating", "propertyName", "city", "assignedTo"),
  ),

  "manage-sales": {
    ...collection(
      "Manage Sales",
      "manage-sales",
      "Sales records with client, unit, value, and owner.",
      [
        { key: "title", label: "Deal Title", type: "text" },
        { key: "subtitle", label: "Stage Summary", type: "text" },
        {
          key: "status",
          label: "Stage",
          type: "select",
          options: [
            { label: "New", value: "new" },
            { label: "Negotiation", value: "negotiation" },
            { label: "Token", value: "token" },
            { label: "Closed", value: "closed" },
          ],
        },
        { key: "clientName", label: "Client Name", type: "text" },
        { key: "unitName", label: "Unit / Property", type: "text" },
        { key: "dealValue", label: "Deal Value", type: "number" },
        { key: "owner", label: "Sales Owner", type: "text" },
        { key: "followUpDate", label: "Follow-up Date", type: "date" },
        textArea,
      ],
      searchMeta("clientName", "unitName", "dealValue", "owner"),
    ),
    layout: "crm",
    routeKind: "sales",
  },

  "sales-clients": {
    ...collection(
      "Clients",
      "sales-clients",
      "Client records with assigned RM, budget, and relationship notes.",
      [
        { key: "title", label: "Client Name", type: "text" },
        { key: "subtitle", label: "Requirement Summary", type: "text" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Lead", value: "lead" },
            { label: "Active", value: "active" },
            { label: "VIP", value: "vip" },
            { label: "Dormant", value: "dormant" },
          ],
        },
        { key: "email", label: "Email", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "city", label: "City", type: "text" },
        { key: "assignedRm", label: "Relationship Manager", type: "text" },
        { key: "budget", label: "Budget", type: "number" },
        textArea,
      ],
      searchMeta("email", "phone", "city", "assignedRm"),
    ),
    layout: "crm",
    routeKind: "clients",
  },

  "helpdesk-tickets": collection(
    "Helpdesk",
    "helpdesk-tickets",
    "Support ticket management with category, SLA, and notes.",
    [
      { key: "title", label: "Ticket Title", type: "text" },
      { key: "subtitle", label: "Customer / Origin", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "open" },
          { label: "In Progress", value: "in-progress" },
          { label: "Resolved", value: "resolved" },
        ],
      },
      { key: "ticketId", label: "Ticket ID", type: "text" },
      { key: "category", label: "Category", type: "text" },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
        ],
      },
      { key: "assignedTo", label: "Assigned To", type: "text" },
      { key: "sla", label: "SLA", type: "text" },
      textArea,
    ],
    searchMeta("ticketId", "category", "priority", "assignedTo"),
  ),

  "helpdesk-faqs": collection(
    "Helpdesk FAQs",
    "helpdesk-faqs",
    "Support FAQs and answer content.",
    [
      { key: "title", label: "Question", type: "text" },
      { key: "subtitle", label: "FAQ Category", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { key: "audience", label: "Audience", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      textArea,
    ],
    searchMeta("audience", "sortOrder", "status"),
  ),

  explore: {
    ...collection(
      "Explore",
      "explore",
      "Explore cards with image, city, and CTA content.",
      [
        { key: "title", label: "Explore Title", type: "text" },
        { key: "subtitle", label: "Explore Location", type: "text" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: statusOptions,
        },
        { key: "slug", label: "Slug", type: "text" },
        { key: "city", label: "City", type: "text" },
        { key: "metaTitle", label: "Meta Title", type: "text" },
        { key: "metaKeywords", label: "Meta Keywords", type: "text" },
        { key: "metaDescription", label: "Meta Description", type: "text" },
        imageField("Cover Image (1920x500)", "image", "1920x500"),
        textArea,
      ],
      searchMeta("city", "metaTitle", "metaKeywords", "status"),
    ),
    layout: "editor",
  },

  podcast: {
    ...collection(
      "Instagram",
      "podcast",
      "Podcast episodes with audio, description, and metadata.",
      undefined,
      [
        { key: "title", label: "Post Title", type: "text" },

        videoField("Post Media"),

        { key: "description", label: "Description", type: "editor" },
      ],
      searchMeta("host", "episodeNumber", "publishDate", "status"),
    ),
    layout: "editor",
  },

  blogs: {
    ...collection(
      "Blogs",
      "blogs",
      "Blog posts with hero image, category, slug, and SEO fields.",
      undefined,
      [
        { key: "title", label: "Blog Title", type: "text" },
        { key: "slug", label: "Slug URL", type: "text" },
        {
          key: "status",
          label: "Publish",
          type: "select",
          options: statusOptions,
        },
        { key: "videoUrl", label: "Video / YouTube URL", type: "text" },
        { key: "category", label: "Category", type: "text" },
        {
          key: "suggestPropertyType",
          label: "Suggest Property Type",
          type: "text",
        },
        {
          key: "suggestPropertyCategory",
          label: "Suggest Property Category",
          type: "text",
        },
        {
          key: "suggestPropertyDeveloper",
          label: "Suggest Property Developer",
          type: "text",
        },
        { key: "metaTitle", label: "Meta Title", type: "text" },
        { key: "metaKeywords", label: "Meta Keywords", type: "text" },
        { key: "metaDescription", label: "Meta Description", type: "text" },
        imageField("Cover Image", "image", "1260x420"),
        textArea,
      ],
      searchMeta("category", "metaTitle", "metaKeywords", "status"),
    ),
    layout: "editor",
  },

  media: collection(
    "Media",
    "media",
    "Media gallery with type, alt text, and image/video links.",
    "editor",
    [
      { key: "title", label: "Asset Name", type: "text" },
      { key: "subtitle", label: "Short Line", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { key: "mediaType", label: "Media Type", type: "text" },
      { key: "altText", label: "Alt Text", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      imageField("Asset Image", "image", "1260x420"),
      { key: "videoUrl", label: "Video URL", type: "text" },
      textArea,
    ],
    searchMeta("mediaType", "altText", "sortOrder", "status"),
  ),

  pages: {
    ...collection(
      "Pages",
      "pages",

      "Website pages with image, slug, and SEO fields.",
      "editor",
      [
        { key: "title", label: "Page Title", type: "text" },
        { key: "slug", label: "Slug URL", type: "text" },
        {
          key: "status",
          label: "Publish",
          type: "select",
          options: statusOptions,
        },
        imageField("Page Image"),
        { key: "metaTitle", label: "Meta Title", type: "text" },
        { key: "metaKeywords", label: "Meta Keywords", type: "text" },
        { key: "metaDescription", label: "Meta Description", type: "text" },
        textArea,
      ],
      searchMeta("slug", "metaTitle", "metaKeywords", "status"),
    ),
    layout: "editor",
  },

  "relationship-manager": {
    ...collection(
      "Relationship Manager",
      "relationship-manager",
      "RM cards with multi-market specialization and social links.",
      [
        { key: "title", label: "Title", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "email", label: "Email Address", type: "text" },
        {
          key: "languages",
          label: "Languages",
          type: "multiselect",
          options: [
            { label: "English", value: "English" },
            { label: "Arabic", value: "Arabic" },
            { label: "Hindi", value: "Hindi" },
            { label: "Russian", value: "Russian" },
          ],
        },
        {
          key: "locations",
          label: "Locations",
          type: "multiselect",
          options: [
            { label: "Dubai Marina", value: "Dubai Marina" },
            { label: "Downtown", value: "Downtown" },
            { label: "Palm Jumeirah", value: "Palm Jumeirah" },
            { label: "Business Bay", value: "Business Bay" },
          ],
        },
        {
          key: "specialization",
          label: "Specialization",
          type: "multiselect",
          options: [
            { label: "Luxury", value: "Luxury" },
            { label: "Off-plan", value: "Off-plan" },
            { label: "Commercial", value: "Commercial" },
            { label: "Investments", value: "Investments" },
          ],
        },
        {
          key: "image",
          label: "Image (400x550)",
          type: "image",
          note: "Recommended 400x550 px portrait image.",
        },
        { key: "facebook", label: "Facebook", type: "text" },
        { key: "instagram", label: "Instagram", type: "text" },
        { key: "linkedin", label: "LinkedIn", type: "text" },
        { key: "whatsapp", label: "Whatsapp", type: "text" },
        { key: "metaTitle", label: "Meta Title", type: "text" },
        { key: "metaDescription", label: "Meta Description", type: "text" },
        {
          key: "visibleOnWebsite",
          label: "Visible in Website",
          type: "boolean",
        },
        { key: "status", label: "Status", type: "select", options: boolStatus },
        textArea,
      ],
      searchMeta("phone", "email", "languages", "status"),
    ),
    layout: "crm",
    routeKind: "relationship-manager",
  },

  careers: collection(
    "Careers",
    "careers",
    "Open positions with role details and recruitment content.",
    "editor",
    [
      { key: "title", label: "Role Title", type: "text" },
      { key: "subtitle", label: "Role Summary", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Published", value: "published" },
          { label: "Draft", value: "draft" },
        ],
      },
      { key: "department", label: "Department", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "employmentType", label: "Employment Type", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      textArea,
    ],
    searchMeta("department", "location", "employmentType", "status"),
  ),

  banner: collection(
    "Banner",
    "banner",
    "Homepage and app banners with city targeting and portrait media.",
    "editor",
    [
      { key: "title", label: "Title", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      withAssetDimensionNote(
        {
          key: "image",
          label: "Banner Image (440x670)",
          type: "image",
          note: "Recommended 440x670 px portrait image.",
        },
        "image",
        "440x670",
      ),
      withAssetDimensionNote(
        {
          key: "videoUrl",
          label: "Banner Video",
          type: "video",
          note: "Portrait MP4 only.",
        },
        "video",
        "1080x1920",
      ),
      textArea,
    ],
    searchMeta("city", "sortOrder", "status"),
  ),

  testimonials: collection(
    "Testimonials",
    "testimonials",
    "Client testimonials with 512x512 profile image and star rating.",
    [
      { key: "title", label: "Title", type: "text" },
      {
        key: "rating",
        label: "Rating",
        type: "select",
        options: [
          { label: "1 Star", value: "1" },
          { label: "2 Stars", value: "2" },
          { label: "3 Stars", value: "3" },
          { label: "4 Stars", value: "4" },
          { label: "5 Stars", value: "5" },
        ],
      },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      withAssetDimensionNote(
        {
          key: "image",
          label: "Profile Image (512x512)",
          type: "image",
          note: "Square image recommended.",
        },
        "image",
        "512x512",
      ),
      { key: "description", label: "Review", type: "textarea" },
    ],
    searchMeta("rating", "status"),
  ),

  events: collection(
    "Events",
    "events",
    "Manage events with title, description, and multiple images/videos.",
    "editor",
    [
      { key: "title", label: "Event Title", type: "text" },

      { key: "subtitle", label: "Event Subtitle", type: "text" },

      {
        key: "eventDate",
        label: "Event Date",
        type: "date",
      },

      {
        key: "location",
        label: "Location",
        type: "text",
      },

      {
        key: "status",
        label: "Status",
        type: "select",
        options: boolStatus,
      },

      imageField("Cover Image", "coverImage", "1260x420"),

      {
        key: "description",
        label: "Event Description",
        type: "textarea",
      },

      // 🔥 MAIN PART (MULTIPLE MEDIA INSIDE EVENT)
      galleryField(
        "Event Media (Images / Videos)",
        "media",
        "Upload multiple images and videos for this event.",
      ),
    ],
    searchMeta("status", "eventDate", "location"),
  ),
  faq: collection(
    "FAQ",
    "faq",
    "Website FAQ content with ordering and answer blocks.",
    [
      { key: "title", label: "Question", type: "text" },
      { key: "subtitle", label: "Section", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      { key: "description", label: "Answer", type: "textarea" },
    ],
    searchMeta("sortOrder", "status"),
  ),

  "property-types": collection(
    "Property Types",
    "property-types",
    "Top-level property types with icon-based presentation.",
    [
      { key: "title", label: "Title", type: "text" },
      {
        key: "icon",
        label: "Icon",
        type: "icon",
        note: "Pick a display icon for the card.",
      },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      textArea,
    ],
    searchMeta("icon", "status"),
  ),

  "property-sub-types": collection(
    "Property Sub-Types",
    "property-sub-types",
    "Sub-types with meta fields and active switch.",
    [
      { key: "title", label: "Name", type: "text" },
      { key: "metaTitle", label: "Meta Title", type: "text" },
      { key: "metaDescription", label: "Meta Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: boolStatus },
    ],
    searchMeta("metaTitle", "status"),
  ),

  "feature-icons": collection(
    "Feature Icons",
    "feature-icons",
    "Visual feature icon master used inside property feature mapping.",
    [
      { key: "title", label: "Feature Label", type: "text" },
      {
        key: "icon",
        label: "Icon",
        type: "icon",
        note: "Pick a display icon for the card.",
      },
      { key: "group", label: "Group", type: "text" },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      textArea,
    ],
    searchMeta("icon", "group", "status"),
  ),

  locations: {
    ...collection(
      "Locations",
      "locations",
      "City and sub-city hierarchy for search and listing grouping.",
      [
        { key: "title", label: "City Name", type: "text" },
        { key: "city", label: "City", type: "text" },
        // { key: "subCityCount", label: "Sub City Count", type: "number" },
        { key: "status", label: "Status", type: "select", options: boolStatus },
        textArea,
      ],
      searchMeta("city", "subCityCount", "status"),
    ),
    layout: "locations",
  },
  sublocations: {
    ...collection(
      "Sub Locations",
      "sub-locations",
      "City and sub-city hierarchy for search and listing grouping.",
      undefined,
      [
        { key: "title", label: "Sub Location Name", type: "text" },
        // { key: "subCityCount", label: "Sub City Count", type: "number" },
        {
          key: "location",
          label: "Location",
          relation: {
            endpoint: "content/locations",
            labelKey: "title",
            valueKey: "_id",
          },
          type: "relation-select",
        },
        { key: "status", label: "Status", type: "select", options: boolStatus },
        // textArea,
      ],
      // searchMeta("city", "subCityCount", "status"),
    ),
    // layout: "locations",
  },
  "projects-page": singleton(
    "Projects Page",
    "projects-page",
    "Manage Projects page banner content only.",
    [
      {
        key: "bannerTitle",
        label: "Banner Title",
        type: "text",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerSubtitle",
        label: "Banner Subtitle",
        type: "textarea",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerPrimaryButtonText",
        label: "Primary Button Text",
        type: "text",
        group: "banner-section",
        column: "right",
      },
      {
        key: "bannerPrimaryButtonUrl",
        label: "Primary Button URL",
        type: "text",
        group: "banner-section",
        column: "right",
      },
      {
        key: "bannerSecondaryButtonText",
        label: "Secondary Button Text",
        type: "text",
        group: "banner-section",
        column: "right",
      },
      {
        key: "bannerSecondaryButtonUrl",
        label: "Secondary Button URL",
        type: "text",
        group: "banner-section",
        column: "right",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "terms-and-conditions": singleton(
    "Terms and Conditions",
    "terms-and-conditions",
    "Manage Terms and Conditions page content only.",
    [
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      textArea2("content"),

      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "privacy-policy": singleton(
    "Privacy Policy",
    "privacy-policy",
    "Manage Privacy Policy page content only.",
    [
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      textArea2("content"),

      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "contact-page": singleton(
    "Contact Us Page",
    "contact-page",
    "Manage Contact Us page content except inquiry form and footer CTA.",
    [
      // BANNER SECTION
      {
        key: "bannerTitle",
        label: "Banner Title",
        type: "text",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerSubtitle",
        label: "Banner Subtitle",
        type: "textarea",
        group: "banner-section",
        column: "left",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      // GET IN TOUCH SECTION
      {
        key: "getInTouchEyebrow",
        label: "Get In Touch Eyebrow",
        type: "text",
        group: "get-in-touch-section",
        column: "left",
      },
      {
        key: "getInTouchTitle",
        label: "Get In Touch Title",
        type: "text",
        group: "get-in-touch-section",
        column: "left",
      },
      {
        key: "getInTouchDescription",
        label: "Get In Touch Description",
        type: "textarea",
        group: "get-in-touch-section",
        column: "left",
      },

      // HIGHLIGHT POINTS
      {
        key: "highlightPoint1Title",
        label: "Highlight Point 1 Title",
        type: "text",
        group: "highlight-points",
        column: "right",
      },
      {
        key: "highlightPoint1Description",
        label: "Highlight Point 1 Description",
        type: "textarea",
        group: "highlight-points",
        column: "right",
      },
      {
        key: "highlightPoint2Title",
        label: "Highlight Point 2 Title",
        type: "text",
        group: "highlight-points",
        column: "right",
      },
      {
        key: "highlightPoint2Description",
        label: "Highlight Point 2 Description",
        type: "textarea",
        group: "highlight-points",
        column: "right",
      },
      {
        key: "highlightPoint3Title",
        label: "Highlight Point 3 Title",
        type: "text",
        group: "highlight-points",
        column: "right",
      },
      {
        key: "highlightPoint3Description",
        label: "Highlight Point 3 Description",
        type: "textarea",
        group: "highlight-points",
        column: "right",
      },

      // CONTACT INFO SECTION
      {
        key: "phoneTitle",
        label: "Phone Title",
        type: "text",
        group: "contact-info",
        column: "left",
      },
      {
        key: "phoneNumbers",
        label: "Phone Numbers",
        type: "textarea",
        group: "contact-info",
        column: "left",
      },
      {
        key: "emailTitle",
        label: "Email Title",
        type: "text",
        group: "contact-info",
        column: "left",
      },
      {
        key: "emailAddresses",
        label: "Email Addresses",
        type: "textarea",
        group: "contact-info",
        column: "left",
      },
      {
        key: "locationTitle",
        label: "Location Title",
        type: "text",
        group: "contact-info",
        column: "right",
      },
      {
        key: "locationAddresses",
        label: "Location Addresses",
        type: "textarea",
        group: "contact-info",
        column: "right",
      },

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      {
        key: "address",
        label: "Address",
        type: "address",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "gallery-page": singleton(
    "Gallery Page",
    "gallery-page",
    "Manage Gallery page content except gallery items, event tabs, footer, and footer CTA.",
    [
      // BANNER SECTION
      {
        key: "bannerTitle",
        label: "Banner Title",
        type: "text",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerSubtitle",
        label: "Banner Subtitle",
        type: "textarea",
        group: "banner-section",
        column: "left",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      // BREADCRUMB SECTION
      {
        key: "breadcrumbHomeText",
        label: "Breadcrumb Home Text",
        type: "text",
        group: "breadcrumb-section",
        column: "left",
      },
      {
        key: "breadcrumbCurrentText",
        label: "Breadcrumb Current Text",
        type: "text",
        group: "breadcrumb-section",
        column: "right",
      },

      // INTRO SECTION
      {
        key: "introEyebrow",
        label: "Intro Eyebrow",
        type: "text",
        group: "intro-section",
        column: "left",
      },
      {
        key: "introTitle",
        label: "Intro Title",
        type: "text",
        group: "intro-section",
        column: "left",
      },
      {
        key: "introDescription",
        label: "Intro Description",
        type: "textarea",
        group: "intro-section",
        column: "left",
      },

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "developer-page": singleton(
    "Developer Page",
    "developer-page",
    "Manage Developer page banner content only.",
    [
      {
        key: "bannerEyebrow",
        label: "Banner Eyebrow",
        type: "text",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerTitle",
        label: "Banner Title",
        type: "text",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerSubtitle",
        label: "Banner Subtitle",
        type: "textarea",
        group: "banner-section",
        column: "left",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "our-team-page": singleton(
    "Our Team Page",
    "our-team-page",
    "Manage Our Team page content except team members and filter tabs.",
    [
      // HERO / BANNER SECTION
      {
        key: "bannerEyebrow",
        label: "Banner Eyebrow",
        type: "text",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerTitle",
        label: "Banner Title",
        type: "text",
        group: "banner-section",
        column: "left",
      },
      {
        key: "bannerButtonText",
        label: "Banner Button Text",
        type: "text",
        group: "banner-section",
        column: "right",
      },
      {
        key: "bannerButtonUrl",
        label: "Banner Button URL",
        type: "text",
        group: "banner-section",
        column: "right",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      // TEAM INTRO SECTION
      {
        key: "teamIntroTitle",
        label: "Team Intro Title",
        type: "text",
        group: "team-intro-section",
        column: "left",
      },
      {
        key: "teamIntroDescription",
        label: "Team Intro Description",
        type: "textarea",
        group: "team-intro-section",
        column: "left",
      },

      // CONNECT CTA SECTION
      {
        key: "connectEyebrow",
        label: "Connect Section Eyebrow",
        type: "text",
        group: "connect-section",
        column: "left",
      },
      {
        key: "connectTitle",
        label: "Connect Section Title",
        type: "text",
        group: "connect-section",
        column: "left",
      },
      {
        key: "connectDescription",
        label: "Connect Section Description",
        type: "textarea",
        group: "connect-section",
        column: "left",
      },
      {
        key: "connectPrimaryButtonText",
        label: "Connect Primary Button Text",
        type: "text",
        group: "connect-section",
        column: "right",
      },
      {
        key: "connectPrimaryButtonUrl",
        label: "Connect Primary Button URL",
        type: "text",
        group: "connect-section",
        column: "right",
      },
      {
        key: "connectSecondaryButtonText",
        label: "Connect Secondary Button Text",
        type: "text",
        group: "connect-section",
        column: "right",
      },
      {
        key: "connectSecondaryButtonUrl",
        label: "Connect Secondary Button URL",
        type: "text",
        group: "connect-section",
        column: "right",
      },

      // FINAL CTA SECTION
      {
        key: "ctaEyebrow",
        label: "CTA Eyebrow",
        type: "text",
        group: "cta-section",
        column: "left",
      },
      {
        key: "ctaTitle",
        label: "CTA Title",
        type: "text",
        group: "cta-section",
        column: "left",
      },
      {
        key: "ctaSubtitle",
        label: "CTA Subtitle",
        type: "textarea",
        group: "cta-section",
        column: "left",
      },
      {
        key: "ctaPrimaryButtonText",
        label: "CTA Primary Button Text",
        type: "text",
        group: "cta-section",
        column: "right",
      },
      {
        key: "ctaPrimaryButtonUrl",
        label: "CTA Primary Button URL",
        type: "text",
        group: "cta-section",
        column: "right",
      },
      {
        key: "ctaSecondaryButtonText",
        label: "CTA Secondary Button Text",
        type: "text",
        group: "cta-section",
        column: "right",
      },
      {
        key: "ctaSecondaryButtonUrl",
        label: "CTA Secondary Button URL",
        type: "text",
        group: "cta-section",
        column: "right",
      },

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "services-page": singleton(
    "Our Services",
    "services-page",
    "Manage Our Services page content section by section.",
    [
      // HERO SECTION
      {
        key: "heroTitle",
        label: "Hero Title",
        type: "text",
        group: "hero-section",
        column: "left",
      },
      {
        key: "heroSubtitle",
        label: "Hero Subtitle",
        type: "textarea",
        group: "hero-section",
        column: "left",
      },
      imageField("Hero Image", "heroImage", "1260x420"),

      // SERVICES OVERVIEW SECTION
      {
        key: "servicesOverviewTitle",
        label: "Services Overview Title",
        type: "text",
        group: "services-overview",
        column: "left",
      },
      {
        key: "servicesOverviewSubtitle",
        label: "Services Overview Subtitle",
        type: "textarea",
        group: "services-overview",
        column: "left",
      },

      {
        key: "overviewService1Number",
        label: "Overview Service 1 Number",
        type: "text",
        group: "services-overview",
        column: "right",
      },
      {
        key: "overviewService1Title",
        label: "Overview Service 1 Title",
        type: "text",
        group: "services-overview",
        column: "right",
      },
      {
        key: "overviewService1Description",
        label: "Overview Service 1 Description",
        type: "textarea",
        group: "services-overview",
        column: "right",
      },
      imageField(
        "Overview Service 1 Image",
        "overviewService1Image",
        "435x217",
      ),
      {
        key: "overviewService2Number",
        label: "Overview Service 2 Number",
        type: "text",
        group: "services-overview",
        column: "right",
      },
      {
        key: "overviewService2Title",
        label: "Overview Service 2 Title",
        type: "text",
        group: "services-overview",
        column: "right",
      },
      {
        key: "overviewService2Description",
        label: "Overview Service 2 Description",
        type: "textarea",
        group: "services-overview",
        column: "right",
      },
      imageField(
        "Overview Service 2 Image",
        "overviewService2Image",
        "435x217",
      ),
      {
        key: "overviewService3Number",
        label: "Overview Service 3 Number",
        type: "text",
        group: "services-overview",
        column: "right",
      },
      {
        key: "overviewService3Title",
        label: "Overview Service 3 Title",
        type: "text",
        group: "services-overview",
        column: "right",
      },
      {
        key: "overviewService3Description",
        label: "Overview Service 3 Description",
        type: "textarea",
        group: "services-overview",
        column: "right",
      },
      imageField(
        "Overview Service 3 Image",
        "overviewService3Image",
        "435x217",
      ),
      // DETAILED SERVICES SECTION
      {
        key: "detailedServicesTitle",
        label: "Detailed Services Title",
        type: "text",
        group: "detailed-services",
        column: "left",
      },
      {
        key: "detailedServicesSubtitle",
        label: "Detailed Services Subtitle",
        type: "textarea",
        group: "detailed-services",
        column: "left",
      },

      {
        key: "detailedService1Title",
        label: "Detailed Service 1 Title",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService1ShortDescription",
        label: "Detailed Service 1 Short Description",
        type: "textarea",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService1Description",
        label: "Detailed Service 1 Full Description",
        type: "textarea",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService1Point1",
        label: "Detailed Service 1 Point 1",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService1Point2",
        label: "Detailed Service 1 Point 2",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService1Point3",
        label: "Detailed Service 1 Point 3",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      imageField(
        "Detailed Service 1 Image",
        "detailedService1Image",
        "560x520",
      ),
      {
        key: "detailedService2Title",
        label: "Detailed Service 2 Title",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService2ShortDescription",
        label: "Detailed Service 2 Short Description",
        type: "textarea",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService2Description",
        label: "Detailed Service 2 Full Description",
        type: "textarea",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService2Point1",
        label: "Detailed Service 2 Point 1",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService2Point2",
        label: "Detailed Service 2 Point 2",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService2Point3",
        label: "Detailed Service 2 Point 3",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      imageField(
        "Detailed Service 2 Image",
        "detailedService2Image",
        "560x520",
      ),
      {
        key: "detailedService3Title",
        label: "Detailed Service 3 Title",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService3ShortDescription",
        label: "Detailed Service 3 Short Description",
        type: "textarea",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService3Description",
        label: "Detailed Service 3 Full Description",
        type: "textarea",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService3Point1",
        label: "Detailed Service 3 Point 1",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService3Point2",
        label: "Detailed Service 3 Point 2",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      {
        key: "detailedService3Point3",
        label: "Detailed Service 3 Point 3",
        type: "text",
        group: "detailed-services",
        column: "right",
      },
      imageField(
        "Detailed Service 3 Image",
        "detailedService3Image",
        "560x520",
      ),
      // HOW IT WORKS SECTION
      {
        key: "howItWorksTitle",
        label: "How It Works Title",
        type: "text",
        group: "how-it-works",
        column: "left",
      },
      {
        key: "howItWorksSubtitle",
        label: "How It Works Subtitle",
        type: "textarea",
        group: "how-it-works",
        column: "left",
      },
      imageField("How It Works Image", "howItWorksImage", "530x650"),
      {
        key: "howItWorksStep1Number",
        label: "How It Works Step 1 Number",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep1Title",
        label: "How It Works Step 1 Title",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep1Description",
        label: "How It Works Step 1 Description",
        type: "textarea",
        group: "how-it-works",
        column: "right",
      },

      {
        key: "howItWorksStep2Number",
        label: "How It Works Step 2 Number",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep2Title",
        label: "How It Works Step 2 Title",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep2Description",
        label: "How It Works Step 2 Description",
        type: "textarea",
        group: "how-it-works",
        column: "right",
      },

      {
        key: "howItWorksStep3Number",
        label: "How It Works Step 3 Number",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep3Title",
        label: "How It Works Step 3 Title",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep3Description",
        label: "How It Works Step 3 Description",
        type: "textarea",
        group: "how-it-works",
        column: "right",
      },

      {
        key: "howItWorksStep4Number",
        label: "How It Works Step 4 Number",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep4Title",
        label: "How It Works Step 4 Title",
        type: "text",
        group: "how-it-works",
        column: "right",
      },
      {
        key: "howItWorksStep4Description",
        label: "How It Works Step 4 Description",
        type: "textarea",
        group: "how-it-works",
        column: "right",
      },

      // WHY CHOOSE WINSTEAD SECTION
      {
        key: "whyChooseWinsteadTitle",
        label: "Why Choose Winstead Title",
        type: "text",
        group: "why-choose-winstead",
        column: "left",
      },
      {
        key: "whyChooseWinsteadSubtitle",
        label: "Why Choose Winstead Subtitle",
        type: "textarea",
        group: "why-choose-winstead",
        column: "left",
      },
      imageField(
        "Why Choose Winstead Image",
        "whyChooseWinsteadImage",
        "600x459",
      ),
      {
        key: "whyChooseWinsteadPoint1",
        label: "Why Choose Winstead Point 1",
        type: "text",
        group: "why-choose-winstead",
        column: "right",
      },
      {
        key: "whyChooseWinsteadPoint2",
        label: "Why Choose Winstead Point 2",
        type: "text",
        group: "why-choose-winstead",
        column: "right",
      },
      {
        key: "whyChooseWinsteadPoint3",
        label: "Why Choose Winstead Point 3",
        type: "text",
        group: "why-choose-winstead",
        column: "right",
      },
      {
        key: "whyChooseWinsteadPoint4",
        label: "Why Choose Winstead Point 4",
        type: "text",
        group: "why-choose-winstead",
        column: "right",
      },

      // CTA SECTION
      {
        key: "ctaTitle",
        label: "CTA Title",
        type: "text",
        group: "cta-section",
        column: "left",
      },
      {
        key: "ctaSubtitle",
        label: "CTA Subtitle",
        type: "textarea",
        group: "cta-section",
        column: "left",
      },
      {
        key: "ctaButtonText",
        label: "CTA Button Text",
        type: "text",
        group: "cta-section",
        column: "right",
      },
      {
        key: "ctaButtonUrl",
        label: "CTA Button URL",
        type: "text",
        group: "cta-section",
        column: "right",
      },

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  "home-page": singleton(
    "Home Page",
    "home-page",
    "Manage home page content section by section.",
    [
      // HERO SECTION
      {
        key: "heroTitle",
        label: "Hero Title",
        type: "text",
        group: "hero-section",
        column: "left",
      },
      {
        key: "heroSubtitle",
        label: "Hero Subtitle",
        type: "textarea",
        group: "hero-section",
        column: "left",
      },
      {
        key: "heroBackgroundImage",
        label: "Hero Background Image",
        type: "video",
        group: "hero-section",
        column: "right",
      },
      {
        key: "heroMobileImage",
        label: "Hero Mobile Image",
        type: "video",
        group: "hero-section",
        column: "right",
      },
      {
        key: "heroVideo",
        label: "Hero Background Video",
        type: "video",
        group: "hero-section",
        column: "right",
      },

      // ABOUT WINSTEAD SECTION
      {
        key: "aboutWinsteadTitle",
        label: "About Winstead Title",
        type: "text",
        group: "about-winstead",
        column: "left",
      },
      {
        key: "aboutWinsteadSubtitle",
        label: "About Winstead Subtitle",
        type: "textarea",
        group: "about-winstead",
        column: "left",
      },
      {
        key: "aboutWinsteadDescription",
        label: "About Winstead Description",
        type: "textarea",
        group: "about-winstead-section",
        column: "left",
      },
      {
        key: "aboutWinsteadImage",
        label: "About Winstead Image",
        type: "image",
        group: "about-winstead",
        column: "right",
      },
      {
        key: "aboutWinsteadButtonText",
        label: "About Winstead Button Text",
        type: "text",
        group: "about-winstead",
        column: "right",
      },
      {
        key: "aboutWinsteadButtonUrl",
        label: "About Winstead Button URL",
        type: "text",
        group: "about-winstead",
        column: "right",
      },

      // STATS SECTION
      {
        key: "statsSectionTitle",
        label: "Stats Section Title",
        type: "text",
        group: "stats-section",
        column: "left",
      },
      {
        key: "satisfiedCustomersCount",
        label: "Satisfied Customers Count",
        type: "number",
        group: "stats-section",
        column: "left",
      },
      {
        key: "propertyListedCount",
        label: "Property Listed Count",
        type: "number",
        group: "stats-section",
        column: "left",
      },
      {
        key: "premiumDevelopersCount",
        label: "Premium Developers Count",
        type: "number",
        group: "stats-section",
        column: "right",
      },
      {
        key: "locationsCount",
        label: "Locations Count",
        type: "number",
        group: "stats-section",
        column: "right",
      },

      // SOCIAL SECTION
      {
        key: "socialSectionTitle",
        label: "Social Section Title",
        type: "text",
        group: "social-section",
        column: "left",
      },
      {
        key: "socialHandle",
        label: "Social Handle",
        type: "text",
        group: "social-section",
        column: "left",
      },
      {
        key: "socialButtonText",
        label: "Social Button Text",
        type: "text",
        group: "social-section",
        column: "right",
      },
      {
        key: "socialButtonUrl",
        label: "Social Button URL",
        type: "text",
        group: "social-section",
        column: "right",
      },

      // LUXURY CONCIERGE CTA SECTION
      {
        key: "ctaTitle",
        label: "CTA Title",
        type: "text",
        group: "cta-section",
        column: "left",
      },
      {
        key: "ctaSubtitle",
        label: "CTA Subtitle",
        type: "textarea",
        group: "cta-section",
        column: "left",
      },
      {
        key: "ctaPrimaryButtonText",
        label: "CTA Primary Button Text",
        type: "text",
        group: "cta-section",
        column: "right",
      },
      {
        key: "ctaPrimaryButtonUrl",
        label: "CTA Primary Button URL",
        type: "text",
        group: "cta-section",
        column: "right",
      },

      // FOOTER BRAND SECTION
      {
        key: "footerLogo",
        label: "Footer Logo",
        type: "image",
        group: "footer-brand",
        column: "left",
      },
      {
        key: "footerBrandText",
        label: "Footer Brand Text",
        type: "textarea",
        group: "footer-brand",
        column: "left",
      },

      // CONTACT SECTION
      {
        key: "contactAddress",
        label: "Contact Address",
        type: "textarea",
        group: "contact-section",
        column: "left",
      },
      {
        key: "contactPhone",
        label: "Contact Phone",
        type: "text",
        group: "contact-section",
        column: "left",
      },
      {
        key: "contactEmail",
        label: "Contact Email",
        type: "text",
        group: "contact-section",
        column: "right",
      },
      {
        key: "workingHours",
        label: "Working Hours",
        type: "text",
        group: "contact-section",
        column: "right",
      },

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),
  awards: collection(
    "Awards",
    "awards",
    "Recognition entries with image, transparent image, video, and career toggle.",
    "editor",
    [
      { key: "title", label: "Award Title", type: "text" },
      { key: "awardYear", label: "Year", type: "number" },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      {
        key: "image",
        label: "Image (500x400)",
        type: "image",
        note: "Recommended 500x400 px image.",
      },
      {
        key: "transparentImage",
        label: "Transparent Image",
        type: "image",
        note: "Use transparent PNG or WEBP.",
      },
      { key: "videoUrl", label: "Video", type: "video", note: "MP4 only." },
      { key: "careerPage", label: "Use for Career Page", type: "boolean" },
      textArea,
    ],
    searchMeta("awardYear", "careerPage", "status"),
  ),

  advertisements: collection(
    "Advertisements",
    "advertisements",
    "Promo banners and ad slots with placement and CTA metadata.",
    [
      { key: "title", label: "Ad Title", type: "text" },
      { key: "placement", label: "Placement", type: "text" },
      { key: "ctaLabel", label: "CTA Label", type: "text" },
      { key: "ctaLink", label: "CTA Link", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      imageField("Ad Image"),
      textArea,
    ],
    searchMeta("placement", "ctaLabel", "sortOrder", "status"),
  ),

  "app-customization": singleton(
    "App Customization",
    "app-customization",
    "App-level branding and configuration fields.",
    [
      { key: "title", label: "App Name", type: "text" },
      { key: "subtitle", label: "Primary Tagline", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { key: "primaryColor", label: "Primary Color", type: "text" },
      { key: "secondaryColor", label: "Secondary Color", type: "text" },
      imageField("App Icon / Splash Image"),
      textArea,
    ],
  ),

  "about-page": singleton(
    "About Us",
    "about-page",
    "Manage About Us page exactly as per the designed sections.",
    [
      // HERO BANNER
      {
        key: "bannerTitle",
        label: "Banner Title",
        type: "text",
        group: "hero-banner",
        column: "left",
      },
      {
        key: "bannerSubtitle",
        label: "Banner Subtitle",
        type: "textarea",
        group: "hero-banner",
        column: "left",
      },
      imageField("Banner Image", "bannerImage", "1260x420"),

      // ABOUT WINSTEAD SECTION
      {
        key: "aboutWinsteadTitle",
        label: "About Winstead Title",
        type: "text",
        group: "about-winstead-section",
        column: "left",
      },
      {
        key: "aboutWinsteadDescription",
        label: "About Winstead Description",
        type: "textarea",
        group: "about-winstead-section",
        column: "left",
      },
      // {
      //   key: "aboutWinsteadImage",
      //   label: "About Winstead Image",
      //   type: "image",
      //   group: "about-winstead-section",
      //   column: "right",
      // },
      imageField("About Winstead Image", "aboutWinsteadImage", "350x300"),
      // INTRO STORY SECTION (NEW PREMIUM SECTION)
      {
        key: "introTitle",
        label: "Intro Title",
        type: "text",
        group: "intro-section",
        column: "right",
      },

      {
        key: "introDescription",
        label: "Intro Description",
        type: "textarea",
        group: "intro-section",
        column: "right",
      },

      imageField("Intro Image", "introImage", "550x400"),
      // STATS SECTION
      {
        key: "statsTitle",
        label: "Stats Title",
        type: "text",
        group: "stats-section",
        column: "left",
      },
      {
        key: "statsSubtitle",
        label: "Stats Subtitle",
        type: "textarea",
        group: "stats-section",
        column: "left",
      },
      {
        key: "stat1Number",
        label: "Stat 1 Number",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      {
        key: "stat1Label",
        label: "Stat 1 Label",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      {
        key: "stat2Number",
        label: "Stat 2 Number",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      {
        key: "stat2Label",
        label: "Stat 2 Label",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      {
        key: "stat3Number",
        label: "Stat 3 Number",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      {
        key: "stat3Label",
        label: "Stat 3 Label",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      {
        key: "stat4Number",
        label: "Stat 4 Number",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      {
        key: "stat4Label",
        label: "Stat 4 Label",
        type: "text",
        group: "stats-section",
        column: "right",
      },
      imageField("Stats Image", "statsImage", "500x520"),
      // CEO MESSAGE SECTION
      {
        key: "ceoMessageTitle",
        label: "CEO Message Title",
        type: "text",
        group: "ceo-message-section",
        column: "left",
      },
      {
        key: "ceoMessageDescription",
        label: "CEO Message Description",
        type: "textarea",
        group: "ceo-message-section",
        column: "left",
      },
      {
        key: "ceoName",
        label: "CEO Name",
        type: "text",
        group: "ceo-message-section",
        column: "right",
      },
      {
        key: "ceoDesignation",
        label: "CEO Designation",
        type: "text",
        group: "ceo-message-section",
        column: "right",
      },
      imageField("CEO Image", "ceoImage", "525x620"),

      // {
      //   key: "ceoImage",
      //   label: "CEO Image",
      //   type: "image",
      //   group: "ceo-message-section",
      //   column: "right",
      // },

      // WHY CLIENTS CHOOSE US SECTION
      {
        key: "whyChooseTitle",
        label: "Why Clients Choose Us Title",
        type: "text",
        group: "why-choose-section",
        column: "left",
      },
      {
        key: "whyChooseDescription",
        label: "Why Clients Choose Us Description",
        type: "textarea",
        group: "why-choose-section",
        column: "left",
      },
      {
        key: "whyChooseCard1Title",
        label: "Why Choose Card 1 Title",
        type: "text",
        group: "why-choose-section",
        column: "right",
      },
      {
        key: "whyChooseCard1Description",
        label: "Why Choose Card 1 Description",
        type: "textarea",
        group: "why-choose-section",
        column: "right",
      },
      {
        key: "whyChooseCard2Title",
        label: "Why Choose Card 2 Title",
        type: "text",
        group: "why-choose-section",
        column: "right",
      },
      {
        key: "whyChooseCard2Description",
        label: "Why Choose Card 2 Description",
        type: "textarea",
        group: "why-choose-section",
        column: "right",
      },
      {
        key: "whyChooseCard3Title",
        label: "Why Choose Card 3 Title",
        type: "text",
        group: "why-choose-section",
        column: "right",
      },
      {
        key: "whyChooseCard3Description",
        label: "Why Choose Card 3 Description",
        type: "textarea",
        group: "why-choose-section",
        column: "right",
      },
      // {
      //   key: "whyChooseImage",
      //   label: "Why Choose Us Image",
      //   type: "image",
      //   group: "why-choose-section",
      //   column: "right",
      // },
      imageField("Why Choose Us Image", "whyChooseImage", "524x745"),
      // HOW WE CAN HELP SECTION
      {
        key: "howWeHelpTitle",
        label: "How We Can Help Title",
        type: "text",
        group: "how-we-help-section",
        column: "left",
      },
      {
        key: "howWeHelpDescription",
        label: "How We Can Help Description",
        type: "textarea",
        group: "how-we-help-section",
        column: "left",
      },
      imageField("How We Can Help Image", "howWeHelpImage", "550x950"),
      {
        key: "point1Text",
        label: "Point 1 Text",
        type: "text",
        group: "experience-section",
        column: "right",
      },
      {
        key: "point2Text",
        label: "Point 2 Text",
        type: "text",
        group: "experience-section",
        column: "right",
      },
      {
        key: "point3Text",
        label: "Point 3 Text",
        type: "text",
        group: "experience-section",
        column: "right",
      },
      {
        key: "point4Text",
        label: "Point 4 Text",
        type: "text",
        group: "experience-section",
        column: "right",
      },
      {
        key: "point5Text",
        label: "Point 5 Text",
        type: "text",
        group: "experience-section",
        column: "right",
      },
      {
        key: "point6Text",
        label: "Point 6 Text",
        type: "text",
        group: "experience-section",
        column: "right",
      },

      // CURATED EXPERIENCE CARD
      {
        key: "curatedExperienceTitle",
        label: "Curated Experience Title",
        type: "text",
        group: "experience-section",
        column: "left",
      },
      {
        key: "curatedExperienceDescription",
        label: "Curated Experience Description",
        type: "textarea",
        group: "experience-section",
        column: "left",
      },
      // // {
      // //   key: "curatedExperienceIcon",
      // //   label: "Curated Experience Icon",
      // //   type: "icon",
      // //   group: "experience-section",
      // //   column: "left",
      // },

      // GUIDED SUPPORT CARD
      {
        key: "guidedSupportTitle",
        label: "Guided Support Title",
        type: "text",
        group: "experience-section",
        column: "right",
      },
      {
        key: "guidedSupportDescription",
        label: "Guided Support Description",
        type: "textarea",
        group: "experience-section",
        column: "right",
      },
      // {
      //   key: "guidedSupportIcon",
      //   label: "Guided Support Icon",
      //   type: "icon",
      //   group: "experience-section",
      //   column: "right",
      // },

      // GALLERY PREVIEW SECTION
      {
        key: "galleryTitle",
        label: "Gallery Title",
        type: "text",
        group: "gallery-preview-section",
        column: "left",
      },
      {
        key: "galleryDescription",
        label: "Gallery Description",
        type: "textarea",
        group: "gallery-preview-section",
        column: "right",
      },
      {
        key: "media",
        label: "Event Media (Images / Videos)",
        type: "gallery",
        multiple: true,
        accept: "image/*,video/*",
        group: "gallery-preview-section",
        note: "Upload multiple images and videos for this event.",
      },

      // FINAL CTA SECTION

      {
        key: "ctaDescription",
        label: "CTA Description",
        type: "textarea",
        group: "final-cta-section",
        column: "left",
      },
      {
        key: "ctaButtonText",
        label: "CTA Button Text",
        type: "text",
        group: "final-cta-section",
        column: "right",
      },
      {
        key: "ctaButtonUrl",
        label: "CTA Button URL",
        type: "text",
        group: "final-cta-section",
        column: "right",
      },

      // SEO
      {
        key: "metaTitle",
        label: "Meta Title",
        type: "text",
        group: "seo",
        column: "left",
      },
      {
        key: "metaDescription",
        label: "Meta Description",
        type: "textarea",
        group: "seo",
        column: "left",
      },
      imageField("OG Image", "ogImage"),
    ],
  ),

  "user-access": collection(
    "User Access",
    "user-access",
    "User records with role and status controls.",
    undefined,
    [
      { key: "name", label: "Name", type: "text" },

      { key: "password", label: "Password", type: "password" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Blocked", value: "blocked" },
        ],
      },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      {
        key: "role",
        label: "Role",
        type: "select",
        options: [
          { label: "Super Admin", value: "super-admin" },
          { label: "Editor", value: "editor" },
        ],
      },
      imageField("Profile Image"),
      textArea,
    ],
    searchMeta("email", "phone", "role", "status"),
  ),

  "custom-seo": singleton(
    "Custom SEO",
    "custom-seo",
    "Global SEO defaults and metadata controls.",
    [
      { key: "title", label: "Default Meta Title", type: "text" },
      { key: "subtitle", label: "Meta Description", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { key: "canonicalUrl", label: "Canonical URL", type: "text" },
      { key: "robots", label: "Robots", type: "text" },
      { key: "ogImage", label: "OG Image", type: "image" },
      textArea,
    ],
  ),

  "sitemap-config": singleton(
    "Sitemap",
    "sitemap-config",
    "Sitemap configuration and ping endpoints.",
    [
      { key: "title", label: "Sitemap Title", type: "text" },
      { key: "subtitle", label: "Primary Sitemap URL", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { key: "lastBuild", label: "Last Build Date", type: "date" },
      { key: "excludedRoutes", label: "Excluded Routes", type: "text" },
      textArea,
    ],
  ),

  "page-logs": collection(
    "Page Logs",
    "page-logs",
    "Page-level activity and change log entries.",
    "editor",
    [
      { key: "title", label: "Log Title", type: "text" },
      { key: "subtitle", label: "Event Summary", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Resolved", value: "resolved" },
        ],
      },
      { key: "pageName", label: "Page Name", type: "text" },
      { key: "actionBy", label: "Action By", type: "text" },
      { key: "logDate", label: "Log Date", type: "date" },
      textArea,
    ],
    searchMeta("pageName", "actionBy", "logDate", "status"),
  ),

  "footer-menu": collection(
    "Footer Menu",
    "footer-menu",
    "Website footer quick links and grouped navigation.",
    "editor",
    [
      { key: "title", label: "Label", type: "text" },
      { key: "subtitle", label: "URL", type: "text" },
      { key: "group", label: "Group", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      textArea,
    ],
    searchMeta("group", "sortOrder", "status"),
  ),
  "top-menu": collection(
    "Top Menu",
    "top-menu",
    "Website top navigation menu.",
    "editor",
    [
      { key: "title", label: "Label", type: "text" },
      { key: "subtitle", label: "URL", type: "text" },
      { key: "group", label: "Group", type: "text" },

      {
        key: "parentId",
        label: "Parent Menu",
        type: "relation-select",
        relation: {
          entity: "content/top-menu",
          labelKey: "title",
          valueKey: "_id",
        },
      },

      { key: "sortOrder", label: "Sort Order", type: "number" },

      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },

      {
        key: "openInNewTab",
        label: "Open In New Tab",
        type: "boolean",
      },

      textArea,
    ],
    searchMeta("group", "sortOrder", "status"),
  ),

  "footer-menu-2": collection(
    "Footer Menu 2",
    "footer-menu-2",
    "Secondary footer menu structure.",
    "editor",
    [
      { key: "title", label: "Label", type: "text" },
      { key: "subtitle", label: "URL", type: "text" },
      { key: "group", label: "Group", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      textArea,
    ],
    searchMeta("group", "sortOrder", "status"),
  ),

  categories: collection(
    "Categories",
    "categories",
    "Category cards and listing taxonomy.",
    "editor",
    [
      { key: "title", label: "Category Title", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      imageField("Category Image"),
      textArea,
    ],
    searchMeta("slug", "sortOrder", "status"),
  ),

  "developer-community": collection(
    "Developer",
    "developer-community",
    "Developer logo and community partner records.",
    "editor",
    [
      { key: "title", label: "Developer Name", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      imageField("Logo / Image", "image"),
      bannerField("Banner Image", "bannerimage", "1260x420"),
      textArea,
      // {
      //   key: "faqs",
      //   label: "FAQs",
      //   type: "faq", // custom type
      // },
    ],
    searchMeta("city", "status"),
  ),
  communities: collection(
    "Community",
    "communities",
    "Developer logo and community partner records.",
    undefined,
    [
      { key: "title", label: "Community Name", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },

      {
        key: "developer",
        label: "Developer",
        type: "relation-select",
        relation: {
          endpoint: "content/developer-community",
          labelKey: "title",
          valueKey: "_id",
        },
      },
      {
        key: "faq",
        label: "FAQ's",
        type: "faq",
      },

      imageField("Logo / Image"),
      textArea,
    ],
    searchMeta("city", "status"),
  ),

  "mega-category-ads": collection(
    "Mega Category Ads",
    "mega-category-ads",
    "Large promotional banners used inside mega category sections.",
    [
      { key: "title", label: "Ad Title", type: "text" },
      { key: "placement", label: "Placement", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      imageField("Ad Image"),
      textArea,
    ],
    searchMeta("placement", "status"),
  ),

  "app-contents": singleton(
    "Contents",
    "app-contents",
    "App content singleton editor for app labels, contact content, and support text.",
    [
      { key: "title", label: "Heading", type: "text" },
      { key: "subtitle", label: "Sub Heading", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      imageField("Cover Image"),
      textArea,
    ],
  ),

  "property-banner": collection(
    "Property Banner",
    "property-banner",
    "Property page banner media with city mapping and active switch.",
    [
      { key: "title", label: "Title", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      {
        key: "image",
        label: "Banner Image",
        type: "image",
        note: "Use approved banner dimensions for property screens.",
      },
      {
        key: "videoUrl",
        label: "Banner Video",
        type: "video",
        note: "MP4 only.",
      },
      textArea,
    ],
    searchMeta("city", "sortOrder", "status"),
  ),

  playbooks: collection(
    "Playbooks",
    "playbooks",
    "Operational playbooks and reusable admin process notes.",
    [
      { key: "title", label: "Playbook Title", type: "text" },
      { key: "subtitle", label: "Summary", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      textArea,
    ],
    searchMeta("sortOrder", "status"),
  ),

  "meta-settings": singleton(
    "Meta Settings",
    "meta-settings",
    "Default metadata controls for pages and templates.",
    [
      { key: "title", label: "Default Meta Title", type: "text" },
      { key: "subtitle", label: "Default Meta Description", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      imageField("Default OG Image"),
      textArea,
    ],
  ),
  "property-amenities": collection(
    "Property Amenities",
    "property-amenities",

    "Property-specific amenities like pool, gym, parking, kids play area, etc.",
    undefined,
    [
      { key: "title", label: "Amenity Name", type: "text" },
      { key: "status", label: "Status", type: "select", options: boolStatus },
      {
        key: "icon",
        label: "Amenity Icon",
        type: "image",
        note: "Pick an icon for the amenity card/list item.",
      },
      { key: "iconName", label: "Amenity Label", type: "text" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
    ],
    searchMeta("iconName", "category", "sortOrder"),
  ),
};
