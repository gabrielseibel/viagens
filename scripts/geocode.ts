/**
 * Preenche lat/lng dos destinos em data/destinations.json usando a ORS Geocoding API.
 * Não sobrescreve coordenadas já preenchidas (diferentes de 0).
 * Roda localmente: npm run geocode
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Destination } from "@/types";

const ORS_API_KEY = process.env.ORS_API_KEY;
const DESTINATIONS_PATH = path.join(process.cwd(), "data", "destinations.json");
const PAUSE_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(destination: Destination): Promise<{ lat: number; lng: number } | null> {
  const text = `${destination.name}, ${destination.state}, Brasil`;
  const url = new URL("https://api.openrouteservice.org/geocode/search");
  url.searchParams.set("api_key", ORS_API_KEY!);
  url.searchParams.set("text", text);
  url.searchParams.set("boundary.country", "BR");
  url.searchParams.set("size", "1");

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error(`  Erro ao geocodificar "${text}": ${response.status} ${response.statusText}`);
    return null;
  }

  const body = await response.json();
  const feature = body?.features?.[0];
  if (!feature) {
    console.warn(`  Nenhum resultado encontrado para "${text}"`);
    return null;
  }

  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng };
}

async function main() {
  if (!ORS_API_KEY) {
    console.error("Defina ORS_API_KEY em .env.local antes de rodar este script.");
    process.exit(1);
  }

  const raw = readFileSync(DESTINATIONS_PATH, "utf-8");
  const destinations: Destination[] = JSON.parse(raw);

  let changed = false;

  for (const destination of destinations) {
    if (destination.lat !== 0 || destination.lng !== 0) {
      console.log(`Pulando "${destination.name}" (já tem coordenadas: ${destination.lat}, ${destination.lng})`);
      continue;
    }

    console.log(`Geocodificando "${destination.name}, ${destination.state}"...`);
    const result = await geocode(destination);

    if (result) {
      console.log(`  -> lat: ${result.lat}, lng: ${result.lng}`);
      destination.lat = result.lat;
      destination.lng = result.lng;
      changed = true;
    }

    await sleep(PAUSE_MS);
  }

  if (changed) {
    writeFileSync(DESTINATIONS_PATH, JSON.stringify(destinations, null, 2) + "\n", "utf-8");
    console.log("\ndata/destinations.json atualizado. Confira as coordenadas antes de commitar.");
  } else {
    console.log("\nNenhuma coordenada foi alterada.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
