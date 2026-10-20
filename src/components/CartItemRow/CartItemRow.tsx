import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { CartItem } from "../../types";

interface CartItemRowProps {
  item: CartItem;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
}

function CartItemRow({ item, selected, onToggleSelect, onIncrease, onDecrease, onRemove }: CartItemRowProps) {
  return (
    <li className={`flex items-center gap-4 py-4 transition-opacity ${selected ? "" : "opacity-60"}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(item.id)}
        className="w-5 h-5 shrink-0 accent-blue-600 cursor-pointer"
        aria-label={`Select ${item.title}`}
      />

      <Link to={`/products/${item.id}`} className="shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-20 h-20 rounded-lg object-cover bg-gray-100 border border-gray-200"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.id}`}
          className="block font-semibold text-gray-900 truncate hover:text-blue-600"
        >
          {item.title}
        </Link>
        <p className="text-sm text-gray-500 capitalize">{item.category}</p>
        <p className="text-sm text-gray-700 mt-1">${item.price.toFixed(2)} each</p>
      </div>

      <div className="flex items-center border border-gray-300 rounded-lg">
        <button
          type="button"
          onClick={() => onDecrease(item.id)}
          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-s-lg"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-medium">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onIncrease(item.id)}
          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-e-lg"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <p className="w-24 text-end font-semibold text-gray-900">
        ${(item.price * item.quantity).toFixed(2)}
      </p>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        aria-label="Remove from cart"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </li>
  );
}

export default CartItemRow;
