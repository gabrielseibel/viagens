"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./Map";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
      Carregando mapa...
    </div>
  ),
});

export default function MapLoader(props: { origin: { name: string; lat: number; lng: number }; points: MapPoint[] }) {
  return <Map {...props} />;
}
