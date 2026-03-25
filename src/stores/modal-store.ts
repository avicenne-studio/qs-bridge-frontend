import { create } from "zustand";
import type { ModalType, ModalData, ModalState } from "@/types/modal";

interface ModalStore {
  showModal: boolean;
  modalState: ModalState<ModalType> | null;
  openModal: <T extends ModalType>(type: T, data?: ModalData<T>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  showModal: false,
  modalState: null,
  openModal: (type, data) =>
    set({ showModal: true, modalState: { type, data } as ModalState<ModalType> }),
  closeModal: () => set({ showModal: false, modalState: null }),
}));
