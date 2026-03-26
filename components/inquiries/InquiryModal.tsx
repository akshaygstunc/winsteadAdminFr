"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function InquiryModal({ data, onClose }: any) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-[#111111] p-6 w-full max-w-lg rounded-2xl border border-[#1A1A1A]">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2>Inquiry Details</h2>
          <FaTimes onClick={onClose} className="cursor-pointer" />
        </div>

        {/* DETAILS */}
        <div className="space-y-3 text-sm">
          <p><b>Name:</b> {data.name}</p>
          <p><b>Contact:</b> {data.contact}</p>
          <p><b>Project:</b> {data.project}</p>
          <p><b>Vendor:</b> {data.vendor}</p>
        </div>

        {/* NOTES */}
        <div className="mt-4">
          <textarea
            placeholder="Add internal notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input h-[100px]"
          />
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose}>Close</button>
          <button className="bg-[#C8A96A] px-4 py-2 rounded-xl text-black">
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}