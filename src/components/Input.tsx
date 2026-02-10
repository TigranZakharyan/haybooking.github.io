import React from "react";
import { type LucideIcon, Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  isPassword?: boolean;
  hint?: string;
}

export function Input({
  label,
  icon: Icon,
  isPassword,
  hint,
  className = "",
  required, // Destructure required to use it for the UI logic
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const paddingLeft = Icon ? "pl-10" : "pl-4";

  return (
    <div className={`w-full text-left ${className}`}>
      <label className="text-sm font-medium text-slate-700 block mb-1">
        {label}
        {/* Render asterisk if required is true */}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3 w-5 h-5 text-slate-400" />
        )}

        <input
          {...props}
          required={required}
          // Logic: If isPassword is true, toggle between 'text' and 'password'
          type={isPassword ? (showPassword ? "text" : "password") : (props.type ?? "text")}
          className={`w-full ${paddingLeft} pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
            placeholder:text-slate-400 ${className || ""}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {hint && (
        <p className="mt-1 text-xs text-slate-400 leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}