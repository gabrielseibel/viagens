"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DAY_OPTIONS } from "@/config/rules";

export default function DaysSelector({ days }: { days: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(newDays: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dias", String(newDays));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">Quantos dias você tem?</p>
      <div className="flex flex-wrap gap-2">
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleChange(d)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              days === d
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 text-slate-700 hover:border-blue-400"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
