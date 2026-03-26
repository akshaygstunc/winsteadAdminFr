"use client";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const vendorsData = [
  {
    id: 1,
    name: "Luxury Estates",
    category: "Ultra Luxury",
    status: true,
    featured: true,
    logo: "https://via.placeholder.com/40",
  },
  {
    id: 2,
    name: "Skyline Builders",
    category: "Luxury",
    status: false,
    featured: false,
    logo: "https://via.placeholder.com/40",
  },
  {
    id: 3,
    name: "Elite Homes",
    category: "Luxury",
    status: true,
    featured: true,
    logo: "https://via.placeholder.com/40",
  },
];

export default function VendorTable({
  search,
  category,
  status,
}: any) {
  const [page, setPage] = useState(1);
  const limit = 5;

  // FILTER LOGIC
  const filtered = vendorsData.filter((v) => {
    return (
      v.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "all" || v.category === category) &&
      (status === "all" ||
        (status === "active" && v.status) ||
        (status === "inactive" && !v.status))
    );
  });

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-4">
      
      {/* TABLE */}
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
            {paginated.map((vendor) => (
              <tr
                key={vendor.id}
                className="border-b border-[#1A1A1A] hover:bg-[#0f0f0f]"
              >
                {/* IMAGE + NAME */}
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={vendor.logo}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <span>{vendor.name}</span>
                </td>

                <td className="p-4 text-gray-400">{vendor.category}</td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      vendor.status
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {vendor.status ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      vendor.featured
                        ? "bg-[#C8A96A]/20 text-[#C8A96A]"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {vendor.featured ? "Yes" : "No"}
                  </span>
                </td>

                <td className="p-4 flex justify-end gap-3">
                  <FaEdit className="cursor-pointer" />
                  <FaTrash className="cursor-pointer text-red-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-[#111] rounded"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-[#111] rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}