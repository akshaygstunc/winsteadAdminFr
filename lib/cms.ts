export type CmsOption = {
  label: string;
  value: string;
};

export type CmsFieldCondition = {
  key: string;
  value: any;
  operator?: "equals" | "notEquals" | "includes";
};

export type CmsRepeaterField = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "boolean"
    | "image"
    | "icon";
  placeholder?: string;
  note?: string;
  options?: CmsOption[];
  defaultValue?: any;
};

export type CmsFieldType =
  | "text"
  | "editor"
  | "textarea"
  | "select"
  | "number"
  | "date"
  | "boolean"
  | "multiselect"
  | "icon"
  | "image"
  | "video"
  | "repeater"
  | "relation-multiselect"
  | "faq"
  | "address"          // ← was used in page but missing here
  | "gallery"          // ← was used in page but missing here
  | "advertisement" 
  | "relation-select";

export type CmsField = {
  multiple: boolean | undefined;
  accept: string;
  key: string;
  label: string;
  type: CmsFieldType;
  note?: string;
  placeholder?: string;
  required?: boolean;
  options?: CmsOption[];
  defaultValue?: any;
  group?: string;
  column?: "left" | "right";
  layout?: "main" | "sidebar"; 
  showWhen?: CmsFieldCondition;
  fields?: CmsRepeaterField[];
  relation?: {
    endpoint: string;
    labelKey?: string;
    valueKey?: string;
  };
};

export type CmsGroup = {
  key: string;
  label: string;
  column: "left" | "right";
};

export type CmsConfig = {
  entity: string;
  title: string;
  subtitle?: string;
  addLabel?: string;
  searchPlaceholder?: string;
  groups: CmsGroup[];
  fields: CmsField[];
  layout: string;
  mode?: "singleton" | "collection";
  cardMeta?: string[]; 
};

export type CmsItem = {
  _id?: string;
  title: string;
  subtitle?: string;
  slug: string;
  status: string;
  image?: string;
  description?: string;
  sortOrder?: number;
  advertisements?: { position: string; code: string }[];
  data?: Record<string, any>;
  [key: string]: any;
};


