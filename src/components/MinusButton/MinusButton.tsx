import { Minus } from "lucide-react";

interface MinusButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  size?: "sm" | "md";
}

const buttonSizes = { sm: "p-1.5", md: "p-2" };
const iconSizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4" };

function MinusButton({ onClick, ariaLabel = "Decrease quantity", size = "sm" }: MinusButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${buttonSizes[size]} text-gray-600 hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500`}
    >
      <Minus className={iconSizes[size]} />
    </button>
  );
}

export default MinusButton;
