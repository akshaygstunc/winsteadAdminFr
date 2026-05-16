"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { Modal } from "@/components/modal";
import { api } from "@/lib/api";
import { CmsConfig, CmsField, CmsItem } from "@/lib/cms";
import { ActionButton, SectionCard, StatusBadge } from "@/components/ui";
import {
  FieldLabel,
  FormActions,
  InlineActions,
  SectionNotice,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/crud-kit";
import { TiptapEditor } from "./TextEditor";
// import ImagePickerModal from "./ImagePicker";
import { Upload, Images, X, Loader2 } from "lucide-react";
import ImagePickerModal from "@/app/properties/ImagePicker";

type RelationOption = { label: string; value: string };
type RelationOptionsMap = Record<string, RelationOption[]>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeApiArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.payload)) return response.payload;
  return [];
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/content/upload/gallery", formData, {});
  const url =
    response?.data?.url ||
    response?.data?.data?.url ||
    response?.data?.fileUrl ||
    response?.data?.data?.fileUrl ||
    response?.data?.location ||
    response?.data?.data?.location ||
    "";
  if (!url) throw new Error("Upload API did not return a URL.");
  return url;
}

function blankFromConfig(config: CmsConfig): CmsItem {
  const data: Record<string, any> = {};
  for (const field of config.fields) {
    if (
      [
        "title",
        "subtitle",
        "slug",
        "status",
        "image",
        "description",
        "sortOrder",
      ].includes(field.key)
    )
      continue;
    if (field.type === "boolean") data[field.key] = false;
    else if (field.type === "number") data[field.key] = 0;
    else if (field.type === "multiselect") data[field.key] = [];
    else if (field.type === "relation-select" && (field as any).multiple)
      data[field.key] = [];
    else if (field.type === "advertisement") data[field.key] = [];
    else data[field.key] = "";
  }
  return {
    title: "",
    subtitle: "",
    slug: "",
    status: "draft",
    image: "",
    description: "",
    sortOrder: 0,
    advertisements: [],
    data,
  };
}

function getValue(item: CmsItem, field: CmsField) {
  const topLevelKeys = [
    "title",
    "subtitle",
    "slug",
    "status",
    "image",
    "description",
    "sortOrder",
    "advertisements", // ← ADD THIS
  ];
  if (topLevelKeys.includes(field.key)) return (item as any)[field.key];
  if (field.key in item) return (item as any)[field.key];
  return item.data?.[field.key];
}

function setValue(item: CmsItem, field: CmsField, value: any): CmsItem {
  const topLevelKeys = [
    "title",
    "subtitle",
    "slug",
    "status",
    "image",
    "description",
    "sortOrder",
    "advertisements", // ← ADD THIS
  ];
  if (field.key in item || topLevelKeys.includes(field.key)) {
    return { ...item, [field.key]: value };
  }
  return { ...item, data: { ...(item.data || {}), [field.key]: value } };
}

// ─── ImageField — Upload + Select from Assets ─────────────────────────────────

function ImageField({
  field,
  value,
  onChange,
}: {
  field: CmsField;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isVideo = field.type === "video";

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadFile(file);
      onChange(url);
    } catch {
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3 w-full">
      <FieldLabel label={field.label} />

      {/* Two buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 transition disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
          ) : (
            <Upload className="h-4 w-4 text-muted" />
          )}
          {uploading ? "Uploading..." : "Upload File"}
        </button>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold hover:bg-gold/20 transition"
        >
          <Images className="h-4 w-4" />
          Select Uploaded
        </button>

        <input
          ref={fileRef}
          type="file"
          accept={isVideo ? "video/*" : "image/*"}
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Optional URL paste */}
      <button
        type="button"
        onClick={() => setShowUrl((v) => !v)}
        className="text-xs text-muted hover:text-gold underline underline-offset-2 transition"
      >
        {showUrl ? "Hide URL input" : "Or paste URL manually"}
      </button>
      {showUrl && (
        <input
          className="input text-sm mt-1"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste ${isVideo ? "video" : "image"} URL here...`}
        />
      )}

      {/* Preview */}
      {value && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-line bg-black">
          {isVideo ? (
            <video
              src={value}
              controls
              className="w-full h-[200px] object-cover"
            />
          ) : (
            <img
              src={value}
              alt={field.label}
              className="w-full h-[200px] object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-xl bg-black/60 p-1.5 text-white hover:bg-red-500/80 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {field.note && <p className="text-xs text-muted">{field.note}</p>}

      {/* Reuse existing ImagePickerModal — single select */}
      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple={false}
        onSelect={(urls) => {
          if (urls[0]) onChange(urls[0]);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

// ─── GalleryUploader ──────────────────────────────────────────────────────────

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
  const [pickerOpen, setPickerOpen] = useState(false);

  const uploadSingleFile = async (file: File): Promise<string> => {
    try {
      return await uploadFile(file);
    } catch (error: any) {
      const msg =
        typeof error?.response?.data?.message === "string"
          ? error.response.data.message
          : error?.message || "Failed to upload file";
      alert(msg);
      throw error;
    }
  };

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const nextImages = [...images];
      for (const file of files) {
        const url = await uploadSingleFile(file);
        nextImages.push(url);
        onChange([...nextImages]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addUrl = () => {
    const next = urlInput.trim();
    if (!next) return;
    onChange([...images, next]);
    setUrlInput("");
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Gallery Images" />
        <p className="mt-1 text-xs text-muted">
          Upload multiple images or paste URLs.
        </p>
      </div>

      <div className="space-y-3 rounded-[24px] border border-line bg-panel/40 p-4">
        {/* URL row */}
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

        {/* Two buttons */}
        <div className="flex gap-2 flex-wrap">
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

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold hover:bg-gold/20 transition"
          >
            <Images className="h-4 w-4" />
            Select Uploaded
          </button>
        </div>
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
              {image && (
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="h-20 w-20 rounded-2xl border border-line object-cover"
                />
              )}
              <div className="flex justify-end">
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

      {/* Picker modal — multi select, appends to gallery */}
      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple={true}
        onSelect={(urls) => {
          const merged = Array.from(new Set([...images, ...urls]));
          onChange(merged);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

// ─── AdvertisementsSection ────────────────────────────────────────────────────

// Drop-in replacement for AdvertisementsSection in your BlogEditorPage file.

type AdSlot = {
  position: string;
  code: string;
  image: string;
  text: string;
  link: string;
};

const emptyAdSlot = (): AdSlot => ({
  position: "",
  code: "",
  image: "",
  text: "",
  link: "",
});

function AdvertisementsSection({
  value,
  onChange,
}: {
  value: AdSlot[];
  onChange: (next: AdSlot[]) => void;
}) {
  const ads = Array.isArray(value) ? value : [];
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [pickerOpenIndex, setPickerOpenIndex] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const add = () => onChange([...ads, emptyAdSlot()]);

  const update = (index: number, key: keyof AdSlot, val: string) => {
    const next = [...ads];
    next[index] = { ...next[index], [key]: val };
    onChange(next);
  };

  const remove = (index: number) => onChange(ads.filter((_, i) => i !== index));

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading((prev) => ({ ...prev, [index]: true }));
      const url = await uploadFile(file);
      update(index, "image", url);
    } catch {
      alert("Failed to upload image.");
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }));
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted uppercase tracking-wider">
        Advertisements
      </p>

      <div className="rounded-[16px] border border-line bg-panel p-3 space-y-3">
        {ads.length === 0 && (
          <p className="text-xs text-muted text-center py-2">
            No ad slots added yet.
          </p>
        )}

        {ads.map((ad, i) => (
          <div
            key={i}
            className="rounded-[12px] border border-line bg-card p-3 space-y-3"
          >
            {/* Slot header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text">
                Ad Slot {i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>

            {/* position */}
            <TextInput
              label="Position"
              value={ad.position}
              onChange={(v) => update(i, "position", v)}
              placeholder="e.g. Top of article, After paragraph 3"
            />

            {/* text */}
            <TextArea
              label="Advertisement Text"
              value={ad.text}
              onChange={(v) => update(i, "text", v)}
              rows={3}
            />

            {/* link */}
            <TextInput
              label="Link / Destination URL"
              value={ad.link}
              onChange={(v) => update(i, "link", v)}
              placeholder="https://..."
            />

            {/* code */}
            <TextInput
              label="Ad Code / Embed"
              value={ad.code}
              onChange={(v) => update(i, "code", v)}
              placeholder="<script> or ad network code"
            />

            {/* image */}
            <div className="space-y-2">
              <FieldLabel label="Ad Image" />

              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={uploading[i]}
                  onClick={() => fileRefs.current[i]?.click()}
                  className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-xs text-text hover:border-gold/50 transition disabled:opacity-50"
                >
                  {uploading[i] ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 text-muted" />
                  )}
                  {uploading[i] ? "Uploading..." : "Upload Image"}
                </button>

                <button
                  type="button"
                  onClick={() => setPickerOpenIndex(i)}
                  className="flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold hover:bg-gold/20 transition"
                >
                  <Images className="h-3.5 w-3.5" />
                  Select Uploaded
                </button>

                <input
                  ref={(el) => {
                    fileRefs.current[i] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, i)}
                />
              </div>

              {/* paste URL fallback */}
              <input
                className="input text-xs w-full"
                value={ad.image || ""}
                onChange={(e) => update(i, "image", e.target.value)}
                placeholder="Or paste image URL..."
              />

              {/* preview */}
              {ad.image && (
                <div className="relative w-full rounded-xl overflow-hidden border border-line bg-black">
                  <img
                    src={ad.image}
                    alt={`Ad ${i + 1}`}
                    className="w-full h-[120px] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => update(i, "image", "")}
                    className="absolute top-1.5 right-1.5 rounded-lg bg-black/60 p-1 text-white hover:bg-red-500/80 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Payload preview — so you can verify keys */}
            <details className="group">
              <summary className="cursor-pointer text-[10px] text-muted hover:text-gold transition-colors select-none">
                Preview payload keys
              </summary>
              <pre className="mt-1.5 rounded-xl bg-black/80 p-3 text-[10px] text-green-400 overflow-x-auto">
                {JSON.stringify(
                  {
                    position: ad.position || "",
                    text: ad.text || "",
                    link: ad.link || "",
                    code: ad.code || "",
                    image: ad.image || "",
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="w-full rounded-[12px] border border-dashed border-line py-2 text-xs text-muted hover:text-text transition-colors"
        >
          + Add advertisement
        </button>
      </div>

      {/* Single shared picker modal keyed by slot index */}
      <ImagePickerModal
        open={pickerOpenIndex !== null}
        onClose={() => setPickerOpenIndex(null)}
        multiple={false}
        onSelect={(urls) => {
          if (pickerOpenIndex !== null && urls[0]) {
            update(pickerOpenIndex, "image", urls[0]);
          }
          setPickerOpenIndex(null);
        }}
      />
    </div>
  );
}

// ─── renderField ──────────────────────────────────────────────────────────────

function renderField(
  field: CmsField,
  value: any,
  onChange: (value: any) => void,
  relationOptions: RelationOptionsMap = {},
) {
  switch (field.type) {
    case "textarea":
      return (
        <TextArea
          label={field.label}
          value={value || ""}
          onChange={onChange}
          rows={field?.key?.toLowerCase()?.includes("body") ? 5 : 4}
        />
      );
    case "editor":
      return (
        <div className="w-full">
          <TiptapEditor
            label={field.label}
            value={value || ""}
            onChange={onChange}
            note={field.note}
          />
        </div>
      );
    case "select":
      return (
        <SelectInput
          label={field.label}
          value={value || ""}
          onChange={onChange}
          options={field.options || []}
        />
      );
    case "relation-select": {
      const options = relationOptions[field.relation?.endpoint] || [];
      const isMultiple = Boolean((field as any).multiple);
      if (isMultiple) {
        const selected = Array.isArray(value) ? value.map(String) : [];
        return (
          <div>
            <FieldLabel label={field.label} />
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-2 text-sm text-text"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={(e) =>
                      onChange(
                        e.target.checked
                          ? [...selected, option.value]
                          : selected.filter((v) => v !== option.value),
                      )
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {!options.length && (
              <p className="mt-2 text-xs text-muted">No options available.</p>
            )}
            {field.note && (
              <p className="mt-2 text-xs text-muted">{field.note}</p>
            )}
          </div>
        );
      }
      return (
        <div>
          <SelectInput
            label={field.label}
            value={value || ""}
            onChange={onChange}
            options={[
              { label: `Select ${field.label}`, value: "" },
              ...options,
            ]}
          />
          {!options.length && (
            <p className="mt-2 text-xs text-muted">No options available.</p>
          )}
          {field.note && (
            <p className="mt-2 text-xs text-muted">{field.note}</p>
          )}
        </div>
      );
    }
    case "number":
      return (
        <TextInput
          label={field.label}
          type="number"
          value={value ?? 0}
          onChange={(v) => onChange(Number(v))}
        />
      );
    case "date":
      return (
        <TextInput
          label={field.label}
          type="date"
          value={value || ""}
          onChange={onChange}
        />
      );
    case "boolean":
      return (
        <div>
          <FieldLabel label={field.label} />
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span>Enabled</span>
          </label>
        </div>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div>
          <FieldLabel label={field.label} />
          <div className="grid gap-2 sm:grid-cols-2">
            {(field.options || []).map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-2 text-sm text-text"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, option.value]
                        : selected.filter((v: string) => v !== option.value),
                    )
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {field.note && (
            <p className="mt-2 text-xs text-muted">{field.note}</p>
          )}
        </div>
      );
    }
    case "icon":
      return (
        <div>
          <FieldLabel label={field.label} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              "building-2",
              "map-pin",
              "star",
              "home",
              "users",
              "images",
              "briefcase-business",
              "badge-dollar-sign",
            ].map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => onChange(icon)}
                className={`rounded-2xl border px-3 py-3 text-sm ${value === icon ? "border-gold bg-gold/10 text-gold" : "border-line bg-panel text-text"}`}
              >
                {icon}
              </button>
            ))}
          </div>
          {field.note && (
            <p className="mt-2 text-xs text-muted">{field.note}</p>
          )}
        </div>
      );

    // ── Image / Video — two-button picker ──
    case "video":
    case "image":
      return (
        <ImageField field={field} value={value || ""} onChange={onChange} />
      );

    case "gallery":
      return <GalleryUploader value={value || []} onChange={onChange} />;

    // ── Advertisement — rendered via renderField too ──
    case "advertisement":
      return <AdvertisementsSection value={value || []} onChange={onChange} />;

    default:
      return (
        <div>
          <TextInput
            label={field.label}
            value={value || ""}
            onChange={onChange}
          />
          {field.note && (
            <p className="mt-2 text-xs text-muted">{field.note}</p>
          )}
        </div>
      );
  }
}

function isFullWidth(field: CmsField) {
  return [
    "editor",
    "textarea",
    "gallery",
    "image",
    "video",
    "multiselect",
    "relation-select",
    "icon",
    "advertisement",
  ].includes(field.type);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function BlogEditorPage({ config }: { config: CmsConfig }) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<CmsItem>(blankFromConfig(config));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [relationOptions, setRelationOptions] = useState<RelationOptionsMap>(
    {},
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fields = useMemo(() => config.fields, [config]);
  const mainFields = fields.filter((f) => f?.layout === "main");
  const sidebarFields = fields.filter((f) => f?.layout === "sidebar");

  // ── check if any field is type advertisement (for always-visible sidebar section)
  const hasAdvertisementField = fields.some((f) => f.type === "advertisement");
  const advertisementField = fields.find((f) => f.type === "advertisement");

  useEffect(() => {
    (async () => {
      try {
        const endpoints = [
          "content/property-types",
          "content/developer-community",
        ];
        const responses = await Promise.all(
          endpoints.map((ep) => api.get(`/${ep}`).catch(() => [])),
        );
        const nextRelations: RelationOptionsMap = {};
        endpoints.forEach((ep, i) => {
          nextRelations[ep] = normalizeApiArray(responses[i]).map(
            (row: any) => ({
              label: String(row?.name ?? row?.title ?? row?.label ?? ""),
              value: String(row?._id ?? row?.id ?? row?.value ?? ""),
            }),
          );
        });
        setRelationOptions(nextRelations);
      } catch {
        // ignore
      }
    })();
  }, []);

  const load = async (term = "") => {
    try {
      const rows = await api.get<CmsItem[]>(
        `/content/${config.entity}${term ? `?search=${encodeURIComponent(term)}` : ""}`,
      );
      setItems(rows);
    } catch {
      setError("Failed to load records.");
    }
  };

  useEffect(() => {
    load();
  }, [config.entity]);

  const reset = () => {
    setEditingId(null);
    setForm(blankFromConfig(config));
    setIsModalOpen(false);
  };

  const edit = (item: CmsItem) => {
    setEditingId(item._id || null);
    setForm({
      ...blankFromConfig(config),
      ...item,
      data: { ...blankFromConfig(config).data, ...(item.data || {}) },
    });
    setIsModalOpen(true);
  };

  const submit = async () => {
    try {
      const payload = {
        ...form,
        slug:
          form.slug ||
          form.title
            ?.toLowerCase()
            ?.replace(/[^a-z0-9]+/g, "-")
            ?.replace(/(^-|-$)+/g, ""),
      };
      if (editingId) {
        await api.patch(`/content/${config.entity}/${editingId}`, payload);
      } else {
        await api.post(`/content/${config.entity}`, payload);
      }
      setMessage(editingId ? "Updated successfully." : "Created successfully.");
      setError(null);
      reset();
      await load(search);
    } catch {
      setError("Unable to save record.");
      setMessage(null);
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/content/${config.entity}/${id}`);
      setMessage("Deleted successfully.");
      setError(null);
      if (editingId === id) reset();
      await load(search);
    } catch {
      setError("Unable to delete record.");
      setMessage(null);
    }
  };

  return (
    <DashboardShell>
      <Header title={config.title} subtitle={config.subtitle} />

      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        {/* ── Modal ── */}
        <Modal open={isModalOpen} onClose={reset} size="full">
          <div className="flex flex-col h-[90vh]">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b px-6 py-3 bg-white shrink-0">
              <h2 className="text-lg font-semibold">
                {editingId ? `Edit ${config.title}` : `Add ${config.title}`}
              </h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status === "published"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.checked ? "published" : "draft",
                      }))
                    }
                  />
                  Publish
                </label>
                <ActionButton onClick={submit}>SAVE</ActionButton>
                {editingId && (
                  <ActionButton secondary onClick={() => remove(editingId)}>
                    Delete
                  </ActionButton>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left — main fields */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {mainFields.map((field) => (
                  <div key={field.key}>
                    {renderField(
                      field,
                      getValue(form, field),
                      (value) =>
                        setForm((prev) => setValue(prev, field, value)),
                      relationOptions,
                    )}
                  </div>
                ))}
              </div>

              {/* Right sidebar */}
              <div className="w-[320px] border-l bg-gray-50 px-4 py-4 overflow-y-auto space-y-4 shrink-0">
                {/* Sidebar fields (non-advertisement) */}
                {sidebarFields
                  .filter((f) => f.type !== "advertisement")
                  .map((field) => (
                    <div key={field.key}>
                      {renderField(
                        field,
                        getValue(form, field),
                        (value) =>
                          setForm((prev) => setValue(prev, field, value)),
                        relationOptions,
                      )}
                    </div>
                  ))}

                {/* ── Advertisements ── */}
                {advertisementField ? (
                  <AdvertisementsSection
                    value={getValue(form, advertisementField) || []}
                    onChange={(next) =>
                      setForm((prev) =>
                        setValue(prev, advertisementField, next),
                      )
                    }
                  />
                ) : (
                  <AdvertisementsSection
                    value={(form as any).advertisements || []}
                    onChange={(next) =>
                      setForm((prev) => ({ ...prev, advertisements: next }))
                    }
                  />
                )}

                {/* Fallback: if no advertisement field in config, show standalone */}
                {!advertisementField && (
                  <AdvertisementsSection
                    value={(form as any).advertisements || []}
                    onChange={(next) =>
                      setForm((prev) => ({ ...prev, advertisements: next }))
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </Modal>

        {/* Listing */}
        <SectionCard
          title={`${config.title} Listing`}
          subtitle="Search, review, edit, and remove saved records."
          action={
            <ActionButton
              onClick={() => {
                setForm(blankFromConfig(config));
                setEditingId(null);
                setIsModalOpen(true);
              }}
            >
              Add New
            </ActionButton>
          }
        >
          <div className="mb-5 flex gap-3">
            <input
              className="input max-w-72"
              placeholder={config.searchPlaceholder || "Search"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load(search);
              }}
            />
            <ActionButton secondary onClick={() => load(search)}>
              Search
            </ActionButton>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-line bg-panel/70">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-card/50">
                  <tr>
                    <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider w-14">
                      SNO.
                    </th>
                    <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider w-20">
                      Image
                    </th>
                    <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">
                      Added At
                    </th>
                    <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-4 text-xs font-medium text-muted uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item._id || item.title}
                      className="border-b border-line last:border-none hover:bg-card/40 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-muted">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-12 w-12 overflow-hidden rounded-xl border border-line bg-card">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-violet-500/15 to-gold/10" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-text">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="mt-1 text-xs text-muted">
                            {item.subtitle}
                          </p>
                        )}
                        {item.slug && (
                          <p className="mt-1 text-xs text-muted/60">
                            /{item.slug}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 min-w-[160px]">
                        <p className="text-sm text-muted">
                          {item.data?.author || item.subtitle}
                        </p>
                        <p className="mt-1 text-xs text-muted/60">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                },
                              ) +
                              " " +
                              new Date(item.createdAt).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )
                            : "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          value={item.status || "draft"}
                          tone={
                            item.status === "active" ||
                            item.status === "published"
                              ? "green"
                              : item.status === "not active" ||
                                  item.status === "draft"
                                ? "red"
                                : "slate"
                          }
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <InlineActions
                          onEdit={() => edit(item)}
                          onDelete={() => remove(item._id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!items.length && (
              <div className="p-8 text-sm text-muted">No records found.</div>
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
