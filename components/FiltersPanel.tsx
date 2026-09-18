"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DAY_OPTIONS, getSuggestedMaxHours } from "@/config/rules";
import { ALL_TYPES, TYPE_LABELS, formatMonthName } from "@/lib/format";
import { filtersToSearchParams, parseFiltersFromSearchParams, type FiltersState } from "@/lib/filters";
import type { DestinationType } from "@/types";

export default function FiltersPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseFiltersFromSearchParams(searchParams);

  function update(partial: Partial<FiltersState>) {
    const next = { ...filters, ...partial };
    router.push(`${pathname}?${filtersToSearchParams(next).toString()}`, { scroll: false });
  }

  function handleDaysChange(days: number) {
    update({ days, maxHours: getSuggestedMaxHours(days) });
  }

  function toggleType(type: DestinationType) {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    update({ types });
  }

  function toggleCost(cost: number) {
    const costRange = filters.costRange.includes(cost)
      ? filters.costRange.filter((c) => c !== cost)
      : [...filters.costRange, cost];
    update({ costRange });
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Saindo de</label>
        <select
          disabled
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        >
          <option>Chapecó, SC</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Dias disponíveis</label>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDaysChange(d)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                filters.days === d
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 text-slate-700 hover:border-blue-400"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Tempo máximo de estrada (só ida)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={18}
            step={0.5}
            value={filters.maxHours}
            onChange={(e) => update({ maxHours: parseFloat(e.target.value) })}
            className="flex-1 accent-blue-600"
          />
          <span className="w-14 text-right text-sm font-medium text-slate-700">{filters.maxHours}h</span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de destino</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type as DestinationType)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                filters.types.includes(type as DestinationType)
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 text-slate-700 hover:border-emerald-400"
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Mês da viagem</label>
        <select
          value={filters.month ?? ""}
          onChange={(e) => update({ month: e.target.value ? parseInt(e.target.value, 10) : null })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Qualquer mês</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {formatMonthName(m)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Faixa de custo</label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((cost) => (
            <button
              key={cost}
              type="button"
              onClick={() => toggleCost(cost)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                filters.costRange.includes(cost)
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-300 text-slate-700 hover:border-slate-500"
              }`}
            >
              {"R$".repeat(cost)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
