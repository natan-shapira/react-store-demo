import { Minus, Plus, ShoppingBag, CheckCircle } from "lucide-react";
import { useCartStore } from "../../stores/useCartStore";
import { useModalStore } from "../../stores/useModalStore";
import type { Product } from "../../types";
import { useState } from "react";

interface ProductModalContentProps {
    product: Product;
}

function ProductModalContent({product}: ProductModalContentProps) {
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);
    const closeModal = useModalStore((state) => state.closeModal);
    
    // שליפת הכמות הקיימת של המוצר הספציפי הזה בסל ב-O(1)
    const existingQuantity = useCartStore((state) => state.items[product.id]?.quantity || 0);
    
    const handleIncrease = () => setQuantity((prev) => prev + 1);
    const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <div className="space-y-6">
            {/* תמונת המוצר */}
            <div className="relative h-64 w-full bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
                <img 
                    src={product.image} 
                    alt={product.title} 
                    className="h-full w-full object-cover" 
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-xs font-semibold px-3 py-1 rounded-full text-gray-700 shadow-xs">
                    {product.category}
                </span>
            </div>

            {/* כותרת ותיאור */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {product.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {product.description}
                </p>
            </div>

            {/* חיווי ויזואלי המציג את הכמות הנוכחית של המוצר בעגלה (אם קיימת) */}
            {existingQuantity > 0 && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span>This product is already in your cart</span>
                    </div>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {existingQuantity} in cart
                    </span>
                </div>
            )}

            {/* מחיר ובחירת כמות */}
            <div className="flex items-center justify-between pt-2">
                <div>
                    <span className="text-xs text-gray-400 block">Unit price</span>
                    <span className="text-3xl font-extrabold text-gray-900">
                        ${product.price.toFixed(2)}
                    </span>
                </div>

                {/* בקרת כמות (Quantity Selector) */}
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                        onClick={handleDecrease}
                        className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-800">
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrease}
                        className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer"
                        aria-label="Increase quantity"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* פוטר: סכום כולל וכפתור הוספה לעגלה */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                    <span className="text-xs text-gray-400 block">Total</span>
                    <span className="text-xl font-bold text-blue-600">
                        ${(product.price * quantity).toFixed(2)}
                    </span>
                </div>
                
                <button
                    onClick={() => {
                        addItem({
                            ...product,
                            quantity,
                        });
                        closeModal();
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm active:scale-98 cursor-pointer"
                >
                    <ShoppingBag className="w-5 h-5" />
                    {existingQuantity > 0 ? "Add more to cart" : "Add to cart"}
                </button>
            </div>
        </div>
    )
}

export default ProductModalContent;