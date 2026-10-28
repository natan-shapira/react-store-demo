import { X } from "lucide-react";
import { useModalStore } from "../../stores/useModalStore";
import { useEffect, useRef } from "react";

function ModalWrapper() {
    const { content, closeModal } = useModalStore();
    const modalRef = useRef<HTMLDivElement>(null);
    
    // שומר את האלמנט שהיה בפוקוס לפני פתיחת המודאל, כדי להחזיר אליו את הפוקוס בסגירה
    const previousActiveElementRef = useRef<HTMLElement | null>(null);

    // ניהול פוקוס והאזנה למקש Escape
    useEffect(() => {
        if (content) {
            // שמירת הפוקוס הנוכחי
            previousActiveElementRef.current = document.activeElement as HTMLElement;

            // העברת הפוקוס למודאל עצמו
            modalRef.current?.focus();

            // שליפה פעם אחת בלבד בעת פתיחת המודאל
            const focusableElements = modalRef?.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            // טיפול בלחיצה על מקש Escape
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    closeModal();
                }
                else{
                    if(e.key === "Tab" && focusableElements && focusableElements?.length > 0){
                        
                        if(e.shiftKey){
                            if(document.activeElement === focusableElements[0] || 
                                document.activeElement === modalRef.current
                            ){
                                focusableElements[focusableElements.length - 1].focus();
                                e.preventDefault();
                            }
                        }
                        else{
                            if(document.activeElement === focusableElements[focusableElements.length - 1]){
                                focusableElements[0].focus();
                                e.preventDefault();
                            }
                        }
                    }
                }
            };

            window.addEventListener("keydown", handleKeyDown);

            return () => {
                window.removeEventListener("keydown", handleKeyDown);
                
                // החזרת הפוקוס לאלמנט המקורי כשהמודאל נסגר
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
                aria-label="Popup"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] outline-none"
            >
                <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close dialog"
                    className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
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