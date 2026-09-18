"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { ROAD_INDEX_COLORS } from "@/config/rules";
import { formatKm, formatMinutesAsHours } from "@/lib/format";
import type { RoadIndexLevel } from "@/types";

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  level: RoadIndexLevel;
  minutes: number;
  km: number;
}

interface MapProps {
  origin: { name: string; lat: number; lng: number };
  points: MapPoint[];
}

const REFERENCE_HOURS = [1, 3, 5, 8];
const REFERENCE_SPEED_KMH = 70;

function buildIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const originIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#1d4ed8;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.6)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function Map({ origin, points }: MapProps) {
  const center: [number, number] = [origin.lat, origin.lng];

  return (
    <MapContainer center={center} zoom={7} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {REFERENCE_HOURS.map((hours) => (
        <Circle
          key={hours}
          center={center}
          radius={hours * REFERENCE_SPEED_KMH * 1000}
          pathOptions={{ color: "#94a3b8", weight: 1, fillOpacity: 0.02, dashArray: "4 4" }}
        />
      ))}

      <Marker position={center} icon={originIcon}>
        <Popup>{origin.name} (origem)</Popup>
      </Marker>

      {points.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]} icon={buildIcon(ROAD_INDEX_COLORS[point.level])}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{point.name}</p>
              <p>
                {formatMinutesAsHours(point.minutes)} · {formatKm(point.km)}
              </p>
              <Link href={`/destino/${point.id}`} className="text-blue-600 underline">
                Ver destino
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
