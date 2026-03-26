import { create } from "zustand";

export const useLocationStore = create((set) => ({
  locations: [],
  setLocations: (data: any) => set({ locations: data }),
}));