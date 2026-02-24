import { Zone } from "@/lib/calculations";

const zoneColors: Record<Zone, string> = {
  GREEN: "bg-green",
  YELLOW: "bg-amber",
  RED: "bg-red"
};

type ThermometerBarProps = {
  value: number;
  zone: Zone;
};

export default function ThermometerBar({ value, zone }: ThermometerBarProps) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      <div className="h-3 w-full rounded-full bg-muted/40 overflow-hidden">
        <div
          className={`h-full ${zoneColors[zone]} transition-all duration-700`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
