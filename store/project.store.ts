import { create } from "zustand";

export const useProjectStore = create((set) => ({
  projects: [],
  setProjects: (data: any) => set({ projects: data }),
}));