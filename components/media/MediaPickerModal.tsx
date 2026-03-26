"use client";

import { FaTimes } from "react-icons/fa";

export default function MediaPickerModal({ onSelect, onClose }: any) {
  const mockImages = [
    "https://via.placeholder.com/200",
    "https://via.placeholder.com/201",
    "https://via.placeholder.com/202",
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#111111] w-full max-w-2xl p-6 rounded-2xl border border-[#1A1A1A]">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2>Select Media</h2>
          <FaTimes onClick={onClose} className="cursor-pointer" />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-3">
          {mockImages.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => {
                onSelect(img);
                onClose();
              }}
              className="cursor-pointer rounded-lg hover:scale-105 transition"
            />
          ))}
        </div>
      </div>
    </div>
  );
}