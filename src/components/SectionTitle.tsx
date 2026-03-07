export const SectionTitle = ({
  title,
  subtitle,
  className
}: {
  title: string;
  subtitle: string;
  className?: string;
}) => (
  <div className={`mb-5 ${className}`}>
    <h2 className="text-xl font-bold text-text-body mb-1">{title}</h2>
    {subtitle && (
      <p className="font-dm text-sm text-text-body/60">{subtitle}</p>
    )}
  </div>
);