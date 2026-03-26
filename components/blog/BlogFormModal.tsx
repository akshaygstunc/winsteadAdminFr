"use client";

import { useState } from "react";
import MediaPickerModal from "@/components/media/MediaPickerModal";
import { FaTimes } from "react-icons/fa";

export default function BlogFormModal({ onClose }: any) {
  const [image, setImage] = useState("");
  const [openMedia, setOpenMedia] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#111111] p-6 w-full max-w-2xl rounded-2xl">

        <div className="flex justify-between mb-4">
          <h2>Add Blog</h2>
          <FaTimes onClick={onClose} />
        </div>

        <div className="space-y-4">
          <input placeholder="Title" className="input" />

          <textarea
            placeholder="Content"
            className="input h-[150px]"
          />

          {/* CATEGORY */}
<select className="input">
  <option>Select Category</option>
  <option>Real Estate</option>
  <option>Luxury Living</option>
  <option>Investment</option>
</select>
          {/* IMAGE */}
          <button
            onClick={() => setOpenMedia(true)}
            className="input text-left"
          >
            Select Featured Image
          </button>

          {image && <img src={image} className="w-32 rounded-lg" />}

          {/* STATUS */}
          <select className="input">
            <option>Draft</option>
            <option>Published</option>
          </select>

          <button className="btn-primary">Save Blog</button>
        </div>

        {openMedia && (
          <MediaPickerModal
            onSelect={setImage}
            onClose={() => setOpenMedia(false)}
          />
        )}
      </div>
    </div>
  );
}