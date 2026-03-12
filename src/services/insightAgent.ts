// insightAgent.ts
// Modular service for generating AI market insights via DeepSeek API.
// Completely isolated — does not touch any existing logic.

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

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function buildPrompt(): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `You are a financial market analyst. Today is ${today}.

Generate a realistic, detailed market intelligence report covering:
1. S&P 500 / US markets
2. International markets (Europe, Asia)
3. Nigerian Stock Exchange (NGX)

Respond ONLY with valid JSON — no markdown fences, no text before or after. Use exactly this schema:

{
  "topGainers": [
    { "ticker": "NVDA", "name": "NVIDIA Corporation", "change": "+4.2%", "reason": "One sentence explaining why this stock is performing well today." },
    { "ticker": "META", "name": "Meta Platforms", "change": "+3.1%", "reason": "One sentence explaining performance." },
    { "ticker": "DANGCEM", "name": "Dangote Cement", "change": "+5.1%", "reason": "One sentence explaining performance." },
    { "ticker": "ASML", "name": "ASML Holding", "change": "+3.2%", "reason": "One sentence explaining performance." },
    { "ticker": "GTCO", "name": "GT Holding Co", "change": "+2.8%", "reason": "One sentence explaining performance." }
  ],
  "promisingStocks": [
    { "ticker": "MSFT", "name": "Microsoft Corporation", "insight": "One short insight about momentum or outlook." },
    { "ticker": "MTNN", "name": "MTN Nigeria", "insight": "One short insight about momentum or outlook." },
    { "ticker": "AMZN", "name": "Amazon.com", "insight": "One short insight about momentum or outlook." },
    { "ticker": "AIRTELAFRI", "name": "Airtel Africa", "insight": "One short insight about momentum or outlook." },
    { "ticker": "TSMC", "name": "Taiwan Semiconductor", "insight": "One short insight about momentum or outlook." }
  ],
  "generalInsight": "A 2-3 sentence AI-generated summary of important global market trends, key macro drivers, and what investors should watch today. Include context on US markets, Nigeria/Africa, and global macro."
}

Use realistic, specific, plausible data. Vary the stocks from the examples above based on current market themes.`;
}

function parseInsightResponse(text: string): GeneratedInsight {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No valid JSON found in AI response");
  }
  const parsed = JSON.parse(clean.slice(start, end + 1));
  if (!parsed.topGainers || !parsed.promisingStocks || !parsed.generalInsight) {
    throw new Error("AI response missing required fields");
  }
  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateMarketInsights(): Promise<GeneratedInsight> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_DEEPSEEK_API_KEY is not set. Add it to your .env file."
    );
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: buildPrompt() }],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from DeepSeek API");
  }

  return parseInsightResponse(text);
}
