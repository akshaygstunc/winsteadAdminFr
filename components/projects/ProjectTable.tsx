"use client";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const data = [
  {
    id: 1,
    name: "Palm Residency",
    vendor: "Luxury Estates",
    price: "₹2Cr - ₹5Cr",
    status: "Available",
    image: "https://via.placeholder.com/60",
  },
];

export default function ProjectTable({ search }: any) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const filtered = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-4">

      <div className="bg-[#111111] rounded-2xl border border-[#1A1A1A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1A1A1A] text-gray-400">
            <tr>
              <th className="p-4 text-left">Project</th>
              <th className="p-4 text-left">Vendor</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((p) => (
              <tr key={p.id} className="border-b border-[#1A1A1A]">
                
                {/* IMAGE + NAME */}
                <td className="p-4 flex items-center gap-3">
                  <img src={p.image} className="w-12 h-12 rounded-lg" />
                  <span>{p.name}</span>
                </td>

                <td className="p-4 text-gray-400">{p.vendor}</td>
                <td className="p-4 text-center">{p.price}</td>

                <td className="p-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    {p.status}
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
      <div className="flex justify-between">
        <button onClick={() => setPage(page - 1)}>Prev</button>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}