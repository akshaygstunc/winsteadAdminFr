"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function ProjectFormModal({ onClose }: any) {
  const [amenities, setAmenities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  const addAmenity = (value: string) => {
    setAmenities([...amenities, value]);
  };

  const addTag = (value: string) => {
    setTags([...tags, value]);
  };

  const handleGallery = (files: any) => {
    const imgs = Array.from(files).map((file: any) =>
      URL.createObjectURL(file)
    );
    setGallery([...gallery, ...imgs]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto">
      
      <div className="bg-[#111111] w-full max-w-3xl p-6 rounded-2xl border border-[#1A1A1A]">
        
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2>Add Project</h2>
          <FaTimes onClick={onClose} className="cursor-pointer" />
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <input placeholder="Project Name" className="input" />
          <input placeholder="Vendor" className="input" />

          <input placeholder="Location" className="input" />
          <input placeholder="Price Range" className="input" />

          <textarea
            placeholder="Description"
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
                <span key={i} className="tag">{a}</span>
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
                <span key={i} className="tag">{t}</span>
              ))}
            </div>
          </div>

          {/* STATUS */}
          <select className="input">
            <option>Available</option>
            <option>Sold</option>
            <option>Coming Soon</option>
          </select>

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
                <img key={i} src={img} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose}>Cancel</button>
          <button className="bg-[#C8A96A] px-4 py-2 rounded-xl text-black">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}