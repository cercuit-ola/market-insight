// api/email-digest.js
// Vercel Cron function — runs at 9AM and 9PM WAT (8AM and 8PM UTC).
// Generates a Bloomberg-quality market brief via Gemini and emails it via Gmail SMTP.
// Protected by CRON_SECRET so only Vercel can trigger it.

const https = require("https");
const nodemailer = require("nodemailer");

// ─── Gemini call (same as generate-insights.js) ──────────────────────────────

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
            reject(new Error("Bad JSON: " + raw.slice(0, 200)));
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
  const s = clean.indexOf("{");
  const e = clean.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("No JSON in AI response");
  return JSON.parse(clean.slice(s, e + 1));
}

function buildEmailPrompt(session) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const isEvening = session === "evening";

  return `You are a Bloomberg terminal analyst. Today is ${dateStr}.
This is the ${isEvening ? "EVENING CLOSE" : "MORNING PRE-MARKET"} edition of MarketBrief.

Generate a comprehensive market intelligence report. Respond ONLY with valid JSON (no markdown, no preamble). Start with { and end with }.

{
  "edition": "${isEvening ? "Evening Close" : "Morning Brief"}",
  "headline": "Write a punchy 8-10 word headline capturing the day's dominant market theme",
  "mood": "${isEvening ? "bullish|bearish|mixed" : "cautious|bullish|bearish|mixed"}",
  "sp500": {
    "level": "5XXX.XX",
    "change": "+X.XX%",
    "direction": "up|down|flat",
    "analysis": "Two specific sentences about S&P 500 performance, key drivers, and sector rotation."
  },
  "ngx": {
    "allshare": "1XXXXX.XX",
    "change": "+X.XX%",
    "direction": "up|down|flat",
    "analysis": "Two specific sentences about NGX performance, banking sector, and macro factors like oil/naira."
  },
  "topGainers": [
    { "ticker": "TICKER", "name": "Company Name", "change": "+X.X%", "reason": "One specific sentence." },
    { "ticker": "TICKER", "name": "Company Name", "change": "+X.X%", "reason": "One specific sentence." },
    { "ticker": "TICKER", "name": "Company Name", "change": "+X.X%", "reason": "One specific sentence." },
    { "ticker": "TICKER", "name": "Company Name", "change": "+X.X%", "reason": "One specific sentence." },
    { "ticker": "TICKER", "name": "Company Name", "change": "+X.X%", "reason": "One specific sentence." }
  ],
  "promisingStocks": [
    { "ticker": "TICKER", "name": "Company Name", "insight": "One short specific insight on momentum/outlook." },
    { "ticker": "TICKER", "name": "Company Name", "insight": "One short specific insight on momentum/outlook." },
    { "ticker": "TICKER", "name": "Company Name", "insight": "One short specific insight on momentum/outlook." }
  ],
  "globalMarkets": {
    "dow": { "value": "4XXXX", "change": "+X.X%", "dir": "up" },
    "nasdaq": { "value": "1XXXX", "change": "+X.X%", "dir": "up" },
    "ftse": { "value": "XXXX", "change": "-X.X%", "dir": "down" },
    "crude": { "value": "$XX.XX", "change": "+X.X%", "dir": "up" },
    "gold": { "value": "$XXXX", "change": "+X.X%", "dir": "up" },
    "usdngn": { "value": "XXXX", "change": "-X.X%", "dir": "down" }
  },
  "keyNews": [
    { "headline": "Specific financial news headline", "impact": "One sentence market impact." },
    { "headline": "Specific financial news headline", "impact": "One sentence market impact." },
    { "headline": "Nigeria/Africa focused headline", "impact": "One sentence impact for Nigerian investors." }
  ],
  "generalInsight": "A Bloomberg-quality 3-sentence summary of the most important market narrative today, what drove moves, and what to watch next session.",
  "disclaimer": "For informational purposes only. Not financial advice. Always do your own research."
}

Use realistic specific numbers. Mix US, global, and Nigerian stocks in gainers/promising. Be precise and data-driven.`;
}

async function generateEmailBrief(apiKey, session) {
  const path = `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const result = await httpsPost(
    "generativelanguage.googleapis.com",
    path,
    { "Content-Type": "application/json" },
    {
      contents: [{ parts: [{ text: buildEmailPrompt(session) }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
    }
  );

  if (result.status !== 200) {
    const msg = result.body?.error?.message || JSON.stringify(result.body).slice(0, 200);
    throw new Error(`Gemini API error ${result.status}: ${msg}`);
  }

  const text = result.body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return extractJSON(text);
}

// ─── HTML email builder ───────────────────────────────────────────────────────

function buildEmailHTML(d, session) {
  const isEvening = session === "evening";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const dirColor = (dir) =>
    dir === "up" ? "#16a34a" : dir === "down" ? "#dc2626" : "#6b7280";

  const moodColor = (mood) => {
    if (!mood) return "#6b7280";
    if (mood.includes("bull")) return "#16a34a";
    if (mood.includes("bear")) return "#dc2626";
    return "#d97706";
  };

  const globalRows = d.globalMarkets
    ? Object.entries({
        "Dow Jones": d.globalMarkets.dow,
        NASDAQ: d.globalMarkets.nasdaq,
        "FTSE 100": d.globalMarkets.ftse,
        "Crude Oil": d.globalMarkets.crude,
        Gold: d.globalMarkets.gold,
        "USD/NGN": d.globalMarkets.usdngn,
      })
        .map(
          ([name, idx]) => `
      <tr>
        <td style="padding:7px 0;font-family:monospace;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6">${name}</td>
        <td style="padding:7px 0;text-align:center;font-size:14px;font-family:Georgia,serif;border-bottom:1px solid #f3f4f6">${idx?.value || "—"}</td>
        <td style="padding:7px 0;text-align:right;font-family:monospace;font-size:12px;font-weight:700;color:${dirColor(idx?.dir)};border-bottom:1px solid #f3f4f6">${idx?.change || "—"}</td>
      </tr>`
        )
        .join("")
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>MarketBrief — ${d.edition || (isEvening ? "Evening Close" : "Morning Brief")}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:20px 16px">
<table width="620" cellpadding="0" cellspacing="0" style="background:#fafaf9;max-width:620px">

  <!-- MASTHEAD -->
  <tr><td style="padding:28px 28px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:3px double #111827;padding-bottom:14px;margin-bottom:20px">
      <tr>
        <td>
          <div style="font-family:monospace;font-size:9px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;margin-bottom:6px">AI-POWERED FINANCIAL INTELLIGENCE</div>
          <div style="font-size:36px;color:#111827;line-height:1.1">Market<em style="color:#2563eb;font-style:italic">Brief</em></div>
        </td>
        <td align="right" valign="bottom">
          <div style="font-family:monospace;font-size:9px;color:#9ca3af;line-height:1.8">
            ${dateStr.toUpperCase()}<br/>
            ${isEvening ? "EVENING CLOSE EDITION" : "MORNING BRIEF EDITION"}<br/>
            <span style="color:#2563eb;font-weight:700">${(d.mood || "mixed").toUpperCase()}</span>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- HEADLINE -->
  <tr><td style="padding:0 28px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111827">
      <tr><td style="padding:16px 20px">
        <div style="font-family:monospace;font-size:9px;letter-spacing:3px;color:#2563eb;text-transform:uppercase;margin-bottom:6px">TODAY'S SIGNAL</div>
        <div style="font-size:18px;color:#f9fafb;font-style:italic;font-family:Georgia,serif;line-height:1.4">${d.headline || "Market Intelligence Report"}</div>
        <div style="margin-top:10px">
          <span style="background:${moodColor(d.mood)};color:#fff;padding:3px 10px;font-family:monospace;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase">${(d.mood || "mixed").toUpperCase()}</span>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- S&P 500 + NGX ROW -->
  <tr><td style="padding:0 28px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;background:#fff">
      <tr>
        <td width="50%" valign="top" style="padding:14px 16px;border-right:1px solid #e5e7eb">
          <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:4px">S&P 500</div>
          <div style="font-size:28px;color:#111827;font-family:Georgia,serif">${d.sp500?.level || "—"}</div>
          <div style="font-family:monospace;font-size:13px;font-weight:700;color:${dirColor(d.sp500?.direction)};margin-bottom:8px">${d.sp500?.change || "—"}</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.7;font-family:Georgia,serif">${d.sp500?.analysis || ""}</div>
        </td>
        <td width="50%" valign="top" style="padding:14px 16px">
          <div style="font-family:monospace;font-size:9px;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:4px">NGX ALL-SHARE</div>
          <div style="font-size:28px;color:#111827;font-family:Georgia,serif">${d.ngx?.allshare || "—"}</div>
          <div style="font-family:monospace;font-size:13px;font-weight:700;color:${dirColor(d.ngx?.direction)};margin-bottom:8px">${d.ngx?.change || "—"}</div>
          <div style="font-size:12px;color:#6b7280;line-height:1.7;font-family:Georgia,serif">${d.ngx?.analysis || ""}</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- GLOBAL MARKETS -->
  ${globalRows ? `
  <tr><td style="padding:0 28px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;background:#fff">
      <tr><td style="padding:10px 16px;border-bottom:2px solid #111827">
        <div style="font-family:monospace;font-size:9px;letter-spacing:3px;color:#2563eb;text-transform:uppercase">GLOBAL MARKETS</div>
      </td></tr>
      <tr><td style="padding:6px 16px 12px">
        <table width="100%" cellpadding="0" cellspacing="0">${globalRows}</table>
      </td></tr>
    </table>
  </td></tr>` : ""}

  <!-- TOP GAINERS -->
  <tr><td style="padding:0 28px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;background:#fff">
      <tr><td style="padding:10px 16px;border-bottom:2px solid #111827">
        <div style="font-family:monospace;font-size:9px;letter-spacing:3px;color:#2563eb;text-transform:uppercase">TOP 5 GAINERS</div>
      </td></tr>
      <tr><td style="padding:6px 16px 12px">
        ${(d.topGainers || []).map(s => `
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #f3f4f6">
          <tr>
            <td style="padding:8px 0 4px">
              <span style="font-family:monospace;font-weight:700;font-size:13px;color:#111827">${s.ticker}</span>
              <span style="font-size:12px;color:#9ca3af;margin-left:8px;font-family:Georgia,serif">${s.name}</span>
            </td>
            <td align="right" style="font-family:monospace;font-size:13px;font-weight:700;color:#16a34a;white-space:nowrap">${s.change}</td>
          </tr>
          <tr><td colspan="2" style="padding:0 0 8px;font-size:12px;color:#6b7280;font-family:Georgia,serif;line-height:1.5">${s.reason}</td></tr>
        </table>`).join("")}
      </td></tr>
    </table>
  </td></tr>

  <!-- PROMISING STOCKS -->
  <tr><td style="padding:0 28px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;background:#fff">
      <tr><td style="padding:10px 16px;border-bottom:2px solid #111827">
        <div style="font-family:monospace;font-size:9px;letter-spacing:3px;color:#2563eb;text-transform:uppercase">PROMISING STOCKS TO WATCH</div>
      </td></tr>
      <tr><td style="padding:6px 16px 12px">
        ${(d.promisingStocks || []).map(s => `
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #f3f4f6">
          <tr><td style="padding:8px 0 4px">
            <span style="font-family:monospace;font-weight:700;font-size:13px;color:#111827">${s.ticker}</span>
            <span style="font-size:12px;color:#9ca3af;margin-left:8px;font-family:Georgia,serif">${s.name}</span>
          </td></tr>
          <tr><td style="padding:0 0 8px;font-size:12px;color:#6b7280;font-family:Georgia,serif;line-height:1.5">${s.insight}</td></tr>
        </table>`).join("")}
      </td></tr>
    </table>
  </td></tr>

  <!-- KEY NEWS -->
  ${(d.keyNews || []).length > 0 ? `
  <tr><td style="padding:0 28px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;background:#fff">
      <tr><td style="padding:10px 16px;border-bottom:2px solid #111827">
        <div style="font-family:monospace;font-size:9px;letter-spacing:3px;color:#2563eb;text-transform:uppercase">KEY NEWS & MACRO</div>
      </td></tr>
      <tr><td style="padding:6px 16px 12px">
        ${d.keyNews.map(n => `
        <div style="border-left:3px solid #2563eb;padding:6px 0 6px 12px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:700;color:#111827;font-family:Georgia,serif;margin-bottom:3px">${n.headline}</div>
          <div style="font-size:12px;color:#6b7280;font-family:Georgia,serif;line-height:1.5">${n.impact}</div>
        </div>`).join("")}
      </td></tr>
    </table>
  </td></tr>` : ""}

  <!-- GENERAL INSIGHT -->
  <tr><td style="padding:0 28px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;background:#fff">
      <tr><td style="padding:10px 16px;border-bottom:2px solid #111827">
        <div style="font-family:monospace;font-size:9px;letter-spacing:3px;color:#2563eb;text-transform:uppercase">AI MARKET INSIGHT</div>
      </td></tr>
      <tr><td style="padding:14px 16px">
        <div style="font-size:13px;color:#374151;line-height:1.8;font-family:Georgia,serif">${d.generalInsight || ""}</div>
      </td></tr>
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:0 28px 28px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:3px double #111827;padding-top:14px;margin-top:4px">
      <tr><td align="center" style="font-family:monospace;font-size:9px;color:#9ca3af;line-height:2">
        MARKETBRIEF · AI-GENERATED MARKET INTELLIGENCE<br/>
        Generated ${now.toLocaleTimeString()} · ${dateStr}<br/>
        <span style="color:#2563eb">Not financial advice. Always do your own research.</span>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Protect the endpoint — only Vercel Cron (with secret) or manual trigger
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers["authorization"] || "";
  if (secret && authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const smtpUser  = process.env.SMTP_USER;
  const smtpPass  = process.env.SMTP_PASS;
  const recipient = process.env.RECIPIENT_EMAIL || smtpUser;

  if (!geminiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set" });
  if (!smtpUser)  return res.status(500).json({ error: "SMTP_USER not set" });
  if (!smtpPass)  return res.status(500).json({ error: "SMTP_PASS not set" });

  // Determine session: 9AM WAT = 8AM UTC, 9PM WAT = 20:00 UTC
  const utcHour = new Date().getUTCHours();
  const session = utcHour >= 12 ? "evening" : "morning";

  try {
    const data = await generateEmailBrief(geminiKey, session);
    const html = buildEmailHTML(data, session);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const editionLabel = session === "evening" ? "Evening Close" : "Morning Brief";

    await transporter.sendMail({
      from: `"MarketBrief 📊" <${smtpUser}>`,
      to: recipient,
      subject: `📊 MarketBrief ${editionLabel} — ${dateLabel}`,
      html,
    });

    return res.status(200).json({
      success: true,
      message: `${editionLabel} sent to ${recipient}`,
      session,
    });
  } catch (err) {
    console.error("[email-digest] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
