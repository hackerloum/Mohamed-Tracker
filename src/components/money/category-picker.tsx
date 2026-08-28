import type { MoneyCategory, PaymentMethod } from "@/core/types/money";

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
}: {
  categories: MoneyCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (categories.length === 0) {
    return (
      <p className="py-6 text-[15px] text-[var(--atelier-muted)]">
        No categories yet. Add some in Settings.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-[var(--atelier-hairline)]">
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onSelect(category.id)}
              className="flex w-full items-center justify-between py-3.5 text-left"
            >
              <span className="text-[16px] text-[var(--atelier-text)]">
                {category.name}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  selected
                    ? "bg-[var(--atelier-accent)]"
                    : "border border-[var(--atelier-hairline)]"
                }`}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function PaymentMethodStrip({
  methods,
  selectedId,
  onSelect,
}: {
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (methods.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {methods.map((method) => {
        const selected = method.id === selectedId;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] ${
              selected
                ? "border-[var(--atelier-accent)] text-[var(--atelier-accent)]"
                : "border-[var(--atelier-hairline)] text-[var(--atelier-muted)]"
            }`}
          >
            {method.name}
          </button>
        );
      })}
    </div>
  );
}
