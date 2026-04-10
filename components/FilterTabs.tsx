"use client";

type FilterTabsProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange?: (value: T) => void;
  className?: string;
};

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  className = "mb-8 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
}: FilterTabsProps<T>) {
  return (
    <div className={className}>
      {options.map((option) => {
        const active = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange?.(option)}
            className={`${active ? "filter-chip-active" : "filter-chip"} shrink-0`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
