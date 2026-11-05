import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DestinationDetails from "@/components/DestinationDetails";
import { destinations, getDestination, getOrigin, getTravelTime, DEFAULT_ORIGIN_ID } from "@/lib/data";
import { formatCostLabel, formatIdealDays, formatMonthName, TYPE_LABELS } from "@/lib/format";

export function generateStaticParams() {
  return destinations.map((d) => ({ id: d.id }));
}

export const dynamicParams = false;

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

export default async function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destination = getDestination(id);
  if (!destination) notFound();

  const origin = getOrigin(DEFAULT_ORIGIN_ID)!;
  const travelTime = getTravelTime(DEFAULT_ORIGIN_ID, destination.id);

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

        <Suspense>
          <DestinationDetails destination={destination} travelTime={travelTime} originName={origin.name} />
        </Suspense>

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
      </main>
    </div>
  );
}
