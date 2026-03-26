"use client";

import InquiryTable from "@/components/inquiries/InquiryTable";
import { useState } from "react";

export default function InquiriesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  return (
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Inquiries</h1>
          <p className="text-gray-400 text-sm">
            Manage all customer inquiries and leads
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4">

          <input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input md:w-[250px]"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input md:w-[200px]"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>

          <button className="bg-[#C8A96A] text-black px-4 py-2 rounded-xl text-sm">
            Export CSV
          </button>
        </div>

        {/* TABLE */}
        <InquiryTable search={search} status={status} />

      </div>
  );
}