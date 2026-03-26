"use client";

import { useState } from "react";

export default function MediaLibrary() {
  const [images, setImages] = useState<any[]>([]);

  const handleUpload = (files: any) => {
    const imgs = Array.from(files).map((file: any) =>
      URL.createObjectURL(file)
    );

    setImages([...images, ...imgs]);
  };

  return (
    <div className="space-y-4">

      {/* UPLOAD */}
      <input
        type="file"
        multiple
        onChange={(e: any) => handleUpload(e.target.files)}
        className="input"
      />

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="border border-[#1A1A1A] rounded-xl overflow-hidden"
          >
            <img src={img} className="w-full h-32 object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}