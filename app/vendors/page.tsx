/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import VendorTable from "../../components/vendors/VendorTable";
import VendorFormModal from "../../components/vendors/VendorFormModal";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { getCategories } from "@/services/category.service";

type VendorStatus = "active" | "inactive";

interface VendorSeo {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
}

export interface VendorFormData {
  _id?: string;
  name: string;
  slug: string;
  logo: string | null;
  bannerImage: string | null;
  description: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  categoryId: string | null;
  isFeatured: boolean;
  status: VendorStatus;
  seo: VendorSeo;
}

interface CategoryOption {
  _id: string;
  name: string;
  type?: string;
}

const initialVendorForm: VendorFormData = {
  name: "",
  slug: "",
  logo: null,
  bannerImage: null,
  description: null,
  contactName: null,
  email: null,
  phone: null,
  address: null,
  categoryId: null,
  isFeatured: false,
  status: "active",
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
  },
};

export default function VendorsPage() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedVendor, setSelectedVendor] =
    useState<VendorFormData>(initialVendorForm);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories({ page: 1, limit: 100 });
        setCategories(
          res?.data?.filter((item: CategoryOption) => item.type === "vendor") ||
          []
        );
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleAddVendor = () => {
    setSelectedVendor(initialVendorForm);
    setOpen(true);
  };

  const handleEditVendor = (vendor: any) => {
    setSelectedVendor({
      _id: vendor._id,
      name: vendor.name || "",
      slug: vendor.slug || "",
      logo: vendor.logo || null,
      bannerImage: vendor.bannerImage || null,
      description: vendor.description || null,
      contactName: vendor.contactName || null,
      email: vendor.email || null,
      phone: vendor.phone || null,
      address: vendor.address || null,
      categoryId:
        typeof vendor.categoryId === "object"
          ? vendor.categoryId?._id || null
          : vendor.categoryId || null,
      isFeatured: Boolean(vendor.isFeatured),
      status: vendor.status || "active",
      seo: {
        metaTitle: vendor.seo?.metaTitle || "",
        metaDescription: vendor.seo?.metaDescription || "",
        metaKeywords: Array.isArray(vendor.seo?.metaKeywords)
          ? vendor.seo.metaKeywords
          : [],
      },
    });
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedVendor(initialVendorForm);
  };

  const handleSuccess = () => {
    setReloadKey((prev) => prev + 1);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-gray-400 text-sm">
            Manage all vendors and their details
          </p>
        </div>

        <button
          onClick={handleAddVendor}
          className="flex items-center gap-2 bg-[#C8A96A] text-black px-4 py-2 rounded-xl text-sm"
        >
          <FaPlus /> Add Vendor
        </button>
      </div>

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

      <VendorTable
        key={reloadKey}
        search={search}
        category={category}
        status={status}
        onEdit={handleEditVendor}
      />

      {open && (
        <VendorFormModal
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          categories={categories}
          initialData={selectedVendor}
          isEdit={Boolean(selectedVendor?._id)}
        />
      )}
    </div>
  );
}