import { X } from "lucide-react";
import { useModalStore } from "../../stores/useModalStore";


function ModalWrapper() {
    const { content, closeModal } = useModalStore();
    if (!content) return null;

    return (
        <div 
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close"
                    className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="overflow-y-auto p-6">
                    {content}
                </div>
            </div>
        </div>
    );
}

export default ModalWrapper;