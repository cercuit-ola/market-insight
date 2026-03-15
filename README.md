# MarketBrief

Daily market intelligence platform. Aggregated performance data and AI-driven insights for S&P 500, Nigerian Exchange, and global markets.

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the root:

```
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

Get a free DeepSeek API key at [platform.deepseek.com](https://platform.deepseek.com).

## Features

- Live market cards for S&P 500, NGX Nigeria, and Bloomberg Global
- AI Market Insight card with static daily summary
- **Generate Insights** — on-demand AI insight generation (rate limited to once every 12 hours)
- Email signup for daily digest

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- DeepSeek API (for AI insight generation)
