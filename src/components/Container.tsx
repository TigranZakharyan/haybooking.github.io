import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-8 ${className}`}
      style={{ maxWidth: 1140 }}
    >
      {children}
    </div>
  );
}
