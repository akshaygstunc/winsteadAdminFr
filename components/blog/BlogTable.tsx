"use client";

import { useEffect, useState } from "react";
import { deleteBlog, getBlogs, updateBlogStatus } from "../../services/blog.service";
import { Blog } from "../../types/blog";

interface BlogTableProps {
  onEdit: (blog: Blog) => void;
}

export default function BlogTable({ onEdit }: BlogTableProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getBlogs({ page: 1, limit: 20 });
      setBlogs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteBlog(id);
      await fetchBlogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "draft" | "published" | "scheduled"
  ) => {
    try {
      const payload =
        status === "scheduled"
          ? { status, publishedAt: new Date().toISOString() }
          : { status };

      await updateBlogStatus(id, payload);
      await fetchBlogs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Status update failed");
    }
  };

  if (loading) {
    return <div className="rounded-xl border p-6">Loading blogs...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-300 p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-[#0B0B0C]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-['#0B0B0C']">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Tags</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Featured</th>
              <th className="px-4 py-3 text-left font-medium">Views</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No blogs found
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{blog.title}</td>
                  <td className="px-4 py-3 text-gray-600">{blog.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{blog.status}</td>
                  <td className="px-4 py-3">{blog.isFeatured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{blog.views}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onEdit(blog)}
                        className="rounded-md border px-3 py-1.5"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            blog.id,
                            blog.status === "published" ? "draft" : "published"
                          )
                        }
                        className="rounded-md border px-3 py-1.5"
                      >
                        {blog.status === "published" ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deletingId === blog.id}
                        className="rounded-md border border-red-300 px-3 py-1.5 text-red-600"
                      >
                        {deletingId === blog.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}