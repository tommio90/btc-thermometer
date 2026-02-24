export type Zone = "GREEN" | "YELLOW" | "RED";
export type Signal = "BUY" | "HOLD" | "SELL";

export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i += 1) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeMomentum(changePercent: number): number {
  const clamped = clamp(changePercent, -30, 30);
  return ((clamped + 30) / 60) * 100;
}

export function proximityToHigh(current: number, high: number): number {
  if (high <= 0) return 0;
  return clamp((current / high) * 100, 0, 100);
}

export function calculateScore(params: {
  rsi: number;
  momentum: number;
  proximity: number;
}): number {
  const { rsi, momentum, proximity } = params;
  return 0.4 * rsi + 0.3 * momentum + 0.3 * proximity;
}

export function getZone(score: number): Zone {
  if (score >= 70) return "GREEN";
  if (score >= 40) return "YELLOW";
  return "RED";
}

export function getSignal(score: number): Signal {
  if (score >= 65) return "BUY";
  if (score >= 40) return "HOLD";
  return "SELL";
}

export function formatScore(value: number): number {
  return Math.round(value);
}
