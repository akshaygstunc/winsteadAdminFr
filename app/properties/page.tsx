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
          valueKey: "_id"
        }
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
      {
        key: "enquireFormImage",
        label: "Enquire Form Image",
        type: "image",
        note: "Banner Size should be 380x300",
      },
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
  const banners = Array.isArray(value) ? value : [];
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Separate video URL state
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const addVideoUrl = () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    if (banners.includes(url)) {
      setErrorMessage("This video URL already exists");
      return;
    }
    onChange([...banners, url]);
    setVideoUrlInput("");
    setErrorMessage("");
  };
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/content/upload/gallery", formData);
    return (
      res?.data?.url ||
      res?.data?.data?.url ||
      res?.data?.fileUrl ||
      res?.data?.location ||
      ""
    );
  };

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setErrorMessage("");
    try {
      const next = [...banners];
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) next.push(url);
      }
      onChange(next);
    } catch (err: any) {
      setErrorMessage(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (banners.includes(url)) {
      setErrorMessage("This URL already exists");
      return;
    }
    onChange([...banners, url]);
    setUrlInput("");
    setErrorMessage("");
  };

  const remove = (index: number) =>
    onChange(banners.filter((_, i) => i !== index));

  const isVideo = (url: string) => {
    if (!url) return false;

    // extension check
    if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(url)) return true;

    // cloudinary / signed / streaming urls
    return (
      url.includes("/video/") ||
      url.includes("video/upload") ||
      url.includes("cloudinary") ||
      url.includes(".m3u8")
    );
  };

  return (
    <div className="space-y-4">
      <FieldLabel label="Banner Images / Videos" />
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted">
          Upload images or videos for property banners.
        </p>
        <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
          📐 Recommended: <span className="font-semibold">1260×420px</span>
        </span>
      </div>

      {/* Upload controls */}
      <div className="rounded-[24px] border border-line bg-panel/40 p-4 space-y-3">
        {/* URL input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <TextInput
              label="Add URL (image or video)"
              value={urlInput}
              onChange={setUrlInput}
              placeholder="https://example.com/banner.jpg or .mp4"
            />
            {/* Separate video URL input */}
          </div>
          <div className="flex items-end">
            <ActionButton secondary onClick={addUrl} disabled={uploading}>
              Add URL
            </ActionButton>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <TextInput
                label="Add Video URL"
                value={videoUrlInput}
                onChange={setVideoUrlInput}
                placeholder="https://example.com/banner.mp4 or .webm"
              />
            </div>
            <div className="flex items-end">
              <ActionButton
                secondary
                onClick={addVideoUrl}
                disabled={uploading}
              >
                Add Video
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Upload + Picker buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 transition disabled:opacity-50"
          >
            <Upload className="h-4 w-4 text-muted" />
            {uploading ? "Uploading..." : "Upload File"}
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold hover:bg-gold/20 transition"
          >
            <Upload className="h-4 w-4" />
            Select Uploaded
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
        )}
      </div>

      {/* Preview grid */}
      {banners.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="space-y-2 rounded-[24px] border border-line bg-panel/40 p-4"
            >
              {/* URL editable input */}
              <TextInput
                label={`Banner ${index + 1} ${isVideo(url) ? "🎬 Video" : "🖼 Image"}`}
                value={url}
                onChange={(next) => {
                  const n = [...banners];
                  n[index] = next;
                  onChange(n);
                }}
              />
              {/* Preview */}
              <div className="flex items-center justify-between">
                {url &&
                  (isVideo(url) ? (
                    <video
                      src={url}
                      className="h-16 w-28 rounded-xl border border-line object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      controls
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Banner ${index + 1}`}
                      className="h-16 w-28 rounded-xl border border-line object-cover"
                    />
                  ))}
                <ActionButton secondary onClick={() => remove(index)}>
                  Remove
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted text-center">
          No banners added yet. Upload an image/video or paste a URL.
        </div>
      )}

      {/* Image picker modal for selecting from already-uploaded assets */}
      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(selected) => {
          if (selected.length)
            onChange([
              ...banners,
              ...selected.filter((u) => !banners.includes(u)),
            ]);
          setPickerOpen(false);
        }}
      />
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

        const rows = Array.isArray(response)
          ? response
          : response?.data || response?.items || response?.results || [];

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
        <div className="mt-1 flex flex-wrap gap-2">
          {[
            { label: "Gallery", size: "1260×420px" },
            { label: "Thumbnail", size: "380×300px" },
            { label: "Banner", size: "1260×420px" },
            { label: "Floor Plan", size: "800×600px" },
          ].map((g) => (
            <span
              key={g.label}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel px-2 py-0.5 text-[11px] text-muted"
            >
              <span className="font-medium text-text">{g.label}:</span> {g.size}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-[24px] border border-line bg-panel/40 p-4">
        <div className="flex flex-col sm:flex-row gap-2">
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
        {/* <input
          className="input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={uploading}
        /> */}
        {/* <div className="flex gap-2">
          <label
            className={`flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 transition cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-4 w-4 text-muted" />
            {uploading ? "Uploading..." : "Upload Images"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div> */}
        <div className="space-y-2">
          <FieldLabel label="Select or Uploaded Assets" />

          {loadingAssets ? (
            <p className="text-xs text-muted">Loading assets...</p>
          ) : !assets.length ? (
            <p className="text-xs text-muted">No uploaded assets found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 max-h-[300px] overflow-y-auto rounded-2xl border border-line p-2 sm:p-3">
              {assets.map((asset: any, i: number) => {
                const url = asset.url || asset.image || asset.fileUrl || "";
                if (!url) return null;
                const selected = images.includes(url);
                const assetPath =
                  asset.path ||
                  asset.key ||
                  (() => {
                    try {
                      return new URL(url).pathname.slice(1);
                    } catch {
                      return url;
                    }
                  })();
                return (
                  <div
                    type="button"
                    key={asset._id || url || i}
                    onClick={() => {
                      if (selected) {
                        onChange(images.filter((img) => img !== url));
                      } else {
                        onChange([...images, url]);
                      }
                    }}
                    className={`relative overflow-hidden rounded-xl border transition ${
                      selected
                        ? "border-gold ring-2 ring-gold"
                        : "border-line hover:border-gold/40"
                    }`}
                  >
                    <img
                      src={url}
                      alt={asset.name || ""}
                      className="h-24 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {asset.name && (
                      <p className="text-[10px] text-muted truncate px-1 pb-1 text-left">
                        {asset.name}
                      </p>
                    )}
                    {selected && (
                      <div className="absolute top-1 right-1 bg-gold text-black text-[10px] px-1.5 py-0.5 rounded">
                        ✓
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          !confirm("Delete this image from assets permanently?")
                        )
                          return;
                        try {
                          await api.delete(
                            `/media-assets/assets?path=${encodeURIComponent(assetPath)}`,
                          );
                          setAssets((prev) =>
                            prev.filter((a) => (a.url || a.fileUrl) !== url),
                          );
                          onChange(images.filter((img) => img !== url));
                        } catch {
                          alert("Failed to delete asset.");
                        }
                      }}
                      className="absolute bottom-1 right-1 rounded-lg bg-red-500 text-white w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
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
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-line object-cover shrink-0"
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

// Drop-in replacement for FloorPlansEditor in your PropertiesPage file.
// Paste this function in place of the existing FloorPlansEditor function.

function FloorPlansEditor({
  value,
  onChange,
  propertyId = "",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  propertyId?: string;
}) {
  const items = Array.isArray(value) ? value : [];
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null); // null = new, object = edit
  const [planForm, setPlanForm] = useState({
    title: "",
    unitType: "",
    bedrooms: 0,
    bathrooms: 0,
    size: "",
    price: 0,
    image: "",
    category: "",
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadOptions = async () => {
  try {
    setLoading(true);
    // Always fetch filtered by propertyId when available
    const endpoint = propertyId
      ? `/content/floor-plans?propertyId=${propertyId}`
      : `/content/floor-plans`;
    const response = await api.get(endpoint);
    const rows = normalizeApiArray(response);

// IMPORTANT
// Extra frontend filtering safety
const filteredRows = propertyId
  ? rows.filter(
      (row: any) =>
        String(row?.propertyId || row?.data?.propertyId || "") ===
        String(propertyId),
    )
  : rows;
    setOptions(
      filteredRows.map((row: any) => ({
        _id: String(row?._id ?? row?.id ?? ""),
        title: String(row?.title ?? ""),
        unitType: String(row?.data?.unitType ?? row?.unitType ?? ""),
        bedrooms: Number(row?.data?.bedrooms ?? row?.bedrooms ?? 0),
        bathrooms: Number(row?.data?.bathrooms ?? row?.bathrooms ?? 0),
        size: String(row?.data?.size ?? row?.size ?? ""),
        price: Number(row?.data?.price ?? row?.price ?? 0),
        image: String(row?.data?.image ?? row?.image ?? ""),
        category: String(row?.data?.category ?? row?.category ?? ""),
        sortOrder: Number(row?.data?.sortOrder ?? row?.sortOrder ?? 0),
      })),
    );
  } catch (error) {
    console.error("Failed to load floor plans:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadOptions();
  }, [propertyId]);

  const isSelected = (id: string) => items.includes(id);

  const toggle = (option: any) => {
    if (!option?._id) return;
    onChange(
      isSelected(option._id)
        ? items.filter((id) => id !== option._id)
      : [...items, option._id],
    );
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/content/upload/gallery", formData);
    return res?.data?.url || res?.data?.data?.url || res?.data?.fileUrl || "";
  };

  const openNewForm = () => {
    setEditingPlan(null);
    setPlanForm({
      title: "",
      unitType: "",
      bedrooms: 0,
      bathrooms: 0,
      size: "",
      price: 0,
      image: "",
      category: "",
      sortOrder: 0,
    });
    setSaveError("");
    setShowForm(true);
  };

  const openEditForm = (opt: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPlan(opt);
    setPlanForm({
      title: opt.title,
      unitType: opt.unitType,
      bedrooms: opt.bedrooms,
      bathrooms: opt.bathrooms,
      size: opt.size,
      price: opt.price,
      image: opt.image,
      category: opt.category,
      sortOrder: opt.sortOrder,
    });
    setSaveError("");
    setShowForm(true);
  };

  const savePlan = async () => {
  if (!planForm.title.trim()) {
    setSaveError("Title is required.");
    return;
  }

  // IMPORTANT
  // Property must exist before adding floor plans
  if (!propertyId) {
    setSaveError(
      "Please save property first before creating floor plans.",
    );
    return;
  }

  try {
    setSaving(true);
    setSaveError("");

    // ==============================
    // PAYLOAD
    // ==============================
    const payload = {
      title: planForm.title,

      // ✅ IMPORTANT
     

      data: {
        unitType: planForm.unitType,
        bedrooms: Number(planForm.bedrooms),
        bathrooms: Number(planForm.bathrooms),
         propertyId: String(propertyId),
        size: planForm.size,
        price: Number(planForm.price),
        image: planForm.image,
        category: planForm.category,
        sortOrder: Number(planForm.sortOrder),
      },
    };

    // ==============================
    // UPDATE
    // ==============================
    if (editingPlan?._id) {
      await api.patch(
        `/content/floor-plans/${editingPlan._id}`,
        payload,
      );

      await loadOptions();

    } else {

      // ==============================
      // CREATE
      // ==============================
      const res = await api.post(
        "/content/floor-plans",
        payload,
      );

      const createdId =
        res?.data?._id ||
        res?.data?.id ||
        res?._id ||
        res?.id ||
        "";

      await loadOptions();

      // auto select created floorplan
      if (createdId) {
        onChange([
          ...items,
          String(createdId),
        ]);
      }
    }

    // ==============================
    // RESET
    // ==============================
    setShowForm(false);

    setEditingPlan(null);

  } catch (err: any) {
    setSaveError(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save floor plan.",
    );
  } finally {
    setSaving(false);
  }
};

  const deletePlan = async (opt: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${opt.title}" floor plan permanently?`)) return;
    setDeletingId(opt._id);
    try {
      await api.delete(`/content/floor-plans/${opt._id}`);
      setOptions((prev) => prev.filter((o) => o._id !== opt._id));
      onChange(items.filter((id) => id !== opt._id));
    } catch {
      alert("Failed to delete floor plan.");
    } finally {
      setDeletingId(null);
    }
  };

  const selectedOptions = options.filter((o) => items.includes(o._id));
  const unselectedOptions = options.filter((o) => !items.includes(o._id));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FieldLabel label="Floor Plans" />
        <button
          type="button"
          onClick={() =>
            showForm && !editingPlan ? setShowForm(false) : openNewForm()
          }
          className="flex items-center gap-1.5 rounded-2xl border border-gold/50 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition"
        >
          {showForm && !editingPlan ? "✕ Cancel" : "+ Create New"}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3 sm:p-5 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gold">
              {editingPlan ? `Edit: ${editingPlan.title}` : "New Floor Plan"}
            </p>
            {editingPlan && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                }}
                className="text-xs text-muted hover:text-text"
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <TextInput
              label="Title *"
              value={planForm.title}
              onChange={(v) => setPlanForm((p) => ({ ...p, title: v }))}
              placeholder="e.g. 2BR Apartment — Type A"
            />
            <TextInput
              label="Unit Type"
              value={planForm.unitType}
              onChange={(v) => setPlanForm((p) => ({ ...p, unitType: v }))}
              placeholder="e.g. apartment"
            />
            <TextInput
              label="Bedrooms"
              type="number"
              value={planForm.bedrooms}
              onChange={(v) =>
                setPlanForm((p) => ({ ...p, bedrooms: Number(v) }))
              }
            />
            <TextInput
              label="Bathrooms"
              type="number"
              value={planForm.bathrooms}
              onChange={(v) =>
                setPlanForm((p) => ({ ...p, bathrooms: Number(v) }))
              }
            />
            <TextInput
              label="Size (sqft / sqm)"
              value={planForm.size}
              onChange={(v) => setPlanForm((p) => ({ ...p, size: v }))}
              placeholder="e.g. 1200 sqft"
            />
            <TextInput
              label="Price"
              type="number"
              value={planForm.price}
              onChange={(v) => setPlanForm((p) => ({ ...p, price: Number(v) }))}
            />
            <TextInput
              label="Category"
              value={planForm.category}
              onChange={(v) => setPlanForm((p) => ({ ...p, category: v }))}
              placeholder="e.g. residential"
            />
            <TextInput
              label="Sort Order"
              type="number"
              value={planForm.sortOrder}
              onChange={(v) =>
                setPlanForm((p) => ({ ...p, sortOrder: Number(v) }))
              }
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <FieldLabel label="Floor Plan Image" />
            <p className="text-xs text-muted">
              Recommended size:{" "}
              <span className="font-semibold text-gold">800x600px</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 transition disabled:opacity-50"
              >
                <Upload className="h-4 w-4 text-muted" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold hover:bg-gold/20 transition"
              >
                <Upload className="h-4 w-4" /> Select Uploaded
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const url = await uploadImage(file);
                  if (url) setPlanForm((p) => ({ ...p, image: url }));
                  setUploading(false);
                  e.target.value = "";
                }}
              />
            </div>
            {planForm.image && (
              <div className="relative w-fit">
                <img
                  src={planForm.image}
                  alt="preview"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-line object-cover shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setPlanForm((p) => ({ ...p, image: "" }))}
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <ImagePickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(imgs) => {
              if (imgs[0]) setPlanForm((p) => ({ ...p, image: imgs[0] }));
              setPickerOpen(false);
            }}
          />

          {saveError && (
            <p className="text-sm text-red-500 font-medium">{saveError}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <ActionButton onClick={savePlan} disabled={saving}>
              {saving
                ? "Saving..."
                : editingPlan
                  ? "Update Floor Plan"
                  : "Save & Select"}
            </ActionButton>
            <ActionButton
              secondary
              onClick={() => {
                setShowForm(false);
                setEditingPlan(null);
                setSaveError("");
              }}
            >
              Cancel
            </ActionButton>
          </div>
        </div>
      )}

      {/* Selected chips */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 border border-line py-3 px-3 sm:py-4 sm:px-4 rounded-2xl overflow-hidden">
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

      {/* All options with edit + delete */}
      <div className="flex flex-wrap gap-2 sm:gap-3 py-4 sm:py-6">
        {loading ? (
          <div className="text-sm text-muted">Loading...</div>
        ) : options.length === 0 ? (
          <div className="text-sm text-muted">
            No floor plans yet. Click "+ Create New" above.
          </div>
        ) : (
          [...selectedOptions, ...unselectedOptions].map((opt) => {
            const selected = isSelected(opt._id);
            return (
              <div
                key={opt._id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${
                  selected
                    ? "bg-card border-gold text-gold"
                    : "border-line text-text hover:bg-card/50"
                }`}
                onClick={() => toggle(opt)}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(opt)}
                  className="accent-yellow-500"
                  onClick={(e) => e.stopPropagation()}
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

                {/* Edit button */}
                <button
                  type="button"
                  onClick={(e) => openEditForm(opt, e)}
                  className="ml-1 rounded p-1 text-muted hover:text-gold hover:bg-gold/10 transition opacity-0 group-hover:opacity-100"
                  title="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => deletePlan(opt, e)}
                  disabled={deletingId === opt._id}
                  className="rounded p-1 text-muted hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === opt._id ? (
                    <svg
                      className="h-3 w-3 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="32"
                        strokeDashoffset="12"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
function ImageField({
  field,
  value,
  onChange,
  uploadFile,
}: {
  field: DynamicField;
  value: string;
  onChange: (url: string) => void;
  uploadFile: (file: File) => Promise<string>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // ==============================
  // VIDEO DETECTION
  // ==============================
  const isVideo = (url: string) => {
    if (!url) return false;

    return (
      /\.(mp4|webm|ogg|mov|m4v)$/i.test(url) ||
      url.includes("/video/") ||
      url.includes("video/upload") ||
      url.includes("cloudinary") ||
      url.includes(".m3u8")
    );
  };

  // ==============================
  // YOUTUBE DETECTION
  // ==============================
  const isYoutubeUrl = (url: string) => {
    if (!url) return false;

    return (
      url.includes("youtube.com/watch") ||
      url.includes("youtu.be/") ||
      url.includes("youtube.com/embed/")
    );
  };

  // ==============================
  // YOUTUBE EMBED URL
  // ==============================
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      // youtu.be
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];

        return `https://www.youtube.com/embed/${id}`;
      }

      // already embed
      if (url.includes("youtube.com/embed/")) {
        return url;
      }

      // youtube.com/watch?v=
      const parsed = new URL(url);

      const id = parsed.searchParams.get("v");

      return `https://www.youtube.com/embed/${id}`;
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-3">
      <FieldLabel label={field.label} />

      {/* BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-2">

        {/* Upload */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 transition disabled:opacity-50"
        >
          <Upload className="h-4 w-4 text-muted" />

          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* Select uploaded */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold hover:bg-gold/20 transition"
        >
          <Upload className="h-4 w-4" />

          Select Uploaded
        </button>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            try {
              setUploading(true);

              const url = await uploadFile(file);

              if (url) {
                onChange(url);
              }
            } catch (err) {
              console.error("Upload failed", err);
            } finally {
              setUploading(false);

              e.target.value = "";
            }
          }}
        />
      </div>

      {/* PREVIEW */}
      {value && (
        <div className="relative w-fit">

          {/* YOUTUBE */}
          {isYoutubeUrl(value) ? (
            <iframe
              src={getYoutubeEmbedUrl(value)}
              className="h-40 w-64 rounded-2xl border border-line bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isVideo(value) ? (

            // VIDEO
            <video
              src={value}
              className="h-40 w-64 rounded-2xl border border-line object-cover bg-black"
              muted
              autoPlay
              loop
              playsInline
              controls
            />

          ) : (

            // IMAGE
            <img
              src={value}
              alt={field.label}
              className="h-40 w-64 rounded-2xl border border-line object-cover"
            />
          )}

          {/* REMOVE BUTTON */}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* NOTE */}
      {field.note && (
        <p className="text-gold text-xs">
          Note: {field.note}
        </p>
      )}

      {/* PICKER MODAL */}
      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(images) => {
          if (images[0]) {
            onChange(images[0]);
          }

          setPickerOpen(false);
        }}
      />
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
        <ImageField
          field={field}
          value={String(value ?? "")}
          onChange={(url) => setForm((prev) => ({ ...prev, [field.key]: url }))}
          uploadFile={uploadSingleFile}
        />
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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, developerFilter, locationFilter]);

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
    // Step 1: Filter
    const filteredItems = items.filter((item) => {
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

    // Step 2: Pehle sab ko latest → oldest sort karo
    const dateSorted = [...filteredItems].sort((a: any, b: any) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    // Step 3: sortOrder > 0 wale items ko unki target position pe inject karo
    const result: any[] = [...dateSorted];

    dateSorted.forEach((item: any) => {
      const order = Number(item.sortOrder) || 0;
      if (order > 0) {
        const currentIdx = result.indexOf(item);
        result.splice(currentIdx, 1);
        const targetIdx = Math.min(order - 1, result.length);
        result.splice(targetIdx, 0, item);
      }
    });

    return result;
  }, [
    items,
    search,
    statusFilter,
    typeFilter,
    developerFilter,
    locationFilter,
  ]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
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
        bannerImages: form.bannerImages || [],
        sortOrder: Number(form.sortOrder || 0),
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
      sortOrder: Number(item.sortOrder || 0),
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
      floorPlans: Array.isArray(item.floorPlans)
        ? item.floorPlans
            .map((fp: any) => (typeof fp === "string" ? fp : (fp?._id ?? "")))
            .filter(Boolean)
        : [],
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
              {paginated.map((property, index) => (
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
                          <div
                            className="flex items-center gap-1 overflow-x-auto max-w-[180px] p-2"
                            style={{ scrollbarWidth: "thin" }}
                          >
                            {property.gallery.map(
                              (media: string, i: number) => {
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
                                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center transition"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              },
                            )}
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
                        <div
                          className="flex gap-1 mt-1 overflow-x-auto max-w-[180px] pt-2"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          {property.bannerImages.map(
                            (img: string, i: number) => (
                              <div key={i} className="relative group shrink-0">
                                <img
                                  src={img}
                                  className="h-4 w-7 rounded object-cover border border-line"
                                />
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const updatedBanners =
                                        property.bannerImages!.filter(
                                          (_: string, idx: number) => idx !== i,
                                        );
                                      const type = property?.type?.map(
                                        (t: any) => t?._id,
                                      );
                                      const subType = property?.subType?.map(
                                        (t: any) => t?._id,
                                      );
                                      await api.patch(
                                        `/properties/${property._id}`,
                                        {
                                          ...property,
                                          developer: property?.developer?._id,
                                          location: property?.location?._id,
                                          type,
                                          subType,
                                          bannerImages: updatedBanners,
                                        },
                                      );
                                      await load();
                                    } catch (err) {
                                      console.error(
                                        "Remove banner failed",
                                        err,
                                      );
                                    }
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center transition"
                                >
                                  ×
                                </button>
                              </div>
                            ),
                          )}
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
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line mt-0">
            <p className="text-xs text-muted">
              Showing{" "}
              <span className="font-medium text-text">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-text">{filtered.length}</span>{" "}
              properties
            </p>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex items-center gap-1 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs text-text hover:border-gold/50 hover:text-gold transition disabled:opacity-40 disabled:pointer-events-none"
              >
                ← Prev
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current ±1, and ellipsis placeholders
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .reduce<(number | "...")[]>((acc, page, i, arr) => {
                  if (i > 0 && page - (arr[i - 1] as number) > 1)
                    acc.push("...");
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, i) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1.5 text-xs text-muted"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[30px] rounded-xl border px-2 py-1.5 text-xs font-medium transition ${
                        currentPage === page
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-line bg-panel text-text hover:border-gold/40 hover:text-gold"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs text-text hover:border-gold/50 hover:text-gold transition disabled:opacity-40 disabled:pointer-events-none"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={open}
        onClose={close}
        title={editingId ? "Edit Property" : "Add Property"}
        subtitle="Expanded property form with SEO, geo, visibility, API relations, media, amenities, floor plans, and gallery uploads."
        size="xl"
      >
        <div className="flex flex-col gap-5">
          {propertyFormSections.map((section) => (
            <div
              key={section.key}
              // className={`space-y-4 rounded-[24px] border border-line bg-panel/40 p-4 ${
              //   section.custom === "amenities" ||
              //   section.custom === "floorPlans" ||
              //   section.custom === "faq" ||
              //   section.custom === "gallery" ||
              //   section.custom === "banners" ||
              //   section.key === "descriptions" ||
              //   section.key === "basic" || // ← basic bhi full width chahiye
              //   section.key === "seo"
              //     ? "col-span-1 sm:col-span-2"
              //     : "col-span-1"
              // }`}
              className="space-y-4 rounded-[24px] border border-line bg-panel/40 p-4"
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
                  propertyId={editingId || ""}
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
        // fetchProperty={load}
        load={load}
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
                typeof fp === "string" ? fp : (fp?._id ?? fp?.title),
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
              propertyId={manageModal.property._id}
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
