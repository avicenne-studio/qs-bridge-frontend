import { create } from "zustand";
import type { ModalType } from "@/types/modal";

interface ModalStore {
  showModal: boolean;
  modalType: ModalType | null;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  showModal: false,
  modalType: null,
  openModal: (modalType) => set({ showModal: true, modalType }),
  closeModal: () => set({ showModal: false }),
}));
