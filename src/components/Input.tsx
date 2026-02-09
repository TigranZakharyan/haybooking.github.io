import React from "react";
import { type LucideIcon, Eye } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  isPassword?: boolean;
}

export function Input({ label, icon: Icon, isPassword, ...props }: InputProps) {
  return (
    <div className="w-full space-y-2 text-left">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative flex items-center">
        <Icon className="absolute left-3 w-5 h-5 text-slate-400" />
        <input
          {...props}
          type={isPassword ? "password" : "text"}
          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
        />
        {isPassword && (
          <button type="button" className="absolute right-3 text-slate-400 hover:text-slate-600">
            <Eye className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}