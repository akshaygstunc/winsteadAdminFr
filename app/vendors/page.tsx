"use client";

import AdminLayout from "@/components/layout/LayoutWrapper";
import VendorTable from "../../components/vendors/VendorTable";
import VendorFormModal from "../../components/vendors/VendorFormModal";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useEffect } from "react";
import { getCategoryDropdown } from "@/services/category.service";
export default function VendorsPage() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoryDropdown({
          type: "vendor",
        });
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);
  return (
    // <AdminLayout>
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-gray-400 text-sm">
            Manage all vendors and their details
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#C8A96A] text-black px-4 py-2 rounded-xl text-sm"
        >
          <FaPlus /> Add Vendor
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          placeholder="Search vendor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input md:w-[250px]"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input md:w-[200px]"
        >
          <option value="all">All Categories</option>

          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input md:w-[200px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <VendorTable search={search} category={category} status={status} />

      {/* MODAL */}
      {open && <VendorFormModal onClose={() => setOpen(false)} />}
    </div>
    // </AdminLayout>
  );
}
