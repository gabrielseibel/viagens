"use client";

import { useSearchParams } from "next/navigation";
import FiltersPanel from "./FiltersPanel";
import MapLoader from "./MapLoader";
import DestinationList from "./DestinationList";
import { destinations, getOrigin, getTravelTimes, DEFAULT_ORIGIN_ID } from "@/lib/data";
import { getFilteredSortedDestinations, parseFiltersFromSearchParams } from "@/lib/filters";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const filters = parseFiltersFromSearchParams(searchParams);

  const origin = getOrigin(DEFAULT_ORIGIN_ID)!;
  const travelTimes = getTravelTimes(DEFAULT_ORIGIN_ID);

  const results = getFilteredSortedDestinations(destinations, travelTimes, filters);

  const mapPoints = results.map(({ destination, travelTime, roadIndex }) => ({
    id: destination.id,
    name: destination.name,
    lat: destination.lat,
    lng: destination.lng,
    level: roadIndex.level,
    minutes: travelTime.minutes,
    km: travelTime.km,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">Para onde ir?</h1>
          <p className="text-sm text-slate-500">
            Saindo de Chapecó, encontre destinos que cabem nos seus dias.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-4">
        <FiltersPanel />

        <div className="h-[350px] overflow-hidden rounded-xl border border-slate-200 md:h-[450px]">
          <MapLoader
            origin={{ name: origin.name, lat: origin.lat, lng: origin.lng }}
            points={mapPoints}
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-500">
            {results.length} destino{results.length === 1 ? "" : "s"} encontrado{results.length === 1 ? "" : "s"}
          </p>
          <DestinationList results={results} />
        </div>
      </main>
    </div>
  );
}
