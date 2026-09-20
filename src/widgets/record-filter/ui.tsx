"use client";

import { useRouter, usePathname } from "next/navigation";

type RecordFilterValue = "all" | "purchase" | "sale";

const OPTIONS: { value: RecordFilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "purchase", label: "매입" },
  { value: "sale", label: "판매" },
];

export function RecordFilter({ type }: { type: RecordFilterValue }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="inline-flex w-fit rounded-full bg-grey-100 p-1">
      {OPTIONS.map((option) => {
        const active = option.value === type;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (option.value !== "all") params.set("type", option.value);
              router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
            }}
            className={`rounded-full px-4 py-1.5 text-label-m font-semibold transition-colors duration-[120ms] ease-toss ${
              active
                ? "bg-white text-grey-900 shadow-[0_1px_4px_oklch(0.155_0.060_261_/_0.12)]"
                : "text-grey-500 hover:text-grey-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
