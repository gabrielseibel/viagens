export type DestinationType =
  | "serra"
  | "praia"
  | "cidade"
  | "natureza"
  | "termas"
  | "gastronomia"
  | "historia"
  | "vinho";

export interface Destination {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  types: DestinationType[];
  bestMonths: number[];
  idealDays: { min: number; max: number };
  costRange: 1 | 2 | 3;
  summary: string;
  highlights: string[];
  affiliateLinks: Record<string, string>;
}

export interface Origin {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export interface TravelTime {
  minutes: number;
  km: number;
}

export type TravelTimesMap = Record<string, TravelTime>;

export type RoadIndexLevel = "leve" | "aceitavel" | "pesado";

export interface RoadIndex {
  percent: number;
  level: RoadIndexLevel;
}

export interface DestinationWithTravel extends Destination {
  travelTime: TravelTime | null;
}
