"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import MediaPickerModal from "@/components/media/MediaPickerModal";

export default function TestimonialsFormModal({ onClose }: any) {
  const [image, setImage] = useState("");
  const [openMedia, setOpenMedia] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#111111] p-6 w-full max-w-lg rounded-2xl">

        <div className="flex justify-between mb-4">
          <h2>Add Testimonial</h2>
          <FaTimes onClick={onClose} />
        </div>

        <div className="space-y-4">
          <input placeholder="Name" className="input" />

          <textarea
            placeholder="Review"
            className="input h-[120px]"
          />

          <input placeholder="Rating (1-5)" className="input" />

          {/* IMAGE */}
          <button
            onClick={() => setOpenMedia(true)}
            className="input text-left"
          >
            Select User Image
          </button>

          {image && <img src={image} className="w-16 rounded-full" />}

          <button className="btn-primary">Save</button>
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