import type { ReactNode } from "react";
import { create } from "zustand";

interface ModalState {
  content: ReactNode | null;
  // Shown as the modal heading and used as the dialog's accessible name
  title: string;
  openModal: (content: ReactNode, title: string) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  content: null,
  title: "",
  openModal: (content, title) => set({ content, title }),
  closeModal: () => set({ content: null, title: "" }),
}));
