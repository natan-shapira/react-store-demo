import { ShoppingBag, CheckCircle } from "lucide-react";
import QuantitySelector from "../../components/QuantitySelector/QuantitySelector";
import { useCartItemQuantity, useCartStore } from "../../stores/useCartStore";
import { useModalStore } from "../../stores/useModalStore";
import type { Product } from "../../types";
import { useQuantity } from "../../hooks/useQuantity";
import { formatPrice } from "../../utils/formatters";

interface ProductModalContentProps {
  product: Product;
}

function ProductModalContent({ product }: ProductModalContentProps) {
  const { quantity, increase, decrease } = useQuantity();
  const addItem = useCartStore((state) => state.addItem);
  const closeModal = useModalStore((state) => state.closeModal);
  const existingQuantity = useCartItemQuantity(product.id);

  return (
    <div className="space-y-6">
      {/* Product image */}
      <div className="relative h-64 w-full bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100">
        <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-xs font-semibold px-3 py-1 rounded-full text-gray-700 shadow-xs">
          {product.category}
        </span>
      </div>

      {/* Description (the title is rendered by ModalWrapper) */}
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{product.description}</p>

      {/* Shown only when the product is already in the cart */}
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

      {/* Price and quantity */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs text-gray-500 block">Unit price</span>
          <span className="text-3xl font-extrabold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>

        <QuantitySelector value={quantity} onIncrease={increase} onDecrease={decrease} size="md" />
      </div>

      {/* Footer: total and add to cart */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <span className="text-xs text-gray-500 block">Total</span>
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(product.price * quantity)}
          </span>
        </div>

        <button
          type="button"
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
  );
}

export default ProductModalContent;
