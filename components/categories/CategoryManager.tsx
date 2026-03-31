/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createCategory,
  getCategories,
  updateCategory,
} from "@/services/category.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type CategoryType = "project" | "vendor";
type CategoryStatus = "active" | "inactive";
type CategoryLevel = "category" | "subcategory";
type ViewTab = "category" | "subcategory";

interface CategoryItem {
  _id: string;
  name: string;
  type: CategoryType;
  catType: CategoryLevel;
  parentId?: string | { _id: string; name: string } | null;
  badgeColor: string;
  displayOrder: number;
  status: CategoryStatus;
}

interface CategoryFormData {
  name: string;
  type: CategoryType;
  catType: CategoryLevel;
  parentId: string;
  badgeColor: string;
  displayOrder: number;
  status: CategoryStatus;
}

export default function CategoryManager() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("category");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    type: "project",
    catType: "category",
    parentId: "",
    badgeColor: "#C8A96A",
    displayOrder: 1,
    status: "active",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["categories", { page: 1, limit: 100 }],
    queryFn: () => getCategories({ page: 1, limit: 100 }),
  });

  const categoryList: CategoryItem[] = Array.isArray(categories)
    ? categories
    : categories?.data || [];

  const parentCategories = useMemo(() => {
    return categoryList.filter(
      (item) => item.catType === "category" && item.type === formData.type
    );
  }, [categoryList, formData.type]);

  const filteredCategories = useMemo(() => {
    return categoryList.filter((item) => item.catType === activeTab);
  }, [categoryList, activeTab]);

  const resetForm = () => {
    setFormData({
      name: "",
      type: "project",
      catType: activeTab,
      parentId: "",
      badgeColor: "#C8A96A",
      displayOrder: 1,
      status: "active",
    });
    setEditingCategoryId(null);
  };

  const openAddModal = () => {
    const nextOrder =
      categoryList.filter((item) => item.catType === activeTab).length + 1;

    setFormData({
      name: "",
      type: "project",
      catType: activeTab,
      parentId: "",
      badgeColor: "#C8A96A",
      displayOrder: nextOrder,
      status: "active",
    });

    setEditingCategoryId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryItem) => {
    setFormData({
      name: category.name,
      type: category.type,
      catType: category.catType,
      parentId:
        typeof category.parentId === "object"
          ? category.parentId?._id || ""
          : category.parentId || "",
      badgeColor: category.badgeColor,
      displayOrder: category.displayOrder,
      status: category.status,
    });

    setEditingCategoryId(category._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (formData.catType === "subcategory" && !formData.parentId) {
      toast.error("Parent category is required for subcategory");
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      catType: formData.catType,
      parentId:
        formData.catType === "subcategory" ? formData.parentId : null,
      badgeColor: formData.badgeColor,
      displayOrder: formData.displayOrder,
      status: formData.status,
    };

    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, payload);
        toast.success("Category updated successfully");
      } else {
        await createCategory(payload);
        toast.success("Category created successfully");
      }

      await refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.log(err);
      toast.error("An error occurred while saving the category");
    }
  };

  if (!mounted) return null;
  if (isLoading) return <div className="text-white">Loading...</div>;

  return (
    <div className="card space-y-6 p-6 bg-black text-white rounded-2xl">
      {/* TOP TABS */}
      <div className="flex gap-4 border-b border-white/40 pb-5">
        <button
          type="button"
          onClick={() => setActiveTab("category")}
          className={`px-6 py-3 rounded-xl text-sm md:text-base font-medium transition ${activeTab === "category"
            ? "bg-[#C8A96A] text-black"
            : "bg-zinc-100 text-zinc-700"
            }`}
        >
          Categories
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subcategory")}
          className={`px-6 py-3 rounded-xl text-sm md:text-base font-medium transition ${activeTab === "subcategory"
            ? "bg-[#C8A96A] text-black"
            : "bg-zinc-100 text-zinc-700"
            }`}
        >
          Subcategories
        </button>
      </div>

      {/* TABLE */}
      <div className="border border-white rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-white/20">
              <tr className="text-white">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Business Type</th>
                <th className="px-6 py-4 font-medium">Category Type</th>
                <th className="px-6 py-4 font-medium">Parent Category</th>
                <th className="px-6 py-4 font-medium">Badge Color</th>
                <th className="px-6 py-4 font-medium">Display Order</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="px-6 py-4">{category.name}</td>
                    <td className="px-6 py-4 capitalize">{category.type}</td>
                    <td className="px-6 py-4 capitalize">{category.catType}</td>
                    <td className="px-6 py-4">
                      {typeof category.parentId === "object"
                        ? category.parentId?.name || "-"
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-6 w-6 rounded-md border border-white/20"
                          style={{ backgroundColor: category.badgeColor }}
                        />
                        <span>{category.badgeColor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{category.displayOrder}</td>
                    <td className="px-6 py-4 capitalize">{category.status}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="bg-[#C8A96A] hover:opacity-90 text-black px-4 py-2 rounded-xl transition font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-white/60"
                    >
                      No {activeTab === "category" ? "categories" : "subcategories"} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BUTTON */}
      <button
        type="button"
        onClick={openAddModal}
        className="w-fit bg-[#C8A96A] hover:opacity-90 text-black px-6 py-4 rounded-2xl text-lg font-medium transition"
      >
        Add {activeTab === "category" ? "Category" : "Subcategory"}
      </button>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-black p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {editingCategoryId ? "Edit Item" : "Add Item"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-white/70 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-lg">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="mb-2 block text-lg">Business Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as CategoryType,
                      parentId: "",
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
                >
                  <option value="project">Project</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-lg">CatType</label>
                <select
                  value={formData.catType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      catType: e.target.value as CategoryLevel,
                      parentId: "",
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
                >
                  <option value="category">Category</option>
                  <option value="subcategory">Subcategory</option>
                </select>
              </div>

              {formData.catType === "subcategory" && (
                <div>
                  <label className="mb-2 block text-lg">Parent Category</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentId: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
                  >
                    <option value="">Select Parent Category</option>
                    {parentCategories.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-2 block text-lg">Badge Color</label>
                <input
                  type="color"
                  value={formData.badgeColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      badgeColor: e.target.value,
                    }))
                  }
                  className="h-[58px] w-full rounded-2xl border border-white/10 bg-black p-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="mb-2 block text-lg">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayOrder: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-lg">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as CategoryStatus,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-white/20 px-5 py-3 text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-[#C8A96A] px-5 py-3 font-medium text-black"
              >
                {editingCategoryId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}