import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../../api/products";
import { useCartStore } from "../../stores/useCartStore";
import { ShoppingBag, ArrowLeft, Plus, Minus, CheckCircle2 } from "lucide-react";
import { formatPrice } from "../../utils/formatters";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id!);
  
  const addToCart = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  
  // שליפת הכמות הקיימת בסל בצורה בטוחה לטיפוסים (בהנחה שהמפתח הוא מספר)
  const existingQuantity = useCartStore((state) => 
    product ? state.items[Number(product.id)]?.quantity || 0 : 0
  );

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      quantity,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        <div className="animate-pulse text-lg font-medium">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <p className="text-red-500 font-medium">Failed to load data, or the product doesn't exist.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors cursor-pointer text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* כפתור חזרה */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to catalog
      </button>

      {/* גריד ראשי: תמונה מצד אחד, פרטים מהצד השני */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* תמונת המוצר */}
        <div className="relative h-96 lg:h-[500px] w-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center shadow-xs">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-xs font-semibold px-3.5 py-1.5 rounded-full text-gray-700 shadow-xs capitalize">
            {product.category}
          </span>
        </div>

        {/* פרטי המוצר והפעולות */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              {product.title}
            </h1>
            
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </div>

            <p className="text-gray-600 text-base leading-relaxed pt-2 border-t border-gray-100">
              {product.description}
            </p>
          </div>

          {/* חיווי ויזואלי המציג את הכמות הנוכחית של המוצר בסל הקניות */}
          {existingQuantity > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-2xl text-sm flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>This product is already in your cart</span>
              </div>
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                {existingQuantity} in cart
              </span>
            </div>
          )}

          {/* אזור בחירת כמות וכפתור רכישה */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              
              {/* בקרת כמות */}
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span aria-live="polite" className="w-10 text-center font-bold text-gray-800">
                  <span className="sr-only">Quantity: </span>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* כפתור הוספה לעגלה */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white active:scale-98"
            >
              <ShoppingBag className="w-5 h-5" />
              {existingQuantity > 0 ? "Add more to cart" : "Add to cart"} • {formatPrice(product.price * quantity)}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default ProductPage;