"use client";

import { FaTimes } from "react-icons/fa";
import { useState } from "react";
import MediaPickerModal from "../media/MediaPickerModal";

export default function VendorFormModal({ onClose }: any) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    contact: "",
    category: "",
    status: "Active",
    featured: false,
  });
  const [logoPreview, setLogoPreview] = useState<any>(null);
  const [logo, setLogo] = useState("");
const [openMedia, setOpenMedia] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111111] w-full max-w-2xl rounded-2xl p-6 border border-[#1A1A1A] overflow-y-auto max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Add Vendor</h2>
          <FaTimes className="cursor-pointer" onClick={onClose} />
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* NAME */}
          <input
            placeholder="Vendor Name"
            className="w-full bg-[#0B0B0C] border border-[#1A1A1A] p-3 rounded-xl"
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            className="w-full bg-[#0B0B0C] border border-[#1A1A1A] p-3 rounded-xl"
          />

          {/* CONTACT */}
          <input
            placeholder="Contact Details"
            className="w-full bg-[#0B0B0C] border border-[#1A1A1A] p-3 rounded-xl"
          />

          {/* CATEGORY */}
          <input
            placeholder="Category"
            className="w-full bg-[#0B0B0C] border border-[#1A1A1A] p-3 rounded-xl"
          />

          {/* STATUS */}
          <select className="w-full bg-[#0B0B0C] border border-[#1A1A1A] p-3 rounded-xl">
            <option>Active</option>
            <option>Inactive</option>
          </select>
<button onClick={() => setOpenMedia(true)} className="input">
  Select Banner Image
</button>
          {/* FEATURED */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" />
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

          {/* IMAGE UPLOAD */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="file"
              onChange={(e: any) =>
                setLogoPreview(URL.createObjectURL(e.target.files[0]))
              }
              className="input"
            />

            {logoPreview && (
              <img
                src={logoPreview}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#1A1A1A] rounded-xl"
            >
              Cancel
            </button>

            <button className="px-4 py-2 bg-[#C8A96A] text-black rounded-xl">
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
