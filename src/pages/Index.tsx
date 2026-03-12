import { BarChart3 } from "lucide-react";
import AIInsightCard from "@/components/AIInsightCard";
import GenerateInsightsButton from "@/components/GenerateInsightsButton";
import MarketCard from "@/components/MarketCard";
import EmailSignup from "@/components/EmailSignup";
import { mockInsight } from "@/data/mockMarketData";
import { motion } from "framer-motion";

const Index = () => {
  const insight = mockInsight;

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            MarketBrief
          </h1>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Daily Market Intelligence.
            </h2>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              Aggregated performance data and AI-driven insights for the S&P 500,
              Nigerian Exchange, and more. Delivered daily.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* AI Insight */}
          <AIInsightCard
            summary={insight.summary}
            generatedAt={insight.generatedAt}
          />

          {/* Generate Insights CTA — placed directly below AI Market Insight card */}
          <GenerateInsightsButton />

          {/* Email Signup */}
          <EmailSignup />

          {/* Market Cards Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {insight.markets.map((market, i) => (
              <MarketCard key={market.market} data={market} index={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
