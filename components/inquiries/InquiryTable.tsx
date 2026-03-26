"use client";

import { useState } from "react";
import InquiryModal from "./InquiryModal";

const data = [
  {
    id: 1,
    name: "Rahul Sharma",
    contact: "9876543210",
    project: "Palm Residency",
    vendor: "Luxury Estates",
    status: "new",
  },
];

export default function InquiryTable({ search, status }: any) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const limit = 5;

  const filtered = data.filter((i) => {
    return (
      i.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" || i.status === status)
    );
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-4">

      {/* TABLE */}
      <div className="bg-[#111111] rounded-2xl border border-[#1A1A1A] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1A1A1A] text-gray-400">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Project</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((i) => (
              <tr key={i.id} className="border-b border-[#1A1A1A]">
                <td className="p-4">{i.name}</td>
                <td className="p-4 text-center">{i.contact}</td>
                <td className="p-4 text-center">{i.project}</td>
                <td className="p-4 text-center">{i.vendor}</td>

                {/* STATUS */}
                <td className="p-4 text-center">
                  <select
                    defaultValue={i.status}
                    className="bg-[#0f0f0f] border border-[#1A1A1A] rounded px-2 py-1 text-xs"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>

                {/* VIEW */}
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelected(i)}
                    className="text-[#C8A96A]"
                  >
                    View
                  </button>
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

      {/* MODAL */}
      {selected && (
        <InquiryModal data={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}