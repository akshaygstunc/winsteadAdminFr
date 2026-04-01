/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createVendor, updateVendor } from "@/services/vendor.service";
import { uploadImageFile } from "@/services/page-content.service";
import type { VendorFormData } from "@/app/vendors/page";

interface CategoryOption {
  _id: string;
  name: string;
}

interface VendorFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: CategoryOption[];
  initialData: VendorFormData;
  isEdit: boolean;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function VendorFormModal({
  onClose,
  onSuccess,
  categories,
  initialData,
  isEdit,
}: VendorFormModalProps) {
  const [form, setForm] = useState<VendorFormData>(initialData);
  const [keywordInput, setKeywordInput] = useState(
    initialData.seo?.metaKeywords?.join(", ") || ""
  );
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    setForm(initialData);
    setKeywordInput(initialData.seo?.metaKeywords?.join(", ") || "");
  }, [initialData]);

  const canAutoSlug = useMemo(() => !isEdit || !form.slug, [isEdit, form.slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name.startsWith("seo.")) {
      const seoKey = name.split(".")[1] as keyof VendorFormData["seo"];
      setForm((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoKey]: value,
        },
      }));
      return;
    }

    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value === "" ? null : value,
      };

      if (name === "name" && canAutoSlug) {
        updated.slug = slugify(value);
      }

      return updated;
    });
  };

  const handleKeywordChange = (value: string) => {
    setKeywordInput(value);
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaKeywords: value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    }));
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "bannerImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (field === "logo") setUploadingLogo(true);
      if (field === "bannerImage") setUploadingBanner(true);

      const res = await uploadImageFile(file);
      const imageUrl = res;

      if (!imageUrl) throw new Error("Image URL not returned from upload API");

      setForm((prev) => ({
        ...prev,
        [field]: imageUrl,
      }));
    } catch (error) {
      console.error(`${field} upload failed`, error);
      alert(`Failed to upload ${field}`);
    } finally {
      if (field === "logo") setUploadingLogo(false);
      if (field === "bannerImage") setUploadingBanner(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        slug: form.slug?.trim() || slugify(form.name),
        logo: form.logo || null,
        bannerImage: form.bannerImage || null,
        description: form.description || null,
        contactName: form.contactName || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        categoryId: form.categoryId || null,
        isFeatured: Boolean(form.isFeatured),
        status: form.status,
        seo: {
          metaTitle: form.seo?.metaTitle || "",
          metaDescription: form.seo?.metaDescription || "",
          metaKeywords: form.seo?.metaKeywords || [],
        },
      };

      if (!payload.name) {
        alert("Vendor name is required");
        return;
      }

      if (!payload.slug) {
        alert("Slug is required");
        return;
      }

      if (isEdit && form._id) {
        await updateVendor(form._id, payload);
      } else {
        await createVendor(payload);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Vendor save failed", error);
      alert(error?.response?.data?.message || "Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start overflow-y-auto p-6">
      <div className="bg-[#111] text-white w-full max-w-4xl rounded-2xl p-6 space-y-6 border border-white/10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Vendor" : "Add Vendor"}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-400">
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Vendor name"
            className="input"
          />

          <input
            name="slug"
            value={form.slug}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))
            }
            placeholder="Slug"
            className="input"
          />

          <input
            name="contactName"
            value={form.contactName || ""}
            onChange={handleChange}
            placeholder="Contact name"
            className="input"
          />

          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="input"
          />

          <input
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
            placeholder="Phone"
            className="input"
          />

          <select
            name="categoryId"
            value={form.categoryId || ""}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            Featured vendor
          </label>
        </div>

        <textarea
          name="address"
          value={form.address || ""}
          onChange={handleChange}
          placeholder="Address"
          className="input w-full min-h-[80px]"
        />

        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Description"
          className="input w-full min-h-[120px]"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">Upload Logo</label>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "logo")} />
            {uploadingLogo && (
              <p className="text-xs text-yellow-400 mt-2">Uploading logo...</p>
            )}
            {form.logo && (
              <div className="mt-3">
                <img
                  src={form.logo}
                  alt="Logo"
                  width={80}
                  height={80}
                  className="rounded object-cover border border-white/10"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm">Upload Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "bannerImage")}
            />
            {uploadingBanner && (
              <p className="text-xs text-yellow-400 mt-2">Uploading banner...</p>
            )}
            {form.bannerImage && (
              <div className="mt-3">
                <Image
                  src={form.bannerImage}
                  alt="Banner"
                  width={200}
                  height={100}
                  className="rounded object-cover border border-white/10"
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-4">
          <h3 className="text-lg font-medium">SEO</h3>

          <input
            name="seo.metaTitle"
            value={form.seo.metaTitle}
            onChange={handleChange}
            placeholder="Meta title"
            className="input w-full"
          />

          <textarea
            name="seo.metaDescription"
            value={form.seo.metaDescription}
            onChange={handleChange}
            placeholder="Meta description"
            className="input w-full min-h-[100px]"
          />

          <input
            value={keywordInput}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="Meta keywords (comma separated)"
            className="input w-full"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingLogo || uploadingBanner}
            className="px-4 py-2 rounded-xl bg-[#C8A96A] text-black disabled:opacity-60"
          >
            {loading ? "Saving..." : isEdit ? "Update Vendor" : "Create Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}