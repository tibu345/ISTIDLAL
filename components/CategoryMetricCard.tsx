type CategoryMetricCardProps = {
  value: number;
  label: string;
};

export function CategoryMetricCard({ value, label }: CategoryMetricCardProps) {
  return (
    <div className="rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
      <span className="font-semibold text-on-background">{value}</span> {label}
    </div>
  );
}
