import type { MarketInsight } from "@/types/market";

export const mockInsight: MarketInsight = {
  summary:
    "Markets showed mixed signals today. The S&P 500 edged higher led by tech gains with NVIDIA surging 4.2%, while the Nigerian stock exchange saw banking sector weakness with Zenith Bank declining 3.1%. Overall sentiment leans cautiously bullish as global investors weigh inflation data against strong corporate earnings.",
  generatedAt: new Date().toISOString(),
  markets: [
    {
      market: "S&P 500",
      change: 1.25,
      lastUpdated: new Date().toISOString(),
      top: [
        { ticker: "NVDA", name: "NVIDIA Corp", price: 924.79, change: 4.2 },
        { ticker: "META", name: "Meta Platforms", price: 502.3, change: 3.1 },
        { ticker: "AMZN", name: "Amazon.com", price: 186.51, change: 2.8 },
        { ticker: "MSFT", name: "Microsoft Corp", price: 425.22, change: 2.1 },
        { ticker: "AAPL", name: "Apple Inc", price: 191.56, change: 1.9 },
      ],
      low: [
        { ticker: "PFE", name: "Pfizer Inc", price: 26.81, change: -3.4 },
        { ticker: "BA", name: "Boeing Co", price: 178.44, change: -2.9 },
        { ticker: "DIS", name: "Walt Disney Co", price: 111.75, change: -2.1 },
        { ticker: "INTC", name: "Intel Corp", price: 31.09, change: -1.8 },
        { ticker: "KO", name: "Coca-Cola Co", price: 59.22, change: -1.2 },
      ],
    },
    {
      market: "NGX (Nigeria)",
      change: -0.45,
      lastUpdated: new Date().toISOString(),
      top: [
        { ticker: "DANGCEM", name: "Dangote Cement", price: 290.0, change: 5.1 },
        { ticker: "AIRTELAFRI", name: "Airtel Africa", price: 1850.0, change: 3.8 },
        { ticker: "MTNN", name: "MTN Nigeria", price: 230.5, change: 2.9 },
        { ticker: "BUACEMENT", name: "BUA Cement", price: 95.0, change: 2.1 },
        { ticker: "GTCO", name: "GT Holding Co", price: 38.5, change: 1.7 },
      ],
      low: [
        { ticker: "ZENITHBANK", name: "Zenith Bank", price: 35.2, change: -3.1 },
        { ticker: "FBNH", name: "FBN Holdings", price: 22.8, change: -2.5 },
        { ticker: "ACCESSCORP", name: "Access Holdings", price: 19.5, change: -2.0 },
        { ticker: "UBAGROUP", name: "UBA Group", price: 21.3, change: -1.6 },
        { ticker: "WAPCO", name: "Lafarge Africa", price: 29.9, change: -1.1 },
      ],
    },
    {
      market: "Bloomberg Global",
      change: 0.78,
      lastUpdated: new Date().toISOString(),
      top: [
        { ticker: "TSMC", name: "Taiwan Semi", price: 152.3, change: 3.9 },
        { ticker: "ASML", name: "ASML Holding", price: 912.5, change: 3.2 },
        { ticker: "SAP", name: "SAP SE", price: 188.4, change: 2.6 },
        { ticker: "NOVO-B", name: "Novo Nordisk", price: 125.8, change: 2.3 },
        { ticker: "TM", name: "Toyota Motor", price: 234.1, change: 1.5 },
      ],
      low: [
        { ticker: "BABA", name: "Alibaba Group", price: 73.4, change: -4.2 },
        { ticker: "NIO", name: "NIO Inc", price: 5.82, change: -3.5 },
        { ticker: "VALE", name: "Vale SA", price: 12.1, change: -2.8 },
        { ticker: "BP", name: "BP plc", price: 34.9, change: -1.9 },
        { ticker: "RIO", name: "Rio Tinto", price: 65.3, change: -1.3 },
      ],
    },
  ],
};
