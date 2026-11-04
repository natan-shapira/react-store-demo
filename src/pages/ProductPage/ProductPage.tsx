import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProduct } from "../../api/products";
import { useCartStore } from "../../stores/useCartStore";
import { ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatPrice } from "../../utils/formatters";
import PlusButton from "../../components/PlusButton/PlusButton";
import MinusButton from "../../components/MinusButton/MinusButton";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id!);

  const location = useLocation();
  // React Router gives the first history entry the key "default", so there is no in-app page to go back to
  const goBack = () => (location.key === "default" ? navigate("/") : navigate(-1));

  const addToCart = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  // Quantity of this product that is already in the cart
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
        <p className="text-red-500 font-medium">
          Failed to load data, or the product doesn't exist.
        </p>
        <button
          type="button"
          onClick={goBack}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors cursor-pointer text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to catalog
      </button>

      {/* Image on one side, details and actions on the other */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="relative h-96 lg:h-[500px] w-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center shadow-xs">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-xs font-semibold px-3.5 py-1.5 rounded-full text-gray-700 shadow-xs capitalize">
            {product.category}
          </span>
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              {product.title}
            </h1>

            <div className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</div>

            <p className="text-gray-600 text-base leading-relaxed pt-2 border-t border-gray-100">
              {product.description}
            </p>
          </div>

          {/* Shown only when the product is already in the cart */}
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

          {/* Quantity selector and add to cart */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>

              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                <MinusButton onClick={handleDecrease} size="md" />
                <span aria-live="polite" className="w-10 text-center font-bold text-gray-800">
                  <span className="sr-only">Quantity: </span>
                  {quantity}
                </span>
                <PlusButton onClick={handleIncrease} size="md" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white active:scale-98"
            >
              <ShoppingBag className="w-5 h-5" />
              {existingQuantity > 0 ? "Add more to cart" : "Add to cart"} •{" "}
              {formatPrice(product.price * quantity)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
