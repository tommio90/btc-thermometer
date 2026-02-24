# Build: BTC Thermometer Dashboard

Clone the design of https://dante.id/investing/ (Uranium Thermometer) but for Bitcoin.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (optional for primitives)
- Deployed to Vercel

## Design Reference (Uranium Thermometer)
Dark charcoal/navy background (~#1E2D3D). Two columns layout.

### Header
- Bitcoin emoji (₿ or 🟠) + "BTC THERMOMETER" in large bold uppercase white text

### Left Column
- Current BTC price in large bold white text (e.g. "$96,432")
- Horizontal progress bar (amber fill on gray track) showing composite score 0-100
- Below bar: "Score: XX/100", "Zone: GREEN/YELLOW/RED", "RSI: XX.X", "Signal: BUY/HOLD/SELL"
- Large bold green/red/amber text: "Macro: BULLISH/NEUTRAL/BEARISH"

### Right Column - "SECTOR"
Show horizontal bars (same style) for these related assets with scores:
- BTC (Bitcoin)
- ETH (Ethereum)  
- SOL (Solana)
- MSTR (MicroStrategy stock)
- IBIT (BlackRock Bitcoin ETF)
- FBTC (Fidelity Bitcoin ETF)
- GBTC (Grayscale Bitcoin Trust)

### Footer
- "Updated: YYYY-MM-DD HH:MM UTC"
- Domain when deployed

## Data Sources (all free, no API key needed)
- CoinGecko API (no key): https://api.coingecko.com/api/v3/
  - BTC price: GET /simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd
  - Historical (for RSI calc): GET /coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily
- Yahoo Finance (for MSTR, IBIT, FBTC, GBTC): GET https://query1.finance.yahoo.com/v8/finance/chart/MSTR?interval=1d&range=30d

## Score Calculation Logic
For each asset:
1. Fetch 14-day price history
2. Calculate RSI (14-period standard)
3. Get 30-day price change %
4. Score = weighted combo:
   - RSI normalized (0-100): 40%
   - 30d momentum (clamped -30% to +30%, normalized): 30%
   - Proximity to 52-week high (normalized): 30%
5. Zone: GREEN (score ≥ 70), YELLOW (40-69), RED (< 40)
6. Signal: BUY (score ≥ 65), HOLD (40-64), SELL (< 40)
7. Macro: BULLISH if BTC score > 60, BEARISH if < 40, else NEUTRAL

## Color Scheme (exact match to reference)
- Background: #1a2332
- Primary text: #FFFFFF
- Amber/gold fill: #F5A623 (YELLOW zone)
- Red fill: #FF5555 (RED zone)
- Green fill: #00CC88 (GREEN zone)  
- Muted gray: #7A8A9A (unfilled bar, labels)
- Accent green text: #00CC88
- Font: Inter (Google Fonts)

## API Routes
Create `/api/btc-data` route that:
1. Fetches all data server-side
2. Calculates scores for all assets
3. Returns JSON with: { btc: { price, score, zone, rsi, signal, macro }, sector: [{ticker, score, zone}] }
4. Cache: revalidate every 300 seconds (5 min)

## App Structure
```
btc-thermometer/
  app/
    page.tsx          # main dashboard (client, polls /api/btc-data every 5min)
    api/
      btc-data/
        route.ts      # server-side data fetching + score calc
    layout.tsx        # Inter font, dark bg
  components/
    ThermometerBar.tsx  # reusable horizontal bar component
    ScoreCard.tsx       # left column card
    SectorRow.tsx       # right column row
  lib/
    calculations.ts   # RSI + score math
  package.json
  tailwind.config.ts
  next.config.ts
  tsconfig.json
```

## Auto-refresh
Dashboard auto-refreshes data every 5 minutes using setInterval + fetch.
Show a small pulsing dot when refreshing.

## OG Image
Add og:image meta tag pointing to a snapshot endpoint.

## Deployment
1. After building, run: `git add -A && git commit -m "feat: BTC thermometer dashboard"`
2. Create GitHub repo: `gh repo create tommio90/btc-thermometer --public --source=. --push`
3. Deploy to Vercel: `vercel --prod --yes`
4. When done, run: `openclaw system event --text "Done: BTC Thermometer deployed at <vercel-url>" --mode now`
