"use client";

import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import MediaPickerModal from "../media/MediaPickerModal";
import { createVendor } from "@/services/vendor.service";
import { getCategoryDropdown } from "@/services/category.service";
import { updateVendor } from "@/services/vendor.service";

export default function VendorFormModal({ onClose, vendor }: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    contact: "",
    category: "",
    status: "Active",
    featured: false,
  });
 const [categories, setCategories] = useState<any[]>([]);
  const [logo, setLogo] = useState("");
  const [logoPreview, setLogoPreview] = useState<any>(null);
  const [openMedia, setOpenMedia] = useState(false);
  const fetchCategories = async () => {
    try {
      const res = await getCategoryDropdown({
        type: "vendor", // ⚠️ confirm this type
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
   // ✅ HANDLE SAVE
 const handleSave = async () => {
  try {
    const payload = {
      name: form.name,
      description: form.description,
      contactName: form.contactName,
      phone: form.phone,
      categoryId: form.categoryId,
      status: form.status,
      isFeatured: form.isFeatured,
      logo: logo,
    };

    if (vendor?._id) {
      // ✅ UPDATE
      await updateVendor(vendor._id, payload);
    } else {
      // ✅ CREATE
      await createVendor(payload);
    }

    onClose();
  } catch (err) {
    console.error("Save vendor error:", err);
  }
};
  useEffect(() => {
  if (vendor) {
    setForm({
      name: vendor.name || "",
      description: vendor.description || "",
      contactName: vendor.contactName || "",
      phone: vendor.phone || "",
      categoryId: vendor.categoryId?._id || "",
      status: vendor.status || "ACTIVE",
      isFeatured: vendor.isFeatured || false,
    });

    setLogo(vendor.logo || "");
  }
}, [vendor]);
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111111] w-full max-w-2xl rounded-2xl p-6 border border-[#1A1A1A] overflow-y-auto max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
  {vendor ? "Edit Vendor" : "Add Vendor"}
</h2>
          <FaTimes className="cursor-pointer" onClick={onClose} />
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* NAME */}
          <input
            placeholder="Vendor Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="input"
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="input"
          />

          {/* CONTACT NAME */}
          <input
            placeholder="Contact Person Name"
            value={form.contactName}
            onChange={(e) =>
              setForm({ ...form, contactName: e.target.value })
            }
            className="input"
          />
           {/* PHONE */}
          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="input"
          />

           {/* CATEGORY DROPDOWN ✅ */}
          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
            className="input"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* STATUS ✅ */}
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
            className="input"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
           {/* FEATURED */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
            />
            Mark as Featured
          </label>
          {/* ✅ MEDIA PICKER BUTTON (ADDED) */}
          <div>
            <button
              onClick={() => setOpenMedia(true)}
              className="w-full bg-[#0B0B0C] border border-[#1A1A1A] p-3 rounded-xl text-left"
            >
              Select Logo from Media Library
            </button>

            {/* PREVIEW FROM MEDIA PICKER */}
            {logo && (
              <img
                src={logo}
                className="w-16 h-16 mt-2 rounded-lg object-cover"
              />
            )}
          </div>

           {/* MEDIA PICKER */}
          <button onClick={() => setOpenMedia(true)} className="input">
            Select Logo from Media Library
          </button>

          {logo && (
            <img src={logo} className="w-16 h-16 rounded-lg" />
          )}

          {/* FILE UPLOAD */}
          <input
            type="file"
            onChange={(e: any) =>
              setLogoPreview(URL.createObjectURL(e.target.files[0]))
            }
            className="input"
          />

          {logoPreview && (
            <img src={logoPreview} className="w-16 h-16 rounded-lg" />
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>

            <button onClick={handleSave} className="btn-primary">
              Save Vendor
            </button>
          </div>
        </div>
      </div>
      {/* ✅ MEDIA MODAL */}
      {openMedia && (
        <MediaPickerModal
          onSelect={(img: string) => setLogo(img)}
          onClose={() => setOpenMedia(false)}
        />
      )}
    </div>
  );
}
