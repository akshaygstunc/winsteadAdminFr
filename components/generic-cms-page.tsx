"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { Modal } from "@/components/modal";
import { ActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api";
import { CmsConfig, CmsField, CmsItem } from "@/lib/cms";

// Extend CmsConfig to include cardMeta if not already defined
declare module "@/lib/cms" {
  interface CmsConfig {
    cardMeta?: string[];
  }
}
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
import { TiptapEditor } from "./TextEditor";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

function blankFromConfig(config: CmsConfig): CmsItem {
  const data: Record<string, any> = {};

  const isContactQuery = config.entity === "contact-query";

  for (const field of config.fields) {
    // skip root-level fields
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
    ) {
      continue;
    }

    // ✅ SPECIAL CASE: contact-query (no forced defaults)
    if (isContactQuery) {
      data[field.key] = "";
      continue;
    }

    switch (field.type) {
      case "boolean":
        data[field.key] = false;
        break;

      case "number":
        data[field.key] = 0;
        break;

      case "multiselect":
        data[field.key] = [];
        break;

      case "relation-select":
        data[field.key] = (field as any).multiple ? [] : "";
        break;

      case "gallery":
        data[field.key] = [];
        break;

      // ✅ FIXED: these should NOT be arrays
      case "image":
      case "video":
      case "text":
      case "textarea":
      case "editor":
      case "date":
      case "select":
        data[field.key] = "";
        break;

      case "faq":
        data[field.key] = [];
        break;

      default:
        data[field.key] = "";
        break;
    }
  }

  return {
    title: "",
    subtitle: "",
    slug: "",
    status: "draft",
    image: "",
    description: "",
    sortOrder: 0,
    data,
  };
}

function getValue(item: CmsItem, field: CmsField) {
  if (field.key in item) return (item as any)[field.key];
  return (
    item.data?.[field.key] ??
    (field.type === "number" ? 0 : field.type === "boolean" ? false : "")
  );
}

function setValue(item: CmsItem, field: CmsField, value: any): CmsItem {
  if (field.key in item) return { ...item, [field.key]: value };
  return { ...item, data: { ...(item.data || {}), [field.key]: value } };
}

async function fileToDataUrl(file: File) {
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
  return uploadedUrl;
}
function RelationSelect({ field, value, onChange }: any) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const res = await api.get(`/${field.relation.endpoint}`);
      console.log(res);
      setOptions(res || []);
    };
    fetchOptions();
  }, []);

  return (
    <div>
      <FieldLabel label={field.label} />
      <select
        className="input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select {field.label}</option>
        {options.map((opt: any) => (
          <option key={opt._id} value={opt._id}>
            {opt.title}
          </option>
        ))}
      </select>
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
function AddressEditor({
  value,
  onChange,
}: {
  value: { location: string; address: string }[];
  onChange: (val: any[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (index: number, key: string, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: val };
    onChange(next);
  };

  const addItem = () => {
    onChange([...items, { location: "", address: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <p className="text-sm font-medium text-gold">Addresses</p>
        <button
          onClick={addItem}
          className="border border-50 border-gold/50 bg-gold/10 text-gold px-4 py-2 rounded-2xl"
        >
          Add Address
        </button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="border p-4 rounded-xl space-y-3">
          <input
            className="input"
            placeholder="Location (e.g. Dubai Marina)"
            value={item.location}
            onChange={(e) => updateItem(index, "location", e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Full Address"
            value={item.address}
            onChange={(e) => updateItem(index, "address", e.target.value)}
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
    <div className="space-y-6 w-full">
      <div>
        <FieldLabel label="Gallery Images" />
        <p className="mt-1 text-xs text-muted">
          Upload multiple property gallery images or paste image URLs.
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
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
                  className="h-20 w-20 rounded-2xl border border-line object-cover"
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
function validateMediaDimensions(
  file: File,
  width: number,
  height: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image")) {
      const img = new Image();
      img.onload = () => {
        resolve(img.width === width && img.height === height);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve(video.videoWidth === width && video.videoHeight === height);
        URL.revokeObjectURL(url);
      };
      video.src = url;
    } else {
      resolve(false);
    }
  });
}
function renderField(
  field: CmsField & { type: CmsField["type"] | "faq" },
  value: any,
  onChange: (value: any) => void,
) {
  console.log("Rendering field:", field, "with value:", field.label);
  switch (field.type) {
    case "textarea":
      return (
        <TextArea label={field.label} value={value || ""} onChange={onChange} />
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
    case "number":
      return (
        <TextInput
          label={field.label}
          type="number"
          value={value ?? 0}
          onChange={(v) => onChange(Number(v))}
          min={0}
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
    case "relation-select":
      return <RelationSelect field={field} value={value} onChange={onChange} />;
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
          {field.note ? (
            <p className="mt-2 text-xs text-muted">{field.note}</p>
          ) : null}
        </div>
      );
    }
    case "editor":
      return (
        <TiptapEditor
          label={field.label}
          value={value || ""}
          onChange={onChange}
          note={field.note}
        />
      );
    case "gallery":
      return <GalleryUploader value={value || []} onChange={onChange} />;
    case "faq":
      // console.log('Rendering FAQEditor with value:', value);
      return (
        <div>
          <FAQEditor value={value || []} onChange={onChange} />
        </div>
      );
    case "address":
      // console.log('Rendering FAQEditor with value:', value);
      return (
        <div>
          <AddressEditor value={value || []} onChange={onChange} />
        </div>
      );
    case "icon": {
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
          {field.note ? (
            <p className="mt-2 text-xs text-muted">{field.note}</p>
          ) : null}
        </div>
      );
    }
    case "video":
    case "image":
      return (
        <div className="space-y-4 w-full">
          <TextInput
            label={field.label}
            value={value || ""}
            onChange={onChange}
            placeholder={`Paste ${field.type} URL or upload below`}
          />

          {/* Upload */}
          <div>
            <FieldLabel label={`${field.label} Upload`} />
            <input
              className="input"
              type="file"
              accept={field.type === "video" ? "video/*" : "image/*"}
              onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const uploadedUrl = await fileToDataUrl(file);
                onChange(uploadedUrl);
              }}
            />
          </div>

          {/* ✅ PREVIEW FIX */}
          {value && (
            <div className="w-full rounded-2xl overflow-hidden border border-line bg-black">
              {field.type === "video" ? (
                <video
                  src={value}
                  controls
                  className="w-full h-[100px] md:h-[200px] object-cover"
                />
              ) : (
                <img
                  src={value}
                  alt={field.label}
                  className="w-full h-30 object-cover"
                />
              )}
            </div>
          )}

          {field.note && <p className="text-xs text-muted">{field.note}</p>}
        </div>
      );
    default:
      return (
        <div>
          <TextInput
            label={field.label}
            value={value || ""}
            onChange={onChange}
            placeholder={field.placeholder}
          />
          {field.note ? (
            <p className="mt-2 text-xs text-muted">{field.note}</p>
          ) : null}
        </div>
      );
  }
}
async function fetchAndUploadFromUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch media");
    }

    const blob = await res.blob();

    const file = new File([blob], "media-file", {
      type: blob.type || "application/octet-stream",
    });

    const uploadedUrl = await fileToDataUrl(file);

    return uploadedUrl;
  } catch (err) {
    console.error("Media fetch/upload failed:", err);
    throw err;
  }
}
export function GenericCmsPage({ config }: { config: CmsConfig }) {
  const isSingleton = config.mode === "singleton";
  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<CmsItem>(blankFromConfig(config));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(isSingleton);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [developerFilter, setDeveloperFilter] = useState("");
  const [developers, setDevelopers] = useState<any[]>([]);
  useEffect(() => {
    if (config.entity === "communities") {
      const fetchDevelopers = async () => {
        try {
          const res = await api.get("/content/developer-community");
          setDevelopers(res || []);
        } catch (err) {
          console.error("Failed to load developers");
        }
      };
      fetchDevelopers();
    }
  }, [config.entity]);
  const load = async (term = "") => {
    setLoading(true);
    setError(null);

    try {
      if (isSingleton) {
        const item = await api.get<CmsItem>(
          `/content/${config.entity}/singleton`,
        );
        setItems([item]);
        setForm({
          ...blankFromConfig(config),
          ...item,
          data: {
            ...blankFromConfig(config).data,
            ...(item.data || {}),
          },
        });
        setOpen(true);
      } else {
        // ✅ CONTACT QUERY (unchanged)
        if (config.entity === "contact-query") {
          const rows = await api.get<CmsItem[]>(
            `/contact-query${term ? `?search=${encodeURIComponent(term)}` : ""}`,
          );

          setItems(rows?.data);
          return;
        }

        // ✅ USER ACCESS (unchanged)
        if (config.entity === "user-access") {
          const rows = await api.get<CmsItem[]>(
            `/auth/users${term ? `?search=${encodeURIComponent(term)}` : ""}`,
          );

          setItems(rows);
          return;
        }

        // ✅ BUILD QUERY (NEW PART)
        let queryParams = new URLSearchParams();

        if (term) {
          queryParams.append("search", term);
        }

        // 👉 ONLY APPLY FOR COMMUNITIES
        if (config.entity === "communities" && developerFilter) {
          queryParams.append("developer", developerFilter);
        }

        const queryString = queryParams.toString();

        const rows = await api.get<CmsItem[]>(
          `/content/${config.entity}${queryString ? `?${queryString}` : ""}`,
        );

        setItems(rows);
      }
    } catch (err) {
      setError("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(search);
  }, [config.entity, developerFilter]);
  const getFieldSpan = (field: CmsField) => {
    const fullWidthTypes = [
      "textarea",
      "editor",
      "gallery",
      "image",
      "video",
      "faq",
      "address",
    ];

    return fullWidthTypes.includes(field.type) ? "col-span-6" : "col-span-3";
  };
  const groupedFields = useMemo(() => {
    const chunks: CmsField[][] = [];
    for (let i = 0; i < config.fields.length; i += 3)
      chunks.push(config.fields.slice(i, i + 3));
    return chunks;
  }, [config.fields]);

  const resetForm = () => {
    setEditingId(null);
    setForm(blankFromConfig(config));
    if (!isSingleton) setOpen(false);
  };

  const onEdit = (item: CmsItem) => {
    const base = blankFromConfig(config);

    setEditingId(item._id || null);
    setForm({
      ...base,
      ...item,
      data: {
        ...base.data,
        ...(item.data || {}),
      },
    });

    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      setError(null);

      const isUserAccess = config.entity === "user-access";
      const base =
        isUserAccess && !editingId
          ? "/auth/register" // ✅ custom API
          : `/content/${config.entity}`;
      const updateBase =
        isUserAccess && editingId
          ? `/auth/update-user/${editingId}`
          : `/content/${config.entity}/${editingId}`; // ✅ custom API
      // ✅ Singleton only for normal content APIs
      if (isSingleton && !isUserAccess) {
        await api.patch(`${base}/singleton`, form);
        setMessage("Saved successfully.");
        await load();
        return;
      }
      const formdata = isUserAccess ? { ...form.data } : form;
      // ✅ UPDATE
      if (editingId) {
        await api.patch(`${updateBase}`, formdata);
      }
      // ✅ CREATE
      else {
        await api.post(base, formdata);
      }

      setMessage(editingId ? "Updated successfully." : "Created successfully.");
      resetForm();
      await load(search);
    } catch (err) {
      console.error(err);
      setError("Unable to save record.");
    }
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/content/${config.entity}/${id}`);
      setMessage("Deleted successfully.");
      await load(search);
    } catch {
      setError("Unable to delete record.");
    }
  };

  return (
    <DashboardShell>
      <Header title={config.title} subtitle={config.subtitle} />
      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        {!isSingleton ? (
          <SectionCard
            title={`${config.title} Records`}
            subtitle="Fully wired add, edit, delete, search, and image persistence flow."
            action={
              <div className="flex gap-3">
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
                {config.entity !== "contact-query" && (
                  <ActionButton
                    onClick={() => {
                      setEditingId(null);
                      setForm(blankFromConfig(config));
                      setOpen(true);
                    }}
                  >
                    {config.addLabel || "Add New"}
                  </ActionButton>
                )}
                {config.entity === "communities" && (
                  <select
                    className="input w-56"
                    value={developerFilter}
                    onChange={(e) => setDeveloperFilter(e.target.value)}
                  >
                    <option value="">All Developers</option>
                    {developers.map((dev: any) => (
                      <option key={dev._id} value={dev._id}>
                        {dev.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            }
          >
            {loading ? <p className="text-sm text-muted">Loading...</p> : null}
            <div
              className={
                config.entity === "contact-query"
                  ? ""
                  : "grid gap-4 md:grid-cols-1 xl:grid-cols-1"
              }
            >
              {config.entity === "contact-query" ? (
                <div className="overflow-hidden rounded-[28px] border border-line bg-panel/70">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1400px] text-left">
                      <thead className="border-b border-line bg-card/50">
                        <tr>
                          {/* ── Primary columns (matching image order) ── */}
                          <th className="px-4 py-4 text-sm font-medium text-gold w-14">
                            SNO.
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Contact
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Query
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Property
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Device
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Added At
                          </th>

                          {/* ── Secondary columns ── */}
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Inquiry Type
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Source
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Referrer
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Assigned
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Notes
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Status
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Updated
                          </th>

                          <th className="px-4 py-4 text-sm font-medium text-gold text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, index) => (
                          <tr
                            key={item._id}
                            className="border-b border-line last:border-none hover:bg-card/40 align-top"
                          >
                            {/* SNO */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {index + 1}
                            </td>

                            {/* Contact — name + phone + email + source URL stacked */}
                            <td className="px-4 py-4 min-w-[220px]">
                              <p className="text-text font-medium leading-snug">
                                {item?.contact?.fullName}
                                {item?.contact?.location
                                  ? ` (${item.contact.location})`
                                  : ""}
                              </p>
                              {item?.contact?.phone && (
                                <p className="text-xs text-gold mt-0.5">
                                  {item.contact.phone}
                                  {item?.contact?.email
                                    ? `, ${item.contact.email}`
                                    : ""}
                                </p>
                              )}
                              {item?.sourcePage && (
                                <p className="text-xs text-muted mt-0.5 truncate max-w-[260px]">
                                  {item.sourcePage}
                                </p>
                              )}
                            </td>

                            {/* Query */}
                            <td className="px-4 py-4 text-sm text-muted max-w-[160px]">
                              {item?.query || "-"}
                            </td>

                            {/* Property — title + project + details stacked */}
                            <td className="px-4 py-4 min-w-[260px]">
                              {item?.property?.propertyTitle ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <p className="text-text font-medium text-sm leading-snug">
                                      {item.property.propertyTitle}
                                      {item?.property?.projectName
                                        ? ` (${item.property.projectName})`
                                        : ""}
                                    </p>
                                    {item?.property?.propertyUrl && (
                                      <a
                                        href={item.property.propertyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-muted hover:text-gold transition-colors shrink-0"
                                      >
                                        <ExternalLink size={13} />
                                      </a>
                                    )}
                                  </div>
                                  {item?.property?.location && (
                                    <p className="text-xs text-gold mt-0.5">
                                      {item.property.location}
                                    </p>
                                  )}
                                  {/* Config line: BR count, beds, baths, area, price */}
                                  <p className="text-xs text-muted mt-0.5 leading-relaxed">
                                    {[
                                      item?.property?.unitLabel
                                        ? `${item.property.unitLabel}`
                                        : null,
                                      item?.property?.configuration
                                        ? item.property.configuration
                                        : null,
                                      item?.property?.area
                                        ? `${item.property.area}`
                                        : null,
                                      item?.property?.price
                                        ? `₹ ${item.property.price.toLocaleString()} AED`
                                        : null,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                </>
                              ) : (
                                <span className="text-muted text-sm">-</span>
                              )}
                            </td>

                            {/* Device — type + browser + IPs stacked */}
                            <td className="px-4 py-4 min-w-[180px]">
                              <p className="text-sm text-muted leading-snug">
                                {[
                                  item?.device?.deviceType,
                                  item?.device?.os,
                                  item?.device?.browser,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "-"}
                              </p>
                              {item?.device?.ipAddress && (
                                <p className="text-xs text-muted/60 mt-0.5">
                                  {item.device.ipAddress}
                                </p>
                              )}
                            </td>

                            {/* Added At */}
                            <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                },
                              )}{" "}
                              {new Date(item.createdAt).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </td>

                            {/* ── Secondary columns ── */}

                            {/* Inquiry Type */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {item?.inquiryType || "-"}
                            </td>

                            {/* Source */}
                            <td className="px-4 py-4 text-sm text-muted max-w-[200px] break-words whitespace-normal">
                              {item?.sourcePage || "-"}
                            </td>

                            {/* Referrer */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {item?.referrer || "-"}
                            </td>

                            {/* Assigned */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {item?.assignedTo || "-"}
                            </td>

                            {/* Notes */}
                            <td className="px-4 py-4 text-sm text-muted truncate max-w-[200px]">
                              {item?.adminNotes || "-"}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <StatusBadge
                                value={item.status || "new"}
                                tone={
                                  item.status === "active" ||
                                  item.status === "published"
                                    ? "green"
                                    : item.status === "archived"
                                      ? "red"
                                      : "gold"
                                }
                              />
                            </td>

                            {/* Updated */}
                            <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => onDelete?.(item._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!items.length && !loading ? (
                    <div className="p-8 text-sm text-muted">
                      No records found.
                    </div>
                  ) : null}
                </div>
              ) : config.entity === "user-access" ? (
                <div className="overflow-hidden rounded-[28px] border border-line bg-panel/70 w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-line bg-card/50">
                        <tr>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Name
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Email
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Role
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Status
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Last Login
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold">
                            Updated
                          </th>
                          <th className="px-4 py-4 text-sm font-medium text-gold text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {console.log(items, "User access items")}
                        {items?.map((item) => (
                          <tr
                            key={item._id}
                            className="border-b border-line last:border-none hover:bg-card/40"
                          >
                            {/* Name */}
                            <td className="px-4 py-4 text-text font-medium">
                              {item?.name || "-"}
                            </td>

                            {/* Email */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {item?.email || "-"}
                            </td>

                            {/* Role */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {item?.role || "-"}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <StatusBadge
                                value={item?.status ? "active" : "inactive"}
                                tone={item?.status ? "green" : "red"}
                              />
                            </td>

                            {/* Last Login */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {item?.lastLogin
                                ? new Date(item.lastLogin).toLocaleString()
                                : "-"}
                            </td>

                            {/* Updated */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {item?.updatedAt
                                ? new Date(item.updatedAt).toLocaleDateString()
                                : "-"}
                            </td>

                            {/* Actions */}
                            {/* <td className="px-4 py-4 text-right">
                                <InlineActions
                                  onEdit={() => onEdit(item)}
                                  onDelete={() => onDelete(item._id)}
                                />
                              </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!items?.length && !loading ? (
                    <div className="p-8 text-sm text-muted">
                      No records found.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[28px] border border-line bg-panel/70">
                  <p className="px-5 pt-4 pb-2 text-xs text-muted">
                    Showing {items?.length || 0} of {items?.length || 0} entries
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-line bg-card/50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-12">
                            SNO.
                          </th>
                          <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-20">
                            Image
                          </th>
                          <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                            Title
                          </th>
                          {config.cardMeta?.map((key) => (
                            <th
                              key={key}
                              className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider"
                            >
                              {key.replace(/([A-Z])/g, " $1")}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                            Added At
                          </th>
                          <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items?.map((item, index) => (
                          <tr
                            key={item._id || item.title}
                            className="border-b border-line last:border-none hover:bg-card/40 transition-colors"
                          >
                            {/* SNO */}
                            <td className="px-4 py-4 text-sm text-muted">
                              {index + 1}
                            </td>

                            {/* Image */}
                            <td className="px-4 py-4">
                              <div className="h-11 w-11 overflow-hidden rounded-xl border border-line bg-card shrink-0">
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

                            {/* Title */}
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium text-text">
                                {item.title}
                              </p>
                              {item.subtitle ? (
                                <p className="mt-0.5 text-xs text-muted">
                                  {item.subtitle}
                                </p>
                              ) : null}
                              {item.description ? (
                                <p className="mt-1 text-xs text-muted/60 line-clamp-1">
                                  {item.description}
                                </p>
                              ) : null}
                            </td>

                            {/* cardMeta */}
                            {config.cardMeta?.map((key) => {
                              const val = getValue(item, {
                                key,
                                label: key,
                                type: "text",
                              } as CmsField);
                              return (
                                <td
                                  key={key}
                                  className="px-4 py-4 text-sm text-muted whitespace-nowrap"
                                >
                                  {val !== undefined &&
                                  val !== null &&
                                  val !== ""
                                    ? String(val)
                                    : "-"}
                                </td>
                              );
                            })}

                            {/* Added At */}
                            <td className="px-4 py-4 min-w-[150px]">
                              <p className="text-sm text-muted">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "2-digit",
                                      },
                                    )
                                  : "-"}
                              </p>
                              <p className="mt-0.5 text-xs text-muted/60">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleTimeString(
                                      "en-GB",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      },
                                    )
                                  : ""}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <StatusBadge
                                value={item.status || "draft"}
                                tone={
                                  item.status === "active" ||
                                  item.status === "published"
                                    ? "green"
                                    : item.status === "archived"
                                      ? "red"
                                      : "gold"
                                }
                              />
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-right">
                              <InlineActions
                                onEdit={() => onEdit(item)}
                                onDelete={() => onDelete(item._id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!items?.length && (
                    <div className="p-8 text-sm text-muted">
                      No records found.
                    </div>
                  )}
                </div>
              )}

              {!items?.length &&
              !loading &&
              config.entity !== "contact-query" ? (
                <div className="rounded-3xl border border-dashed border-line p-8 text-sm text-muted">
                  No records found.
                </div>
              ) : null}
            </div>
          </SectionCard>
        ) : null}

        {isSingleton ? (
          <SectionCard
            title={config.title}
            subtitle="Singleton settings editor with image upload and persistent save."
          >
            <div className="space-y-5">
              {form.image ? (
                <img
                  src={form.image}
                  alt={form.title}
                  className="h-64 w-full rounded-[28px] border border-line object-cover"
                />
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                {config.fields.map((field) => (
                  <div
                    key={field.key}
                    className={
                      field.type === "textarea" ||
                      field.type === "editor" ||
                      field.type === "gallery" ||
                      field.type === "image"
                        ? "md:col-span-2 xl:col-span-3 w-full"
                        : ""
                    }
                  >
                    {renderField(field, getValue(form, field), (value) =>
                      setForm((prev) => setValue(prev, field, value)),
                    )}
                  </div>
                ))}
              </div>
              <FormActions
                onSubmit={onSubmit}
                submitLabel={config.addLabel || "Save"}
              />
            </div>
          </SectionCard>
        ) : null}

        {!isSingleton ? (
          <Modal
            open={open}
            onClose={resetForm}
            title={
              editingId
                ? `Edit ${config.title}`
                : config.addLabel || `Add ${config.title}`
            }
            subtitle="Every route now has its own working form, search flow, and persistent Mongo-backed record storage."
            size="xl"
          >
            <div className="space-y-5 mt-0">
              {groupedFields.map((group, index) => (
                <FormGrid key={index} columns={2}>
                  {group.map((field) => (
                    <div
                      key={field.key}
                      className={
                        ["textarea", "image", "gallery", "faq"].includes(
                          field.type,
                        )
                          ? "md:col-span-3 xl:col-span-3 mt-0"
                          : ""
                      }
                    >
                      {renderField(field, getValue(form, field), (value) =>
                        setForm((prev) => setValue(prev, field, value)),
                      )}
                    </div>
                  ))}
                </FormGrid>
              ))}
              <FormActions
                onSubmit={onSubmit}
                onCancel={resetForm}
                submitLabel={editingId ? "Update" : "Create"}
              />
            </div>
          </Modal>
        ) : null}
      </div>
    </DashboardShell>
  );
}
