"use client";

import { useState } from "react";

export default function MediaLibrary() {
  const [images, setImages] = useState<any[]>([]);
const [folder, setFolder] = useState("all");
  const handleUpload = (files: any) => {
    const imgs = Array.from(files).map((file: any) =>
      URL.createObjectURL(file)
    );

    setImages([...images, ...imgs.map((img) => ({
  url: img,
  folder: "general" // later dynamic
}))]);
  };

  return (
    <div className="space-y-4">
<div className="flex gap-3 mb-4">
  {["all", "vendors", "projects", "general"].map((f) => (
    <button
      key={f}
      onClick={() => setFolder(f)}
      className={`px-3 py-1 rounded-full text-sm ${
        folder === f ? "bg-[#C8A96A] text-black" : "bg-[#111] text-gray-400"
      }`}
    >
      {f}
    </button>
  ))}
</div>
      {/* UPLOAD */}
      <input
        type="file"
        multiple
        onChange={(e: any) => handleUpload(e.target.files)}
        className="input"
      />

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images
  .filter((img) => folder === "all" || img.folder === folder)
  .map((img, i) => (
          <div
            key={i}
            className="border border-[#1A1A1A] rounded-xl overflow-hidden"
          >
            <img src={img.url} className="w-full h-32 object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}