import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { Eye, ShoppingBag, Plus, Minus, CheckCircle2 } from "lucide-react";
import { useModalStore } from "../../stores/useModalStore";
import { useCartStore } from "../../stores/useCartStore";
import ProductModalContent from "../../modals/ProductModalContent/ProductModalContent";
import { formatPrice } from "../../utils/formatters";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addItem);
  const openModal = useModalStore((state) => state.openModal);

  // שליפת הכמות הקיימת בסל עבור המוצר הנוכחי
  const existingQuantity = useCartStore((state) => 
    state.items[Number(product.id)]?.quantity || 0
  );

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden hover:shadow-md transition-all group relative ${
      existingQuantity > 0 ? "border-emerald-300 ring-1 ring-emerald-200/50" : "border-gray-200"
    }`}>
      
      {/* אזור התמונה עם אפקט זום קל ומעטפת לחיצה */}
      <div className="relative h-52 w-full bg-gray-50 overflow-hidden">
        {/* The title link already leads to the product, so this duplicate is hidden from keyboard and screen readers */}
        <Link to={`/products/${product.id}`} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </Link>

        {/* The badges sit outside the hidden link so screen readers still read them; clicks pass through to the link */}
        <span className="pointer-events-none absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 shadow-xs">
          {product.category}
        </span>

        {/* תג קטן המציג את הכמות בסל על גבי התמונה אם המוצר קיים בעגלה */}
        {existingQuantity > 0 && (
          <div className="pointer-events-none absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{existingQuantity} in cart</span>
          </div>
        )}
      </div>

      {/* תוכן הכרטיס */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* כותרת המוצר - לחיצה תעביר לעמוד פרטי מוצר */}
          <h3 className="font-semibold text-gray-800 line-clamp-1">
            <Link 
              to={`/products/${product.id}`}
              className="hover:text-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 rounded-xs"
            >
              {product.title}
            </Link>
          </h3>
          <p className="text-gray-500 text-xs line-clamp-2 mt-1">{product.description}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
          
          {/* כפתור תצוגה מהירה בפופאפ */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openModal(<ProductModalContent product={product} />);
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
            title="Quick view"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* בקרת כמות וכפתור הוספה לעגלה */}
        <div className="mt-4 space-y-3">
          {/* בורר כמות */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <span className="text-xs text-gray-500 font-medium">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecrease}
                className="p-1.5 text-gray-600 hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              
              {/* כמות עם התאמה לנגישות קוראי מסך */}
              <span aria-live="polite" className="w-6 text-center font-bold text-sm text-gray-800">
                <span className="sr-only">Quantity: </span>
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                className="p-1.5 text-gray-600 hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* כפתור הוספה לעגלה עם הכמות הנבחרת */}
          <button
            type="button"
            onClick={() => {
              addToCart({
                ...product,
                quantity,
              });
              setQuantity(1); // איפוס הכמות ל-1 לאחר ההוספה
            }}
            className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500 ${
              existingQuantity > 0 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {existingQuantity > 0 ? "Add more to cart" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;