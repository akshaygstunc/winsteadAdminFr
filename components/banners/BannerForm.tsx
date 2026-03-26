"use client";

import { useState } from "react";
import MediaPickerModal from "@/components/media/MediaPickerModal";

export default function BannerForm() {
  const [image, setImage] = useState("");
  const [openMedia, setOpenMedia] = useState(false);

  return (
    <div className="card space-y-4">

      <input placeholder="Banner Title" className="input" />
      <input placeholder="CTA Text" className="input" />
      <input placeholder="Link" className="input" />

      {/* IMAGE */}
      <button
        onClick={() => setOpenMedia(true)}
        className="input text-left"
      >
        Select Banner Image
      </button>

      {image && (
        <img src={image} className="w-full h-40 object-cover rounded-lg" />
      )}

      <button className="btn-primary">Save Banner</button>

      {openMedia && (
        <MediaPickerModal
          onSelect={setImage}
          onClose={() => setOpenMedia(false)}
        />
      )}
    </div>
  );
}