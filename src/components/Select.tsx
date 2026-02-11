import React from "react";
import { type LucideIcon, ChevronDown } from "lucide-react";
import type { TOption } from "@/types";

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: LucideIcon;
  hint?: string;
  variant?: "default" | "primary";
  options: TOption[];
  placeholder?: string;
}

export function Select({
  label,
  icon: Icon,
  hint,
  variant = "default",
  className = "",
  required,
  options,
  placeholder,
  value,
  ...props
}: SelectProps) {
  const paddingLeft = Icon ? "pl-10" : "pl-4";

  const borderVariant =
    variant === "primary"
      ? "border-primary focus:ring-primary"
      : "border-slate-200 focus:ring-indigo-500";

  const isPlaceholderSelected = !value;

  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3 w-5 h-5 text-slate-400 pointer-events-none" />
        )}

        <select
          {...props}
          required={required}
          value={value ?? ""}
          className={`appearance-none w-full ${paddingLeft} pr-10 py-3 bg-slate-50 border rounded-lg
            focus:outline-none focus:ring-2 transition-all
            ${borderVariant}
            ${isPlaceholderSelected ? "text-slate-400" : "text-slate-700"}`}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>

      {hint && (
        <p className="mt-1 text-xs text-slate-400 leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}
