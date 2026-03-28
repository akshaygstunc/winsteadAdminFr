/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createCategory,
  getCategories,
  updateCategory,
} from "@/services/category.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type CategoryType = "project" | "vendor";
type CategoryStatus = "active" | "inactive";

interface CategoryItem {
  id: number;
  name: string;
  type: CategoryType;
  badgeColor: string;
  displayOrder: number;
  status: CategoryStatus;
}

export default function CategoryManager() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryType>("project");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>("");

  const [formData, setFormData] = useState<Omit<CategoryItem, "id">>({
    name: "",
    type: "project",
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
    refetchInterval: 2000, // Refetch every 60 seconds for real-time updates
  });

  const categoryList = Array.isArray(categories) ? categories : categories?.data || [];

  const createCat = async () => {
    try {
      await createCategory(formData);
      toast.success("Category created successfully");
      await refetch();
    } catch (err) {
      console.log(err);
      toast.error("Failed to create category");
    }
  };

  const editCat = async () => {
    if (!editingCategoryId) return;

    try {
      await updateCategory(editingCategoryId, formData);
      toast.success("Category updated successfully");
      await refetch();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update category");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: activeTab,
      badgeColor: activeTab === "project" ? "#C8A96A" : "#f59e0b",
      displayOrder: 1,
      status: "active",
    });
    setEditingCategoryId(null);
  };

  const openAddModal = () => {
    const nextOrder =
      categoryList.filter((item: CategoryItem) => item.type === activeTab).length + 1;

    setFormData({
      name: "",
      type: activeTab,
      badgeColor: activeTab === "project" ? "#C8A96A" : "#f59e0b",
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
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, formData);
      } else {
        await createCat();
      }

      setIsModalOpen(false);
      resetForm();
      toast.success(`Category  ${editingCategoryId ? "updated" : "created"} successfully`);
    } catch (err) {
      console.log(err);
      toast.error("An error occurred while saving the category");
    };
  }
  if (!mounted) return null;
  if (isLoading) return <div className="text-white">Loading...</div>;

  const vendorCategories = categoryList.filter(
    (item: CategoryItem) => item.type === "vendor"
  );
  const projectCategories = categoryList.filter(
    (item: CategoryItem) => item.type === "project"
  );
  const filteredCategories =
    activeTab === "project" ? projectCategories : vendorCategories;

  return (
    <div className="card space-y-6 p-6 bg-black text-white rounded-2xl">
      <div className="flex gap-4 border-b border-white/40 pb-5">
        <button
          type="button"
          onClick={() => setActiveTab("project")}
          className={`px-6 py-3 rounded-xl text-sm md:text-base font-medium transition ${activeTab === "project"
            ? "bg-[#C8A96A] text-black"
            : "bg-zinc-100 text-zinc-700"
            }`}
        >
          Project Categories
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vendor")}
          className={`px-6 py-3 rounded-xl text-sm md:text-base font-medium transition ${activeTab === "vendor"
            ? "bg-[#C8A96A] text-black"
            : "bg-zinc-100 text-zinc-700"
            }`}
        >
          Vendor Categories
        </button>
      </div>

      <div className="border border-white rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/20">
              <tr className="text-white">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Badge Color</th>
                <th className="px-6 py-4 font-medium">Display Order</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category: CategoryItem) => (
                  <tr
                    key={category.id}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="px-6 py-4">{category.name}</td>
                    <td className="px-6 py-4 capitalize">{category.type}</td>
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
                  <td colSpan={6} className="px-6 py-8 text-center text-white/60">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="button"
        onClick={openAddModal}
        className="w-fit bg-[#C8A96A] hover:opacity-90 text-black px-6 py-4 rounded-2xl text-lg font-medium transition"
      >
        Add Category
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-black p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {editingCategoryId ? "Edit Category" : "Add Category"}
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
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="mb-2 block text-lg">Category Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as CategoryType,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
                >
                  <option value="project">Project</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

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
                {editingCategoryId ? "Update Category" : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}