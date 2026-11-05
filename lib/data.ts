import destinationsData from "@/data/destinations.json";
import originsData from "@/data/origins.json";
import chapecoTravelTimes from "@/data/travel-times/chapeco-sc.json";
import type { Destination, Origin, TravelTimesMap } from "@/types";

export const destinations = destinationsData as Destination[];
export const origins = originsData as Origin[];

const travelTimesByOrigin: Record<string, TravelTimesMap> = {
  "chapeco-sc": chapecoTravelTimes as TravelTimesMap,
};

export const DEFAULT_ORIGIN_ID = origins[0]?.id ?? "chapeco-sc";

export function getOrigin(originId: string): Origin | undefined {
  return origins.find((o) => o.id === originId);
}

export function getDestination(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

export function getTravelTimes(originId: string): TravelTimesMap {
  return travelTimesByOrigin[originId] ?? {};
}

export function getTravelTime(originId: string, destinationId: string) {
  return getTravelTimes(originId)[destinationId] ?? null;
}
