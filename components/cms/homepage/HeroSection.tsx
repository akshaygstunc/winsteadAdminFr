"use client";

import { useState } from "react";

export default function HeroSection() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    cta: "",
    bg: "",
  });

  return (
    <div className="card">
      <h2 className="section-title">Hero Section</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Title"
          className="input"
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />

        <input
          placeholder="CTA Text"
          className="input"
          onChange={(e) => setData({ ...data, cta: e.target.value })}
        />

        <textarea
          placeholder="Subtitle"
          className="input md:col-span-2"
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
        />

        <input type="file" className="input md:col-span-2" />
      </div>

      <button className="btn-primary mt-4">Save Hero</button>
    </div>
  );
}