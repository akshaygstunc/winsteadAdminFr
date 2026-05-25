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
  path?: string;
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
      .map(([url]) => url),
  );
}

// ─── Asset Grid Card ──────────────────────────────────────────────────────────

function AssetGridCard({
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
      className={`relative rounded-2xl border overflow-hidden transition-all duration-200
        ${
          selected
            ? "border-gold ring-2 ring-gold/30"
            : isDuplicate
              ? "border-red-500/40"
              : "border-line bg-panel/70"
        }`}
    >
      {/* ── Image area: click toggles selection ── */}
      <div
        className="relative h-36 w-full bg-card/80 overflow-hidden cursor-pointer select-none"
        onClick={() => onSelect(asset._id)}
      >
        {!imgError ? (
          <img
            src={asset.url}
            alt={asset.name}
            className="h-full w-full object-cover pointer-events-none"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-1.5 text-muted pointer-events-none">
            <svg
              className="w-7 h-7 opacity-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-[10px] opacity-40">No preview</span>
          </div>
        )}

        {/* Always-visible checkbox */}
        <div
          className={`absolute top-2 left-2 h-5 w-5 rounded-md border-2 flex items-center justify-center pointer-events-none transition-all
            ${selected ? "border-gold bg-gold" : "border-white bg-black/50"}`}
        >
          {selected && (
            <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Duplicate badge */}
        {isDuplicate && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <span className="inline-flex items-center rounded-full bg-red-500/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              Dup
            </span>
          </div>
        )}
      </div>

      {/* Info + actions */}
      <div className="px-2.5 pt-2 pb-2.5 space-y-1.5">
        <p
          className="text-xs font-medium text-text truncate leading-snug"
          title={asset.name}
        >
          {asset.name || "Unnamed"}
        </p>

        <div className="flex items-center justify-between text-[10px] text-muted">
          <span>{formatBytes(asset.size)}</span>
          <span>
            {asset.uploadedAt
              ? new Date(asset.uploadedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
              : "—"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => onView(asset)}
            className="flex-1 rounded-lg border border-line bg-card/60 py-1 text-[10px] text-text hover:border-gold/50 hover:text-gold transition"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onDelete(asset)}
            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 py-1 text-[10px] text-red-400 hover:bg-red-500/20 transition"
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-[28px] border border-line bg-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text truncate max-w-[80%]">
            {asset.name || "Asset Preview"}
          </h2>
          <button
            type="button"
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
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-line px-5 py-2.5 text-sm text-muted hover:text-text transition"
          >
            Close
          </button>
          <button
            type="button"
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-[28px] border border-line bg-panel p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-text">Delete Asset</h2>
          <p className="mt-2 text-sm text-muted">
            Are you sure you want to delete{" "}
            <span className="text-text font-medium">
              {asset.name || "this asset"}
            </span>
            ? This action cannot be undone.
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
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-line px-5 py-2.5 text-sm text-muted hover:text-text transition"
          >
            Cancel
          </button>
          <button
            type="button"
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

// ─── Bulk Delete Confirm Modal ───────────────────────────────────────────────

function BulkDeleteModal({
  count,
  onClose,
  onConfirm,
  loading,
}: {
  count: number;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  // ← if (!asset) return null; HATAO — yahan se
  if (count === 0) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      style={{ display: count === 0 ? "none" : "flex" }} // ← count 0 ho toh hide karo
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-[28px] border border-line bg-panel p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-text">
            Delete {count} Asset{count !== 1 ? "s" : ""}
          </h2>
          <p className="mt-2 text-sm text-muted">
            You are about to permanently delete{" "}
            <span className="text-text font-medium">
              {count} selected asset{count !== 1 ? "s" : ""}
            </span>
            . This action cannot be undone.
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          ⚠️ All selected files will be removed from your storage bucket.
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-line px-5 py-2.5 text-sm text-muted hover:text-text transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-red-500/80 hover:bg-red-500 px-5 py-2.5 text-sm text-white transition disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : `Delete ${count} Asset${count !== 1 ? "s" : ""}`}
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
  const [sortBy, setSortBy] = useState<
    "latest" | "oldest" | "name-asc" | "name-desc" | "size-asc" | "size-desc"
  >("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [viewAsset, setViewAsset] = useState<Asset | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/properties/assets");
      const rows = normalizeApiArray(res);
      const mapped = rows.map((row: any, index: number) => ({
        ...row,
         _id:
        row._id ||
        row.id ||
        row.path ||
        row.url ||
        `asset-${index}`, // ← fallback to url
        url: row.url || row.fileUrl || "",
        name: row.name || row.url?.split("/").pop() || "Unnamed",
        path:
          row.path ||
          row.key ||
          (() => {
            try {
              return new URL(row.url || "").pathname.slice(1);
            } catch {
              return row.url || "";
            }
          })(),
        size: row.size || row.fileSize || undefined,
        uploadedAt: row.uploadedAt || row.createdAt || undefined,
      }));
      setAssets(mapped);
    } catch {
      setError("Failed to load assets. API may not be ready yet.");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const duplicateUrls = findDuplicates(assets);

  const filtered = [...assets]
    .filter((asset) => {
      const matchesSearch =
        !search ||
        asset.name?.toLowerCase().includes(search.toLowerCase()) ||
        asset.url?.toLowerCase().includes(search.toLowerCase());
      const matchesDuplicate = filter === "all" || duplicateUrls.has(asset.url);
      return matchesSearch && matchesDuplicate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.uploadedAt || 0).getTime() -
            new Date(a.uploadedAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.uploadedAt || 0).getTime() -
            new Date(b.uploadedAt || 0).getTime()
          );
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "size-asc":
          return (a.size || 0) - (b.size || 0);
        case "size-desc":
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedAssets = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [filtered.length, totalPages, currentPage]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isPageAllSelected =
    paginatedAssets.length > 0 &&
    paginatedAssets.every((a) => selected.has(a._id));

  const toggleSelectPage = () => {
    if (isPageAllSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        paginatedAssets.forEach((a) => next.delete(a._id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paginatedAssets.forEach((a) => next.add(a._id));
        return next;
      });
    }
  };

  const selectAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a._id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteAsset) return;
    setDeleteLoading(true);
    try {
      const path = (deleteAsset as any).path || deleteAsset.url;
      await api.delete(`/media-assets/assets?path=${encodeURIComponent(path)}`);
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
    setBulkDeleteLoading(true);
    try {
      const selectedAssets = assets.filter((a) => selected.has(a._id));
      await Promise.all(
        selectedAssets.map((asset) => {
          const path = (asset as any).path || asset.url;
          return api.delete(
            `/media-assets/assets?path=${encodeURIComponent(path)}`,
          );
        }),
      );
      setMessage(`${selected.size} asset(s) deleted.`);
      setAssets((prev) => prev.filter((a) => !selected.has(a._id)));
      setSelected(new Set());
      setShowBulkDeleteModal(false);
    } catch {
      setError("Failed to delete some assets.");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const duplicateCount = assets.filter((a) => duplicateUrls.has(a.url)).length;

  return (
    <DashboardShell>
      <Header
        title="Assets"
        subtitle="View and manage all uploaded images. Use the checkbox on each card to select, or use the toolbar below."
      />

      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Assets", value: assets.length },
            {
              label: "Duplicates",
              value: duplicateCount,
              highlight: duplicateCount > 0,
            },
            { label: "Selected", value: selected.size },
            { label: "Showing", value: filtered.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card rounded-[20px] border border-line bg-panel/60 px-4 py-4"
            >
              <p className="text-xs text-muted">{stat.label}</p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  stat.highlight ? "text-red-400" : "text-text"
                }`}
              >
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
                className="input max-w-36"
                placeholder="Search by name or URL"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="input max-w-40"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All Assets</option>
                <option value="duplicates">Duplicates Only</option>
              </select>
              <select
                className="input max-w-44"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-asc">Size Low → High</option>
                <option value="size-desc">Size High → Low</option>
              </select>
              <select
                className="input max-w-28"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={12}>12 / page</option>
                <option value={24}>24 / page</option>
                <option value={48}>48 / page</option>
                <option value={96}>96 / page</option>
              </select>
              <ActionButton secondary onClick={load}>
                Refresh
              </ActionButton>
            </div>
          }
        >
          {/* Bulk action toolbar */}
          <div className="flex items-center justify-between mb-4 min-h-[36px]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectPage}
                className="flex items-center gap-2 rounded-xl border border-line bg-card/60 px-3 py-1.5 text-xs text-text hover:border-gold/50 hover:text-gold transition"
              >
                <span
                  className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition
                    ${
                      isPageAllSelected ? "border-gold bg-gold" : "border-muted"
                    }`}
                >
                  {isPageAllSelected && (
                    <svg
                      className="w-2.5 h-2.5 text-black"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {isPageAllSelected ? "Deselect Page" : "Select Page"}
              </button>

              <button
                type="button"
                onClick={selectAll}
                className="rounded-xl border border-line bg-card/60 px-3 py-1.5 text-xs text-text hover:border-gold/50 hover:text-gold transition"
              >
                {selected.size === filtered.length && filtered.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>

              {selected.size > 0 && (
                <span className="text-xs text-muted">
                  {selected.size} selected
                </span>
              )}
            </div>

            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(true)}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition font-medium"
              >
                Delete Selected ({selected.size})
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center text-sm text-muted">
              Loading assets...
            </div>
          ) : !filtered.length ? (
            <div className="rounded-3xl border border-dashed border-line p-12 text-center text-sm text-muted">
              {error
                ? "API not available yet — waiting for backend endpoint."
                : "No assets found."}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted mb-3">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filtered.length)} of{" "}
                {filtered.length} entries
              </p>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {paginatedAssets.map((asset) => (
                  <AssetGridCard
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
                <p className="text-sm text-muted">
                  Page {currentPage} of {totalPages || 1}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-xl border border-line px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(currentPage - 3, 0),
                      Math.max(currentPage - 3, 0) + 5,
                    )
                    .map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-10 min-w-[40px] rounded-xl border text-sm transition ${
                          currentPage === page
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-line hover:bg-card"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-xl border border-line px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
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

      {showBulkDeleteModal && (
        <BulkDeleteModal
          count={selected.size}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDelete}
          loading={bulkDeleteLoading}
        />
      )}
    </DashboardShell>
  );
}
