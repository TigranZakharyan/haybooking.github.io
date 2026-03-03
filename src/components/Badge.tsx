import React from "react";

export type BadgeVariant = 
  | "primary" 
  | "primary-outline"
  | "info" 
  | "success" 
  | "destructive" 
  | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge = ({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "", 
  ...props 
}: BadgeProps) => {
  
  const baseStyles = "inline-flex items-center rounded-md font-semibold transition-colors focus:outline-none select-none";
  
  const variantStyles: Record<BadgeVariant, string> = {
    // Uses your theme's primary color
    primary: "bg-primary text-white border-transparent hover:bg-primary/90",
    "primary-outline": "border border-primary text-primary bg-primary/5 hover:bg-primary/10",
    
    // Status-based colors
    info: "bg-blue-100 text-blue-700 border-transparent",
    success: "bg-green-100 text-green-700 border-transparent",
    destructive: "bg-red-100 text-red-700 border-transparent",
    outline: "border border-gray-200 text-gray-600 bg-transparent",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] tracking-wider uppercase",
    md: "px-2.5 py-1 text-xs",
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};