"use client";

import BlogTable from "../../components/blog/BlogTable";
import BlogFormModal from "../../components/blog/BlogFormModal";
import { useState } from "react";

export default function BlogPage() {
  const [open, setOpen] = useState(false);

  return (
      <div className="space-y-6">

        <div className="flex justify-between">
          <h1 className="text-2xl">Blog</h1>

          <button
            onClick={() => setOpen(true)}
            className="btn-primary"
          >
            Add Blog
          </button>
        </div>

        <BlogTable />

        {open && <BlogFormModal onClose={() => setOpen(false)} />}
      </div>
  );
}