import { getSuggestedMaxHours, computeRoadIndex } from "@/config/rules";
import type { Destination, DestinationType, RoadIndex, TravelTime, TravelTimesMap } from "@/types";

export interface FiltersState {
  days: number;
  maxHours: number;
  types: DestinationType[];
  month: number | null;
  costRange: number[];
}

export const DEFAULT_DAYS = 3;

export function getDefaultFilters(): FiltersState {
  return {
    days: DEFAULT_DAYS,
    maxHours: getSuggestedMaxHours(DEFAULT_DAYS),
    types: [],
    month: null,
    costRange: [],
  };
}

export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): FiltersState {
  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key);
    }
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  const defaults = getDefaultFilters();

  const daysRaw = get("dias");
  const days = daysRaw ? parseInt(daysRaw, 10) : defaults.days;

  const maxHoursRaw = get("tempoMax");
  const maxHours = maxHoursRaw ? parseFloat(maxHoursRaw) : getSuggestedMaxHours(days);

  const typesRaw = get("tipos");
  const types = typesRaw ? (typesRaw.split(",").filter(Boolean) as DestinationType[]) : [];

  const monthRaw = get("mes");
  const month = monthRaw ? parseInt(monthRaw, 10) : null;

  const costRaw = get("custo");
  const costRange = costRaw ? costRaw.split(",").filter(Boolean).map(Number) : [];

  return {
    days: Number.isFinite(days) && days > 0 ? days : defaults.days,
    maxHours: Number.isFinite(maxHours) && maxHours > 0 ? maxHours : defaults.maxHours,
    types,
    month: month && month >= 1 && month <= 12 ? month : null,
    costRange,
  };
}

export function filtersToSearchParams(filters: FiltersState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("dias", String(filters.days));
  params.set("tempoMax", String(filters.maxHours));
  if (filters.types.length > 0) params.set("tipos", filters.types.join(","));
  if (filters.month) params.set("mes", String(filters.month));
  if (filters.costRange.length > 0) params.set("custo", filters.costRange.join(","));
  return params;
}

export interface DestinationResult {
  destination: Destination;
  travelTime: TravelTime;
  roadIndex: RoadIndex;
  matchesBestMonth: boolean;
  matchesIdealDays: boolean;
  relevance: number;
}

export function getFilteredSortedDestinations(
  destinations: Destination[],
  travelTimes: TravelTimesMap,
  filters: FiltersState
): DestinationResult[] {
  const results: DestinationResult[] = [];

  for (const destination of destinations) {
    const travelTime = travelTimes[destination.id];
    if (!travelTime) continue;

    const oneWayHours = travelTime.minutes / 60;
    if (oneWayHours > filters.maxHours) continue;

    if (filters.types.length > 0 && !destination.types.some((t) => filters.types.includes(t))) {
      continue;
    }

    if (filters.costRange.length > 0 && !filters.costRange.includes(destination.costRange)) {
      continue;
    }

    const roadIndex = computeRoadIndex(oneWayHours, filters.days);
    const matchesBestMonth = filters.month ? destination.bestMonths.includes(filters.month) : false;
    const matchesIdealDays =
      filters.days >= destination.idealDays.min && filters.days <= destination.idealDays.max;

    let relevance = 0;
    if (roadIndex.level === "leve") relevance += 3;
    else if (roadIndex.level === "aceitavel") relevance += 1;
    if (matchesBestMonth) relevance += 5;
    if (matchesIdealDays) relevance += 3;

    results.push({ destination, travelTime, roadIndex, matchesBestMonth, matchesIdealDays, relevance });
  }

  results.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    return a.travelTime.minutes - b.travelTime.minutes;
  });

  return results;
}
