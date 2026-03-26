"use client";

import { useState } from "react";

export default function AboutSection() {
  const [data, setData] = useState({
    title: "",
    description: "",
  });

  return (
    <div className="card">
      <h2 className="section-title">About Section</h2>

      <input
        placeholder="Title"
        className="input"
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />

      <textarea
        placeholder="Description"
        className="input mt-4 h-[120px]"
        onChange={(e) =>
          setData({ ...data, description: e.target.value })
        }
      />

      <input type="file" className="input mt-4" />

      <button className="btn-primary mt-4">Save About</button>
    </div>
  );
}