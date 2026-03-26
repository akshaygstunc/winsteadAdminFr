"use client";

import { useState } from "react";
import MediaPickerModal from "../media/MediaPickerModal";

export default function SEOForm() {
  const [data, setData] = useState({
    page: "",
    title: "",
    description: "",
    slug: "",
    og: "",
  });

  const [openMedia, setOpenMedia] = useState(false);

  return (
    <div className="card space-y-4">

      {/* PAGE */}
      <select
        className="input"
        onChange={(e) => setData({ ...data, page: e.target.value })}
      >
        <option>Select Page</option>
        <option>Homepage</option>
        <option>Vendors</option>
        <option>Projects</option>
      </select>

      {/* META */}
      <input
        placeholder="Meta Title"
        className="input"
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />

      <textarea
        placeholder="Meta Description"
        className="input h-[100px]"
        onChange={(e) =>
          setData({ ...data, description: e.target.value })
        }
      />

      <input
        placeholder="URL Slug"
        className="input"
        onChange={(e) => setData({ ...data, slug: e.target.value })}
      />

      {/* OG IMAGE */}
      <button
        onClick={() => setOpenMedia(true)}
        className="input text-left"
      >
        Select OG Image
      </button>

      {data.og && (
        <img src={data.og} className="w-40 rounded-lg" />
      )}

      <button className="btn-primary">Save SEO</button>

      {openMedia && (
        <MediaPickerModal
          onSelect={(img: string) =>
            setData({ ...data, og: img })
          }
          onClose={() => setOpenMedia(false)}
        />
      )}
    </div>
  );
}