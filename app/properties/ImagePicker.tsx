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

// ==============================
// VIDEO DETECTION
// ==============================
function isVideo(url: string) {
  if (!url) return false;

  return (
    /\.(mp4|webm|ogg|mov|m4v)$/i.test(url) ||
    url.includes("/video/") ||
    url.includes("video/upload") ||
    url.includes("cloudinary") ||
    url.includes(".m3u8")
  );
}

// ==============================
// YOUTUBE DETECTION
// ==============================
function isYoutubeUrl(url: string) {
  if (!url) return false;

  return (
    url.includes("youtube.com/watch") ||
    url.includes("youtu.be/") ||
    url.includes("youtube.com/embed/")
  );
}

// ==============================
// GET EMBED URL
// ==============================
function getYoutubeEmbedUrl(url: string) {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    const parsed = new URL(url);
    const id = parsed.searchParams.get("v");

    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return "";
  }
}

export default function ImagePickerModal({
  open,
  onClose,
  onSelect,
  multiple = true,
}: Props) {
  const [tab, setTab] = useState<Tab>("upload");

  // Upload tab
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Library tab
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetSearch, setAssetSearch] = useState("");

  // ==============================
  // FETCH ASSETS
  // ==============================
  useEffect(() => {
    if (tab !== "library" || !open) return;

    (async () => {
      try {
        setLoadingAssets(true);

        const response = await api.get("/properties/assets");

        const rows = normalizeApiArray(response);

        setAssets(
          rows.map((row: any) => ({
            ...row,
            _id: row._id || row.id || "",
            url: row.url || row.fileUrl || "",
            path: row.path || row.key || "",
          })),
        );
      } catch (err) {
        console.error("Failed to load assets", err);
        setAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    })();
  }, [tab, open]);

  // ==============================
  // RESET
  // ==============================
  const handleClose = () => {
    setImages([]);
    setSelectedAssets([]);
    setUrlInput("");
    setErrorMessage("");
    setAssetSearch("");
    setTab("upload");

    onClose();
  };

  // ==============================
  // UPLOAD FILES
  // ==============================
  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    setErrorMessage("");

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post(
          "/content/upload/gallery",
          formData,
        );

        const url =
          res?.data?.url ||
          res?.data?.data?.url ||
          res?.data?.fileUrl ||
          res?.data?.location ||
          "";

        if (url) {
          uploaded.push(url);
        }
      }

      setImages((prev) =>
        multiple ? [...prev, ...uploaded] : uploaded,
      );
    } catch (err: any) {
      const msg = (() => {
        try {
          return JSON.parse(err?.message)?.message;
        } catch {
          return err?.message;
        }
      })();

      setErrorMessage(msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // ADD URL
  // ==============================
  const addUrl = () => {
    const value = urlInput.trim();

    if (!value) return;

    setImages((prev) =>
      multiple ? [...prev, value] : [value],
    );

    setUrlInput("");
  };

  // ==============================
  // REMOVE
  // ==============================
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ==============================
  // TOGGLE ASSET
  // ==============================
  const toggleAsset = (url: string) => {
    if (!multiple) {
      setSelectedAssets([url]);
      return;
    }

    setSelectedAssets((prev) =>
      prev.includes(url)
        ? prev.filter((u) => u !== url)
        : [...prev, url],
    );
  };

  // ==============================
  // FILTER ASSETS
  // ==============================
  const filteredAssets = assets.filter((a) => {
    const url = a.url || "";
    const name = a.name || "";

    return (
      !assetSearch ||
      name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      url.toLowerCase().includes(assetSearch.toLowerCase())
    );
  });

  // ==============================
  // FINAL SELECT
  // ==============================
  const handleSelect = () => {
    if (tab === "upload") {
      onSelect(images);
    } else {
      onSelect(selectedAssets);
    }

    handleClose();
  };

  const canConfirm =
    tab === "upload"
      ? images.length > 0
      : selectedAssets.length > 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload / Select Media"
    >
      <div className="space-y-4">

        {/* TABS */}
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
              {t === "upload"
                ? "Upload New"
                : "Select Uploaded"}
            </button>
          ))}
        </div>

        {/* ================================= */}
        {/* UPLOAD TAB */}
        {/* ================================= */}
        {tab === "upload" && (
          <div className="space-y-4">

            {errorMessage && (
              <p className="text-sm text-red-500">
                {errorMessage}
              </p>
            )}

            <input
              type="file"
              multiple={multiple}
              className="input"
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files) {
                  uploadFiles(e.target.files);
                }
              }}
            />

            {uploading && (
              <p className="text-sm text-muted">
                Uploading...
              </p>
            )}

            {/* URL INPUT */}
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Paste image / video / YouTube URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && addUrl()
                }
              />

              <button
                onClick={addUrl}
                className="btn"
              >
                Add
              </button>
            </div>

            {/* PREVIEW */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">

                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl overflow-hidden border border-line bg-black"
                  >

                    {/* YOUTUBE */}
                    {isYoutubeUrl(img) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(img)}
                        className="h-40 w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : isVideo(img) ? (

                      // VIDEO
                      <video
                        src={img}
                        className="h-40 w-full object-cover"
                        muted
                        autoPlay
                        loop
                        playsInline
                        controls
                      />

                    ) : (

                      // IMAGE
                      <img
                        src={img}
                        alt="preview"
                        className="h-40 w-full object-cover"
                      />
                    )}

                    {/* REMOVE */}
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
                No media selected
              </div>
            )}
          </div>
        )}

        {/* ================================= */}
        {/* LIBRARY TAB */}
        {/* ================================= */}
        {tab === "library" && (
          <div className="space-y-3">

            <input
              className="input w-full"
              placeholder="Search by name or URL..."
              value={assetSearch}
              onChange={(e) =>
                setAssetSearch(e.target.value)
              }
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
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-3 max-h-[360px] overflow-y-auto rounded-xl border border-line p-3">

                {filteredAssets.map((asset: any, i: number) => {
                  const url =
                    asset.url ||
                    asset.image ||
                    asset.fileUrl ||
                    "";

                  if (!url) return null;

                  const selected =
                    selectedAssets.includes(url);

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
                      key={asset._id || url || i}
                      className={`relative overflow-hidden rounded-xl border-2 transition group cursor-pointer ${
                        selected
                          ? "border-gold ring-2 ring-gold/30"
                          : "border-line hover:border-gold/50"
                      }`}
                      onClick={() => toggleAsset(url)}
                    >

                      {/* YOUTUBE */}
                      {isYoutubeUrl(url) ? (
                        <div className="relative h-24 w-full bg-black">
                          <iframe
                            src={getYoutubeEmbedUrl(url)}
                            className="h-full w-full"
                            allowFullScreen
                          />
                        </div>
                      ) : isVideo(url) ? (

                        // VIDEO
                        <div className="relative h-24 w-full bg-black">
                          <video
                            src={url}
                            className="h-full w-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />

                          <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                            🎬 Video
                          </span>
                        </div>

                      ) : (

                        // IMAGE
                        <img
                          src={url}
                          alt={asset.name || ""}
                          className="h-24 w-full object-cover"
                        />
                      )}

                      {/* SELECTED */}
                      {selected && (
                        <div className="absolute top-1 right-1 bg-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                          ✓
                        </div>
                      )}

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();

                          if (
                            !confirm(
                              "Delete this asset permanently?",
                            )
                          ) {
                            return;
                          }

                          try {
                            await api.delete(
                              `/media-assets/assets?path=${encodeURIComponent(assetPath)}`,
                            );

                            setAssets((prev) =>
                              prev.filter(
                                (a) => a._id !== asset._id,
                              ),
                            );

                            setSelectedAssets((prev) =>
                              prev.filter((u) => u !== url),
                            );
                          } catch {
                            alert("Failed to delete asset.");
                          }
                        }}
                        className="absolute bottom-1 left-1 rounded-lg bg-red-500/80 text-white w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedAssets.length > 0 && (
              <p className="text-xs text-gold">
                {selectedAssets.length} asset
                {selectedAssets.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-2 pt-2 border-t border-line">

          <button
            onClick={handleClose}
            className="btn-secondary border p-1 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleSelect}
            disabled={!canConfirm}
            className="btn disabled:opacity-40 disabled:cursor-not-allowed border p-1 rounded-xl"
          >
            {tab === "upload"
              ? `Save ${
                  images.length > 0
                    ? `(${images.length})`
                    : ""
                }`
              : `Use Selected ${
                  selectedAssets.length > 0
                    ? `(${selectedAssets.length})`
                    : ""
                }`}
          </button>
        </div>
      </div>
    </Modal>
  );
}