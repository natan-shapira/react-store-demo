import type { ReactNode } from "react";
import { create } from "zustand";

interface ModalOptions {
  // id of an element inside the content that describes the dialog, read by screen readers after the title
  descriptionId?: string;
}

interface ModalState {
  content: ReactNode | null;
  // Shown as the modal heading and used as the dialog's accessible name
  title: string;
  descriptionId: string | undefined;
  openModal: (content: ReactNode, title: string, options?: ModalOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  content: null,
  title: "",
  descriptionId: undefined,
  openModal: (content, title, options) =>
    set({ content, title, descriptionId: options?.descriptionId }),
  closeModal: () => set({ content: null, title: "", descriptionId: undefined }),
}));
