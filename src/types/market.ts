export interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
}

export interface MarketData {
  market: string;
  change: number;
  top: StockData[];
  low: StockData[];
  lastUpdated: string;
}

export interface MarketInsight {
  summary: string;
  markets: MarketData[];
  generatedAt: string;
}
