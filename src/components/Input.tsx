import React from "react";
import { type LucideIcon, Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  isPassword?: boolean;
  hint?: string;
  error?: string; // ✅ new error prop
  variant?: "default" | "primary";
}

export function Input({
  label,
  icon: Icon,
  isPassword,
  hint,
  error,
  variant = "default",
  className = "",
  required,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const paddingLeft = Icon ? "pl-10" : "pl-4";

  const borderVariant =
    variant === "primary"
      ? "border-primary focus:ring-primary"
      : "border-slate-200 focus:ring-indigo-500";

  return (
    <div className={`w-full text-left ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-slate-700 block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3 w-5 h-5 text-slate-400" />
        )}

        <input
          {...props}
          required={required}
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : props.type ?? "text"
          }
          className={`w-full ${paddingLeft} pr-10 py-3 bg-slate-50 border rounded-lg
            focus:outline-none focus:ring-2 transition-all
            placeholder:text-slate-400
            ${borderVariant}
            ${error ? "!border-red-500 focus:ring-red-500" : ""}`} // ✅ red border on error
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Hint or Error */}
      {error ? (
        <p className="mt-1 text-xs text-red-500 leading-snug">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-400 leading-snug">{hint}</p>
      )}
    </div>
  );
}
