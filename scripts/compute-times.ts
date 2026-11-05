/**
 * Calcula tempo (min) e distância (km) de carro da origem até todos os destinos,
 * usando a ORS Matrix API (perfil driving-car), e grava em data/travel-times/<origin-id>.json.
 * Roda localmente: npm run compute-times -- <origin-id>
 * Se nenhum origin-id for passado, usa o primeiro de data/origins.json.
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Destination, Origin, TravelTimesMap } from "@/types";

config({ path: ".env.local" });

const ORS_API_KEY = process.env.ORS_API_KEY;
const DESTINATIONS_PATH = path.join(process.cwd(), "data", "destinations.json");
const ORIGINS_PATH = path.join(process.cwd(), "data", "origins.json");
const TRAVEL_TIMES_DIR = path.join(process.cwd(), "data", "travel-times");

const BATCH_SIZE = 10;
const PAUSE_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function computeBatch(
  origin: Origin,
  batch: Destination[]
): Promise<{ id: string; minutes: number; km: number }[]> {
  const locations = [[origin.lng, origin.lat], ...batch.map((d) => [d.lng, d.lat])];

  const response = await fetch("https://api.openrouteservice.org/v2/matrix/driving-car", {
    method: "POST",
    headers: {
      Authorization: ORS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      locations,
      sources: [0],
      destinations: batch.map((_, i) => i + 1),
      metrics: ["duration", "distance"],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro na ORS Matrix API: ${response.status} ${response.statusText} - ${text}`);
  }

  const body = await response.json();
  const durations: number[] = body.durations[0];
  const distances: number[] = body.distances[0];

  return batch.map((d, i) => ({
    id: d.id,
    minutes: Math.round(durations[i] / 60),
    km: Math.round(distances[i] / 1000),
  }));
}

async function main() {
  if (!ORS_API_KEY) {
    console.error("Defina ORS_API_KEY em .env.local antes de rodar este script.");
    process.exit(1);
  }

  const originId = process.argv[2];
  const origins: Origin[] = JSON.parse(readFileSync(ORIGINS_PATH, "utf-8"));
  const origin = originId ? origins.find((o) => o.id === originId) : origins[0];

  if (!origin) {
    console.error(`Origem "${originId}" não encontrada em data/origins.json.`);
    process.exit(1);
  }

  const destinations: Destination[] = JSON.parse(readFileSync(DESTINATIONS_PATH, "utf-8"));
  const geocoded = destinations.filter((d) => d.lat !== 0 || d.lng !== 0);
  const missing = destinations.filter((d) => d.lat === 0 && d.lng === 0);

  if (missing.length > 0) {
    console.warn(
      `Aviso: ${missing.length} destino(s) sem coordenadas serão ignorados: ${missing
        .map((d) => d.name)
        .join(", ")}`
    );
  }

  console.log(`Calculando tempos de "${origin.name}" para ${geocoded.length} destino(s)...`);

  const result: TravelTimesMap = {};
  const batches = chunk(geocoded, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    console.log(`  Lote ${i + 1}/${batches.length}...`);
    const times = await computeBatch(origin, batches[i]);
    for (const t of times) {
      result[t.id] = { minutes: t.minutes, km: t.km };
    }
    if (i < batches.length - 1) {
      await sleep(PAUSE_MS);
    }
  }

  mkdirSync(TRAVEL_TIMES_DIR, { recursive: true });
  const outPath = path.join(TRAVEL_TIMES_DIR, `${origin.id}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf-8");
  console.log(`\nGravado em ${path.relative(process.cwd(), outPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
