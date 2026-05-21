"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FieldLabel } from "@/components/crud-kit";
import { api } from "@/lib/api";
import {
  Upload,
  Images,
  X,
  Check,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";

type MediaType = "image" | "video";

interface MediaAsset {
  _id?: string;
  url: string;
  name?: string;
  path?: string;
  type?: string;
  createdAt?: string;
}

interface MediaPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mediaType?: MediaType;
  note?: string;
  placeholder?: string;
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

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function extractPath(url: string): string {
  try {
    return new URL(url).pathname.slice(1);
  } catch {
    return url;
  }
}

/* ─── Library Modal ─────────────────────────────────────────── */
function LibraryModal({
  mediaType,
  onSelect,
  onClose,
}: {
  mediaType: MediaType;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get<any>("/properties/assets");
        const rows: any[] = Array.isArray(res)
          ? res
          : res?.data || res?.items || res?.results || [];

        const mapped: MediaAsset[] = rows
          .map((row) => ({
            _id: row._id || row.id || "",
            url: row.url || "",
            name: row.name || "",
            path: row.path || row.key || extractPath(row.url || ""),
            createdAt: row.uploadedAt || row.createdAt || "",
          }))
          .filter((a) => a.url);

        setAssets(mapped);
      } catch {
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mediaType]);

  const handleDelete = async (asset: MediaAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this image permanently? This cannot be undone."))
      return;
    setDeletingUrl(asset.url);
    try {
      const path = asset.path || extractPath(asset.url);
      await api.delete(`/media-assets/assets?path=${encodeURIComponent(path)}`);
      setAssets((prev) => prev.filter((a) => a.url !== asset.url));
      if (selected === asset.url) setSelected(null);
    } catch {
      alert("Failed to delete asset.");
    } finally {
      setDeletingUrl(null);
    }
  };

  const filtered = assets.filter(
    (a) =>
      !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.url.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const backdropRef = useRef<HTMLDivElement>(null);
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-[28px] border border-line bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
          <div>
            <p className="text-sm font-semibold text-text">
              Select from Library
            </p>
            <p className="text-xs text-muted mt-0.5">
              {mediaType === "video" ? "Video" : "Image"} assets · hover to
              delete
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                className="input pl-8 h-9 text-sm w-52"
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-line bg-panel p-2 text-muted hover:text-text transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading assets...
            </div>
          ) : !filtered.length ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted">
              No {mediaType} assets found.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              {filtered.map((asset, i) => (
                <div
                  key={`${asset.url}-${i}`}
                  className={`relative group rounded-2xl border-2 overflow-hidden aspect-square transition-all cursor-pointer ${
                    selected === asset.url
                      ? "border-gold shadow-lg shadow-gold/20"
                      : "border-line hover:border-gold/50"
                  }`}
                  onClick={() =>
                    setSelected(selected === asset.url ? null : asset.url)
                  }
                >
                  {mediaType === "video" || isVideo(asset.url) ? (
                    <video
                      src={asset.url}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name || `Asset ${i + 1}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  )}

                  {/* Selected overlay */}
                  {selected === asset.url && (
                    <div className="absolute inset-0 bg-gold/20 flex items-center justify-center pointer-events-none">
                      <div className="rounded-full bg-gold p-1.5">
                        <Check className="h-3.5 w-3.5 text-black" />
                      </div>
                    </div>
                  )}

                  {/* Name tooltip */}
                  {asset.name && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      <p className="text-xs text-white truncate">
                        {asset.name}
                      </p>
                    </div>
                  )}

                  {/* Delete button — top-right on hover */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(asset, e)}
                    disabled={deletingUrl === asset.url}
                    className="absolute top-1 right-1 rounded-lg bg-red-500 text-white w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 z-10 disabled:opacity-60"
                  >
                    {deletingUrl === asset.url ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-line bg-panel/50">
          <p className="text-xs text-muted">
            {selected ? "1 asset selected" : `${filtered.length} assets`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-2xl border border-line bg-panel px-4 py-2 text-sm text-text hover:bg-card transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="rounded-2xl border border-gold/50 bg-gold/10 px-4 py-2 text-sm text-gold hover:bg-gold/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main MediaPickerField ─────────────────────────────────── */
export function MediaPickerField({
  label,
  value,
  onChange,
  mediaType = "image",
  note,
  placeholder,
}: MediaPickerFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [tab, setTab] = useState<"preview" | "url">("preview");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <>
      <div className="space-y-3 w-full">
        <FieldLabel label={label} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 hover:bg-panel/80 transition disabled:opacity-50"
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
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold hover:bg-gold/20 transition"
          >
            <Images className="h-4 w-4" />
            Select from Library
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={mediaType === "video" ? "video/*" : "image/*"}
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setTab(tab === "url" ? "preview" : "url")}
            className="text-xs text-muted hover:text-gold transition underline underline-offset-2"
          >
            {tab === "url" ? "Hide URL input" : "Or paste URL manually"}
          </button>
          {tab === "url" && (
            <input
              className="input mt-2 text-sm"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || `Paste ${mediaType} URL here...`}
            />
          )}
        </div>

        {value && (
          <div className="relative w-full rounded-2xl overflow-hidden border border-line bg-black">
            {mediaType === "video" || isVideo(value) ? (
              <video
                src={value}
                controls
                className="w-full h-[180px] object-cover"
              />
            ) : (
              <img
                src={value}
                alt={label}
                className="w-full h-[180px] object-cover"
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

        {note && <p className="text-xs text-muted">{note}</p>}
      </div>

      {showLibrary && (
        <LibraryModal
          mediaType={mediaType}
          onSelect={onChange}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </>
  );
}
