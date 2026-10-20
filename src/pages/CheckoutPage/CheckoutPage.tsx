import { Navigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../../stores/useCartStore";
import type { CartItem } from "../../types";

const EMPTY_ARRAY: number[] = [];

function CheckoutPage() {
    const location = useLocation();
    const selectedItemIds: number[] = location.state?.selectedItemIds ?? EMPTY_ARRAY;

    const cartItems = useCartStore(
        useShallow((state) =>
            selectedItemIds
                .map((id) => state.items[id] as CartItem | undefined)
                .filter((item): item is CartItem => item !== undefined)
        )
    );

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            <p className="text-gray-700 mb-6">This is the checkout page. Implement your checkout process here.</p>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Selected Items</h2>
                <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                        <li key={item.id} className="py-3 flex justify-between items-center">
                            <span className="font-semibold">
                                {item.title} <span className="text-gray-500 font-normal">× {item.quantity}</span>
                            </span>
                            <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-between border-t border-gray-200 pt-4 mt-2 text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
