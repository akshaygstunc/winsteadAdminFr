"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { ActionButton, SectionCard } from "@/components/ui";
import { SectionNotice } from "@/components/crud-kit";

// ─── Types ───────────────────────────────────────────────────────────────────

type Asset = {
  _id: string;
  url: string;
  name: string;
  size?: number;
  uploadedAt?: string;
  usedIn?: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeApiArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function findDuplicates(assets: Asset[]): Set<string> {
  const urlCount: Record<string, number> = {};
  for (const asset of assets) {
    urlCount[asset.url] = (urlCount[asset.url] || 0) + 1;
  }
  return new Set(
    Object.entries(urlCount)
      .filter(([, count]) => count > 1)
      .map(([url]) => url)
  );
}

// ─── Image Card ──────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  isDuplicate,
  onView,
  onDelete,
  selected,
  onSelect,
}: {
  asset: Asset;
  isDuplicate: boolean;
  onView: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group relative rounded-[20px] border overflow-hidden bg-panel/60 transition-all duration-200 ${
        selected
          ? "border-gold ring-1 ring-gold/40"
          : isDuplicate
          ? "border-red-500/50"
          : "border-line hover:border-line/80"
      }`}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(asset._id)}
          className="h-4 w-4 accent-gold cursor-pointer"
        />
      </div>

      {/* Duplicate Badge */}
      {isDuplicate && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
          Duplicate
        </div>
      )}

      {/* Image */}
      <div className="h-40 w-full bg-card overflow-hidden">
        {!imgError ? (
          <img
            src={asset.url}
            alt={asset.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted text-xs">
            No Preview
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-medium text-text truncate" title={asset.name}>
          {asset.name || "Unnamed"}
        </p>
        <div className="flex items-center justify-between text-[10px] text-muted">
          <span>{formatBytes(asset.size)}</span>
          {asset.uploadedAt && (
            <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onView(asset)}
            className="flex-1 rounded-xl border border-line bg-card/60 py-1.5 text-[11px] text-text hover:border-gold/50 hover:text-gold transition"
          >
            View
          </button>
          <button
            onClick={() => onDelete(asset)}
            className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({
  asset,
  onClose,
  onDelete,
}: {
  asset: Asset | null;
  onClose: () => void;
  onDelete: (asset: Asset) => void;
}) {
  if (!asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[28px] border border-line bg-panel p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text truncate max-w-[80%]">
            {asset.name || "Asset Preview"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border border-line bg-black max-h-[420px] flex items-center justify-center">
          <img
            src={asset.url}
            alt={asset.name}
            className="max-h-[420px] w-full object-contain"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-line bg-card/50 px-4 py-3">
            <p className="text-xs text-muted mb-1">File Size</p>
            <p className="text-text font-medium">{formatBytes(asset.size)}</p>
          </div>
          <div className="rounded-2xl border border-line bg-card/50 px-4 py-3">
            <p className="text-xs text-muted mb-1">Uploaded</p>
            <p className="text-text font-medium">
              {asset.uploadedAt
                ? new Date(asset.uploadedAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card/50 px-4 py-3">
          <p className="text-xs text-muted mb-1">URL</p>
          <a
            href={asset.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gold underline break-all"
          >
            {asset.url}
          </a>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-line px-5 py-2.5 text-sm text-muted hover:text-text transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onDelete(asset);
              onClose();
            }}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition"
          >
            Delete Asset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({
  asset,
  onClose,
  onConfirm,
  loading,
}: {
  asset: Asset | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-line bg-panel p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-text">Delete Asset</h2>
          <p className="mt-2 text-sm text-muted">
            Are you sure you want to delete{" "}
            <span className="text-text font-medium">{asset.name || "this asset"}</span>?
            This action cannot be undone.
          </p>
        </div>

        <div className="h-24 rounded-2xl overflow-hidden border border-line">
          <img
            src={asset.url}
            alt={asset.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-line px-5 py-2.5 text-sm text-muted hover:text-text transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-red-500/80 hover:bg-red-500 px-5 py-2.5 text-sm text-white transition disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "duplicates">("all");
  const [viewAsset, setViewAsset] = useState<Asset | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/content/assets");
      const rows = normalizeApiArray(res);
      setAssets(rows);
    } catch {
      setError("Failed to load assets. API may not be ready yet.");
      // placeholder data for UI preview
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const duplicateUrls = findDuplicates(assets);

  const filtered = assets.filter((asset) => {
    const matchesSearch =
      !search || asset.name?.toLowerCase().includes(search.toLowerCase()) || asset.url?.toLowerCase().includes(search.toLowerCase());
    const matchesDuplicate = filter === "all" || duplicateUrls.has(asset.url);
    return matchesSearch && matchesDuplicate;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a._id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteAsset) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/content/assets/${deleteAsset._id}`);
      setMessage("Asset deleted successfully.");
      setAssets((prev) => prev.filter((a) => a._id !== deleteAsset._id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteAsset._id);
        return next;
      });
    } catch {
      setError("Failed to delete asset.");
    } finally {
      setDeleteLoading(false);
      setDeleteAsset(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    setLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) => api.delete(`/content/assets/${id}`))
      );
      setMessage(`${selected.size} asset(s) deleted.`);
      setAssets((prev) => prev.filter((a) => !selected.has(a._id)));
      setSelected(new Set());
    } catch {
      setError("Failed to delete some assets.");
    } finally {
      setLoading(false);
    }
  };

  const duplicateCount = assets.filter((a) => duplicateUrls.has(a.url)).length;

  return (
    <DashboardShell>
      <Header
        title="Assets"
        subtitle="View and manage all uploaded images. Duplicate assets are highlighted in red."
      />

      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Assets", value: assets.length },
            { label: "Duplicates", value: duplicateCount, highlight: duplicateCount > 0 },
            { label: "Selected", value: selected.size },
            { label: "Showing", value: filtered.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[20px] border border-line bg-panel/60 px-4 py-4"
            >
              <p className="text-xs text-muted">{stat.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${stat.highlight ? "text-red-400" : "text-text"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <SectionCard
          title="All Assets"
          subtitle="Images stored in your cloud storage bucket."
          action={
            <div className="flex flex-wrap gap-3">
              <input
                className="input w-56"
                placeholder="Search by name or URL"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="input w-40"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All Assets</option>
                <option value="duplicates">Duplicates Only</option>
              </select>
              <ActionButton secondary onClick={selectAll}>
                {selected.size === filtered.length && filtered.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </ActionButton>
              {selected.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition"
                >
                  Delete Selected ({selected.size})
                </button>
              )}
              <ActionButton secondary onClick={load}>
                Refresh
              </ActionButton>
            </div>
          }
        >
          {loading ? (
            <div className="py-16 text-center text-sm text-muted">
              Loading assets...
            </div>
          ) : !filtered.length ? (
            <div className="rounded-3xl border border-dashed border-line p-12 text-center text-sm text-muted">
              {error
                ? "API not available yet — waiting for backend endpoint."
                : "No assets found."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((asset) => (
                <AssetCard
                  key={asset._id}
                  asset={asset}
                  isDuplicate={duplicateUrls.has(asset.url)}
                  onView={setViewAsset}
                  onDelete={setDeleteAsset}
                  selected={selected.has(asset._id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <ViewModal
        asset={viewAsset}
        onClose={() => setViewAsset(null)}
        onDelete={(a) => {
          setViewAsset(null);
          setDeleteAsset(a);
        }}
      />

      <DeleteModal
        asset={deleteAsset}
        onClose={() => setDeleteAsset(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </DashboardShell>
  );
}