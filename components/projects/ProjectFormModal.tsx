"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { getVendors } from "@/services/vendor.service";
import { getCategoryDropdown } from "@/services/category.service";
import { createProject, updateProject, uploadBrochure, uploadDeveloperLogo, uploadFloorPlan } from "@/services/projects.service";
import { uploadFile } from "@/services/upload.service";

const TextEditor = dynamic(() => import("@/components/common/TextEditor"), {
  ssr: false,
});

type ProjectStatus = "available" | "sold" | "coming-soon" | "inactive";

interface AmenityItem {
  title: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
}

interface ProjectFactItem {
  label: string;
  value: string;
}

interface FloorPlanItem {
  unitType: string;
  bedrooms?: number | null;
  floorLevel?: string | null;
  totalArea?: string | null;
  image?: string | File | null;
  brochure?: string | File | null;
  price?: string | null;
  status?: string | null;
}

interface ProjectFormModalProps {
  onClose: () => void;
  project?: any;
  onSuccess?: () => void;
}

export default function ProjectFormModal({
  onClose,
  project,
  onSuccess,
}: ProjectFormModalProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const [developerLogoFile, setDeveloperLogoFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState({
    brochure: false,
    floorPlan: false,
    developerLogo: false,
  });

  const [typeInput, setTypeInput] = useState("");
  const [subTypeInput, setSubTypeInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [locationHighlightInput, setLocationHighlightInput] = useState("");
  const [seoKeywordInput, setSeoKeywordInput] = useState("");

  const [form, setForm] = useState({
    vendorId: "",
    categoryId: "",
    subCategoryId: "",

    name: "",
    buildingName: "",
    slug: "",

    type: [] as string[],
    subType: [] as string[],

    developerName: "",
    developerType: "",
    developerDescription: "",
    developerLogo: "",

    community: "",

    city: "",
    subCity: "",
    location: "",
    address: "",
    locationMapUrl: "",
    locationHighlights: [] as string[],

    priceRange: "",

    shortDescription: "",
    fullDescription: "",

    highlights: [] as string[],
    amenities: [] as AmenityItem[],
    tags: [] as string[],
    projectFacts: [] as ProjectFactItem[],

    gallery: [] as string[],
    brochure: "",
    floorPlan: "",
    floorPlans: [] as FloorPlanItem[],

    brochureTitle: "",
    ctaTitle: "",
    ctaSubtitle: "",

    status: "available" as ProjectStatus,
    isFeatured: false,

    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [] as string[],
    },
  });

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSeoField = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [key]: value,
      },
    }));
  };

  const handleUpload = async (file: File, folder: string) => {
    let res;
    if (folder == 'brochure') {
      res = await uploadBrochure(file)
    } else if (folder == 'floor-plan') {
      res = await uploadFloorPlan(file)
    } else if (folder == 'developer-logo') {
      res = await uploadDeveloperLogo(file)
    } else {
      res = await uploadFile(file)
    }
    return res?.data?.url || res?.url || res;
  };

  const uploadBrochurefile = async (file: File | null) => {
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, brochure: true }));
      const url = await handleUpload(file, "brochure");

      setBrochureFile(file);
      setForm((prev) => ({
        ...prev,
        brochure: url || "",
      }));

      toast.success("Brochure uploaded");
    } catch (err) {
      console.error("Brochure upload failed:", err);
      toast.error("Failed to upload brochure");
    } finally {
      setUploading((prev) => ({ ...prev, brochure: false }));
    }
  };

  const uploadFloorPlanfile = async (file: File | null) => {
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, floorPlan: true }));
      const url = await handleUpload(file, "floor-plan");

      setFloorPlanFile(file);
      setForm((prev) => ({
        ...prev,
        floorPlan: url || "",
      }));

      toast.success("Floor plan uploaded");
    } catch (err) {
      console.error("Floor plan upload failed:", err);
      toast.error("Failed to upload floor plan");
    } finally {
      setUploading((prev) => ({ ...prev, floorPlan: false }));
    }
  };

  const uploadDeveloperLogofile = async (file: File | null) => {
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, developerLogo: true }));
      const url = await handleUpload(file, "developer-logo");

      setDeveloperLogoFile(file);
      setForm((prev) => ({
        ...prev,
        developerLogo: url || "",
      }));

      toast.success("Developer logo uploaded");
    } catch (err) {
      console.error("Developer logo upload failed:", err);
      toast.error("Failed to upload developer logo");
    } finally {
      setUploading((prev) => ({ ...prev, developerLogo: false }));
    }
  };

  const uploadFloorPlanItemFile = async (
    index: number,
    key: "image" | "brochure",
    file: File | null
  ) => {
    if (!file) return;

    try {
      const url = await handleUpload(file);

      setForm((prev) => ({
        ...prev,
        floorPlans: prev.floorPlans.map((item, i) =>
          i === index ? { ...item, [key]: url || "" } : item
        ),
      }));

      toast.success(
        key === "image"
          ? "Floor plan image uploaded"
          : "Floor plan brochure uploaded"
      );
    } catch (err) {
      console.error(`Floor plan ${key} upload failed:`, err);
      toast.error(`Failed to upload floor plan ${key}`);
    }
  };

  const addStringValue = (
    value: string,
    key: "type" | "subType" | "highlights" | "tags" | "locationHighlights"
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setForm((prev) => ({
      ...prev,
      [key]: [...prev[key], trimmed],
    }));
  };

  const removeStringValue = (
    index: number,
    key: "type" | "subType" | "highlights" | "tags" | "locationHighlights"
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_: string, i: number) => i !== index),
    }));
  };

  const addSeoKeyword = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaKeywords: [...prev.seo.metaKeywords, trimmed],
      },
    }));
  };

  const removeSeoKeyword = (index: number) => {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaKeywords: prev.seo.metaKeywords.filter((_, i) => i !== index),
      },
    }));
  };

  const handleGallery = (files: FileList) => {
    setGalleryFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const addAmenity = () => {
    setForm((prev) => ({
      ...prev,
      amenities: [
        ...prev.amenities,
        { title: "", description: "", icon: "", image: "" },
      ],
    }));
  };

  const updateAmenity = (index: number, key: keyof AmenityItem, value: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeAmenity = (index: number) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const addProjectFact = () => {
    setForm((prev) => ({
      ...prev,
      projectFacts: [...prev.projectFacts, { label: "", value: "" }],
    }));
  };

  const updateProjectFact = (
    index: number,
    key: keyof ProjectFactItem,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      projectFacts: prev.projectFacts.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeProjectFact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      projectFacts: prev.projectFacts.filter((_, i) => i !== index),
    }));
  };

  const addFloorPlanItem = () => {
    setForm((prev) => ({
      ...prev,
      floorPlans: [
        ...prev.floorPlans,
        {
          unitType: "",
          bedrooms: null,
          floorLevel: "",
          totalArea: "",
          image: null,
          brochure: null,
          price: "",
          status: "",
        },
      ],
    }));
  };

  const updateFloorPlanItem = (
    index: number,
    key: keyof FloorPlanItem,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      floorPlans: prev.floorPlans.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const removeFloorPlanItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      floorPlans: prev.floorPlans.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const v = await getVendors({ page: 1, limit: 100 });
        setVendors(v.data || []);

        const c = await getCategoryDropdown({ type: "project" });
        setCategories(c.data.filter((cat) => cat.catType == "category") || []);
      } catch (err) {
        console.error("Failed to fetch project form data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      return;
    }

    const fetchSubCategories = async () => {
      try {
        const res = await getCategoryDropdown({
          type: "project",
        });
        const subcat = res.data.filter(
          (cat) => cat.catType == "subcategory" && cat.parentId == form.categoryId
        );
        setSubCategories(subcat);
      } catch (err) {
        console.error("Failed to fetch sub categories:", err);
      }
    };

    fetchSubCategories();
  }, [form.categoryId]);

  useEffect(() => {
    if (!project) return;

    setForm({
      vendorId: project.vendorId?._id || project.vendorId || "",
      categoryId: project.categoryId?._id || project.categoryId || "",
      subCategoryId: project.subCategoryId?._id || project.subCategoryId || "",

      name: project.name || "",
      buildingName: project.buildingName || "",
      slug: project.slug || "",

      type: project.type || [],
      subType: project.subType || [],

      developerName: project.developerName || "",
      developerType: project.developerType || "",
      developerDescription: project.developerDescription || "",
      developerLogo: project.developerLogo || "",

      community: project.community || "",

      city: project.city || "",
      subCity: project.subCity || "",
      location: project.location || "",
      address: project.address || "",
      locationMapUrl: project.locationMapUrl || "",
      locationHighlights: project.locationHighlights || [],

      priceRange: project.priceRange || "",

      shortDescription: project.shortDescription || "",
      fullDescription: project.fullDescription || "",

      highlights: project.highlights || [],
      amenities: project.amenities || [],
      tags: project.tags || [],
      projectFacts: project.projectFacts || [],

      gallery: project.gallery || [],
      brochure: project.brochure || "",
      floorPlan: project.floorPlan || "",
      floorPlans: project.floorPlans || [],

      brochureTitle: project.brochureTitle || "",
      ctaTitle: project.ctaTitle || "",
      ctaSubtitle: project.ctaSubtitle || "",

      status: project.status || "available",
      isFeatured: Boolean(project.isFeatured),

      seo: {
        metaTitle: project.seo?.metaTitle || "",
        metaDescription: project.seo?.metaDescription || "",
        metaKeywords: project.seo?.metaKeywords || [],
      },
    });
  }, [project]);

  const handleSave = async () => {
    try {
      const uploadedGalleryUrls = await Promise.all(
        galleryFiles
          .filter((file) => file instanceof File)
          .map((file) => handleUpload(file))
      );

      const existingGalleryUrls = (form.gallery || []).filter(
        (item) => typeof item === "string"
      );

      const payload = {
        vendorId: form.vendorId,
        categoryId: form.categoryId || null,
        subCategoryId: form.subCategoryId || null,

        name: form.name,
        buildingName: form.buildingName || null,
        slug: form.slug,

        type: form.type,
        subType: form.subType,

        developerName: form.developerName || null,
        developerType: form.developerType || null,
        developerDescription: form.developerDescription || null,
        developerLogo: form.developerLogo || null,

        community: form.community || null,

        city: form.city || null,
        subCity: form.subCity || null,
        location: form.location || null,
        address: form.address || null,
        locationMapUrl: form.locationMapUrl || null,
        locationHighlights: form.locationHighlights,

        priceRange: form.priceRange || null,

        shortDescription: form.shortDescription || null,
        fullDescription: form.fullDescription || null,

        highlights: form.highlights,
        amenities: form.amenities.filter((item) => item.title?.trim()),
        tags: form.tags,
        projectFacts: form.projectFacts.filter(
          (item) => item.label?.trim() && item.value?.trim()
        ),

        gallery: [...existingGalleryUrls, ...uploadedGalleryUrls],
        brochure: form.brochure || null,
        floorPlan: form.floorPlan || null,
        floorPlans: form.floorPlans
          .filter((item) => item.unitType?.trim())
          .map((item) => ({
            unitType: item.unitType,
            bedrooms: item.bedrooms ?? null,
            floorLevel: item.floorLevel || null,
            totalArea: item.totalArea || null,
            image: typeof item.image === "string" ? item.image : null,
            brochure: typeof item.brochure === "string" ? item.brochure : null,
            price: item.price || null,
            status: item.status || null,
          })),

        brochureTitle: form.brochureTitle || null,
        ctaTitle: form.ctaTitle || null,
        ctaSubtitle: form.ctaSubtitle || null,

        status: form.status,
        isFeatured: form.isFeatured,

        seo: {
          metaTitle: form.seo.metaTitle || null,
          metaDescription: form.seo.metaDescription || null,
          metaKeywords: form.seo.metaKeywords,
        },
      };

      if (project?._id) {
        await updateProject(project._id, payload);
      } else {
        await createProject(payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Project save error:", err);
      toast.error("Failed to save project");
    }
  };

  const renderTags = (
    items: string[],
    onRemove: (index: number) => void
  ) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="px-3 py-1 rounded-full text-xs bg-[#C8A96A]/20 text-[#C8A96A] border border-[#C8A96A]/30 flex items-center gap-2"
        >
          {item}
          <button type="button" onClick={() => onRemove(index)}>
            ×
          </button>
        </span>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-[#111111] w-full max-w-[1500px] p-6 rounded-2xl border border-[#1A1A1A] max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {project ? "Edit Project" : "Add Project"}
          </h2>
          <FaTimes onClick={onClose} className="cursor-pointer text-white" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="input"
                value={form.vendorId}
                onChange={(e) => setField("vendorId", e.target.value)}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setField("categoryId", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={form.subCategoryId}
                onChange={(e) => setField("subCategoryId", e.target.value)}
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Project Name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="input"
              />

              <input
                placeholder="Building Name"
                value={form.buildingName}
                onChange={(e) => setField("buildingName", e.target.value)}
                className="input"
              />

              <input
                placeholder="Slug"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                className="input"
              />

              <input
                placeholder="Developer Name"
                value={form.developerName}
                onChange={(e) => setField("developerName", e.target.value)}
                className="input"
              />

              <input
                placeholder="Developer Type"
                value={form.developerType}
                onChange={(e) => setField("developerType", e.target.value)}
                className="input"
              />

              <input
                placeholder="Community"
                value={form.community}
                onChange={(e) => setField("community", e.target.value)}
                className="input"
              />

              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                className="input"
              />

              <input
                placeholder="Sub City"
                value={form.subCity}
                onChange={(e) => setField("subCity", e.target.value)}
                className="input"
              />

              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                className="input"
              />

              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                className="input"
              />

              <input
                placeholder="Location Map URL"
                value={form.locationMapUrl}
                onChange={(e) => setField("locationMapUrl", e.target.value)}
                className="input"
              />

              <input
                placeholder="Price Range"
                value={form.priceRange}
                onChange={(e) => setField("priceRange", e.target.value)}
                className="input"
              />

              <select
                className="input"
                value={form.status}
                onChange={(e) => setField("status", e.target.value as ProjectStatus)}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="coming-soon">Coming Soon</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <label className="flex items-center gap-3 text-white">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setField("isFeatured", e.target.checked)}
              />
              Featured Project
            </label>

            <div>
              <input
                placeholder="Add Project Type and press Enter"
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStringValue(typeInput, "type");
                    setTypeInput("");
                  }
                }}
                className="input"
              />
              {renderTags(form.type, (index) => removeStringValue(index, "type"))}
            </div>

            <div>
              <input
                placeholder="Add Sub Type and press Enter"
                value={subTypeInput}
                onChange={(e) => setSubTypeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStringValue(subTypeInput, "subType");
                    setSubTypeInput("");
                  }
                }}
                className="input"
              />
              {renderTags(form.subType, (index) => removeStringValue(index, "subType"))}
            </div>

            <div>
              <input
                placeholder="Add Highlight and press Enter"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStringValue(highlightInput, "highlights");
                    setHighlightInput("");
                  }
                }}
                className="input"
              />
              {renderTags(form.highlights, (index) =>
                removeStringValue(index, "highlights")
              )}
            </div>

            <div>
              <input
                placeholder="Add Tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStringValue(tagInput, "tags");
                    setTagInput("");
                  }
                }}
                className="input"
              />
              {renderTags(form.tags, (index) => removeStringValue(index, "tags"))}
            </div>

            <div>
              <input
                placeholder="Add Location Highlight and press Enter"
                value={locationHighlightInput}
                onChange={(e) => setLocationHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStringValue(locationHighlightInput, "locationHighlights");
                    setLocationHighlightInput("");
                  }
                }}
                className="input"
              />
              {renderTags(form.locationHighlights, (index) =>
                removeStringValue(index, "locationHighlights")
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400">Developer Description</label>
              <TextEditor
                value={form.developerDescription}
                onChange={(value: string) => setField("developerDescription", value)}
                placeholder="Enter developer description"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Short Description</label>
              <TextEditor
                value={form.shortDescription}
                onChange={(value: string) => setField("shortDescription", value)}
                placeholder="Enter short description"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Full Description</label>
              <TextEditor
                value={form.fullDescription}
                onChange={(value: string) => setField("fullDescription", value)}
                placeholder="Enter full description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Developer Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: any) => uploadDeveloperLogofile(e.target.files?.[0] || null)}
                  className="input mt-1"
                />
                {uploading.developerLogo && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Uploading developer logo...
                  </p>
                )}
                {form.developerLogo && (
                  <p className="text-xs text-green-400 mt-1 break-all">
                    {form.developerLogo}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400">Upload Brochure (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e: any) => uploadBrochurefile(e.target.files?.[0] || null)}
                  className="input mt-1"
                />
                {uploading.brochure && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Uploading brochure...
                  </p>
                )}
                {form.brochure && (
                  <p className="text-xs text-green-400 mt-1 break-all">
                    {form.brochure}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400">Upload Floor Plan</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e: any) => uploadFloorPlanfile(e.target.files?.[0] || null)}
                  className="input mt-1"
                />
                {uploading.floorPlan && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Uploading floor plan...
                  </p>
                )}
                {form.floorPlan && (
                  <p className="text-xs text-green-400 mt-1 break-all">
                    {form.floorPlan}
                  </p>
                )}
              </div>

              <input
                placeholder="Brochure Title"
                value={form.brochureTitle}
                onChange={(e) => setField("brochureTitle", e.target.value)}
                className="input"
              />

              <input
                placeholder="CTA Title"
                value={form.ctaTitle}
                onChange={(e) => setField("ctaTitle", e.target.value)}
                className="input"
              />

              <input
                placeholder="CTA Subtitle"
                value={form.ctaSubtitle}
                onChange={(e) => setField("ctaSubtitle", e.target.value)}
                className="input md:col-span-2"
              />

              <input
                placeholder="Meta Title"
                value={form.seo.metaTitle}
                onChange={(e) => setSeoField("metaTitle", e.target.value)}
                className="input md:col-span-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Meta Description</label>
              <TextEditor
                value={form.seo.metaDescription}
                onChange={(value: string) => setSeoField("metaDescription", value)}
                placeholder="Enter meta description"
              />
            </div>

            <div>
              <input
                placeholder="Add Meta Keyword and press Enter"
                value={seoKeywordInput}
                onChange={(e) => setSeoKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSeoKeyword(seoKeywordInput);
                    setSeoKeywordInput("");
                  }
                }}
                className="input"
              />
              {renderTags(form.seo.metaKeywords, removeSeoKeyword)}
            </div>

            <div>
              <label className="text-sm text-gray-400">Gallery Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e: any) => handleGallery(e.target.files)}
                className="input"
              />

              <div className="flex gap-2 mt-2 flex-wrap">
                {form.gallery
                  .filter((img) => typeof img === "string")
                  .map((img: string, i: number) => (
                    <img
                      key={`existing-${i}`}
                      src={img}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ))}

                {galleryFiles.map((img: File, i: number) => (
                  <img
                    key={`new-${i}`}
                    src={URL.createObjectURL(img)}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* FULL WIDTH BOTTOM SECTIONS */}
          <div className="xl:col-span-2 space-y-6">
            <div className="border-t border-[#1A1A1A] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Amenities</h3>
                <button
                  type="button"
                  onClick={addAmenity}
                  className="bg-[#C8A96A] text-black px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <FaPlus /> Add Amenity
                </button>
              </div>

              <div className="space-y-4">
                {form.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-[#2A2A2A] rounded-xl p-4"
                  >
                    <input
                      placeholder="Amenity Title"
                      value={amenity.title}
                      onChange={(e) => updateAmenity(index, "title", e.target.value)}
                      className="input"
                    />

                    <input
                      placeholder="Amenity Icon"
                      value={amenity.icon || ""}
                      onChange={(e) => updateAmenity(index, "icon", e.target.value)}
                      className="input"
                    />

                    <input
                      placeholder="Amenity Image URL"
                      value={amenity.image || ""}
                      onChange={(e) => updateAmenity(index, "image", e.target.value)}
                      className="input"
                    />

                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-400">
                        Amenity Description
                      </label>
                      <TextEditor
                        value={amenity.description || ""}
                        onChange={(value: string) =>
                          updateAmenity(index, "description", value)
                        }
                        placeholder="Enter amenity description"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="text-red-400 flex items-center gap-2"
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1A1A1A] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Project Facts</h3>
                <button
                  type="button"
                  onClick={addProjectFact}
                  className="bg-[#C8A96A] text-black px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <FaPlus /> Add Fact
                </button>
              </div>

              <div className="space-y-3">
                {form.projectFacts.map((fact, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 border border-[#2A2A2A] rounded-xl p-4"
                  >
                    <input
                      placeholder="Label"
                      value={fact.label}
                      onChange={(e) =>
                        updateProjectFact(index, "label", e.target.value)
                      }
                      className="input"
                    />
                    <input
                      placeholder="Value"
                      value={fact.value}
                      onChange={(e) =>
                        updateProjectFact(index, "value", e.target.value)
                      }
                      className="input"
                    />
                    <button
                      type="button"
                      onClick={() => removeProjectFact(index)}
                      className="text-red-400 flex items-center justify-center"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1A1A1A] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Floor Plans</h3>
                <button
                  type="button"
                  onClick={addFloorPlanItem}
                  className="bg-[#C8A96A] text-black px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <FaPlus /> Add Floor Plan
                </button>
              </div>

              <div className="space-y-4">
                {form.floorPlans.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#2A2A2A] rounded-xl p-4"
                  >
                    <input
                      placeholder="Unit Type"
                      value={item.unitType}
                      onChange={(e) =>
                        updateFloorPlanItem(index, "unitType", e.target.value)
                      }
                      className="input"
                    />

                    <input
                      type="number"
                      placeholder="Bedrooms"
                      value={item.bedrooms ?? ""}
                      onChange={(e) =>
                        updateFloorPlanItem(
                          index,
                          "bedrooms",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="input"
                    />

                    <input
                      placeholder="Floor Level"
                      value={item.floorLevel || ""}
                      onChange={(e) =>
                        updateFloorPlanItem(index, "floorLevel", e.target.value)
                      }
                      className="input"
                    />

                    <input
                      placeholder="Total Area"
                      value={item.totalArea || ""}
                      onChange={(e) =>
                        updateFloorPlanItem(index, "totalArea", e.target.value)
                      }
                      className="input"
                    />

                    <input
                      placeholder="Price"
                      value={item.price || ""}
                      onChange={(e) =>
                        updateFloorPlanItem(index, "price", e.target.value)
                      }
                      className="input"
                    />

                    <input
                      placeholder="Status"
                      value={item.status || ""}
                      onChange={(e) =>
                        updateFloorPlanItem(index, "status", e.target.value)
                      }
                      className="input"
                    />

                    <div>
                      <label className="text-sm text-gray-400">
                        Upload Floor Plan Image / File
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e: any) =>
                          uploadFloorPlanItemFile(
                            index,
                            "image",
                            e.target.files?.[0] || null
                          )
                        }
                        className="input mt-1"
                      />
                      {item.image && (
                        <p className="text-xs text-green-400 mt-1 break-all">
                          {typeof item.image === "string"
                            ? item.image
                            : item.image.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">
                        Upload Floor Plan Brochure
                      </label>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e: any) =>
                          uploadFloorPlanItemFile(
                            index,
                            "brochure",
                            e.target.files?.[0] || null
                          )
                        }
                        className="input mt-1"
                      />
                      {item.brochure && (
                        <p className="text-xs text-green-400 mt-1 break-all">
                          {typeof item.brochure === "string"
                            ? item.brochure
                            : item.brochure.name}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeFloorPlanItem(index)}
                        className="text-red-400 flex items-center gap-2"
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#2A2A2A] text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#C8A96A] px-4 py-2 rounded-xl text-black font-medium"
          >
            {project ? "Update Project" : "Save Project"}
          </button>
        </div>
      </div>
    </div>
  );
}