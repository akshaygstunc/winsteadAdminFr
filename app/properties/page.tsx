"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { Property, WorkspaceSnapshot } from "@/lib/types";
import { ActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { Modal } from "@/components/modal";
import {
  FieldLabel,
  FormActions,
  FormGrid,
  InlineActions,
  SectionNotice,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/crud-kit";
import PropertyImportModal from "@/components/PropertyImport";
import { TiptapEditor } from "@/components/TextEditor";
import { GoogleAddressInput } from "@/components/GoogleAutoComplete";
import { useRef } from "react";
import ImagePickerModal from "./ImagePicker";
import { Upload } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format a number as AED price with comma separators */
function formatAED(value: number | string | undefined): string {
  const num = Number(value || 0);
  if (!num) return "AED —";
  return `AED ${num.toLocaleString("en-AE")}`;
}

/**
 * Format property type into human-readable label.
 * Handles objects with name/title, plain strings, and arrays.
 * Examples:
 *   { name: "apartment", bedrooms: 1 } → "1BR Apartment"
 *   { name: "villa" }                  → "Villa"
 *   "2br-apartment"                    → "2BR Apartment"
 *   "studio"                           → "Studio"
 */
function formatPropertyType(type: any): string {
  if (!type) return "";

  // If it's an object with a name/title field
  if (typeof type === "object" && !Array.isArray(type)) {
    const rawName: string = type.name || type.title || "";
    return normaliseTypeName(rawName, type.bedrooms);
  }

  // Plain string
  if (typeof type === "string") {
    return normaliseTypeName(type);
  }

  return String(type);
}

/**
 * Core normaliser — converts raw type slugs/names to display labels.
 * Injects bedroom count prefix when present and not already in the name.
 */
function normaliseTypeName(raw: string, bedrooms?: number): string {
  if (!raw) return "";

  // Clean slug → readable (e.g. "2br-apartment" → "2BR Apartment")
  // Detect bedroom prefix in the string itself: "1br", "2br", "3br" etc.
  const bedroomPrefixMatch = raw.match(/^(\d+)\s*br[-_\s]?/i);

  let bedroomPrefix = "";
  let baseName = raw;

  if (bedroomPrefixMatch) {
    bedroomPrefix = `${bedroomPrefixMatch[1]}BR `;
    baseName = raw.slice(bedroomPrefixMatch[0].length);
  } else if (bedrooms && bedrooms > 0) {
    bedroomPrefix = `${bedrooms}BR `;
  }

  // Capitalise each word, clean separators
  const label = baseName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  return `${bedroomPrefix}${label}`;
}

/**
 * Format the full type column for a property.
 * Handles arrays, single objects, strings.
 */
function formatTypes(typeField: any): string {
  if (!typeField) return "—";

  if (Array.isArray(typeField)) {
    if (typeField.length === 0) return "—";
    return typeField
      .map((t) => formatPropertyType(t))
      .filter(Boolean)
      .join(", ");
  }

  return formatPropertyType(typeField) || "—";
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FieldOption = {
  label: string;
  value: string;
};

type RelationConfig = {
  entity: string;
  labelKey: string;
  valueKey: string;
};

type AmenityItem = {
  _id?: string;
  title: string;
  icon: string;
  description?: string;
};

type FloorPlanItem = {
  unitType: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  price: number;
  image: string;
  category: string;
  sortOrder: number;
};

type PropertyForm = Property & {
  propertyType?: string[];
  propertySubType?: string[];
  sublocation: string;
  categories?: string;
  propertyBanner?: string;
  propertydoc?: string;
  amenities?: AmenityItem[];
  floorPlans?: string[];
  communities?: string;
  faq: any[];
  bannerImages?: string[];
  isStandalone?: boolean;
};

type DynamicField = {
  key: keyof PropertyForm;
  label: string;
  type:
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "toggle"
    | "image"
    | "relation-select"
    | "relation-multiselect"
    | "editor";
  options?: FieldOption[];
  relation?: RelationConfig;
  note?: string;
};

type FieldSection = {
  key: string;
  title: string;
  columns?: 1 | 2 | 3;
  fields?: DynamicField[];
  custom?: "gallery" | "amenities" | "floorPlans" | "file" | "faq" | "banners";
};

type RelationData = Record<string, FieldOption[]>;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const emptyForm: PropertyForm = {
  title: "",
  buildingName: "",
  metaTitle: "",
  slug: "",
  metaDescription: "",
  metaKeywords: "",
  developer: "",
  developerType: "",
  shortDescription: "",
  city: "",
  fullDescription: "",
  appDescription: "",
  location: "",
  address: "",
  longitude: "",
  latitude: "",
  propertyStatus: "ready",
  bannerImages: [],
  visibility: "both",
  price: 0,
  status: "active",
  bedrooms: 0,
  bathrooms: 0,
  thumbnail: "",
  propertyBanner: "",
  enquireFormImage: "",
  featured: false,
  active: true,
  hotLaunch: false,
  exclusive: false,
  sortOrder: 0,
  tag: "",
  url: "",
  author: "winstead",
  gallery: [],
  propertyType: [],
  propertySubType: [],
  categories: "",
  faq: [],
  propertydoc: "",
  amenities: [],
  floorPlans: [],
  type: "",
  subType: "",
  category: "",
  sublocation: "",
  isStandalone: false,
  communities: "",
};

const propertyFormSections: FieldSection[] = [
  {
    key: "basic",
    title: "Basic Information",
    columns: 2,
    fields: [
      { key: "title", label: "Property Name", type: "text" },
      { key: "buildingName", label: "Building / Area Name", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      {
        key: "type",
        label: "Property Type",
        type: "relation-multiselect",
        relation: {
          entity: "content/property-types",
          labelKey: "name",
          valueKey: "_id",
        },
      },
      {
        key: "banners",
        title: "Banner Images",
        custom: "banners",
      } as any,
      {
        key: "subType",
        label: "Property Sub-Type",
        type: "relation-multiselect",
        relation: {
          entity: "content/property-sub-types",
          labelKey: "name",
          valueKey: "_id",
        },
      },
      {
        key: "communities",
        label: "Communities",
        type: "relation-select",
        relation: {
          entity: "content/developer-communities",
          labelKey: "title",
          valueKey: "_id",
        },
      },
      {
        key: "categories",
        label: "Property Categories",
        type: "relation-select",
        relation: {
          entity: "content/categories",
          labelKey: "title",
          valueKey: "_id",
        },
      },
      {
        key: "developer",
        label: "Developer",
        type: "relation-select",
        relation: {
          entity: "content/developer-community",
          labelKey: "name",
          valueKey: "_id",
        },
      },
      {
        key: "propertyStatus",
        label: "Property Status",
        type: "select",
        options: [
          { label: "Off Plan", value: "off-plan" },
          { label: "Ready", value: "ready" },
          { label: "Sold Out", value: "sold-out" },
        ],
      },
      {
        key: "location",
        label: "Location",
        type: "relation-select",
        relation: {
          entity: "content/locations",
          labelKey: "name",
          valueKey: "_id",
        },
      },
      {
        key: "sublocation",
        label: "Sub location",
        type: "relation-select",
        relation: {
          entity: "content/sub-locations",
          labelKey: "name",
          valueKey: "_id",
        },
      },
      { key: "address", label: "Address", type: "address" },
    ],
  },
  {
    key: "seo",
    title: "SEO",
    columns: 1,
    fields: [
      { key: "metaTitle", label: "Meta Title", type: "text" },
      { key: "metaDescription", label: "Meta Description", type: "textarea" },
      { key: "metaKeywords", label: "Meta Keywords", type: "text" },
      {
        key: "visibility",
        label: "Visibility",
        type: "select",
        options: [
          { label: "Mobile", value: "mobile" },
          { label: "Web", value: "web" },
          { label: "Both", value: "both" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Draft", value: "draft" },
          { label: "Ready", value: "ready" },
          { label: "Sold", value: "sold" },
        ],
      },
    ],
  },
  {
    key: "details",
    title: "Property Details",
    columns: 2,
    fields: [
      { key: "price", label: "Price", type: "number" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      {
        key: "thumbnail",
        label: "Thumbnail",
        type: "image",
        note: "Banner Size should be 380x300",
      },
      {
        key: "propertyBanner",
        label: "Property Banner",
        type: "image",
        note: "Banner Size should be 1260x420",
      },
      { key: "enquireFormImage", label: "Enquire Form Image", type: "image" },
      { key: "author", label: "Author", type: "text" },
      {
        key: "duringconstruction",
        label: "During Construction",
        type: "number",
      },
      { key: "handover", label: "Handover", type: "number" },
      { key: "propertydoc", title: "Property Document", custom: "file" } as any,
    ],
  },
  {
    key: "flags",
    title: "Flags",
    columns: 2,
    fields: [
      { key: "active", label: "Active", type: "toggle" },
      { key: "hotLaunch", label: "Hot Launch", type: "toggle" },
      { key: "exclusive", label: "Exclusive", type: "toggle" },
      { key: "featured", label: "Featured", type: "toggle" },
    ],
  },
  {
    key: "amenities",
    title: "Amenities",
    custom: "amenities",
  },
  {
    key: "floorPlans",
    title: "Floor Plans",
    custom: "floorPlans",
  },
  {
    key: "faq",
    title: "FAQs",
    custom: "faq",
  },
  {
    key: "descriptions",
    title: "Descriptions",
    columns: 2,
    fields: [
      { key: "shortDescription", label: "Short Description", type: "textarea" },
      { key: "appDescription", label: "App Description", type: "textarea" },
      { key: "fullDescription", label: "Full Description", type: "editor" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeApiArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.payload)) return response.payload;
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (unchanged from original, kept for completeness)
// ─────────────────────────────────────────────────────────────────────────────

function BannerUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-4">
      <FieldLabel label="Banner Images" />
      <p className="text-xs text-muted">
        Upload banner images (recommended 1260x420)
      </p>
      <GalleryUploader value={value} onChange={onChange} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function MultiSelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: FieldOption[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: any) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleValue = (val: string) => {
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
    );
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-1.5" ref={ref}>
      <FieldLabel label={label} />
      <div
        className="input w-full min-h-[44px] flex flex-wrap gap-1.5 items-center cursor-text"
        onClick={() => setOpen(true)}
      >
        {value.map((val) => {
          const item = options.find((o) => o.value === val);
          return (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-gold/20 text-gold border border-gold/30"
            >
              {item?.label || val}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleValue(val);
                }}
                className="text-gold/70 hover:text-gold font-bold leading-none"
              >
                ×
              </button>
            </span>
          );
        })}
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? `Select ${label}` : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-text placeholder:text-muted outline-none border-none"
        />
      </div>
      {open && (
        <div className="relative z-50">
          <div className="absolute top-0 left-0 right-0 border border-line rounded-xl bg-panel shadow-lg max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-muted">
                No options found.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const selected = value.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleValue(option.value)}
                    className={`px-4 py-2.5 cursor-pointer flex justify-between items-center text-sm transition-colors ${selected ? "bg-card text-muted line-through" : "text-text hover:bg-card/60"}`}
                  >
                    <span>{option.label}</span>
                    {selected && (
                      <span className="text-xs text-gold ml-2">✓</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PdfUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const uploadPdf = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<any>(`/content/upload/gallery`, formData);
      return res?.data?.url;
    } catch {
      alert("Failed to upload PDF");
      return null;
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        className="input"
        placeholder="Paste PDF URL"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="file"
        accept="application/pdf"
        className="input"
        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = await uploadPdf(file);
          if (url) onChange(url);
        }}
      />
      {value && (
        <div className="rounded-2xl border border-line p-3 text-sm text-muted">
          📄 PDF Uploaded
          <div className="mt-2 flex gap-3">
            <a href={value} target="_blank" className="text-gold underline">
              View
            </a>
            <a href={value} download className="text-gold underline">
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function FAQEditor({
  value,
  onChange,
}: {
  value: { question: string; answer: string }[];
  onChange: (val: any[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const updateItem = (index: number, key: string, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: val };
    onChange(next);
  };
  const addItem = () => onChange([...items, { question: "", answer: "" }]);
  const removeItem = (index: number) =>
    onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm font-medium text-gold">FAQs</p>
        <button
          onClick={addItem}
          className="border border-gold/50 bg-gold/10 text-gold px-4 py-2 rounded-2xl"
        >
          Add FAQ
        </button>
      </div>
      {items.map((faq, index) => (
        <div key={index} className="border p-4 rounded-xl space-y-3">
          <input
            className="input"
            placeholder="Question"
            value={faq.question}
            onChange={(e) => updateItem(index, "question", e.target.value)}
          />
          <textarea
            className="input"
            placeholder="Answer"
            value={faq.answer}
            onChange={(e) => updateItem(index, "answer", e.target.value)}
          />
          <button
            className="text-red-500 text-sm"
            onClick={() => removeItem(index)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function GalleryUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const images = Array.isArray(value) ? value : [];
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadSingleFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/content/upload/gallery", formData, {});
      const uploadedUrl =
        response?.data?.url ||
        response?.data?.data?.url ||
        response?.data?.fileUrl ||
        response?.data?.location ||
        "";
      if (!uploadedUrl) {
        setErrorMessage(`${response.error || "Unknown error"}: ${file.name}`);
        throw new Error("Upload API did not return image URL");
      }
      return uploadedUrl;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to upload ${file.name}`;
      setErrorMessage(message);
      throw err;
    }
  };
  useEffect(() => {
    (async () => {
      try {
        setLoadingAssets(true);

        const response = await api.get("/properties/assets");

        const rows =
          response?.data ||
          response?.items ||
          response?.results ||
          response ||
          [];

        setAssets(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error("Failed to load assets", err);
      } finally {
        setLoadingAssets(false);
      }
    })();
  }, []);
  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setErrorMessage("");
    try {
      const nextImages = [...images];
      for (const file of files) {
        try {
          const uploadedUrl = await uploadSingleFile(file);
          nextImages.push(uploadedUrl);
          onChange([...nextImages]);
        } catch (err: any) {
          setErrorMessage(
            err?.response?.data?.message ||
              err?.message ||
              `Failed to upload ${file.name}`,
          );
        }
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Gallery upload failed",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addUrl = () => {
    setErrorMessage("");
    const next = urlInput.trim();
    if (!next) {
      setErrorMessage("Please enter image URL");
      return;
    }
    if (images.includes(next)) {
      setErrorMessage("This image URL already exists");
      return;
    }
    onChange([...images, next]);
    setUrlInput("");
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Gallery Images" />
        <p className="mt-1 text-xs text-muted">
          Upload multiple property gallery images or paste image URLs.
          <br />
          <span className="font-bold py-2">
            Note: Dimension should be 1260x420
          </span>
        </p>
      </div>
      <div className="space-y-3 rounded-[24px] border border-line bg-panel/40 p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <TextInput
              label="Add Image URL"
              value={urlInput}
              onChange={setUrlInput}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex items-end">
            <ActionButton secondary onClick={addUrl} disabled={uploading}>
              Add URL
            </ActionButton>
          </div>
        </div>
        <input
          className="input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={uploading}
        />
        <div className="space-y-2">
          <FieldLabel label="Select From Uploaded Assets" />

          {loadingAssets ? (
            <p className="text-xs text-muted">Loading assets...</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto rounded-2xl border border-line p-3">
              {assets.map((asset: any) => {
                const selected = images.includes(asset.url);

                return (
                  <button
                    type="button"
                    key={asset._id || asset.url}
                    onClick={() => {
                      if (selected) {
                        onChange(images.filter((img) => img !== asset.url));
                      } else {
                        onChange([...images, asset.url]);
                      }
                    }}
                    className={`relative overflow-hidden rounded-xl border transition ${
                      selected
                        ? "border-gold ring-2 ring-gold"
                        : "border-line hover:border-gold/40"
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt=""
                      className="h-24 w-full object-cover"
                    />

                    {selected && (
                      <div className="absolute top-1 right-1 bg-gold text-black text-[10px] px-1.5 py-0.5 rounded">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {uploading && <p className="text-xs text-muted">Uploading images...</p>}
        {errorMessage && (
          <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
        )}
      </div>
      {images.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="space-y-3 rounded-[24px] border border-line bg-panel/40 p-4"
            >
              <TextInput
                label={`Image ${index + 1}`}
                value={image}
                onChange={(next) => {
                  const n = [...images];
                  n[index] = next;
                  onChange(n);
                }}
              />
              <div className="flex justify-between items-center">
                {image && (
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="h-20 w-20 rounded-2xl border border-line object-cover"
                  />
                )}
                <ActionButton
                  secondary
                  onClick={() => onChange(images.filter((_, i) => i !== index))}
                  disabled={uploading}
                >
                  Remove
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}
      {!images.length && (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          No gallery images added yet.
        </div>
      )}
    </div>
  );
}

function AmenitiesEditor({
  value,
  onChange,
}: {
  value: AmenityItem[];
  onChange: (next: AmenityItem[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await api.get("/content/property-amenities");
        const rows = normalizeApiArray(response);
        setOptions(
          rows.map((row: any) => ({
            _id: String(row?._id ?? row?.id ?? ""),
            title: String(row?.name ?? row?.title ?? ""),
            icon: String(row?.data?.icon ?? row?.image ?? ""),
            description: String(row?.description ?? ""),
          })),
        );
      } catch (error) {
        console.error("Failed to load amenities:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isSelected = (id: string) => items.some((item) => item._id === id);
  const toggle = (option: any) => {
    if (isSelected(option._id)) {
      onChange(items.filter((item) => item._id !== option._id));
    } else {
      onChange([
        ...items,
        {
          _id: option._id,
          title: option.title,
          icon: option.icon,
          description: option.description || "",
        },
      ]);
    }
  };
  const unselectedOptions = options.filter(
    (o) => !items.some((i) => i._id === o._id),
  );

  return (
    <div className="space-y-3">
      <FieldLabel label="Amenities" />
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 border-black border py-5 px-5 rounded-2xl mb-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/20 border border-gold/30 text-gold text-sm"
            >
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.title}
                  className="h-4 w-4 rounded object-cover"
                />
              )}
              <span className="font-medium">{item.title}</span>
              <button
                type="button"
                onClick={() => toggle(item)}
                className="ml-1 text-gold/70 hover:text-gold font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 py-10">
        {loading ? (
          <div className="text-sm text-muted">Loading...</div>
        ) : (
          [...items, ...unselectedOptions].map((opt) => {
            const selected = isSelected(opt._id);
            return (
              <label
                key={opt._id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${selected ? "bg-card border-gold text-gold" : "border-line text-text hover:bg-card/50"}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(opt)}
                  className="accent-yellow-500"
                />
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt={opt.title}
                    className="h-4 w-4 rounded object-cover"
                  />
                )}
                <span className="font-medium">{opt.title}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function FloorPlansEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await api.get("/content/floor-plans");
        const rows = normalizeApiArray(response);
        setOptions(
          rows.map((row: any) => ({
            _id: String(row?._id ?? row?.id ?? ""),
            title: String(row?.title ?? ""),
            unitType: String(row?.data?.unitType ?? row?.unitType ?? ""),
            bedrooms: Number(row?.data?.bedrooms ?? row?.bedrooms ?? 0),
            bathrooms: Number(row?.data?.bathrooms ?? row?.bathrooms ?? 0),
            image: String(row?.data?.image ?? row?.image ?? ""),
          })),
        );
      } catch (error) {
        console.error("Failed to load floor plans:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isSelected = (id: string) => items.includes(id);
  const toggle = (option: any) => {
    if (!option?._id) return;
    onChange(
      isSelected(option._id)
        ? items.filter((id) => id !== option._id)
        : [...items, option._id],
    );
  };
  const selectedOptions = options.filter((o) => items.includes(o._id));
  const unselectedOptions = options.filter((o) => !items.includes(o._id));

  return (
    <div className="space-y-3">
      <FieldLabel label="Floor Plans" />
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 border-black border py-5 px-5 rounded-2xl mb-4">
          {selectedOptions.map((opt) => (
            <div
              key={opt._id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/20 border border-gold/30 text-gold text-sm"
            >
              {opt.image && (
                <img
                  src={opt.image}
                  alt={opt.title}
                  className="h-5 w-5 rounded object-cover"
                />
              )}
              <span className="font-medium">{opt.title}</span>
              <span className="text-xs opacity-70">
                {opt.bedrooms}B · {opt.bathrooms}Ba
              </span>
              <button
                type="button"
                onClick={() => toggle(opt)}
                className="ml-1 text-gold/70 hover:text-gold font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-4 py-10">
        {loading ? (
          <div className="text-sm text-muted">Loading...</div>
        ) : (
          [...selectedOptions, ...unselectedOptions].map((opt) => {
            const selected = isSelected(opt._id);
            return (
              <label
                key={opt._id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${selected ? "bg-card border-gold text-gold" : "border-line text-text hover:bg-card/50"}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(opt)}
                  className="accent-yellow-500"
                />
                {opt.image && (
                  <img
                    src={opt.image}
                    alt={opt.title}
                    className="h-5 w-5 rounded object-cover"
                  />
                )}
                <span className="font-medium">{opt.title}</span>
                <span className="text-xs text-muted">
                  {opt.bedrooms}B · {opt.bathrooms}Ba
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function renderDynamicField(
  field: DynamicField,
  form: PropertyForm,
  setForm: React.Dispatch<React.SetStateAction<PropertyForm>>,
  relations: RelationData,
  communityOptions: FieldOption[],
) {
  const value = form[field.key];
  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/content/upload/gallery", formData);
    const uploadedUrl =
      response?.data?.url ||
      response?.data?.data?.url ||
      response?.data?.fileUrl ||
      response?.data?.location ||
      "";
    if (!uploadedUrl) throw new Error("Upload API did not return image URL");
    return uploadedUrl;
  };

  switch (field.type) {
    case "text":
      return (
        <TextInput
          label={field.label}
          value={String(value ?? "")}
          onChange={(next) =>
            setForm((prev) => {
              const updated = { ...prev, [field.key]: next };
              if (field.key === "title") {
                const generatedOldSlug = createSlug(prev.title || "");
                if (!prev.slug || prev.slug === generatedOldSlug)
                  updated.slug = createSlug(next);
              }
              return updated;
            })
          }
        />
      );
    case "number":
      return (
        <TextInput
          label={field.label}
          type="number"
          value={Number(value ?? 0)}
          onChange={(next) =>
            setForm((prev) => ({ ...prev, [field.key]: Number(next) }))
          }
        />
      );
    case "textarea":
      return (
        <TextArea
          label={field.label}
          value={String(value ?? "")}
          onChange={(next) =>
            setForm((prev) => ({ ...prev, [field.key]: next }))
          }
        />
      );
    case "editor":
      return (
        <TiptapEditor
          label={field.label}
          value={String(value ?? "")}
          onChange={(next) =>
            setForm((prev) => ({ ...prev, [field.key]: next }))
          }
        />
      );
    case "select":
      return (
        <SelectInput
          label={field.label}
          value={String(value ?? "")}
          onChange={(next) =>
            setForm((prev) => ({ ...prev, [field.key]: next as never }))
          }
          options={field.options || []}
        />
      );
    case "relation-select":
      // ── Communities ka special case ──
      if (field.key === "communities") {
        return (
          <div className="space-y-2">
            {/* Standalone checkbox */}
            <label className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.isStandalone)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isStandalone: e.target.checked,
                    communities: e.target.checked ? "NA" : "",
                  }))
                }
                className="accent-yellow-500"
              />
              <span className="text-xs text-text">
                Standalone Project{" "}
                <span className="text-muted">(no community)</span>
              </span>
            </label>

            {/* Community dropdown — sirf tab dikhao jab standalone nahi */}
            {!form.isStandalone ? (
              <div>
                <FieldLabel label="Community" />
                <select
                  className="input w-full"
                  value={String(form.communities || "")}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      communities: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Community --</option>
                  <option value="NA">NA (No Community)</option>
                  {communityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-muted px-1">
                Standalone — community not required
              </p>
            )}
          </div>
        );
      }

      // ── Baki sab relation-select normal ──
      return (
        <div className="space-y-2">
          <FieldLabel label={field.label} />
          <select
            className="input w-full"
            value={String(value ?? "")}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
            }
          >
            <option value="">-- Select --</option>
            {(relations[field.relation?.entity || ""] || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "address":
      return (
        <div className="space-y-2">
          <FieldLabel label="Address" />
          <GoogleAddressInput
            value={String(form.address || "")}
            onChange={(val) => setForm((prev) => ({ ...prev, address: val }))}
            onSelect={({ address, lat, lng }) =>
              setForm((prev) => ({
                ...prev,
                address,
                latitude: String(lat),
                longitude: String(lng),
              }))
            }
          />
          {form.latitude && form.longitude && (
            <p className="text-xs text-muted">
              Lat: {form.latitude} | Lng: {form.longitude}
            </p>
          )}
        </div>
      );
    case "relation-multiselect":
      return (
        <MultiSelectInput
          label={field.label}
          value={Array.isArray(value) ? (value as string[]) : []}
          options={relations[field.relation?.entity || ""] || []}
          onChange={(next) =>
            setForm((prev) => ({ ...prev, [field.key]: next as never }))
          }
        />
      );
    case "toggle":
      return (
        <Toggle
          label={field.label}
          checked={Boolean(value)}
          onChange={(next) =>
            setForm((prev) => ({ ...prev, [field.key]: next as never }))
          }
        />
      );
    case "image":
      return (
        <div className="space-y-3">
          <TextInput
            label={field.label}
            value={String(value ?? "")}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, [field.key]: next }))
            }
            placeholder="Paste image URL or upload below"
          />
          <div className="flex justify-between items-center">
            <input
              className="input"
              type="file"
              accept="image/*,video/*"
              onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await uploadSingleFile(file);
                setForm((prev) => ({ ...prev, [field.key]: dataUrl }));
              }}
            />
            {value &&
              (String(value).match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={String(value)}
                  className="h-16 w-16 rounded-2xl border object-cover"
                  controls
                />
              ) : (
                <img
                  src={String(value)}
                  className="h-16 w-16 rounded-2xl border object-cover"
                />
              ))}
          </div>
          {field.note && (
            <p className="text-gold text-xs">Note: {field.note}</p>
          )}
        </div>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const [items, setItems] = useState<PropertyForm[]>([]);
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [relations, setRelations] = useState<RelationData>({});
  const [open2, setOpen2] = useState(false);
  const [communityOptions, setCommunityOptions] = useState<FieldOption[]>([]);
  const [mounted, setMounted] = useState(false);
  const [developerFilter, setDeveloperFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [previewModal, setPreviewModal] = useState<{
    type: "floorPlans" | "amenities" | "faq";
    property: PropertyForm;
  } | null>(null);
  const [manageModal, setManageModal] = useState<{
    type: "floorPlans" | "amenities" | "faq";
    property: PropertyForm;
  } | null>(null);
  const [imagePicker, setImagePicker] = useState<{
    open: boolean;
    type: "gallery" | "banner";
    propertyId?: string;
  }>({ open: false, type: "gallery" });

  const developerOptions = relations["content/developer-community"] || [];
  const locationOptions = relations["content/locations"] || [];
  const typeFilterOptions = relations["content/property-types"] || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const url = form.developer
          ? `/content/communities?developer=${form.developer}`
          : `/content/communities`; // ← developer nahi hai toh sab fetch karo
        const res = await api.get(url);
        setCommunityOptions(
          normalizeApiArray(res).map((row: any) => ({
            label: String(row?.title ?? ""),
            value: String(row?._id ?? ""),
          })),
        );
      } catch {
        setCommunityOptions([]);
      }
    })();
  }, [form.developer]);

  const load = async () => {
    try {
      const snapshot = await api.get<WorkspaceSnapshot>("/properties/admin");
      setItems(((snapshot as any) || []) as PropertyForm[]);
    } catch {
      setError("Failed to load properties.");
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const endpoints = [
          "content/property-types",
          "content/property-sub-types",
          "content/developer-community",
          "content/developer-types",
          "content/locations",
          "content/property-amenities",
          "content/categories",
          "content/sub-locations",
        ];
        const responses = await Promise.all(
          endpoints.map((ep) => api.get(`/${ep}`).catch(() => [])),
        );
        const nextRelations: RelationData = {};
        endpoints.forEach((ep, i) => {
          nextRelations[ep] = normalizeApiArray(responses[i]).map(
            (row: any) => ({
              label: String(row?.name ?? row?.title ?? row?.label ?? ""),
              value: String(row?._id ?? row?.id ?? row?.value ?? ""),
            }),
          );
        });
        setRelations(nextRelations);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const searchText = [
        item.title,
        item.city,
        item.location?.title,
        item.developer?.title,
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!search || searchText.includes(search.toLowerCase())) &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (typeFilter === "all" ||
          item?.type?._id === typeFilter ||
          item?.type === typeFilter) &&
        (developerFilter === "all" ||
          item?.developer?._id === developerFilter ||
          item?.developer === developerFilter) &&
        (locationFilter === "all" ||
          item?.location?._id === locationFilter ||
          item?.location === locationFilter)
      );
    });
  }, [
    items,
    search,
    statusFilter,
    typeFilter,
    developerFilter,
    locationFilter,
  ]);

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async () => {
    try {
      setError(null);
      const slug = form.slug || createSlug(form.title || "");
      const payload = {
        ...form,
        slug,
        isStandalone: form.isStandalone || false,
        communities: form.isStandalone ? "NA" : form.communities || "",
        url: form.url || `/property/${slug}`,
        type: form.type || [],
        propertySubType: form.propertySubType || [],
        developer: form.developer || "",
        location: form.location || "",
        categories: form.categories,
        category: form.category,
        gallery: form.gallery || [],
        amenities: form.amenities || [],
        floorPlans: form.floorPlans || [],
        faq: form.faq || [],
        tag: form.hotLaunch ? "HOT" : form.exclusive ? "Exclusive" : form.tag,
      };
      if (editingId) {
        await api.patch(`/properties/${editingId}`, payload);
      } else {
        await api.post(`/properties`, payload);
      }
      setMessage(editingId ? "Property updated." : "Property created.");
      close();
      load();
    } catch {
      setError("Unable to save property.");
    }
  };

  const edit = (item: any) => {
    const getId = (val: any) => {
      if (!val) return "";
      if (typeof val === "string") return val;
      return val._id || val.id || "";
    };
    const normalizeArrayIds = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val))
        return val
          .map((v) => (typeof v === "string" ? v : v?._id || v?.id || ""))
          .filter(Boolean);
      return [typeof val === "string" ? val : val?._id || val?.id || ""].filter(
        Boolean,
      );
    };
    setForm({
      ...emptyForm,
      ...item,
      type: normalizeArrayIds(item.type),
      subType: normalizeArrayIds(item.subType),
      propertyType: normalizeArrayIds(item.propertyType || item.type),
      propertySubType: normalizeArrayIds(item.propertySubType || item.subType),
      developer: getId(item.developer),
      location: getId(item.location),
      sublocation: getId(item.sublocation),
      communities:
        getId(item.communities) === "NA" ? "NA" : getId(item.communities),
      isStandalone:
        Boolean(item.isStandalone) || getId(item.communities) === "NA",
      categories: item.categories,
      propertyStatus: (item.propertyStatus || "ready").toLowerCase(),
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      thumbnail: item.thumbnail || "",
      propertyBanner: item.propertyBanner || "",
      enquireFormImage: item.enquireFormImage || "",
      propertydoc: item.propertydoc || "",
      amenities: Array.isArray(item.amenities) ? item.amenities : [],
      floorPlans: Array.isArray(item.floorPlans) ? item.floorPlans : [],
      faq: Array.isArray(item.faq) ? item.faq : [],
      price: Number(item.price || 0),
      bedrooms: Number(item.bedrooms || 0),
      bathrooms: Number(item.bathrooms || 0),
      sortOrder: Number(item.sortOrder || 0),
      featured: Boolean(item.featured),
      active: Boolean(item.active),
      hotLaunch: Boolean(item.hotLaunch),
      exclusive: Boolean(item.exclusive),
      duringconstruction: Number(item.duringconstruction || 0),
      handover: Number(item.handover || 0),
    });
    setEditingId(item._id || null);
    setOpen(true);
  };

  const remove = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/properties/${id}`);
      setMessage("Property deleted.");
      load();
    } catch {
      setError("Unable to delete property.");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardShell>
      <Header
        title="Properties"
        subtitle="Expanded property form with API-driven relations, amenities, floor plans, and gallery uploads."
      />
      <SectionNotice message={message} error={error} />

      <SectionCard
        title="Property Listing"
        subtitle="Filters, actions, and richer property cards."
        action={
          <div className="flex flex-wrap gap-2">
            <input
              className="input max-w-56"
              placeholder="Search property, city, developer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input max-w-44"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {typeFilterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="input max-w-44"
              value={developerFilter}
              onChange={(e) => setDeveloperFilter(e.target.value)}
            >
              <option value="all">All Developers</option>
              {developerOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="input max-w-44"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locationOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="input max-w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="sold">Sold</option>
            </select>
            <ActionButton onClick={() => setOpen(true)}>
              Add Property
            </ActionButton>
            <ActionButton onClick={() => setOpen2(!open2)}>
              Import CSV
            </ActionButton>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel/80">
          <table className="min-w-full text-sm">
            <thead className="bg-card/80 text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2.5 w-8">#</th>
                <th className="px-3 py-2.5">Property</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Price</th>
                <th className="px-3 py-2.5">Developer / Features</th>
                <th className="px-3 py-2.5">Date / Status</th>
                <th className="px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((property, index) => (
                <tr
                  key={property._id || property.title}
                  className="border-t border-line hover:bg-card/50 align-top"
                >
                  {/* # */}
                  <td className="px-3 py-2.5 text-muted font-medium text-xs w-8">
                    {index + 1}
                  </td>

                  {/* Property — compact */}
                  <td className="px-3 py-2.5 min-w-[200px] max-w-[240px]">
                    <div className="font-medium text-text text-sm leading-tight">
                      {property.title}
                    </div>
                    {property.location?.title || property.location?.name ? (
                      <div className="text-xs text-muted mt-0.5">
                        {property.location?.title ?? property.location?.name}
                        {property.city ? `, ${property.city}` : ""}
                      </div>
                    ) : null}
                    {property.slug && (
                      <div className="text-[11px] text-muted/60 mt-0.5 truncate max-w-[200px]">
                        {property.slug}
                      </div>
                    )}

                    {/* Gallery thumbnails — compact strip */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {Array.isArray(property?.gallery) &&
                      property.gallery.length > 0 ? (
                        <>
                          <div className="flex items-center gap-0.5 overflow-hidden max-w-[120px]">
                            {property.gallery
                              .slice(0, 5)
                              .map((media: string, i: number) => {
                                const isVideo = /\.(mp4|webm|ogg)$/i.test(
                                  media,
                                );
                                return (
                                  <div
                                    key={i}
                                    className="relative group shrink-0"
                                  >
                                    {isVideo ? (
                                      <video
                                        src={media}
                                        className="h-6 w-6 rounded object-cover border border-line"
                                        muted
                                      />
                                    ) : (
                                      <img
                                        src={media}
                                        alt=""
                                        className="h-6 w-6 rounded object-cover border border-line"
                                      />
                                    )}
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          const updatedGallery =
                                            property.gallery.filter(
                                              (_: string, idx: number) =>
                                                idx !== i,
                                            );
                                          const type = property?.type?.map(
                                            (t: any) => t?._id,
                                          );
                                          const subType =
                                            property?.subType?.map(
                                              (t: any) => t?._id,
                                            );
                                          await api.patch(
                                            `/properties/${property._id}`,
                                            {
                                              ...property,
                                              developer:
                                                property?.developer?._id,
                                              location: property?.location?._id,
                                              type,
                                              subType,
                                              gallery: updatedGallery,
                                            },
                                          );
                                          await load();
                                        } catch (err) {
                                          console.error(
                                            "Remove image failed",
                                            err,
                                          );
                                        }
                                      }}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                            {property.gallery.length > 5 && (
                              <span className="text-[10px] text-muted ml-0.5">
                                +{property.gallery.length - 5}
                              </span>
                            )}
                          </div>
                          <button
                            className="h-6 w-6 rounded flex items-center justify-center border border-line hover:bg-card shrink-0"
                            onClick={() =>
                              setImagePicker({
                                open: true,
                                type: "gallery",
                                propertyId: property._id,
                              })
                            }
                          >
                            <Upload size={11} className="text-gold" />
                          </button>
                        </>
                      ) : (
                        <button
                          className="h-6 w-6 rounded flex items-center justify-center border border-dashed border-line hover:bg-card"
                          onClick={() =>
                            setImagePicker({
                              open: true,
                              type: "gallery",
                              propertyId: property._id,
                            })
                          }
                        >
                          <Upload size={11} className="text-muted" />
                        </button>
                      )}
                    </div>

                    {/* Banner images strip */}
                    {Array.isArray(property?.bannerImages) &&
                      property.bannerImages.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {property.bannerImages
                            .slice(0, 3)
                            .map((img: string, i: number) => (
                              <img
                                key={i}
                                src={img}
                                className="h-4 w-7 rounded object-cover border border-line"
                              />
                            ))}
                          {property.bannerImages.length > 3 && (
                            <span className="text-[10px] text-muted self-center ml-0.5">
                              +{property.bannerImages.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                  </td>

                  {/* Type — formatted */}
                  <td className="px-3 py-2.5 min-w-[130px]">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(property?.type) &&
                      property.type.length > 0 ? (
                        property.type.map((t: any, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-card border border-line text-text"
                          >
                            {formatPropertyType(t)}
                          </span>
                        ))
                      ) : property?.type ? (
                        <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-card border border-line text-text">
                          {formatPropertyType(property.type)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </div>
                  </td>

                  {/* Price — AED formatted */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-sm font-medium text-text">
                      {formatAED(property.price)}
                    </span>
                  </td>

                  {/* Developer / Features */}
                  <td className="px-3 py-2.5 min-w-[180px]">
                    <div className="flex flex-wrap gap-1">
                      {property?.developer?.title && (
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
                          {property.developer.title}
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setManageModal({ type: "floorPlans", property })
                        }
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        Plans ({property?.floorPlans?.length ?? 0})
                      </button>
                      <button
                        onClick={() =>
                          setManageModal({ type: "amenities", property })
                        }
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                      >
                        Features ({property?.amenities?.length ?? 0})
                      </button>
                      <button
                        onClick={() =>
                          setManageModal({ type: "faq", property })
                        }
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        FAQ ({property?.faq?.length ?? 0})
                      </button>
                      <button
                        onClick={() =>
                          setImagePicker({
                            open: true,
                            type: "banner",
                            propertyId: property._id,
                          })
                        }
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        Banner
                      </button>
                    </div>
                  </td>

                  {/* Date / Status */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-xs text-muted mb-1">
                      {property?.createdAt
                        ? new Date(property.createdAt).toLocaleDateString(
                            "en-AE",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )
                        : "—"}
                    </div>
                    <StatusBadge
                      value={property.status || "draft"}
                      tone={
                        property.status === "active"
                          ? "green"
                          : property.status === "inactive"
                            ? "red"
                            : "slate"
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 text-right">
                    <InlineActions
                      onEdit={() => edit(property)}
                      onDelete={() => remove(property._id)}
                    />
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    No properties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={open}
        onClose={close}
        title={editingId ? "Edit Property" : "Add Property"}
        subtitle="Expanded property form with SEO, geo, visibility, API relations, media, amenities, floor plans, and gallery uploads."
        size="xl"
      >
        <div className="grid grid-cols-2 gap-5">
          {propertyFormSections.map((section) => (
            <div
              key={section.key}
              className={`space-y-4 rounded-[24px] border border-line bg-panel/40 p-4 ${
                section.custom === "amenities" ||
                section.custom === "floorPlans" ||
                section.custom === "faq" ||
                section.custom === "gallery" ||
                section.key === "descriptions"
                  ? "col-span-2"
                  : ""
              }`}
            >
              <h3 className="text-sm font-semibold text-text">
                {section.title}
              </h3>
              {section.custom === "faq" ? (
                <FAQEditor
                  value={Array.isArray(form.faq) ? form.faq : []}
                  onChange={(next) =>
                    setForm((prev) => ({ ...prev, faq: next }))
                  }
                />
              ) : section.custom === "banners" ? (
                <BannerUploader
                  value={
                    Array.isArray(form.bannerImages) ? form.bannerImages : []
                  }
                  onChange={(next) =>
                    setForm((prev) => ({ ...prev, bannerImages: next }))
                  }
                />
              ) : section.custom === "amenities" ? (
                <AmenitiesEditor
                  value={Array.isArray(form.amenities) ? form.amenities : []}
                  onChange={(next) =>
                    setForm((prev) => ({ ...prev, amenities: next }))
                  }
                />
              ) : section.custom === "floorPlans" ? (
                <FloorPlansEditor
                  value={Array.isArray(form.floorPlans) ? form.floorPlans : []}
                  onChange={(next) =>
                    setForm((prev) => ({ ...prev, floorPlans: next }))
                  }
                />
              ) : section.custom === "file" ? (
                <PdfUploader
                  value={form.propertydoc || ""}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, propertydoc: url }))
                  }
                />
              ) : (
                <FormGrid columns={section.columns}>
                  {(section.fields || []).map((field) => (
                    <div key={String(field.key)}>
                      {renderDynamicField(
                        field,
                        form,
                        setForm,
                        relations,
                        communityOptions,
                      )}
                    </div>
                  ))}
                </FormGrid>
              )}
            </div>
          ))}
        </div>
        <FormActions
          onSubmit={submit}
          onCancel={close}
          submitLabel={editingId ? "Update Property" : "Create Property"}
        />
      </Modal>

      <PropertyImportModal
        open={open2}
        onClose={() => setOpen2(false)}
        fetchProperty={load}
      />

      {/* ── Image Picker ── */}
      <ImagePickerModal
        open={imagePicker.open}
        onClose={() => setImagePicker({ open: false, type: "gallery" })}
        onSelect={async (images) => {
          if (!imagePicker.propertyId || images.length === 0) return;
          try {
            const current = items.find((p) => p._id === imagePicker.propertyId);
            let updatedPayload: any = {};
            if (imagePicker.type === "gallery")
              updatedPayload.gallery = Array.from(
                new Set([...(current?.gallery || []), ...images]),
              );
            if (imagePicker.type === "banner")
              updatedPayload.bannerImages = Array.from(
                new Set([...(current?.bannerImages || []), ...images]),
              );
            const type = current?.type?.map((t: any) => t?._id);
            const subType = current?.subType?.map((t: any) => t?._id);
            await api.patch(`/properties/${imagePicker.propertyId}`, {
              ...current,
              developer: current?.developer?._id,
              location: current?.location?._id,
              type,
              subType,
              ...updatedPayload,
            });
            await load();
          } catch (err) {
            console.error("Upload failed", err);
          }
        }}
      />

      {/* ── Manage Modal (Floor Plans / Amenities / FAQ) ── */}
      {manageModal && (
        <Modal
          open={!!manageModal}
          onClose={() => setManageModal(null)}
          title={`Manage ${manageModal.type}`}
          size="xl"
        >
          {manageModal.type === "floorPlans" && (
            <FloorPlansEditor
              value={(manageModal.property.floorPlans || []).map((fp: any) =>
                typeof fp === "string" ? fp : fp?.title,
              )}
              onChange={(next) =>
                setManageModal((prev) =>
                  prev
                    ? {
                        ...prev,
                        property: { ...prev.property, floorPlans: next },
                      }
                    : null,
                )
              }
            />
          )}
          {manageModal.type === "amenities" && (
            <AmenitiesEditor
              value={manageModal.property.amenities || []}
              onChange={(next) =>
                setManageModal((prev) =>
                  prev
                    ? {
                        ...prev,
                        property: { ...prev.property, amenities: next },
                      }
                    : null,
                )
              }
            />
          )}
          {manageModal.type === "faq" && (
            <FAQEditor
              value={manageModal.property.faq || []}
              onChange={(next) =>
                setManageModal((prev) =>
                  prev
                    ? { ...prev, property: { ...prev.property, faq: next } }
                    : null,
                )
              }
            />
          )}
          <div className="flex justify-end mt-4">
            <ActionButton
              onClick={async () => {
                const p = manageModal.property;
                const type = p?.type?.map((ty: any) => ty?._id);
                const subType = p?.subType?.map((ty: any) => ty?._id);
                await api.patch(`/properties/${p._id}`, {
                  ...p,
                  developer: p?.developer?._id,
                  location: p?.location?._id,
                  amenities: p.amenities,
                  floorPlans: p.floorPlans,
                  type,
                  subType,
                  faq: p.faq,
                });
                await load();
                setManageModal(null);
              }}
            >
              Save Changes
            </ActionButton>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}
