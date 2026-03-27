"use client";

import { useEffect, useState } from "react";
import InquiryModal from "./InquiryModal";
import { getInquiries, updateInquiry } from "@/services/inquiry.service";

export default function InquiryTable({ search, status }: any) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});

  const limit = 5;

  // ✅ FETCH DATA
  const fetchData = async () => {
    try {
      const res = await getInquiries({
        page,
        limit,
        search,
        status: status === "all" ? undefined : status,
      });

      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error("Inquiry fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, status]);

  // ✅ STATUS UPDATE
  const handleStatusChange = async (id: string, value: string) => {
    try {
      await updateInquiry(id, { status: value });
      fetchData();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

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
            {data.map((i) => (
              <tr key={i._id} className="border-b border-[#1A1A1A]">
                <td className="p-4">{i.name}</td>
                <td className="p-4 text-center">{i.phone}</td>
                <td className="p-4 text-center">
                  {i.projectId?.name || "-"}
                </td>
                <td className="p-4 text-center">
                  {i.vendorId?.name || "-"}
                </td>

                {/* STATUS */}
                <td className="p-4 text-center">
                  <select
                    value={i.status}
                    onChange={(e) =>
                      handleStatusChange(i._id, e.target.value)
                    }
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
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span className="text-sm">
          Page {meta.page || 1} / {meta.totalPages || 1}
        </span>

        <button
          disabled={page === meta.totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {selected && (
        <InquiryModal
          data={selected}
          onClose={() => setSelected(null)}
          refresh={fetchData}
        />
      )}
    </div>
  );
}