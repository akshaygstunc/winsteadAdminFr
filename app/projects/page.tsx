"use client";

// import AdminLayout from "@/components/layout/AdminLayout";
import ProjectTable from "../../components/projects/ProjectTable";
import ProjectFormModal from "../../components/projects/ProjectFormModal";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    // <AdminLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-gray-400 text-sm">
              Manage all property listings
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-[#C8A96A] text-black px-4 py-2 rounded-xl text-sm"
          >
            <FaPlus /> Add Project
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-[250px]"
        />

        {/* TABLE */}
        <ProjectTable search={search} />

        {/* MODAL */}
        {open && <ProjectFormModal onClose={() => setOpen(false)} />}
      </div>
    // </AdminLayout>
  );
}