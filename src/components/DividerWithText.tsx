interface DividerProps {
  children: React.ReactNode;
}

export function DividerWithText({ children }: DividerProps) {
  return (
    <div className="relative flex items-center py-4 w-full">
      <div className="flex-grow border-t border-text-body"></div>
      <span className="flex-shrink mx-4">
        {children}
      </span>
      <div className="flex-grow border-t border-text-body"></div>
    </div>
  );
}