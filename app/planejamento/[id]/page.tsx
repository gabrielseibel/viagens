import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PlanningCard from "@/components/PlanningCard";
import { destinations, getDestination, getOrigin, getTravelTime, DEFAULT_ORIGIN_ID } from "@/lib/data";

export function generateStaticParams() {
  return destinations.map((d) => ({ id: d.id }));
}

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Montar planejamento — Organizador de Viagens",
};

export default async function PlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destination = getDestination(id);
  if (!destination) notFound();

  const origin = getOrigin(DEFAULT_ORIGIN_ID)!;
  const travelTime = getTravelTime(DEFAULT_ORIGIN_ID, destination.id);
  if (!travelTime) notFound();

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href={`/destino/${destination.id}`} className="text-sm text-blue-600 hover:underline">
            ← Voltar para {destination.name}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Suspense>
          <PlanningCard destination={destination} travelTime={travelTime} originName={origin.name} />
        </Suspense>
      </main>
    </div>
  );
}
