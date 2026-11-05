import MinusButton from "../MinusButton/MinusButton";
import PlusButton from "../PlusButton/PlusButton";

interface QuantitySelectorProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: "sm" | "md";
}

// "sm" sits inside a container the caller already styles, so it has no frame of its own
const containerStyles = {
  sm: "flex items-center gap-2",
  md: "flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1",
};
const valueStyles = { sm: "w-6 text-sm", md: "w-10" };

function QuantitySelector({ value, onIncrease, onDecrease, size = "sm" }: QuantitySelectorProps) {
  return (
    <div className={containerStyles[size]}>
      <MinusButton onClick={onDecrease} size={size} />
      {/* The sr-only label lets screen readers announce the quantity */}
      <span
        aria-live="polite"
        className={`${valueStyles[size]} text-center font-bold text-gray-800`}
      >
        <span className="sr-only">Quantity: </span>
        {value}
      </span>
      <PlusButton onClick={onIncrease} size={size} />
    </div>
  );
}

export default QuantitySelector;
