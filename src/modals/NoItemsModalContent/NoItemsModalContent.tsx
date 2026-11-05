import { useEffect, useRef } from "react";
import { useModalStore } from "../../stores/useModalStore";

export const NO_ITEMS_MODAL_TITLE = "No items selected";
export const NO_ITEMS_MODAL_DESCRIPTION_ID = "no-items-modal-description";
export const AUTO_CLOSE_MS = 8000;

function NoItemsModalContent() {
  const closeModal = useModalStore((state) => state.closeModal);
  const rootRef = useRef<HTMLDivElement>(null);

  // The timer lives only as long as this content is shown, so closing or replacing the modal cancels it
  // and it can never close a different modal
  useEffect(() => {
    const dialog = rootRef.current?.closest<HTMLElement>('[role="dialog"]');
    let isHovered = false;
    const handlePointerEnter = () => (isHovered = true);
    const handlePointerLeave = () => (isHovered = false);
    dialog?.addEventListener("pointerenter", handlePointerEnter);
    dialog?.addEventListener("pointerleave", handlePointerLeave);

    // ModalWrapper focuses the dialog itself on open, so only focus on a control inside it means "in use"
    const isInUse = () =>
      isHovered ||
      (!!dialog && document.activeElement !== dialog && dialog.contains(document.activeElement));

    let timer: ReturnType<typeof setTimeout>;
    const scheduleClose = () => {
      timer = setTimeout(() => (isInUse() ? scheduleClose() : closeModal()), AUTO_CLOSE_MS);
    };
    scheduleClose();

    return () => {
      clearTimeout(timer);
      dialog?.removeEventListener("pointerenter", handlePointerEnter);
      dialog?.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [closeModal]);

  return (
    <div ref={rootRef} className="space-y-6">
      <p id={NO_ITEMS_MODAL_DESCRIPTION_ID} className="text-gray-600">
        Select at least one item in your cart, then choose “Proceed to checkout” to review your
        order.
      </p>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-500">This message closes automatically.</p>
        <button
          type="button"
          onClick={closeModal}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default NoItemsModalContent;
