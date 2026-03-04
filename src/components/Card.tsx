export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/60 backdrop-blur-md rounded-2xl border border-primary/30 shadow-md p-3 sm:p-7 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
