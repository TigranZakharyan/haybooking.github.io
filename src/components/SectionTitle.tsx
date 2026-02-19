export const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="mb-5">
    <h2 className="text-lg font-bold text-text-body mb-1">{title}</h2>
    {subtitle && (
      <p className="font-dm text-sm text-text-body/60">{subtitle}</p>
    )}
  </div>
);