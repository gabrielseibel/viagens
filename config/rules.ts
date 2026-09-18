import type { RoadIndex, RoadIndexLevel } from "@/types";

// Tempo máximo sugerido de estrada (só ida), por dias disponíveis de viagem.
export const MAX_HOURS_BY_DAYS: { minDays: number; maxHours: number }[] = [
  { minDays: 2, maxHours: 3 },
  { minDays: 3, maxHours: 5 },
  { minDays: 4, maxHours: 7 },
  { minDays: 6, maxHours: 10 },
  { minDays: 8, maxHours: 12 },
];

export const DAY_OPTIONS = [2, 3, 4, 5, 7, 10, 15] as const;

export const USABLE_HOURS_PER_DAY = 10;

export const ROAD_INDEX_THRESHOLDS: { leve: number; aceitavel: number } = {
  leve: 0.2,
  aceitavel: 0.35,
};

export function getSuggestedMaxHours(days: number): number {
  let suggested = MAX_HOURS_BY_DAYS[0].maxHours;
  for (const rule of MAX_HOURS_BY_DAYS) {
    if (days >= rule.minDays) {
      suggested = rule.maxHours;
    }
  }
  return suggested;
}

export function computeRoadIndex(oneWayHours: number, days: number): RoadIndex {
  const hoursOnRoad = 2 * oneWayHours;
  const hoursAvailable = days * USABLE_HOURS_PER_DAY;
  const percent = hoursAvailable > 0 ? hoursOnRoad / hoursAvailable : 0;

  let level: RoadIndexLevel;
  if (percent <= ROAD_INDEX_THRESHOLDS.leve) {
    level = "leve";
  } else if (percent <= ROAD_INDEX_THRESHOLDS.aceitavel) {
    level = "aceitavel";
  } else {
    level = "pesado";
  }

  return { percent, level };
}

export const ROAD_INDEX_LABELS: Record<RoadIndexLevel, string> = {
  leve: "Leve",
  aceitavel: "Aceitável",
  pesado: "Pesado",
};

export const ROAD_INDEX_COLORS: Record<RoadIndexLevel, string> = {
  leve: "#16a34a",
  aceitavel: "#d97706",
  pesado: "#dc2626",
};
