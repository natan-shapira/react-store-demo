import { Info, Lock } from "lucide-react";
import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { useCartStore } from "../../stores/useCartStore";
import type { CartItem } from "../../types";
import { formatPrice } from "../../utils/formatters";
import NoItemsModalContent, {
  NO_ITEMS_MODAL_DESCRIPTION_ID,
  NO_ITEMS_MODAL_TITLE,
} from "../../modals/NoItemsModalContent/NoItemsModalContent";
import { useModalStore } from "../../stores/useModalStore";

const EMPTY_ARRAY: number[] = [];

// location.state can hold anything (e.g. after a manual history edit), so it is validated before use
const getSelectedItemIds = (state: unknown): number[] => {
  const ids =
    state && typeof state === "object" && "selectedItemIds" in state ? state.selectedItemIds : null;
  return Array.isArray(ids) && ids.every((id): id is number => Number.isInteger(id))
    ? ids
    : EMPTY_ARRAY;
};

function CheckoutPage() {
  const location = useLocation();
  const selectedItemIds = getSelectedItemIds(location.state);

  const openModal = useModalStore((state) => state.openModal);

  const cartItems = useCartStore(
    useShallow((state) =>
      selectedItemIds
        .map((id) => state.items[id])
        .filter((item): item is CartItem => item !== undefined)
    )
  );
  const hasItems = cartItems.length > 0;

  // Rendering must not update other components, so the modal is opened after the commit
  useEffect(() => {
    if (!hasItems) {
      openModal(<NoItemsModalContent />, NO_ITEMS_MODAL_TITLE, {
        descriptionId: NO_ITEMS_MODAL_DESCRIPTION_ID,
      });
    }
  }, [hasItems, openModal]);

  if (!hasItems) {
    return <Navigate to="/cart" replace />;
  }

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Temporary: remove together with the disabled "Place order" button once ordering is implemented */}
      <div
        role="note"
        className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        <Info className="w-5 h-5 shrink-0 text-amber-600" aria-hidden="true" />
        <p>
          <span className="font-semibold">Checkout is not available yet.</span> This page is a
          preview of your order. Delivery details and payment will be added in a future update, and
          your cart stays saved in the meantime.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-6">
          <h2 className="py-4 border-b border-gray-200 text-lg font-bold text-gray-900">
            Order items
          </h2>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                {/* The title next to the image already names the product */}
                <img
                  src={item.image}
                  alt=""
                  className="w-16 h-16 shrink-0 rounded-lg object-cover bg-gray-100 border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} <span>× {item.quantity}</span>
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="bg-white rounded-xl border border-gray-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
              </dt>
              <dd className="font-medium">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shipping</dt>
              <dd className="font-medium">Free</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
              <dt className="font-bold text-gray-900">Total</dt>
              <dd className="font-bold text-gray-900">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            type="button"
            disabled
            aria-describedby="place-order-note"
            className="w-full mt-6 py-3 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            Place order
          </button>
          <p id="place-order-note" className="mt-2 text-center text-xs text-gray-500">
            Ordering will be available soon
          </p>
          <Link to="/cart" className="block text-center mt-3 text-sm text-blue-600 hover:underline">
            Back to cart
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
