import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,

  login: (user: any) => set({ user }),
  logout: () => set({ user: null }),
}));