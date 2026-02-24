import {
  calculateRSI,
  calculateScore,
  formatScore,
  getSignal,
  getZone,
  normalizeMomentum,
  proximityToHigh
} from "@/lib/calculations";

export const revalidate = 300;

type AssetScore = {
  ticker: string;
  score: number;
  zone: "GREEN" | "YELLOW" | "RED";
};

type BtcPayload = {
  price: number;
  score: number;
  zone: "GREEN" | "YELLOW" | "RED";
  rsi: number;
  signal: "BUY" | "HOLD" | "SELL";
  macro: "BULLISH" | "NEUTRAL" | "BEARISH";
};

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return res.json() as Promise<T>;
}

function extractCoinGeckoPrices(data: { prices: [number, number][] }): number[] {
  return data.prices.map((entry) => entry[1]).filter((price) => Number.isFinite(price));
}

function extractYahooPrices(data: any): number[] {
  const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
  return closes.filter((price: number | null) => typeof price === "number");
}

function calculateFromPrices(prices: number[]): {
  rsi: number;
  momentum: number;
  proximity: number;
  score: number;
  zone: "GREEN" | "YELLOW" | "RED";
  signal: "BUY" | "HOLD" | "SELL";
} {
  const recent = prices.slice(-30);
  const rsi = calculateRSI(recent, 14);
  const first = recent[0] ?? prices[0] ?? 0;
  const last = prices[prices.length - 1] ?? 0;
  const momentumRaw = first ? ((last - first) / first) * 100 : 0;
  const momentum = normalizeMomentum(momentumRaw);
  const high = Math.max(...prices, 0);
  const proximity = proximityToHigh(last, high);
  const score = calculateScore({ rsi, momentum, proximity });
  const zone = getZone(score);
  const signal = getSignal(score);

  return {
    rsi,
    momentum,
    proximity,
    score,
    zone,
    signal
  };
}

export async function GET() {
  try {
    const [simplePrice, btcChart, ethChart, solChart] = await Promise.all([
      fetchJson<{ bitcoin: { usd: number }; ethereum: { usd: number }; solana: { usd: number } }>(
        `${COINGECKO_BASE}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd`
      ),
      fetchJson<{ prices: [number, number][] }>(
        `${COINGECKO_BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily`
      ),
      fetchJson<{ prices: [number, number][] }>(
        `${COINGECKO_BASE}/coins/ethereum/market_chart?vs_currency=usd&days=365&interval=daily`
      ),
      fetchJson<{ prices: [number, number][] }>(
        `${COINGECKO_BASE}/coins/solana/market_chart?vs_currency=usd&days=365&interval=daily`
      )
    ]);

    const yahooTickers = ["MSTR", "IBIT", "FBTC", "GBTC"];
    const yahooRequests = yahooTickers.map((ticker) =>
      fetchJson<any>(`${YAHOO_BASE}/${ticker}?interval=1d&range=1y`)
    );

    const [mstrChart, ibitChart, fbtcChart, gbtcChart] = await Promise.all(yahooRequests);

    const btcPrices = extractCoinGeckoPrices(btcChart);
    const ethPrices = extractCoinGeckoPrices(ethChart);
    const solPrices = extractCoinGeckoPrices(solChart);

    const btcMetrics = calculateFromPrices(btcPrices);
    const ethMetrics = calculateFromPrices(ethPrices);
    const solMetrics = calculateFromPrices(solPrices);

    const yahooCharts = [mstrChart, ibitChart, fbtcChart, gbtcChart];
    const yahooScores = yahooCharts.map((chart) => calculateFromPrices(extractYahooPrices(chart)));

    const btcPayload: BtcPayload = {
      price: simplePrice.bitcoin.usd,
      score: formatScore(btcMetrics.score),
      zone: btcMetrics.zone,
      rsi: Number(btcMetrics.rsi.toFixed(1)),
      signal: btcMetrics.signal,
      macro: btcMetrics.score > 60 ? "BULLISH" : btcMetrics.score < 40 ? "BEARISH" : "NEUTRAL"
    };

    const sector: AssetScore[] = [
      { ticker: "BTC", score: formatScore(btcMetrics.score), zone: btcMetrics.zone },
      { ticker: "ETH", score: formatScore(ethMetrics.score), zone: ethMetrics.zone },
      { ticker: "SOL", score: formatScore(solMetrics.score), zone: solMetrics.zone },
      { ticker: "MSTR", score: formatScore(yahooScores[0].score), zone: yahooScores[0].zone },
      { ticker: "IBIT", score: formatScore(yahooScores[1].score), zone: yahooScores[1].zone },
      { ticker: "FBTC", score: formatScore(yahooScores[2].score), zone: yahooScores[2].zone },
      { ticker: "GBTC", score: formatScore(yahooScores[3].score), zone: yahooScores[3].zone }
    ];

    return Response.json({ btc: btcPayload, sector });
  } catch (error) {
    return Response.json(
      {
        btc: {
          price: 0,
          score: 0,
          zone: "RED",
          rsi: 0,
          signal: "SELL",
          macro: "BEARISH"
        },
        sector: []
      },
      { status: 500 }
    );
  }
}
