import * as Dialog from "@radix-ui/react-dialog";
import { useModalStore } from "@/stores/modal-store";
import { ModalType } from "@/types/modal";
import type { ModalData } from "@/types/modal";
import OverrideOrderModal from "../components/modals/override-order-modal";
import type { ReactNode } from "react";
import cn from "@/utils/classnames";
import { X } from "lucide-react";

function ModalContent() {
  const { modalState, closeModal } = useModalStore();

  let content: ReactNode | null;
  let title: string | null;

  switch (modalState?.type) {
    case ModalType.overrideOrder: {
      const data = modalState.data as ModalData<"overrideOrder">;
      title = "Override Order";
      content = <OverrideOrderModal {...data} />;
      break;
    }

    default:
      title = null;
      content = null;
  }

  return (
    <div className="w-full h-fit max-w-[500px] rounded-3xl bg-primary p-6 flex flex-col">
      <div className="flex w-full justify-between items-center">
        <Dialog.Title className="text-white text-2xl font-semibold">{title}</Dialog.Title>
        <button
          onClick={closeModal}
          className={cn(
            "rounded-lg p-1.5 text-white/50 cursor-pointer",
            "hover:text-white hover:bg-white/10 transition-colors",
          )}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      {content}
    </div>
  );
}

export default function ModalProvider() {
  const { showModal, closeModal } = useModalStore();

  function handleOnOpenChange(open: boolean) {
    if (!open) closeModal();
  }

  return (
    <Dialog.Root open={showModal} onOpenChange={handleOnOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn("modal-overlay", "fixed inset-0 z-50 bg-black/40 backdrop-blur-[5px]")}
        />
        <Dialog.Content
          className={cn(
            "modal-content",
            "fixed top-1/2 left-1/2 z-50 w-full max-w-[500px] focus:outline-none",
          )}
        >
          <ModalContent />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
