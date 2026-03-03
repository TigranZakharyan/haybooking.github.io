import { useState, useRef, type PropsWithChildren } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";
type TooltipVariant = "primary" | "success" | "warning" | "danger";

type TooltipProps = PropsWithChildren<{
  text: string;
  onClick?: () => void;
  duration?: number;
  position?: TooltipPosition;
  variant?: TooltipVariant; // Added variant prop
}>;

export const Tooltip = ({
  text,
  children,
  onClick,
  duration = 2000,
  position = "top",
  variant = "primary", // Default set to primary
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    onClick?.();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    timeoutRef.current = setTimeout(() => setVisible(false), duration);
  };

  // --- Configuration Mappings ---

  const positionClasses: Record<TooltipPosition, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
    left: "right-full top-1/2 -translate-y-1/2 mr-3",
    right: "left-full top-1/2 -translate-y-1/2 ml-3",
  };

  const variantClasses: Record<TooltipVariant, string> = {
    primary: "bg-primary text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-red-600 text-white",
  };

  const arrowClasses: Record<TooltipPosition, string> = {
    top: `top-full left-1/2 -translate-x-1/2 border-t-current`, // Uses text color or current variant color
    bottom: `bottom-full left-1/2 -translate-x-1/2 border-b-current`,
    left: `left-full top-1/2 -translate-y-1/2 border-l-current`,
    right: `right-full top-1/2 -translate-y-1/2 border-r-current`,
  };

  // Dynamic color for the arrow based on the background variant
  const arrowVariantColor: Record<TooltipVariant, string> = {
    primary: "text-primary",
    success: "text-emerald-600",
    warning: "text-amber-500",
    danger: "text-red-600",
  };

  return (
    <div className="relative inline-block">
      <div 
        onClick={handleClick} 
        className="cursor-pointer active:scale-95 transition-transform"
      >
        {children}
      </div>

      <div
        className={`
          absolute z-50 whitespace-nowrap
          px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xl
          transition-all duration-300 ease-out pointer-events-none
          ${positionClasses[position]}
          ${variantClasses[variant]}
          ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-95"}
        `}
      >
        {text}
        <div 
          className={`absolute border-4 border-transparent 
          ${arrowClasses[position]} 
          ${arrowVariantColor[variant]}`} 
        />
      </div>
    </div>
  );
};