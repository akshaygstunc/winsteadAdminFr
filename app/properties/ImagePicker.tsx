"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { api } from "@/lib/api";

type Props = {
    open: boolean;
    onClose: () => void;
    onSelect: (images: string[]) => void;
    multiple?: boolean;
};

type Tab = "upload" | "library";

function normalizeApiArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.results)) return response.results;
    return [];
}

export default function ImagePickerModal({
    open,
    onClose,
    onSelect,
    multiple = true,
}: Props) {
    const [tab, setTab] = useState<Tab>("upload");

    // ── Upload tab state ──
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // ── Library tab state ──
    const [assets, setAssets] = useState<any[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [assetSearch, setAssetSearch] = useState("");

    // Fetch assets when library tab opens
    useEffect(() => {
        if (tab !== "library" || !open) return;
        (async () => {
            try {
                setLoadingAssets(true);
                const response = await api.get("/properties/assets");
                const rows = normalizeApiArray(response);
                setAssets(rows);
            } catch (err) {
                console.error("Failed to load assets", err);
                setAssets([]);
            } finally {
                setLoadingAssets(false);
            }
        })();
    }, [tab, open]);

    // Reset on close
    const handleClose = () => {
        setImages([]);
        setSelectedAssets([]);
        setUrlInput("");
        setErrorMessage("");
        setAssetSearch("");
        setTab("upload");
        onClose();
    };

    // ── Upload tab handlers ──
    const uploadFiles = async (files: FileList) => {
        setUploading(true);
        setErrorMessage("");
        try {
            const uploaded: string[] = [];
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);
                const res = await api.post("/content/upload/gallery", formData);
                const url =
                    res?.data?.url ||
                    res?.data?.data?.url ||
                    res?.data?.fileUrl ||
                    res?.data?.location ||
                    "";
                if (url) uploaded.push(url);
            }
            setImages((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
        } catch (err: any) {
            const msg = (() => { try { return JSON.parse(err?.message)?.message; } catch { return err?.message; } })();
            setErrorMessage(msg || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const addUrl = () => {
        if (!urlInput.trim()) return;
        setImages((prev) => (multiple ? [...prev, urlInput.trim()] : [urlInput.trim()]));
        setUrlInput("");
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // ── Library tab handlers ──
    const toggleAsset = (url: string) => {
        if (!multiple) {
            setSelectedAssets([url]);
            return;
        }
        setSelectedAssets((prev) =>
            prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
        );
    };

    const filteredAssets = assets.filter((a) => {
        const url = a.url || "";
        const name = a.name || "";
        return (
            !assetSearch ||
            name.toLowerCase().includes(assetSearch.toLowerCase()) ||
            url.toLowerCase().includes(assetSearch.toLowerCase())
        );
    });

    // ── Confirm ──
    const handleSelect = () => {
        if (tab === "upload") {
            onSelect(images);
        } else {
            onSelect(selectedAssets);
        }
        handleClose();
    };

    const canConfirm = tab === "upload" ? images.length > 0 : selectedAssets.length > 0;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Upload / Select Images"
        >
            <div className="space-y-4">

                {/* Tabs */}
                <div className="flex gap-1 rounded-2xl border border-line bg-panel p-1 w-fit">
                    {(["upload", "library"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`rounded-xl px-4 py-1.5 text-sm capitalize transition ${
                                tab === t
                                    ? "bg-gold/10 text-gold border border-gold/40"
                                    : "text-muted hover:text-text"
                            }`}
                        >
                            {t === "upload" ? "Upload New" : "Select Uploaded"}
                        </button>
                    ))}
                </div>

                {/* ── Upload Tab ── */}
                {tab === "upload" && (
                    <div className="space-y-4">
                        {errorMessage && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}

                        <input
                            type="file"
                            multiple={multiple}
                            className="input"
                            accept="image/*,video/*"
                            onChange={(e) => {
                                if (e.target.files) uploadFiles(e.target.files);
                            }}
                        />

                        {uploading && (
                            <p className="text-sm text-muted">Uploading...</p>
                        )}

                        <div className="flex gap-2">
                            <input
                                className="input flex-1"
                                placeholder="Or paste image URL"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addUrl()}
                            />
                            <button onClick={addUrl} className="btn">Add</button>
                        </div>

                        {images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                                {images.map((img, i) => (
                                    <div key={i} className="relative rounded-xl overflow-hidden border border-line">
                                        <img src={img} alt="preview" className="h-24 w-full object-cover" />
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted border border-dashed border-line p-4 rounded-xl text-center">
                                No images selected
                            </div>
                        )}
                    </div>
                )}

                {/* ── Library Tab ── */}
                {tab === "library" && (
                    <div className="space-y-3">
                        <input
                            className="input w-full"
                            placeholder="Search by name or URL..."
                            value={assetSearch}
                            onChange={(e) => setAssetSearch(e.target.value)}
                        />

                        {loadingAssets ? (
                            <div className="py-10 text-center text-sm text-muted">
                                Loading assets...
                            </div>
                        ) : !filteredAssets.length ? (
                            <div className="py-10 text-center text-sm text-muted border border-dashed border-line rounded-xl">
                                No assets found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 gap-3 max-h-[360px] overflow-y-auto rounded-xl border border-line p-3">
                                {filteredAssets.map((asset: any, i: number) => {
                                    const url = asset.url || asset.image || asset.fileUrl || "";
                                    if (!url) return null;
                                    const isSelected = selectedAssets.includes(url);

                                    return (
                                        <button
                                            key={asset._id || url || i}
                                            type="button"
                                            onClick={() => toggleAsset(url)}
                                            className={`relative overflow-hidden rounded-xl border-2 transition ${
                                                isSelected
                                                    ? "border-gold ring-2 ring-gold/30"
                                                    : "border-line hover:border-gold/50"
                                            }`}
                                        >
                                            <img
                                                src={url}
                                                alt={asset.name || ""}
                                                className="h-24 w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3EN/A%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                            {asset.name && (
                                                <p className="text-[10px] text-muted truncate px-1 pb-1 text-left bg-panel/80">
                                                    {asset.name}
                                                </p>
                                            )}
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 bg-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    ✓
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {selectedAssets.length > 0 && (
                            <p className="text-xs text-gold">
                                {selectedAssets.length} asset{selectedAssets.length > 1 ? "s" : ""} selected
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-line">
                    <button onClick={handleClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleSelect}
                        disabled={!canConfirm}
                        className="btn disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {tab === "upload"
                            ? `Save ${images.length > 0 ? `(${images.length})` : ""}`
                            : `Use Selected ${selectedAssets.length > 0 ? `(${selectedAssets.length})` : ""}`}
                    </button>
                </div>
            </div>
        </Modal>
    );
}