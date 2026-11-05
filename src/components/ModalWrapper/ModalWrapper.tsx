import { X } from "lucide-react";
import { useModalStore } from "../../stores/useModalStore";
import { useEffect, useId, useRef } from "react";
import { useShallow } from "zustand/shallow";

function ModalWrapper() {
  const { content, title, closeModal } = useModalStore(
    useShallow((state) => ({
      content: state.content,
      title: state.title,
      closeModal: state.closeModal,
    }))
  );
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // The element focused before the modal opened, so focus can return to it on close
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (content) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      modalRef.current?.focus();

      // Collected once on open: the modal content does not change while it is open
      const focusableElements = modalRef?.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeModal();
        } else {
          if (e.key === "Tab" && focusableElements && focusableElements?.length > 0) {
            if (e.shiftKey) {
              if (
                document.activeElement === focusableElements[0] ||
                document.activeElement === modalRef.current
              ) {
                focusableElements[focusableElements.length - 1]?.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === focusableElements[focusableElements.length - 1]) {
                focusableElements[0]?.focus();
                e.preventDefault();
              }
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);

        previousActiveElementRef.current?.focus();
      };
    }
  }, [content, closeModal]);

  if (!content) return null;

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] outline-none"
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 p-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="overflow-y-auto p-6">
          {/* pr-12 keeps long titles clear of the close button */}
          <h2 id={titleId} className="text-2xl font-bold text-gray-900 leading-tight pr-12 mb-4">
            {title}
          </h2>
          {content}
        </div>
      </div>
    </div>
  );
}

export default ModalWrapper;
