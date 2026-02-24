"use client";

import { useEffect, useState } from "react";
import ScoreCard from "@/components/ScoreCard";
import SectorRow from "@/components/SectorRow";
import { Signal, Zone } from "@/lib/calculations";

type BtcPayload = {
  price: number;
  score: number;
  zone: Zone;
  rsi: number;
  signal: Signal;
  macro: "BULLISH" | "NEUTRAL" | "BEARISH";
};

type SectorPayload = {
  ticker: string;
  score: number;
  zone: Zone;
};

type ApiResponse = {
  btc: BtcPayload;
  sector: SectorPayload[];
};

const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [domain, setDomain] = useState("btc-thermometer.vercel.app");

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/btc-data");
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = (await res.json()) as ApiResponse;
      setData(json);
      setUpdatedAt(new Date().toISOString());
    } catch (error) {
      setUpdatedAt(new Date().toISOString());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);

  const formattedUpdated = updatedAt
    ? new Date(updatedAt).toISOString().replace("T", " ").slice(0, 16) + " UTC"
    : "--";

  return (
    <main className="min-h-screen px-6 py-10 md:px-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-20 h-80 w-80 rounded-full bg-green/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-amber/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🟠</div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted">Bitcoin</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em]">BTC THERMOMETER</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="uppercase tracking-[0.3em]">Live</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRefreshing ? "bg-green animate-pulse" : "bg-muted"
              }`}
            />
          </div>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/5 bg-white/5 p-8 shadow-glow">
            {data ? (
              <ScoreCard
                price={data.btc.price}
                score={data.btc.score}
                zone={data.btc.zone}
                rsi={data.btc.rsi}
                signal={data.btc.signal}
                macro={data.btc.macro}
              />
            ) : (
              <div className="space-y-4">
                <div className="h-10 w-40 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/10" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 rounded bg-white/10" />
                  <div className="h-4 rounded bg-white/10" />
                  <div className="h-4 rounded bg-white/10" />
                  <div className="h-4 rounded bg-white/10" />
                </div>
                <div className="h-10 w-64 rounded bg-white/10" />
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-[0.3em]">SECTOR</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-muted">Score</span>
            </div>
            <div className="mt-6 space-y-5">
              {data?.sector?.length ? (
                data.sector.map((asset) => (
                  <SectorRow
                    key={asset.ticker}
                    ticker={asset.ticker}
                    score={asset.score}
                    zone={asset.zone}
                  />
                ))
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-6 rounded bg-white/10" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-12 flex flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div>Updated: {formattedUpdated}</div>
          <div>{domain}</div>
        </footer>
      </div>
    </main>
  );
}
