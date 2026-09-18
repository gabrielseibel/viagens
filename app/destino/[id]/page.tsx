import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RoadIndexBadge from "@/components/RoadIndexBadge";
import DaysSelector from "@/components/DaysSelector";
import { destinations, getDestination, getOrigin, getTravelTime, DEFAULT_ORIGIN_ID } from "@/lib/data";
import { computeRoadIndex } from "@/config/rules";
import { DEFAULT_DAYS } from "@/lib/filters";
import {
  formatCostLabel,
  formatIdealDays,
  formatKm,
  formatMinutesAsHours,
  formatMonthName,
  TYPE_LABELS,
} from "@/lib/format";

export function generateStaticParams() {
  return destinations.map((d) => ({ id: d.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const destination = getDestination(id);
  if (!destination) return {};
  return {
    title: `${destination.name} — Organizador de Viagens`,
    description: destination.summary,
  };
}

export default async function DestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const destination = getDestination(id);
  if (!destination) notFound();

  const query = await searchParams;
  const diasRaw = Array.isArray(query.dias) ? query.dias[0] : query.dias;
  const days = diasRaw ? parseInt(diasRaw, 10) : DEFAULT_DAYS;
  const validDays = Number.isFinite(days) && days > 0 ? days : DEFAULT_DAYS;

  const origin = getOrigin(DEFAULT_ORIGIN_ID)!;
  const travelTime = getTravelTime(DEFAULT_ORIGIN_ID, destination.id);
  const roadIndex = travelTime ? computeRoadIndex(travelTime.minutes / 60, validDays) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Voltar para a busca
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {destination.name} <span className="font-normal text-slate-400">· {destination.state}</span>
          </h1>
          <p className="mt-1 text-slate-600">{destination.summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {destination.types.map((t) => (
            <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {TYPE_LABELS[t]}
            </span>
          ))}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
            {formatCostLabel(destination.costRange)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Saindo de {origin.name}</p>
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-700">Melhor época</p>
            <p className="mt-1 text-slate-600">
              {destination.bestMonths.length === 12
                ? "Ano todo"
                : destination.bestMonths.map((m) => formatMonthName(m, true)).join(", ")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-700">Dias ideais</p>
            <p className="mt-1 text-slate-600">{formatIdealDays(destination.idealDays)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">Destaques</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
            {destination.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>

        <Link
          href={`/planejamento/${destination.id}?dias=${validDays}`}
          className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
        >
          Montar planejamento
        </Link>
      </main>
    </div>
  );
}
