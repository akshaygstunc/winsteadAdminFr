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
  title: string;
  icon: string;
  description: string;
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
  floorPlans?: FloorPlanItem[];
  communities?: string;
  faq: any[];
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
};

type FieldSection = {
  key: string;
  title: string;
  columns?: 1 | 2 | 3;
  fields?: DynamicField[];
  custom?: "gallery" | "amenities" | "floorPlans" | "file" | "faq";
};

type RelationData = Record<string, FieldOption[]>;
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
  author: "wasim",
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
};

const propertyFormSections: FieldSection[] = [
  {
    key: "basic",
    title: "Basic Information",
    columns: 3,
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
          entity: "content/developer-communities", // 👈 new endpoint
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
    key: "payment-plan",
    title: "Payment Plan",
    columns: 1,
    fields: [
      {
        key: "duringconstruction",
        label: "During Construction",
        type: "number",
      },
      { key: "handover", label: "Handover", type: "number" },
    ],
  },
  {
    key: "faq",
    title: "Property FAQ",
    columns: 1,
    custom: "faq",
  },
  {
    key: "propertydoc",
    title: "Property Document",
    custom: "file",
  },
  {
    key: "seo",
    title: "SEO",
    columns: 3,
    fields: [
      { key: "metaTitle", label: "Meta Title", type: "text" },
      { key: "metaDescription", label: "Meta Description", type: "textarea" },
      { key: "metaKeywords", label: "Meta Keywords", type: "text" },
    ],
  },
  {
    key: "details",
    title: "Property Details",
    columns: 3,
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
    ],
  },
  {
    key: "visibility",
    title: "Visibility & Status",
    columns: 3,
    fields: [
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
    key: "descriptions",
    title: "Descriptions",
    columns: 2,
    fields: [
      { key: "shortDescription", label: "Short Description", type: "textarea" },
      { key: "appDescription", label: "App Description", type: "textarea" },
      { key: "fullDescription", label: "Full Description", type: "editor" },
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
    key: "gallery",
    title: "Gallery Images",
    custom: "gallery",
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
];

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeApiArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.payload)) return response.payload;
  return [];
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
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handleClick = (e: any) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="space-y-2" ref={ref}>
      <FieldLabel label={label} />

      {/* Selected Chips */}
      <div
        onClick={() => setOpen(!open)}
        className="input w-full min-h-[44px] flex flex-wrap gap-2 items-center cursor-pointer"
      >
        {value.length > 0 ? (
          value.map((val) => {
            const item = options.find((o) => o.value === val);
            return (
              <span
                key={val}
                className="px-2 py-1 text-xs rounded bg-yellow-500 text-black flex items-center gap-1"
              >
                {item?.label || val}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(val);
                  }}
                  className="text-black font-bold"
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-muted text-sm">Select {label}</span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="border rounded-lg bg-black max-h-60 overflow-auto shadow-lg">
          {options.map((option) => {
            const selected = value.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleValue(option.value)}
                className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm ${
                  selected
                    ? "bg-white text-black"
                    : "text-gold hover:bg-white/10"
                }`}
              >
                {option.label}
                {selected && "✔"}
              </div>
            );
          })}
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
      {/* URL Input */}
      <input
        type="text"
        className="input"
        placeholder="Paste PDF URL"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Upload */}
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

      {/* Preview */}
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

  const addItem = () => {
    onChange([...items, { question: "", answer: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm font-medium text-gold">FAQs</p>
        <button
          onClick={addItem}
          className=" border border-50 border-gold/50 bg-gold/10 text-gold px-4 py-2 rounded-2xl"
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

  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/content/upload/gallery", formData, {});
    console.log(response, "Upload response");
    const uploadedUrl =
      response?.data?.url ||
      response?.data?.data?.url ||
      response?.data?.fileUrl ||
      response?.data?.data?.fileUrl ||
      response?.data?.location ||
      response?.data?.data?.location ||
      "";

    if (!uploadedUrl) {
      throw new Error("Upload API did not return image URL");
    }

    return uploadedUrl;
  };

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);

    try {
      const nextImages = [...images];

      for (const file of files) {
        const uploadedUrl = await uploadSingleFile(file);
        nextImages.push(uploadedUrl);
        onChange([...nextImages]);
      }
    } catch (error) {
      console.error("Gallery upload failed:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addUrl = () => {
    const next = urlInput.trim();
    if (!next) return;
    onChange([...(images || []), next]);
    setUrlInput("");
  };

  const updateImage = (index: number, nextValue: string) => {
    const next = [...images];
    next[index] = nextValue;
    onChange(next);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
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

        {uploading ? (
          <p className="text-xs text-muted">Uploading images...</p>
        ) : null}
      </div>

      {!!images.length && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="space-y-3 rounded-[24px] border border-line bg-panel/40 p-4"
            >
              <TextInput
                label={`Image ${index + 1}`}
                value={image}
                onChange={(next) => updateImage(index, next)}
              />

              {image ? (
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="h-40 w-full rounded-2xl border border-line object-cover"
                />
              ) : null}

              <div className="flex justify-end">
                <ActionButton
                  secondary
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                >
                  Remove
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {!images.length ? (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          No gallery images added yet.
        </div>
      ) : null}
    </div>
  );
}
type AmenityItem = {
  _id?: string;
  title: string;
  icon: string;
  description?: string;
};

type AmenityOption = {
  _id: string;
  title: string;
  icon: string;
  description?: string;
};

function AmenitiesEditor({
  value,
  onChange,
}: {
  value: AmenityItem[];
  onChange: (next: AmenityItem[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const [options, setOptions] = useState<AmenityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true);
        const response = await api.get("/content/property-amenities");
        const rows = normalizeApiArray(response);
        console.log(rows, "Fetched amenities for selection");
        const nextOptions: AmenityOption[] = rows.map((row: any) => ({
          _id: String(row?._id ?? row?.id ?? ""),
          title: String(row?.name ?? row?.title ?? ""),
          icon: String(row?.data?.icon ?? row?.image ?? ""),
          description: String(row?.description ?? ""),
        }));

        setOptions(nextOptions);
      } catch (error) {
        console.error("Failed to load amenities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const isChecked = (optionId: string) => {
    return items.some((item) => item._id === optionId);
  };

  const toggleAmenity = (option: AmenityOption, checked: boolean) => {
    if (checked) {
      const exists = items.some((item) => item._id === option._id);
      if (exists) return;
      console.log(option, "Toggling amenity - adding");
      onChange([
        ...items,
        {
          _id: option._id,
          title: option.title,
          icon: option?.icon,
          description: option.description || "",
        },
      ]);
      return;
    }

    onChange(items.filter((item) => item._id !== option._id));
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Amenities" />
        <p className="mt-1 text-xs text-muted">
          Select one or more amenities. Selected amenity name and icon will be
          saved with the property.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line p-6 text-sm text-muted">
          Loading amenities...
        </div>
      ) : !options.length ? (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          No amenities found.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Dropdown Header */}
          <div
            onClick={() => setOpenDropdown(!openDropdown)}
            className="cursor-pointer flex justify-between items-center border border-line rounded-2xl px-4 py-3 bg-panel"
          >
            <span className="text-sm text-text">Select Amenities</span>
            <span className="text-xs text-muted">
              {openDropdown ? "▲" : "▼"}
            </span>
          </div>

          {/* Dropdown List */}
          {openDropdown && (
            <div className="max-h-72 overflow-y-auto border border-line rounded-2xl bg-panel/40 divide-y">
              {options.map((option) => {
                const checked = isChecked(option._id);

                return (
                  <label
                    key={option._id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${
                      checked ? "bg-panel" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={(e) => toggleAmenity(option, e.target.checked)}
                    />

                    <div className="flex items-start gap-3">
                      {option?.icon ? (
                        <img
                          src={option.icon}
                          alt={option.title}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-card" />
                      )}

                      <div>
                        <div className="text-sm text-text font-medium">
                          {option.title}
                        </div>
                        {option.description && (
                          <p className="text-xs text-muted">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!!items.length && (
        <div className="rounded-2xl border border-line bg-panel/30 p-4">
          <p className="mb-3 text-sm font-medium text-text">
            Selected Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div
                key={`${item._id || item.title}-${index}`}
                className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs text-text"
              >
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="h-5 w-5 rounded object-cover"
                  />
                ) : null}

                <span>{item.title}</span>

                {/* 🔥 Remove Button */}
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  className="ml-1 text-red-400 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FloorPlansEditor({
  value,
  onChange,
}: {
  value: FloorPlanItem[];
  onChange: (next: FloorPlanItem[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const [options, setOptions] = useState<FloorPlanItem & { _id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    const fetchFloorPlans = async () => {
      try {
        setLoading(true);
        const response = await api.get("/content/floor-plans");
        const rows = normalizeApiArray(response);
        const nextOptions = rows.map((row: any) => ({
          _id: String(row?._id ?? row?.id ?? ""),
          title: String(row?.title ?? ""),
          unitType: String(row?.data?.unitType ?? row?.unitType ?? ""),
          category: String(row?.data?.category ?? row?.category ?? ""),
          bedrooms: Number(row?.data?.bedrooms ?? row?.bedrooms ?? 0),
          bathrooms: Number(row?.data?.bathrooms ?? row?.bathrooms ?? 0),
          size: String(row?.data?.size ?? row?.size ?? ""),
          price: Number(row?.data?.price ?? row?.price ?? 0),
          image: String(row?.data?.image ?? row?.image ?? ""),
          sortOrder: Number(row?.data?.sortOrder ?? row?.sortOrder ?? 0),
        }));
        setOptions(nextOptions);
      } catch (error) {
        console.error("Failed to load floor plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloorPlans();
  }, []);

  const isChecked = (optionId: string) =>
    items.some((item: any) => item._id === optionId);

  const toggleFloorPlan = (option: any, checked: boolean) => {
    if (checked) {
      if (items.some((item: any) => item._id === option._id)) return;
      onChange([...items, { ...option }]);
    } else {
      onChange(items.filter((item: any) => item._id !== option._id));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Floor Plans" />
        <p className="mt-1 text-xs text-muted">
          Select floor plans to attach to this property.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line p-6 text-sm text-muted">
          Loading floor plans...
        </div>
      ) : !options.length ? (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          No floor plans found. Add them from the Floor Plans section.
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onClick={() => setOpenDropdown(!openDropdown)}
            className="cursor-pointer flex justify-between items-center border border-line rounded-2xl px-4 py-3 bg-panel"
          >
            <span className="text-sm text-text">Select Floor Plans</span>
            <span className="text-xs text-muted">
              {openDropdown ? "▲" : "▼"}
            </span>
          </div>

          {openDropdown && (
            <div className="max-h-72 overflow-y-auto border border-line rounded-2xl bg-panel/40 divide-y">
              {options.map((option) => {
                const checked = isChecked(option._id);
                return (
                  <label
                    key={option._id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${checked ? "bg-panel" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={(e) =>
                        toggleFloorPlan(option, e.target.checked)
                      }
                    />
                    <div className="flex items-start gap-3">
                      {option.image ? (
                        <img
                          src={option.image}
                          alt={option.title}
                          className="h-10 w-10 rounded object-cover border border-line"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-card" />
                      )}
                      <div>
                        <div className="text-sm text-text font-medium">
                          {option.title}
                        </div>
                        <p className="text-xs text-muted">
                          {option.unitType} · {option.bedrooms}B{" "}
                          {option.bathrooms}Ba · {option.size} · ₹
                          {Number(option.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!!items.length && (
        <div className="rounded-2xl border border-line bg-panel/30 p-4">
          <p className="mb-3 text-sm font-medium text-text">
            Selected Floor Plans
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((item: any, index) => (
              <div
                key={`${item._id || item.title}-${index}`}
                className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs text-text"
              >
                <span>
                  {item.title} — {item.unitType}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  className="ml-1 text-red-400 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getRelationLabel(
  relations: RelationData,
  entity: string,
  value?: string | null,
) {
  if (!value) return "";
  const option = (relations[entity] || []).find((item) => item.value === value);
  return option?.label || value;
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
    console.log(response, "Upload response");
    const uploadedUrl =
      response?.data?.url ||
      response?.data?.data?.url ||
      response?.data?.fileUrl ||
      response?.data?.data?.fileUrl ||
      response?.data?.location ||
      response?.data?.data?.location ||
      "";

    if (!uploadedUrl) {
      throw new Error("Upload API did not return image URL");
    }

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
                const oldSlug = prev.slug || "";
                const generatedOldSlug = createSlug(prev.title || "");
                if (!oldSlug || oldSlug === generatedOldSlug) {
                  updated.slug = createSlug(next);
                }
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
            setForm((prev) => ({
              ...prev,
              [field.key]: Number(next),
            }))
          }
        />
      );

    case "textarea":
      return (
        <TextArea
          label={field.label}
          value={String(value ?? "")}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next,
            }))
          }
        />
      );
    case "editor":
      return (
        <TiptapEditor
          label={field.label}
          value={String(value ?? "")}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next,
            }))
          }
        />
      );

    case "select":
      return (
        <SelectInput
          label={field.label}
          value={String(value ?? "")}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next as never,
            }))
          }
          options={field.options || []}
        />
      );

    case "relation-select":
      return (
        <div className="space-y-2">
          <FieldLabel label={field.label} />
          <select
            className="input w-full"
            value={String(value ?? "")}
            onChange={(e) => {
              console.log(`Setting ${field.key} =`, e.target.value); // ✅ raw value
              setForm((prev) => ({
                ...prev,
                [field.key]: e.target.value,
              }));
            }}
          >
            <option value="">-- Select --</option>
            {(field.key === "communities"
              ? communityOptions
              : relations[field.relation?.entity || ""] || []
            ).map((opt) => (
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
            onChange={(val) =>
              setForm((prev) => ({
                ...prev,
                address: val,
              }))
            }
            onSelect={({ address, lat, lng }) =>
              setForm((prev) => ({
                ...prev,
                address,
                latitude: String(lat),
                longitude: String(lng),
              }))
            }
          />

          {/* Show lat/lng */}
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
            setForm((prev) => ({
              ...prev,
              [field.key]: next as never,
            }))
          }
        />
      );

    case "toggle":
      return (
        <Toggle
          label={field.label}
          checked={Boolean(value)}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next as never,
            }))
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
              setForm((prev) => ({
                ...prev,
                [field.key]: next,
              }))
            }
            placeholder="Paste image URL or upload below"
          />

          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await uploadSingleFile(file);
              setForm((prev) => ({
                ...prev,
                [field.key]: dataUrl,
              }));
            }}
          />

          {value ? (
            <img
              src={String(value)}
              alt={field.label}
              className="h-40w-full rounded-2xl border border-line object-cover"
            />
          ) : null}
          <p className="text-gold text-xs">Note: {field.note}</p>
        </div>
      );

    default:
      return null;
  }
}

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
  const developerOptions = relations["content/developer-community"] || [];
  const locationOptions = relations["content/locations"] || [];
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const fetchCommunities = async () => {
      if (!form.developer) {
        setCommunityOptions([]);
        return;
      }

      try {
        const res = await api.get(
          `/content/communities?developer=${form.developer}`,
        );

        const rows = normalizeApiArray(res);

        const options = rows.map((row: any) => ({
          label: String(row?.title ?? ""),
          value: String(row?._id ?? ""),
        }));

        setCommunityOptions(options);
      } catch (err) {
        console.error("Failed to fetch communities", err);
        setCommunityOptions([]);
      }
    };

    fetchCommunities();
  }, [form.developer]);
  const load = async () => {
    try {
      const snapshot = await api.get<WorkspaceSnapshot>("/properties/admin");
      console.log(snapshot, "Loaded properties snapshot");
      setItems(((snapshot as any) || []) as PropertyForm[]);
    } catch {
      setError("Failed to load properties.");
    }
  };

  useEffect(() => {
    load();

    const fetchRelations = async () => {
      try {
        const endpoints = [
          "content/property-types",
          "content/property-sub-types",
          // 'content/property-categories',
          "content/developer-community",
          "content/developer-types",
          "content/locations",
          "content/property-amenities",
          "content/categories",
          "content/sub-locations",
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) => api.get(`/${endpoint}`).catch(() => [])),
        );

        const nextRelations: RelationData = {};

        endpoints.forEach((endpoint, index) => {
          const rows = normalizeApiArray(responses[index]);
          nextRelations[endpoint] = rows.map((row: any) => ({
            label: String(row?.name ?? row?.title ?? row?.label ?? ""),
            value: String(row?._id ?? row?.id ?? row?.value ?? ""),
          }));
        });

        setRelations(nextRelations);
      } catch {
        // ignore relation loading errors for now
      }
    };

    fetchRelations();
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

      const matchesSearch =
        !search || searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        item?.type?._id === typeFilter ||
        item?.type === typeFilter;

      const matchesDeveloper =
        developerFilter === "all" ||
        item?.developer?._id === developerFilter ||
        item?.developer === developerFilter;

      const matchesLocation =
        locationFilter === "all" ||
        item?.location?._id === locationFilter ||
        item?.location === locationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesDeveloper &&
        matchesLocation
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
  console.log("FORM LOCATION:", form.location);
  const submit = async () => {
    try {
      setError(null);

      const slug = form.slug || createSlug(form.title || "");

      const payload = {
        ...form,

        slug,
        url: form.url || `/property/${slug}`,

        // ✅ NORMALIZE RELATIONS
        // propertyType: form.propertyType || [],
        type: form.type || [],
        propertySubType: form.propertySubType || [],
        developer: form.developer || "",
        location: form.location || "",

        // ✅ FIX CATEGORY
        categories: form.categories,
        category: form.category,

        // ✅ ARRAYS SAFE
        gallery: form.gallery || [],
        amenities: form.amenities || [],
        floorPlans: form.floorPlans || [],
        faq: form.faq || [],

        // ✅ TAG FIX
        tag: form.hotLaunch ? "HOT" : form.exclusive ? "Exclusive" : form.tag,
      };
      console.log("Submitting payload location:", payload.location);
      console.log("Submitting payload developer:", payload.developer);

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

      if (Array.isArray(val)) {
        return val
          .map((v) => (typeof v === "string" ? v : v?._id || v?.id || ""))
          .filter(Boolean);
      }
      console.log(item);
      return [typeof val === "string" ? val : val?._id || val?.id || ""].filter(
        Boolean,
      );
    };

    setForm({
      ...emptyForm,
      ...item,
      type: normalizeArrayIds(item.type),
      subType: normalizeArrayIds(item.subType),
      // ✅ TYPE FIX (important)
      propertyType: normalizeArrayIds(item.propertyType || item.type),
      propertySubType: normalizeArrayIds(item.propertySubType || item.subType),

      // ✅ DEVELOPER FIX
      developer: getId(item.developer),

      // ✅ LOCATION FIX
      location: getId(item.location),
      // sublocation: getId(item.sublocation),

      // ✅ COMMUNITY (if exists)
      communities: getId(item.communities),

      // ✅ CATEGORY FIX (string → array)
      categories: item.categories,

      // ✅ PROPERTY STATUS FIX (case normalize)
      propertyStatus: (item.propertyStatus || "ready").toLowerCase(),

      // ✅ MEDIA SAFE
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      thumbnail: item.thumbnail || "",
      propertyBanner: item.propertyBanner || "",
      enquireFormImage: item.enquireFormImage || "",
      propertydoc: item.propertydoc || "",

      // ✅ COMPLEX FIELDS
      amenities: Array.isArray(item.amenities) ? item.amenities : [],
      floorPlans: Array.isArray(item.floorPlans) ? item.floorPlans : [],
      faq: Array.isArray(item.faq) ? item.faq : [],

      // ✅ NUMBERS SAFE
      price: Number(item.price || 0),
      bedrooms: Number(item.bedrooms || 0),
      bathrooms: Number(item.bathrooms || 0),
      sortOrder: Number(item.sortOrder || 0),

      // ✅ FLAGS
      featured: Boolean(item.featured),
      active: Boolean(item.active),
      hotLaunch: Boolean(item.hotLaunch),
      exclusive: Boolean(item.exclusive),

      // ✅ PAYMENT PLAN
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
  // Add these state variables inside PropertiesPage() — near your other useState hooks
  const [previewModal, setPreviewModal] = useState<{
    type: "floorPlans" | "amenities" | "faq";
    property: PropertyForm;
  } | null>(null);
  const typeFilterOptions = relations["property-types"] || [];
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
        subtitle="Filters, actions, and richer property cards closer to the admin product flow."
        action={
          <div className="flex flex-wrap gap-3">
            {/* SEARCH */}
            <input
              className="input max-w-64"
              placeholder="Search property, city, developer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* PROPERTY TYPE */}
            <select
              className="input max-w-48"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {typeFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* ✅ DEVELOPER FILTER */}
            <select
              className="input max-w-48"
              value={developerFilter}
              onChange={(e) => setDeveloperFilter(e.target.value)}
            >
              <option value="all">All Developers</option>
              {developerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* ✅ LOCATION FILTER */}
            <select
              className="input max-w-48"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}--
                </option>
              ))}
            </select>

            {/* STATUS */}
            <select
              className="input max-w-40"
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

            <ActionButton>Manage FAQ</ActionButton>
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
                <th className="px-4 py-3">SNO.</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Developer / Features</th>
                <th className="px-4 py-3">Added At / Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((property, index) => {
                return (
                  <tr
                    key={property._id || property.title}
                    className="border-t border-line hover:bg-card/50"
                  >
                    {/* SNO */}
                    <td className="px-4 py-3 text-muted font-medium align-top w-10">
                      {index + 1}
                    </td>

                    {/* Property */}
                    <td className="px-4 py-3 align-top">
                      {/* Title */}
                      <div className="font-medium text-text mb-1">
                        {property.title}
                      </div>

                      {/* Location */}
                      <div className="text-xs text-muted mb-1">
                        {property.location?.title}
                        {property.city ? `, ${property.city}` : ""}
                      </div>

                      {/* Slug */}
                      <div className="text-xs text-muted mb-2">
                        {property.slug}
                      </div>

                      {/* Thumbnail */}

                      {Array.isArray(property?.gallery) &&
                      property.gallery.length > 0 ? (
                        <div className="flex items-center -space-x-2">
                          {property.gallery
                            .slice(0, 5)
                            .map((img: string, i: number) => (
                              <img
                                key={i}
                                src={img}
                                alt={property.title}
                                className="h-10 w-10 rounded object-cover border border-line bg-lightgray"
                              />
                            ))}

                          {/* +count badge */}
                          {property.gallery.length > 5 && (
                            <div className="h-10 w-10 flex items-center justify-center rounded bg-black text-white text-xs border border-line">
                              +{property.gallery.length - 5}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-9 w-11 rounded-lg bg-muted" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {Array.isArray(property?.type)
                        ? property.type.map((t: any) => t.title).join(", ")
                        : property?.type?.title || "—"}
                    </td>
                    {/* Action — Developer / Floor Plans / Features / FAQ */}
                    <td className="px-4 py-3 align-top max-w-[200px]">
                      <div className="flex flex-wrap gap-1.5">
                        {property?.developer?.title && (
                          <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            {property.developer.title}
                          </span>
                        )}

                        {/* Clickable Floor Plans badge */}
                        {property.floorPlans &&
                          property.floorPlans.length > 0 && (
                            <button
                              onClick={() =>
                                setPreviewModal({
                                  type: "floorPlans",
                                  property,
                                })
                              }
                              className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              Floor Plans ({property.floorPlans.length})
                            </button>
                          )}

                        {/* Clickable Features / Amenities badge */}
                        {property.amenities &&
                          property.amenities.length > 0 && (
                            <button
                              onClick={() =>
                                setPreviewModal({ type: "amenities", property })
                              }
                              className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                            >
                              Features ({property.amenities.length})
                            </button>
                          )}

                        {/* Clickable FAQ badge */}
                        {property.faq && property.faq.length > 0 && (
                          <button
                            onClick={() =>
                              setPreviewModal({ type: "faq", property })
                            }
                            className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            FAQ ({property.faq.length})
                          </button>
                        )}
                      </div>
                    </td>
                    {/* Action — Type & Developer as badges */}
                    {/* <td className="px-4 py-3 align-top max-w-[200px]">
                      <div className="flex flex-wrap gap-1.5">
                        {property?.developer?.title && (
                          <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            {property.developer.title}
                          </span>
                        )}
                        {property.floorPlans && (
                          <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Floor Plans ({property?.floorPlans?.length})
                          </span>
                        )}
                        {property.faq && (
                          <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            FAQ ({property?.faq?.length})
                          </span>
                        )}
                        {property.amenities && (
                          <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            Features ({property?.amenities?.length})
                          </span>
                        )}
                        {/* <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-card text-muted border border-line">
                          Beds: {property.bedrooms || 0}
                        </span>
                        <span className="inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-card text-muted border border-line">
                          Baths: {property.bathrooms || 0}
                        </span> 
                      </div>
                    </td>  */}

                    {/* Added At / Status */}
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-text text-sm mb-1">
                        {property?.createdAt
                          ? new Date(property.createdAt).toLocaleDateString()
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
                    <td className="px-4 py-3 text-right align-top">
                      <InlineActions
                        onEdit={() => edit(property)}
                        onDelete={() => remove(property._id)}
                      />
                    </td>
                  </tr>
                );
              })}

              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No properties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Modal
        open={open}
        onClose={close}
        title={editingId ? "Edit Property" : "Add Property"}
        subtitle="Expanded property form with SEO, geo, visibility, API relations, media, amenities, floor plans, and gallery uploads."
        size="xl"
      >
        <div className="space-y-5">
          {propertyFormSections.map((section) => (
            <div
              key={section.key}
              className="space-y-4 rounded-[24px] border border-line bg-panel/40 p-4"
            >
              <h3 className="text-sm font-semibold text-text">
                {section.title}
              </h3>

              {section.custom === "gallery" ? (
                <GalleryUploader
                  value={Array.isArray(form.gallery) ? form.gallery : []}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      gallery: next,
                    }))
                  }
                />
              ) : section.custom === "faq" ? (
                <FAQEditor
                  value={Array.isArray(form.faq) ? form.faq : []}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      faq: next,
                    }))
                  }
                />
              ) : section.custom === "amenities" ? (
                <AmenitiesEditor
                  value={Array.isArray(form.amenities) ? form.amenities : []}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      amenities: next,
                    }))
                  }
                />
              ) : section.custom === "floorPlans" ? (
                <FloorPlansEditor
                  value={Array.isArray(form.floorPlans) ? form.floorPlans : []}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      floorPlans: next,
                    }))
                  }
                />
              ) : section.custom === "file" ? ( // ✅ NEW
                <PdfUploader
                  value={form.propertydoc || ""}
                  onChange={(url) =>
                    setForm((prev) => ({
                      ...prev,
                      propertydoc: url,
                    }))
                  }
                />
              ) : (
                <FormGrid columns={section.columns || 3}>
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

          <FormActions
            onSubmit={submit}
            onCancel={close}
            submitLabel={editingId ? "Update Property" : "Create Property"}
          />
        </div>
      </Modal>
      <PropertyImportModal
        open={open2}
        onClose={() => setOpen2(false)}
        fetchProperty={load}
      />
      {/* Floor Plans / Amenities Preview Modal */}
      {previewModal && (
        <Modal
          open={!!previewModal}
          onClose={() => setPreviewModal(null)}
          title={
            previewModal.type === "floorPlans"
              ? `Floor Plans — ${previewModal.property.title}`
              : `Features / Amenities — ${previewModal.property.title}`
          }
          subtitle={
            previewModal.type === "floorPlans"
              ? "All floor plans attached to this property."
              : "All amenities attached to this property."
          }
          size="xl"
        >
          {previewModal.type === "floorPlans" ? (
            // ── FLOOR PLANS LIST ──
            <div className="space-y-3">
              {(previewModal.property.floorPlans || []).length === 0 ? (
                <p className="text-sm text-muted">No floor plans added.</p>
              ) : (
                (previewModal.property.floorPlans || []).map((fp, i) => (
                  <div
                    key={fp._id || i}
                    className="flex items-start gap-4 rounded-2xl border border-line bg-panel/60 p-4"
                  >
                    {/* Image */}
                    {fp.image ? (
                      <img
                        src={fp.image}
                        alt={fp.title}
                        className="h-20 w-24 rounded-xl object-cover border border-line shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-24 rounded-xl bg-card border border-line shrink-0" />
                    )}

                    {/* Details */}
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-text">{fp.title}</div>
                      <div className="text-xs text-muted">
                        Unit Type:{" "}
                        <span className="text-text">{fp.unitType || "—"}</span>
                        {fp.category ? (
                          <>
                            {" "}
                            &nbsp;·&nbsp; Category:{" "}
                            <span className="text-text">{fp.category}</span>
                          </>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted mt-1">
                        <span>🛏 {fp.bedrooms ?? 0} Beds</span>
                        <span>🚿 {fp.bathrooms ?? 0} Baths</span>
                        {fp.size ? <span>📐 {fp.size}</span> : null}
                        {fp.price ? (
                          <span className="text-gold font-medium">
                            ₹{Number(fp.price).toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Sort Order */}
                    {fp.sortOrder !== undefined && (
                      <div className="text-xs text-muted shrink-0">
                        #{fp.sortOrder}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : previewModal.type === "amenities" ? (
            // ── AMENITIES LIST ──
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(previewModal.property.amenities || []).length === 0 ? (
                <p className="text-sm text-muted col-span-full">
                  No amenities added.
                </p>
              ) : (
                (previewModal.property.amenities || []).map((amenity, i) => (
                  <div
                    key={amenity._id || i}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-panel/60 px-4 py-3"
                  >
                    {amenity.icon ? (
                      <img
                        src={amenity.icon}
                        alt={amenity.title}
                        className="h-9 w-9 rounded-lg object-cover border border-line shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-card border border-line shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-text">
                        {amenity.title}
                      </div>
                      {amenity.description ? (
                        <div className="text-xs text-muted mt-0.5">
                          {amenity.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // ── FAQ LIST ──
            <div className="space-y-3">
              {(previewModal.property.faq || []).length === 0 ? (
                <p className="text-sm text-muted">No FAQs added.</p>
              ) : (
                (previewModal.property.faq || []).map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-line bg-panel/60 p-4 space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                        {i + 1}
                      </span>
                      <div className="font-medium text-text text-sm leading-snug">
                        {item.question}
                      </div>
                    </div>
                    {item.answer && (
                      <div className="ml-9 text-sm text-muted leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </Modal>
      )}
    </DashboardShell>
  );
}
