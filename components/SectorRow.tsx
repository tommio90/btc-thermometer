import ThermometerBar from "@/components/ThermometerBar";
import { Zone } from "@/lib/calculations";

type SectorRowProps = {
  ticker: string;
  score: number;
  zone: Zone;
};

export default function SectorRow({ ticker, score, zone }: SectorRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 text-sm font-semibold text-muted">{ticker}</div>
      <div className="flex-1">
        <ThermometerBar value={score} zone={zone} />
      </div>
      <div className="w-12 text-right text-sm text-muted">{score}</div>
    </div>
  );
}
