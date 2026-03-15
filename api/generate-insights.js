// api/generate-insights.js
// Vercel serverless function — runs on the SERVER, so GEMINI_API_KEY is never
// exposed to the browser. The frontend calls /.netlify/... replaced by /api/generate-insights.
// Free Gemini 1.5 Flash: 1,500 req/day, no credit card needed.

const https = require("https");

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path,
        method: "POST",
        headers: { ...headers, "Content-Length": Buffer.byteLength(data) },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            reject(new Error("Bad JSON from Gemini: " + raw.slice(0, 300)));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function extractJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1)
    throw new Error("No JSON object found in AI response");
  return JSON.parse(clean.slice(start, end + 1));
}

function buildPrompt() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/New_York",
  });

  return `You are a Bloomberg-level financial market analyst. Today is ${today}, ${time} ET.

Generate a detailed, realistic morning market intelligence report covering:
- S&P 500 and US markets
- International markets (Europe, Asia-Pacific)
- Nigerian Stock Exchange (NGX)
- Commodities (Oil, Gold)
- Key macro events/news

Respond ONLY with a valid JSON object — no markdown fences, no text before or after. Start your response with { and end with }.

{
  "topGainers": [
    { "ticker": "NVDA", "name": "NVIDIA Corporation", "change": "+4.2%", "reason": "Specific one-sentence reason based on current market themes." },
    { "ticker": "META", "name": "Meta Platforms", "change": "+3.1%", "reason": "Specific one-sentence reason." },
    { "ticker": "DANGCEM", "name": "Dangote Cement", "change": "+5.1%", "reason": "Specific one-sentence reason, NGX context." },
    { "ticker": "ASML", "name": "ASML Holding", "change": "+3.2%", "reason": "Specific one-sentence reason, European context." },
    { "ticker": "GTCO", "name": "GT Holding Co", "change": "+2.8%", "reason": "Specific one-sentence reason, Nigeria banking sector." }
  ],
  "promisingStocks": [
    { "ticker": "MSFT", "name": "Microsoft Corporation", "insight": "Specific short momentum insight." },
    { "ticker": "MTNN", "name": "MTN Nigeria", "insight": "Specific short insight, Nigerian telecom context." },
    { "ticker": "AMZN", "name": "Amazon.com", "insight": "Specific short momentum insight." },
    { "ticker": "AIRTELAFRI", "name": "Airtel Africa", "insight": "Specific short insight." },
    { "ticker": "TSMC", "name": "Taiwan Semiconductor", "insight": "Specific short insight, semiconductor cycle." }
  ],
  "generalInsight": "A Bloomberg-quality 3-4 sentence summary of global market conditions today. Cover US equities, macro drivers (Fed, yields, inflation), Nigeria/Africa outlook, and key risks investors should watch. Be specific and data-driven."
}

Use realistic numbers and specific current themes. Do not reuse the exact example tickers — generate the actual top movers based on current market knowledge.`;
}

async function callGemini(apiKey) {
  const path = `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const result = await httpsPost(
    "generativelanguage.googleapis.com",
    path,
    { "Content-Type": "application/json" },
    {
      contents: [{ parts: [{ text: buildPrompt() }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    }
  );

  if (result.status !== 200) {
    const msg = result.body?.error?.message || JSON.stringify(result.body).slice(0, 200);
    throw new Error(`Gemini API error ${result.status}: ${msg}`);
  }

  const text = result.body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  return extractJSON(text);
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured on the server. Add it in Vercel Environment Variables.",
    });
  }

  try {
    const data = await callGemini(apiKey);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("[generate-insights] Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
