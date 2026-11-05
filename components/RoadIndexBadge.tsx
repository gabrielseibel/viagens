import { ROAD_INDEX_LABELS, ROAD_INDEX_COLORS } from "@/config/rules";
import type { RoadIndexLevel } from "@/types";

const BG_CLASSES: Record<RoadIndexLevel, string> = {
  leve: "bg-green-100 text-green-800 border-green-300",
  aceitavel: "bg-amber-100 text-amber-800 border-amber-300",
  pesado: "bg-red-100 text-red-800 border-red-300",
};

export default function RoadIndexBadge({
  level,
  percent,
}: {
  level: RoadIndexLevel;
  percent?: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${BG_CLASSES[level]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: ROAD_INDEX_COLORS[level] }}
      />
      {ROAD_INDEX_LABELS[level]}
      {percent !== undefined ? ` · ${Math.round(percent * 100)}%` : ""}
    </span>
  );
}
