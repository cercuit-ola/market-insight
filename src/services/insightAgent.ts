// insightAgent.ts
// Calls the Vercel serverless function /api/generate-insights.
// The Gemini API key lives on the server — never in the browser bundle.

export interface GeneratedInsight {
  topGainers: {
    ticker: string;
    name: string;
    change: string;
    reason: string;
  }[];
  promisingStocks: {
    ticker: string;
    name: string;
    insight: string;
  }[];
  generalInsight: string;
  generatedAt: string;
}

export async function generateMarketInsights(): Promise<GeneratedInsight> {
  const response = await fetch("/api/generate-insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(
      json.error ||
        `Server returned ${response.status}. Make sure GEMINI_API_KEY is set in Vercel Environment Variables.`
    );
  }

  const d = json.data;

  if (!d?.topGainers || !d?.promisingStocks || !d?.generalInsight) {
    throw new Error("Unexpected response shape from server.");
  }

  return {
    topGainers: d.topGainers,
    promisingStocks: d.promisingStocks,
    generalInsight: d.generalInsight,
    generatedAt: new Date().toISOString(),
  };
}
