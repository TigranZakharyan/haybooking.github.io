import { useState, useRef, useEffect } from "react";
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
        width: rect.width,
        transform: "translateX(-50%)",
        zIndex: 9999,
      });
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  const borderVariant =
    variant === "primary"
      ? "border-primary focus:ring-primary"
      : "border-slate-200 focus:ring-indigo-500";

  const dropdown = open && (
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
            {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
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
        onClick={() => setOpen((p) => !p)}
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
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <input type="hidden" value={value} required={required} />

      {createPortal(dropdown, document.body)}

      {error && <p className="mt-1 text-xs text-red-500 leading-snug">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-slate-400 leading-snug">{hint}</p>}
    </div>
  );
}