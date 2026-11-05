import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProduct } from "../../api/products";
import { useCartItemQuantity, useCartStore } from "../../stores/useCartStore";
import { ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatPrice } from "../../utils/formatters";
import { useQuantity } from "../../hooks/useQuantity";
import QuantitySelector from "../../components/QuantitySelector/QuantitySelector";
import { ProductSkeleton } from "../../components/PageSkeletons/PageSkeletons";
import QueryError from "../../components/QueryError/QueryError";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error, refetch } = useProduct(id!);

  const location = useLocation();
  // React Router gives the first history entry the key "default", so there is no in-app page to go back to
  const goBack = () => (location.key === "default" ? navigate("/") : navigate(-1));

  const addToCart = useCartStore((state) => state.addItem);
  const { quantity, increase, decrease } = useQuantity();
  const existingQuantity = useCartItemQuantity(product?.id);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      quantity,
    });
  };

  if (isLoading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <QueryError
        error={error}
        fallbackMessage="Failed to load the product"
        onRetry={() => refetch()}
      >
        <button
          type="button"
          onClick={goBack}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors cursor-pointer text-sm"
        >
          Go back
        </button>
      </QueryError>
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

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>

              <QuantitySelector
                value={quantity}
                onIncrease={increase}
                onDecrease={decrease}
                size="md"
              />
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
