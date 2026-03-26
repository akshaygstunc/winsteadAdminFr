"use client";

import { useState } from "react";

export default function StaticPageForm() {
  const [page, setPage] = useState("about");

  return (
    <div className="card space-y-4">

      {/* PAGE SELECT */}
      <select
        className="input"
        value={page}
        onChange={(e) => setPage(e.target.value)}
      >
        <option value="about">About Us</option>
        <option value="contact">Contact</option>
        <option value="privacy">Privacy Policy</option>
        <option value="terms">Terms</option>
      </select>

      {/* TITLE */}
      <input placeholder="Page Title" className="input" />

      {/* CONTENT */}
      <textarea
        placeholder="Page Content (Rich Text later)"
        className="input h-[200px]"
      />

      {/* SAVE */}
      <button className="btn-primary">Save Page</button>
    </div>
  );
}