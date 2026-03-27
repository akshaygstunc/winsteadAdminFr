"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getVendors } from "@/services/vendor.service";
import { getCategoryDropdown } from "@/services/category.service";
import { createProject, updateProject } from "@/services/projects.service";
import { uploadFile } from "@/services/upload.service";
export default function ProjectFormModal({ onClose, project }: any) {
  const [amenities, setAmenities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [brochure, setBrochure] = useState<any>(null);
  const [floorPlan, setFloorPlan] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    vendorId: "",
    categoryId: "",
    location: "",
    priceRange: "",
    shortDescription: "",
    fullDescription: "",
    status: "AVAILABLE",
    isFeatured: false,
  });
  const addAmenity = (value: string) => {
    setAmenities([...amenities, value]);
  };

  const addTag = (value: string) => {
    setTags([...tags, value]);
  };
  const handleUpload = async (file: File) => {
  return await uploadFile(file);
};

 const handleGallery = (files: any) => {
  setGallery([...gallery, ...Array.from(files)]);
};
  useEffect(() => {
    const fetchData = async () => {
      const v = await getVendors({ limit: 100 });
      setVendors(v.data);

      const c = await getCategoryDropdown({ type: "project" });
      setCategories(c.data);
    };

    fetchData();
  }, []);
const handleSave = async () => {
  try {
    // ✅ Upload files first
    const brochureUrl = brochure
      ? await handleUpload(brochure)
      : "";

    const floorPlanUrl = floorPlan
      ? await handleUpload(floorPlan)
      : "";

    // ✅ Upload gallery
    const galleryUrls = await Promise.all(
      gallery.map((file: any) => handleUpload(file))
    );

    const payload = {
      ...form,
      amenities,
      tags,
      gallery: galleryUrls,
      brochure: brochureUrl,
      floorPlan: floorPlanUrl,
    };

    if (project?._id) {
      await updateProject(project._id, payload);
    } else {
      await createProject(payload);
    }

    onClose();
  } catch (err) {
    console.error("Upload error:", err);
  }
};
useEffect(() => {
  if (project) {
    setForm({
      name: project.name || "",
      vendorId: project.vendorId?._id || "",
      categoryId: project.categoryId?._id || "",
      location: project.location || "",
      priceRange: project.priceRange || "",
      shortDescription: project.shortDescription || "",
      fullDescription: project.fullDescription || "",
      status: project.status || "AVAILABLE",
      isFeatured: project.isFeatured || false,
    });

    setAmenities(project.amenities || []);
    setTags(project.tags || []);
    setGallery(project.gallery || []);
  }
}, [project]);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-[#111111] w-full max-w-3xl p-6 rounded-2xl border border-[#1A1A1A]">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2>{project ? "Edit Project" : "Add Project"}</h2>
          <FaTimes onClick={onClose} className="cursor-pointer" />
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
  placeholder="Project Name"
  value={form.name}
  onChange={(e) =>
    setForm({ ...form, name: e.target.value })
  }
  className="input"
/>
          <select
            className="input"
            value={form.vendorId}
            onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>

          <input
  placeholder="Location"
  value={form.location}
  onChange={(e) =>
    setForm({ ...form, location: e.target.value })
  }
  className="input"
/>
          <input
  placeholder="Price Range"
  value={form.priceRange}
  onChange={(e) =>
    setForm({ ...form, priceRange: e.target.value })
  }
  className="input"
/>

          <textarea
  placeholder="Description"
  value={form.fullDescription}
  onChange={(e) =>
    setForm({ ...form, fullDescription: e.target.value })
  }
  className="input md:col-span-2"
/>

          {/* AMENITIES */}
          <div className="md:col-span-2">
            <input
              placeholder="Add Amenity"
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  addAmenity(e.target.value);
                  e.target.value = "";
                }
              }}
              className="input"
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((a, i) => (
                <span key={i} className="tag">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* TAGS */}
          <div className="md:col-span-2">
            <input
              placeholder="Add Tag"
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  addTag(e.target.value);
                  e.target.value = "";
                }
              }}
              className="input"
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t, i) => (
                <span key={i} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <select
            className="input"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* STATUS */}
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
            <option value="COMING_SOON">Coming Soon</option>
          </select>

          {/* FILE UPLOADS */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BROCHURE */}
            <div>
              <label className="text-sm text-gray-400">
                Upload Brochure (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e: any) => setBrochure(e.target.files[0])}
                className="input mt-1"
              />

              {brochure && (
                <p className="text-xs text-green-400 mt-1">{brochure.name}</p>
              )}
            </div>

            {/* FLOOR PLAN */}
            <div>
              <label className="text-sm text-gray-400">Upload Floor Plan</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e: any) => setFloorPlan(e.target.files[0])}
                className="input mt-1"
              />

              {floorPlan && (
                <p className="text-xs text-green-400 mt-1">{floorPlan.name}</p>
              )}
            </div>
          </div>

          {/* GALLERY */}
          <div className="md:col-span-2">
            <input
              type="file"
              multiple
              onChange={(e: any) => handleGallery(e.target.files)}
              className="input"
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {gallery.map((img, i) => (
                <img key={i} src={URL.createObjectURL(img)} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} className="bg-[#C8A96A] px-4 py-2 rounded-xl text-black">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
