"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RoadIndexBadge from "./RoadIndexBadge";
import DaysSelector from "./DaysSelector";
import { computeRoadIndex } from "@/config/rules";
import { DEFAULT_DAYS } from "@/lib/filters";
import { formatMinutesAsHours, formatKm } from "@/lib/format";
import type { Destination, TravelTime } from "@/types";

export default function DestinationDetails({
  destination,
  travelTime,
  originName,
}: {
  destination: Destination;
  travelTime: TravelTime | null;
  originName: string;
}) {
  const searchParams = useSearchParams();
  const diasRaw = searchParams.get("dias");
  const days = diasRaw ? parseInt(diasRaw, 10) : DEFAULT_DAYS;
  const validDays = Number.isFinite(days) && days > 0 ? days : DEFAULT_DAYS;

  const roadIndex = useMemo(
    () => (travelTime ? computeRoadIndex(travelTime.minutes / 60, validDays) : null),
    [travelTime, validDays]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">Saindo de {originName}</p>
      {travelTime ? (
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {formatMinutesAsHours(travelTime.minutes)} · {formatKm(travelTime.km)}
        </p>
      ) : (
        <p className="mt-1 text-slate-500">Tempo de viagem ainda não calculado.</p>
      )}

      <div className="mt-4">
        <DaysSelector days={validDays} />
      </div>

      {roadIndex && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-slate-500">Com {validDays} dias, o índice de estrada é:</span>
          <RoadIndexBadge level={roadIndex.level} percent={roadIndex.percent} />
        </div>
      )}

      <Link
        href={`/planejamento/${destination.id}?dias=${validDays}`}
        className="mt-4 block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        Montar planejamento
      </Link>
    </div>
  );
}
