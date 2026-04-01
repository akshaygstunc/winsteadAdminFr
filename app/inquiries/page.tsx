"use client";

import InquiryTable from "@/components/inquiries/InquiryTable";
import { useMemo, useState } from "react";

type InquiryType =
  | "all"
  | "contact_query"
  | "app_contact_query"
  | "app_call_request"
  | "review_request";

const inquiryTabs: { label: string; value: InquiryType }[] = [
  { label: "All", value: "all" },
  { label: "Contact Queries", value: "contact_query" },
  { label: "App Contact", value: "app_contact_query" },
  { label: "Call Requests", value: "app_call_request" },
  { label: "Review Requests", value: "review_request" },
];

export default function InquiriesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState<InquiryType>("all");

  const pageText = useMemo(() => {
    switch (type) {
      case "contact_query":
        return {
          title: "Contact Queries",
          subtitle: "Manage website contact form inquiries",
        };
      case "app_contact_query":
        return {
          title: "App Contact Queries",
          subtitle: "Manage app contact inquiries",
        };
      case "app_call_request":
        return {
          title: "Call Requests",
          subtitle: "Manage app callback requests",
        };
      case "review_request":
        return {
          title: "Review Requests",
          subtitle: "Manage review-related requests",
        };
      default:
        return {
          title: "Inquiries",
          subtitle: "Manage all customer inquiries and leads",
        };
    }
  }, [type]);

  return (
    <div className="space-y-6 rounded-[28px] border border-white/10 bg-[#050505] p-6 md:p-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          {pageText.title}
        </h1>
        <p className="text-sm text-gray-400 mt-1">{pageText.subtitle}</p>
      </div>

      {/* TOP TABS LIKE SCREENSHOT */}
      <div className="flex flex-wrap gap-4">
        {inquiryTabs.map((tab) => {
          const isActive = type === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setType(tab.value)}
              className={`min-w-[80px] rounded-[10px] px-2 py-2 text-2xl text-sm   transition ${isActive
                ? "bg-[#C8A96A] text-black"
                : "bg-[#E7E7EA] text-[#4A4A54] hover:bg-white"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/20 pt-6" />

      {/* FILTERS + TABLE WRAPPER */}
      <div className="rounded-[32px] border border-white bg-[#050505] overflow-hidden">
        {/* FILTER BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 md:p-6 border-b border-white/15">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-xl border border-white/20 bg-transparent px-4 text-white placeholder:text-gray-500 outline-none md:w-[280px]"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-12 rounded-xl border border-white/20 bg-transparent px-4 text-white outline-none md:w-[200px]"
            >
              <option value="all" className="text-black">
                All Status
              </option>
              <option value="new" className="text-black">
                New
              </option>
              <option value="contacted" className="text-black">
                Contacted
              </option>
              <option value="closed" className="text-black">
                Closed
              </option>
            </select>
          </div>

          <button className="h-12 rounded-xl bg-[#C8A96A] px-5 text-sm font-medium text-black hover:opacity-90">
            Export CSV
          </button>
        </div>

        {/* TABLE */}
        <div className="p-0">
          <InquiryTable search={search} status={status} type={type} />
        </div>
      </div>
    </div>
  );
}