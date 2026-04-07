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
  | "icon";

export type CmsField = {
  key: string;
  label: string;
  type: CmsFieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  section?: string;
  note?: string;
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
  type: "textarea",
};
const imageField = (label = "Image"): CmsField => ({
  key: "image",
  label,
  type: "image",
});
const searchMeta = (...keys: string[]) => keys;

const collection = (
  title: string,
  entity: string,
  subtitle: string,
  fields: CmsField[],
  cardMeta: string[] = [],
): CmsConfig => ({
  title,
  subtitle,
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
    [
      { key: "title", label: "Lead Name", type: "text" },
      { key: "subtitle", label: "Subject", type: "text" },
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
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "propertyType", label: "Property Type", type: "text" },
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
      textArea,
    ],
    searchMeta("email", "phone", "city", "priority"),
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
        imageField("Cover Image (1920x500)"),
        textArea,
      ],
      searchMeta("city", "metaTitle", "metaKeywords", "status"),
    ),
    layout: "editor",
  },

  podcast: {
    ...collection(
      "Podcast",
      "podcast",
      "Podcast episodes with artwork, publish date, and stream URL.",
      [
        { key: "title", label: "Episode Title", type: "text" },
        { key: "subtitle", label: "Episode Tagline", type: "text" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: statusOptions,
        },
        { key: "host", label: "Host", type: "text" },
        { key: "episodeNumber", label: "Episode #", type: "number" },
        { key: "publishDate", label: "Publish Date", type: "date" },
        { key: "streamUrl", label: "Stream URL", type: "text" },
        imageField("Episode Artwork"),
        textArea,
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
        imageField("Cover Image"),
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
      imageField("Asset Image"),
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
    [
      { key: "title", label: "Role Title", type: "text" },
      { key: "subtitle", label: "Role Summary", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "open" },
          { label: "Closed", value: "closed" },
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
        label: "Banner Image (440x670)",
        type: "image",
        note: "Recommended 440x670 px portrait image.",
      },
      {
        key: "videoUrl",
        label: "Banner Video",
        type: "video",
        note: "Portrait MP4 only.",
      },
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
      {
        key: "image",
        label: "Profile Image (512x512)",
        type: "image",
        note: "Square image recommended.",
      },
      { key: "description", label: "Review", type: "textarea" },
    ],
    searchMeta("rating", "status"),
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
        { key: "subCityCount", label: "Sub City Count", type: "number" },
        { key: "status", label: "Status", type: "select", options: boolStatus },
        textArea,
      ],
      searchMeta("city", "subCityCount", "status"),
    ),
    layout: "locations",
  },

  awards: collection(
    "Awards",
    "awards",
    "Recognition entries with image, transparent image, video, and career toggle.",
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
    "Section-based About page editor approximating the screenshot structure.",
    [
      { key: "title", label: "Hero Heading", type: "text" },
      { key: "subtitle", label: "Hero Sub Heading", type: "text" },
      imageField("Parallax Image (1920x800)"),
      { key: "expertsHeading", label: "Experts Block Heading", type: "text" },
      { key: "expertsBody", label: "Experts Block Body", type: "textarea" },
      { key: "globalHeading", label: "Global Outlook Heading", type: "text" },
      { key: "globalBody", label: "Global Outlook Body", type: "textarea" },
      { key: "recognitionHeading", label: "Recognition Heading", type: "text" },
      { key: "recognitionBody", label: "Recognition Body", type: "textarea" },
      {
        key: "inventoryHeading",
        label: "Exclusive Inventory Heading",
        type: "text",
      },
      {
        key: "inventoryBody",
        label: "Exclusive Inventory Body",
        type: "textarea",
      },
      {
        key: "responsiveHeading",
        label: "Responsiveness Heading",
        type: "text",
      },
      { key: "responsiveBody", label: "Responsiveness Body", type: "textarea" },
      {
        key: "languageHeading",
        label: "Fluent In Your World Heading",
        type: "text",
      },
      {
        key: "languageBody",
        label: "Fluent In Your World Body",
        type: "textarea",
      },
      {
        key: "blockOrderNote",
        label: "Section Ordering Note",
        type: "text",
        note: "Use the heading/body pairs above to mirror the screenshot blocks in order.",
      },
      textArea,
    ],
  ),

  "user-access": collection(
    "User Access",
    "user-access",
    "User records with role and status controls.",
    [
      { key: "title", label: "User Name", type: "text" },
      { key: "subtitle", label: "Designation", type: "text" },
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
          { label: "Manager", value: "manager" },
          { label: "Editor", value: "editor" },
          { label: "Support", value: "support" },
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

  "footer-menu-2": collection(
    "Footer Menu 2",
    "footer-menu-2",
    "Secondary footer menu structure.",
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
    "Developer Community",
    "developer-community",
    "Developer logo and community partner records.",
    [
      { key: "title", label: "Developer Name", type: "text" },
      { key: "city", label: "City", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
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
};
