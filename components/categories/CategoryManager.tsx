"use client";

import { useState } from "react";

export default function CategoryManager() {
  const [categories, setCategories] = useState([
    { name: "Ultra Luxury", badgeColor: "#C8A96A" },
  ]);

  return (
    <div className="card space-y-4">

      {categories.map((c, i) => (
        <div key={i} className="flex gap-3">
          <input
            value={c.name}
            className="input"
            onChange={(e) => {
              const updated = [...categories];
              updated[i].name = e.target.value;
              setCategories(updated);
            }}
          />

          <input
            type="color"
            value={c.badgeColor}
            onChange={(e) => {
              const updated = [...categories];
              updated[i].badgeColor = e.target.value;
              setCategories(updated);
            }}
          />
        </div>
      ))}

      <button
        onClick={() =>
          setCategories([...categories, { name: "", badgeColor: "#ffffff" }])
        }
        className="btn-primary"
      >
        Add Category
      </button>
    </div>
  );
}