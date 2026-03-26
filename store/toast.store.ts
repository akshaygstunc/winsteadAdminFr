import { create } from "zustand";

export const useToast = create((set) => ({
  message: "",
  show: false,
  setToast: (msg: string) =>
    set({ message: msg, show: true }),
  clear: () => set({ show: false }),
}));