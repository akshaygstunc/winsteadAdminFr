import { create } from "zustand";

export const useLeadStore = create((set) => ({
  leads: [],
  setLeads: (data: any) => set({ leads: data }),
}));