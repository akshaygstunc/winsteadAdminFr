/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { deleteVendor, getVendors } from "@/services/vendor.service";
import { useRouter } from "next/navigation";

interface VendorTableProps {
  search: string;
  category: string;
  status: string;
  onEdit: (vendor: any) => void;
}

export default function VendorTable({
  search,
  category,
  status,
  onEdit,
}: VendorTableProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const limit = 5;
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getVendors({
        page,
        limit,
        search: search || undefined,
        categoryId: category === "all" ? undefined : category,
        status: status === "all" ? undefined : status,
      });

      setData(res?.data || []);
      setMeta(res?.meta || {});
    } catch (err) {
      console.error("Vendor fetch error:", err);
      setData([]);
      setMeta({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, category, status]);

  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this vendor?");
    if (!confirmed) return;

    try {
      await deleteVendor(id);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#111111] rounded-2xl border border-[#1A1A1A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1A1A1A] text-gray-400">
            <tr>
              <th className="p-4 text-left">Vendor</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Loading vendors...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No vendors found
                </td>
              </tr>
            ) : (
              data.map((vendor) => (
                <tr key={vendor._id} className="border-b border-[#1A1A1A]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={vendor.logo || "/placeholder.png"}
                        alt={vendor.name || "Vendor"}
                        className="w-10 h-10 rounded-lg object-cover border border-[#1A1A1A]"
                      />
                      <div>
                        <p
                          onClick={() => router.push(`/vendors/${vendor._id}`)}
                          className="cursor-pointer hover:underline font-medium"
                        >
                          {vendor.name || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vendor.email || vendor.phone || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-gray-400">{vendor.slug || "-"}</td>

                  <td className="p-4 text-gray-400">
                    {vendor.categoryId?.name || "-"}
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${vendor.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      {vendor.status || "-"}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {vendor.isFeatured ? "Yes" : "No"}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(vendor)}
                        className="text-gray-300 hover:text-white"
                        title="Edit Vendor"
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(vendor._id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete Vendor"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 rounded-lg border border-[#1A1A1A] disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-gray-400">
          Page {meta?.page || 1} / {meta?.totalPages || 1}
        </span>

        <button
          disabled={loading || page >= (meta?.totalPages || 1)}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 rounded-lg border border-[#1A1A1A] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}