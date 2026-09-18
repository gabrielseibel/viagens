import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PlanningCard from "@/components/PlanningCard";
import { destinations, getDestination, getOrigin, getTravelTime, DEFAULT_ORIGIN_ID } from "@/lib/data";
import { computeRoadIndex } from "@/config/rules";
import { DEFAULT_DAYS } from "@/lib/filters";

export function generateStaticParams() {
  return destinations.map((d) => ({ id: d.id }));
}

export const metadata: Metadata = {
  title: "Montar planejamento — Organizador de Viagens",
};

export default async function PlanningPage({
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
  if (!travelTime) notFound();

  const roadIndex = computeRoadIndex(travelTime.minutes / 60, validDays);

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href={`/destino/${destination.id}?dias=${validDays}`} className="text-sm text-blue-600 hover:underline">
            ← Voltar para {destination.name}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <PlanningCard
          destination={destination}
          travelTime={travelTime}
          roadIndex={roadIndex}
          days={validDays}
          originName={origin.name}
        />
      </main>
    </div>
  );
}
