"use client";

import BlogTable from "../../components/blog/BlogTable";
import BlogFormModal from "../../components/blog/BlogFormModal";
import { useState } from "react";
import { Blog } from "../../types/blog";

export default function BlogPage() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const handleAdd = () => {
    setSelectedBlog(null);
    setOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBlog(null);
  };

  const handleSuccess = () => {
    setOpen(false);
    setSelectedBlog(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>

        <button onClick={handleAdd} className="btn-primary">
          Add Blog
        </button>
      </div>

      <BlogTable key={refreshKey} onEdit={handleEdit} />

      {open && (
        <BlogFormModal
          blog={selectedBlog}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}