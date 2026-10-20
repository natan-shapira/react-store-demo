import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartItemRow from "../../components/CartItemRow/CartItemRow";
import { useCartStore } from "../../stores/useCartStore";

function CartPage() {
  const navigate = useNavigate();
  const {  items : cartItems, updateQuantity, removeItem, clearCart } = useCartStore();
  const items = Object.values(cartItems);

  // שומרים את הפריטים שבוטלה בחירתם, כך שפריט חדש בסל מסומן כברירת מחדל
  const [unselectedIds, setUnselectedIds] = useState<Set<number>>(new Set());
  const isSelected = (id: number) => !unselectedIds.has(id);
  const selectedItems = items.filter((item) => isSelected(item.id));
  const allSelected = selectedItems.length === items.length;
  const noneSelected = selectedItems.length === 0;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleToggleSelect = (id: number) => {
    setUnselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const handleToggleSelectAll = () => {
    setUnselectedIds(allSelected ? new Set(items.map((item) => item.id)) : new Set());
  };

  const handleIncrease = (id: number) => {
    updateQuantity(id, cartItems[id].quantity + 1);
  };
  const handleDecrease = (id: number) => {
    updateQuantity(id, cartItems[id].quantity - 1);
  };

  const handleRemove = (id: number) => {
    removeItem(id);
  };
  const handleClearCart = () => {
    clearCart();
  };
  const handleCheckout = () => {
    navigate("/checkout", { state: { selectedItemIds: selectedItems.map(item => item.id) } });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">You haven't added any products to your cart yet</p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart{" "}
          <span className="text-gray-500 font-normal">
            ({totalItems} {totalItems === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          type="button"
          onClick={handleClearCart}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-6">
          <label className="flex items-center gap-4 py-4 border-b border-gray-200 text-sm font-medium text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = !allSelected && !noneSelected;
              }}
              onChange={handleToggleSelectAll}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
            Select all
            <span className="text-gray-500 font-normal">
              ({selectedItems.length} of {items.length} selected)
            </span>
          </label>
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                selected={isSelected(item.id)}
                onToggleSelect={handleToggleSelect}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        </section>

        <aside className="bg-white rounded-xl border border-gray-200 p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">
                Subtotal ({selectedCount} {selectedCount === 1 ? "item" : "items"})
              </dt>
              <dd className="font-medium">${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shipping</dt>
              <dd className="font-medium">{shipping === 0 ? "Free" : `$${(+shipping).toFixed(2)}`}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
              <dt className="font-bold text-gray-900">Total</dt>
              <dd className="font-bold text-gray-900">${total.toFixed(2)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={noneSelected}
            className="w-full mt-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            Proceed to checkout
          </button>
          <Link
            to="/"
            className="block text-center mt-3 text-sm text-blue-600 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
