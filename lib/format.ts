export const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const MONTH_NAMES_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export const COST_LABELS: Record<1 | 2 | 3, string> = {
  1: "Econômico",
  2: "Médio",
  3: "Caro",
};

export const TYPE_LABELS: Record<string, string> = {
  serra: "Serra",
  praia: "Praia",
  cidade: "Cidade",
  natureza: "Natureza",
  termas: "Termas",
  gastronomia: "Gastronomia",
  historia: "História",
  vinho: "Vinho",
};

export const ALL_TYPES = Object.keys(TYPE_LABELS) as (keyof typeof TYPE_LABELS)[];

export function formatMinutesAsHours(minutes: number): string {
  const totalMinutes = Math.round(minutes);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function formatKm(km: number): string {
  return `${Math.round(km).toLocaleString("pt-BR")} km`;
}

export function formatMonthName(month: number, short = false): string {
  const names = short ? MONTH_NAMES_SHORT : MONTH_NAMES;
  return names[month - 1] ?? "";
}

export function formatCostSymbol(costRange: 1 | 2 | 3): string {
  return "R$".repeat(costRange);
}

export function formatCostLabel(costRange: 1 | 2 | 3): string {
  return COST_LABELS[costRange];
}

export function formatIdealDays(idealDays: { min: number; max: number }): string {
  if (idealDays.min === idealDays.max) return `${idealDays.min} dias`;
  return `${idealDays.min}-${idealDays.max} dias`;
}
