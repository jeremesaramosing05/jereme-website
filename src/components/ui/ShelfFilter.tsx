"use client";

import { shelves, type ShelfId } from "@/content/library";

export type ShelfFilterValue = ShelfId | "all";

type Props = {
  value: ShelfFilterValue;
  onChange: (value: ShelfFilterValue) => void;
};

const pills: { id: ShelfFilterValue; label: string }[] = [
  { id: "all", label: "All" },
  ...shelves.map((s) => ({ id: s.id as ShelfFilterValue, label: s.label })),
];

export function ShelfFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-6 sm:px-0">
      {pills.map((pill) => {
        const active = value === pill.id;
        return (
          <button
            key={pill.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(pill.id)}
            className={`rounded-full border px-4 py-1.5 text-sm tracking-wide transition-all duration-300 ${
              active
                ? "border-accent bg-accent text-background"
                : "border-line text-muted hover:-translate-y-px hover:border-accent hover:text-accent"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
