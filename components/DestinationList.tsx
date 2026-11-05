import Link from "next/link";
import RoadIndexBadge from "./RoadIndexBadge";
import { formatCostSymbol, formatKm, formatMinutesAsHours, TYPE_LABELS } from "@/lib/format";
import type { DestinationResult } from "@/lib/filters";

export default function DestinationList({ results }: { results: DestinationResult[] }) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
        Nenhum destino encontrado com esses filtros. Tente aumentar os dias ou o tempo máximo de estrada.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {results.map(({ destination, travelTime, roadIndex, matchesBestMonth, matchesIdealDays }) => (
        <li key={destination.id}>
          <Link
            href={`/destino/${destination.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {destination.name} <span className="font-normal text-slate-400">· {destination.state}</span>
                </h3>
                <p className="text-sm text-slate-600">
                  {formatMinutesAsHours(travelTime.minutes)} · {formatKm(travelTime.km)}
                </p>
              </div>
              <RoadIndexBadge level={roadIndex.level} />
            </div>

            <p className="mt-2 text-sm text-slate-600">{destination.summary}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {destination.types.map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5">
                  {TYPE_LABELS[t]}
                </span>
              ))}
              <span className="rounded-full bg-slate-100 px-2 py-0.5">{formatCostSymbol(destination.costRange)}</span>
              {matchesBestMonth && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Melhor época</span>
              )}
              {matchesIdealDays && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">Dias ideais</span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
