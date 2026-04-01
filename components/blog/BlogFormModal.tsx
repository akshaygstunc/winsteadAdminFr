/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { createBlog, updateBlog } from "../../services/blog.service";
import { Blog, BlogPayload } from "../../types/blog";
import { uploadImageFile } from "@/services/page-content.service";

interface BlogFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  blog?: Blog | null;
}

export default function BlogFormModal({
  onClose,
  onSuccess,
  blog,
}: BlogFormModalProps) {
  const isEdit = !!blog;

  const [form, setForm] = useState<BlogPayload>({
    title: blog?.title || "",
    slug: blog?.slug || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    featuredImage: blog?.featuredImage || "",
    featuredImageAlt: blog?.featuredImageAlt || "",
    tags: blog?.tags || [],
    seo: {
      metaTitle: blog?.seo?.metaTitle || "",
      metaDescription: blog?.seo?.metaDescription || "",
      focusKeyword: blog?.seo?.focusKeyword || "",
      canonicalUrl: blog?.seo?.canonicalUrl || "",
      ogTitle: blog?.seo?.ogTitle || "",
      ogDescription: blog?.seo?.ogDescription || "",
      ogImage: blog?.seo?.ogImage || "",
      indexStatus: blog?.seo?.indexStatus || "index",
    },
    status: blog?.status || "draft",
    isFeatured: blog?.isFeatured || false,
    showOnHomepage: blog?.showOnHomepage || false,
    enableComments: blog?.enableComments || false,
    publishedAt: blog?.publishedAt || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const modalTitle = useMemo(() => {
    return isEdit ? "Edit Blog" : "Add Blog";
  }, [isEdit]);

  const handleChange = (key: keyof BlogPayload, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSeoChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [key]: value,
      },
    }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");

      const imageUrl = await uploadImageFile(file);

      setForm((prev) => ({
        ...prev,
        featuredImage: imageUrl, // save actual uploaded URL, not file.name
      }));
    } catch (err) {
      console.error("Image upload failed", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      // allow selecting same file again if needed
      e.target.value = "";
    }
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;

    if (form.tags.includes(value)) {
      setTagInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, value],
    }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      if (!form.title.trim()) {
        throw new Error("Title is required");
      }

      if (!form.content.trim()) {
        throw new Error("Content is required");
      }

      const payload: BlogPayload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug?.trim() || undefined,
        excerpt: form.excerpt?.trim() || "",
        content: form.content,
        featuredImage: form.featuredImage?.trim() || "",
        featuredImageAlt: form.featuredImageAlt?.trim() || "",
        tags: form.tags,
        publishedAt:
          form.status === "scheduled" || form.status === "published"
            ? form.publishedAt || undefined
            : undefined,
      };

      if (isEdit && blog?.id) {
        await updateBlog(blog.id, payload);
      } else {
        await createBlog(payload);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const imagePreviewUrl = form.featuredImage?.trim() || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-[#111111] p-6 shadow-xl text-white">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="auto-generated-if-empty"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                rows={10}
                placeholder="Write blog content here"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Featured Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
              />

              {uploadingImage ? (
                <p className="mt-2 text-sm text-gray-400">Uploading image...</p>
              ) : null}

              {imagePreviewUrl ? (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-gray-400">Preview</p>
                  <img
                    src={imagePreviewUrl}
                    alt={form.featuredImageAlt || "Featured preview"}
                    className="h-24 w-24 rounded-lg border border-white/10 object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Featured Image URL
              </label>
              <input
                value={form.featuredImage || ""}
                onChange={(e) => handleChange("featuredImage", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="Uploaded image URL will appear here"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Featured Image Alt
              </label>
              <input
                value={form.featuredImageAlt}
                onChange={(e) => handleChange("featuredImageAlt", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="Alt text"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                  placeholder="Enter tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/5"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as BlogPayload["status"])
                }
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
              >
                <option value="draft" className="text-black">
                  Draft
                </option>
                <option value="published" className="text-black">
                  Published
                </option>
                <option value="scheduled" className="text-black">
                  Scheduled
                </option>
              </select>
            </div>

            {(form.status === "published" || form.status === "scheduled") && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Published At
                </label>
                <input
                  type="datetime-local"
                  value={
                    form.publishedAt
                      ? new Date(form.publishedAt).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "publishedAt",
                      e.target.value ? new Date(e.target.value).toISOString() : ""
                    )
                  }
                  className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured || false}
                  onChange={(e) => handleChange("isFeatured", e.target.checked)}
                />
                <span>Featured Blog</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.showOnHomepage || false}
                  onChange={(e) =>
                    handleChange("showOnHomepage", e.target.checked)
                  }
                />
                <span>Show on Homepage</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enableComments || false}
                  onChange={(e) =>
                    handleChange("enableComments", e.target.checked)
                  }
                />
                <span>Enable Comments</span>
              </label>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 p-4">
              <h3 className="font-medium">SEO</h3>

              <input
                value={form.seo?.metaTitle || ""}
                onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="Meta Title"
              />

              <textarea
                value={form.seo?.metaDescription || ""}
                onChange={(e) =>
                  handleSeoChange("metaDescription", e.target.value)
                }
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                rows={3}
                placeholder="Meta Description"
              />

              <input
                value={form.seo?.focusKeyword || ""}
                onChange={(e) => handleSeoChange("focusKeyword", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="Focus Keyword"
              />

              <input
                value={form.seo?.canonicalUrl || ""}
                onChange={(e) => handleSeoChange("canonicalUrl", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="Canonical URL"
              />

              <input
                value={form.seo?.ogTitle || ""}
                onChange={(e) => handleSeoChange("ogTitle", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="OG Title"
              />

              <textarea
                value={form.seo?.ogDescription || ""}
                onChange={(e) => handleSeoChange("ogDescription", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                rows={3}
                placeholder="OG Description"
              />

              <input
                value={form.seo?.ogImage || ""}
                onChange={(e) => handleSeoChange("ogImage", e.target.value)}
                className="input w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                placeholder="OG Image URL"
              />
            </div>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || uploadingImage}
            className="rounded-lg bg-white px-4 py-2 text-black disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : uploadingImage
                ? "Uploading..."
                : isEdit
                  ? "Update Blog"
                  : "Create Blog"}
          </button>
        </div>
      </div>
    </div>
  );
}