import { create } from "zustand";

export const useCategoryStore = create((set) => ({
  categories: [],
  setCategories: (data: any) => set({ categories: data }),
}));