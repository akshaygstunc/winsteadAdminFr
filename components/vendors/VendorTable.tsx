"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getVendors, deleteVendor } from "@/services/vendor.service";
import VendorFormModal from "./VendorFormModal";
import { useRouter } from "next/navigation";
export default function VendorTable({ search, category, status }: any) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  const limit = 5;
  const router = useRouter();
  const fetchData = async () => {
    try {
      const res = await getVendors({
        page,
        limit,
        search,
        categoryId: category === "all" ? undefined : category,
        status: status === "all" ? undefined : status.toUpperCase(),
      });

      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(interval); // 🔥 IMPORTANT cleanup
  }, [page, search, status]);

  const handleDelete = async (id: string) => {
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
              <th className="p-4 text-left">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((vendor) => (
              <tr key={vendor._id} className="border-b border-[#1A1A1A]">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={vendor.logo || "/placeholder.png"}
                    className="w-10 h-10 rounded-lg"
                  />
                  <span
                    onClick={() => router.push(`/vendors/${vendor._id}`)}
                    className="cursor-pointer hover:underline"
                  >
                    {vendor.name}
                  </span>
                </td>

                <td className="p-4 text-gray-400">
                  {vendor.categoryId?.name || "-"}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      vendor.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>

                <td className="p-4 text-center">
                  {vendor.isFeatured ? "Yes" : "No"}
                </td>

                <td className="p-4 flex justify-end gap-3">
                  <FaEdit
                    onClick={() => setSelectedVendor(vendor)}
                    className="cursor-pointer"
                  />

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          Page {meta.page || 1} / {meta.totalPages || 1}
        </span>

        <button
          disabled={page === meta.totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
      {selectedVendor && (
        <VendorFormModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
}
