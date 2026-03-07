import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { type LucideIcon, ChevronDown, Check } from "lucide-react";
import type { TOption } from "@/types";

interface SelectProps {
  label?: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  variant?: "default" | "primary";
  options: TOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function Select({
  label,
  icon: Icon,
  hint,
  error,
  variant = "default",
  options,
  placeholder = "Select option",
  value,
  onChange,
  required,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  // Start with opacity 0 so it's invisible until coordinates are set
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: "fixed",
    opacity: 0,
    pointerEvents: "none",
  });

  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
      width: rect.width,
      transform: "translateX(-50%)",
      zIndex: 9999,
      opacity: 1, // Reveal once position is calculated
      pointerEvents: "auto",
    });
  };

  // FIX: useLayoutEffect runs synchronously before the browser paints
  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    } else {
      setDropdownStyle((prev) => ({ ...prev, opacity: 0, pointerEvents: "none" }));
    }
  }, [open]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      // Check if click is outside both the button container AND the portal dropdown
      if (
        ref.current && !ref.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Update position on scroll + resize
  useEffect(() => {
    if (!open) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const borderVariant =
    variant === "primary"
      ? "border-primary focus:ring-primary"
      : "border-slate-200 focus:ring-indigo-500";

  const dropdown = (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange?.(option.value);
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 text-left
              hover:bg-slate-100 transition-colors
              ${isSelected ? "bg-slate-100 font-medium" : ""}`}
          >
            <span>{option.label}</span>

            {isSelected && (
              <Check className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={ref} className={`w-full text-left relative ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 border rounded-lg
        transition-all focus:outline-none focus:ring-2
        ${error ? "border-red-500 focus:ring-red-500" : borderVariant}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-slate-400" />}

          <span className={selectedOption ? "text-slate-700" : "text-slate-400"}>
            {selectedOption?.label || placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <input type="hidden" value={value} required={required} />

      {/* Render portal only if open to keep DOM clean */}
      {open && createPortal(dropdown, document.body)}

      {error && (
        <p className="mt-1 text-xs text-red-500 leading-snug">
          {error}
        </p>
      )}

      {!error && hint && (
        <p className="mt-1 text-xs text-slate-400 leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}