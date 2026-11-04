import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { CartItem } from "../../types";
import { formatPrice } from "../../utils/formatters";
import PlusButton from "../PlusButton/PlusButton";
import MinusButton from "../MinusButton/MinusButton";

interface CartItemRowProps {
  item: CartItem;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
}

function CartItemRow({
  item,
  selected,
  onToggleSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemRowProps) {
  return (
    <li
      className={`flex items-center gap-4 py-4 transition-opacity ${selected ? "" : "opacity-60"}`}
    >
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
        <p className="text-sm text-gray-700 mt-1">{formatPrice(item.price)} each</p>
      </div>

      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
        <MinusButton onClick={() => onDecrease(item.id)} size="md" />
        <span aria-live="polite" className="w-10 text-center font-medium">
          <span className="sr-only">Quantity: </span>
          {item.quantity}
        </span>
        <PlusButton onClick={() => onIncrease(item.id)} size="md" />
      </div>

      <p className="w-24 text-end font-semibold text-gray-900">
        {formatPrice(item.price * item.quantity)}
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
