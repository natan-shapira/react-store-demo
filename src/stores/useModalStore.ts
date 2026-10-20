import type { ReactNode } from "react";
import { create } from "zustand";

interface ModalState {
    content: ReactNode | null; 
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    content: null,
    openModal: (content) => set({ content }),
    closeModal: () => set({ content: null }),
}));