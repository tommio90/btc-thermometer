import ThermometerBar from "@/components/ThermometerBar";
import { Signal, Zone } from "@/lib/calculations";

const zoneText: Record<Zone, string> = {
  GREEN: "text-green",
  YELLOW: "text-amber",
  RED: "text-red"
};

const macroText: Record<"BULLISH" | "NEUTRAL" | "BEARISH", string> = {
  BULLISH: "text-green",
  NEUTRAL: "text-amber",
  BEARISH: "text-red"
};

type ScoreCardProps = {
  price: number;
  score: number;
  zone: Zone;
  rsi: number;
  signal: Signal;
  macro: "BULLISH" | "NEUTRAL" | "BEARISH";
};

export default function ScoreCard({
  price,
  score,
  zone,
  rsi,
  signal,
  macro
}: ScoreCardProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Current BTC</p>
        <h2 className="mt-2 text-5xl md:text-6xl font-bold">${price.toLocaleString()}</h2>
      </div>

      <ThermometerBar value={score} zone={zone} />

      <div className="grid grid-cols-2 gap-4 text-sm text-muted">
        <div>
          <span className="text-primary font-semibold">Score:</span> {score}/100
        </div>
        <div className={zoneText[zone]}>
          <span className="text-primary font-semibold">Zone:</span> {zone}
        </div>
        <div>
          <span className="text-primary font-semibold">RSI:</span> {rsi.toFixed(1)}
        </div>
        <div>
          <span className="text-primary font-semibold">Signal:</span> {signal}
        </div>
      </div>

      <div className={`text-4xl md:text-5xl font-extrabold ${macroText[macro]}`}>
        Macro: {macro}
      </div>
    </section>
  );
}
