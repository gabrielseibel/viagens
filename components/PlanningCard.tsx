"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import RoadIndexBadge from "./RoadIndexBadge";
import { ROAD_INDEX_LABELS } from "@/config/rules";
import {
  formatCostLabel,
  formatKm,
  formatMinutesAsHours,
  formatMonthName,
} from "@/lib/format";
import type { Destination, RoadIndex, TravelTime } from "@/types";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

interface PlanningCardProps {
  destination: Destination;
  travelTime: TravelTime;
  roadIndex: RoadIndex;
  days: number;
  originName: string;
}

export default function PlanningCard({
  destination,
  travelTime,
  roadIndex,
  days,
  originName,
}: PlanningCardProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(CARD_WIDTH);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");

  useEffect(() => {
    if (!outerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(Math.min(width, CARD_WIDTH));
    });
    observer.observe(outerRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = containerWidth / CARD_WIDTH;

  async function renderPng(): Promise<string> {
    if (!cardRef.current) throw new Error("Card não está pronto");
    return toPng(cardRef.current, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      pixelRatio: 1,
      cacheBust: true,
    });
  }

  async function handleDownload() {
    setStatus("working");
    try {
      const dataUrl = await renderPng();
      const link = document.createElement("a");
      link.download = `planejamento-${destination.id}.png`;
      link.href = dataUrl;
      link.click();
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  async function handleShare() {
    setStatus("working");
    try {
      const dataUrl = await renderPng();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `planejamento-${destination.id}.png`, { type: "image/png" });
      const canShareFiles =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        await navigator.share({
          files: [file],
          title: `Planejamento: ${destination.name}`,
          text: `Vou para ${destination.name} — ${formatMinutesAsHours(travelTime.minutes)} de estrada!`,
        });
      } else {
        const link = document.createElement("a");
        link.download = `planejamento-${destination.id}.png`;
        link.href = dataUrl;
        link.click();
      }
      setStatus("idle");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        console.error(error);
        setStatus("error");
      } else {
        setStatus("idle");
      }
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div ref={outerRef} className="mx-auto w-full max-w-[420px]">
        <div
          style={{ width: containerWidth, height: containerWidth * (CARD_HEIGHT / CARD_WIDTH) }}
          className="relative overflow-hidden rounded-xl shadow-lg print:mx-auto print:h-auto print:w-full print:max-w-none print:shadow-none"
        >
          <div
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="print:!h-auto print:!w-full print:!scale-100"
          >
            <div
              ref={cardRef}
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
              className="flex flex-col bg-gradient-to-br from-blue-600 to-emerald-600 p-16 text-white print:h-auto print:min-h-0 print:text-black print:from-white print:to-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold tracking-tight">Organizador de Viagens</span>
                <RoadIndexBadge level={roadIndex.level} />
              </div>

              <div className="mt-12">
                <p className="text-2xl opacity-90">{days} dias de viagem</p>
                <h1 className="mt-2 text-7xl font-extrabold leading-tight">{destination.name}</h1>
                <p className="mt-1 text-3xl opacity-90">{destination.state}</p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6 text-2xl">
                <div className="rounded-2xl bg-white/15 p-6 print:border print:border-slate-300 print:bg-transparent">
                  <p className="opacity-80">Saindo de</p>
                  <p className="font-semibold">{originName}</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-6 print:border print:border-slate-300 print:bg-transparent">
                  <p className="opacity-80">Tempo e distância</p>
                  <p className="font-semibold">
                    {formatMinutesAsHours(travelTime.minutes)} · {formatKm(travelTime.km)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 p-6 print:border print:border-slate-300 print:bg-transparent">
                  <p className="opacity-80">Melhor época</p>
                  <p className="font-semibold">
                    {destination.bestMonths.length === 12
                      ? "Ano todo"
                      : destination.bestMonths.map((m) => formatMonthName(m, true)).join(", ")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 p-6 print:border print:border-slate-300 print:bg-transparent">
                  <p className="opacity-80">Custo estimado</p>
                  <p className="font-semibold">{formatCostLabel(destination.costRange)}</p>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-2xl font-semibold opacity-90">Destaques</p>
                <ul className="mt-3 space-y-2 text-2xl">
                  {destination.highlights.slice(0, 3).map((h) => (
                    <li key={h}>• {h}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 flex-1 rounded-2xl border-2 border-dashed border-white/40 p-6 print:border-slate-400">
                <p className="text-xl opacity-80">Anotações</p>
                <p className="mt-3 whitespace-pre-wrap text-xl">
                  {notes || "Datas, hospedagem, o que não pode faltar..."}
                </p>
              </div>

              <div className="mt-10 flex items-center justify-between text-lg opacity-80">
                <span>Índice de estrada: {ROAD_INDEX_LABELS[roadIndex.level]}</span>
                <span>organizadordeviagens.app</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[420px] print:hidden">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Anotações (aparecem no card)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Datas, hospedagem, o que não pode faltar..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mx-auto flex max-w-[420px] flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={handleShare}
          disabled={status === "working"}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Compartilhar
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={status === "working"}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
        >
          Baixar imagem
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Imprimir
        </button>
      </div>

      {status === "error" && (
        <p className="mx-auto max-w-[420px] text-sm text-red-600 print:hidden">
          Não foi possível gerar a imagem. Tente novamente.
        </p>
      )}
    </div>
  );
}
