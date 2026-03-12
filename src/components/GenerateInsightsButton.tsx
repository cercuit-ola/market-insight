// GenerateInsightsButton.tsx
// Self-contained CTA button + generated output panel.
// Placed directly below the AIInsightCard. Does NOT modify any existing component.

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { generateMarketInsights } from "@/services/insightAgent";
import type { GeneratedInsight } from "@/services/insightAgent";
import { useInsightCooldown } from "@/hooks/useInsightCooldown";
import GeneratedInsightPanel from "./GeneratedInsightPanel";

const GenerateInsightsButton = () => {
  const { isLocked, timeRemaining, startCooldown } = useInsightCooldown();
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<GeneratedInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isLocked || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateMarketInsights();
      setInsight(result);
      startCooldown();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLocked || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
      className="rounded-lg bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      {/* Button row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Fresh Market Intelligence
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isLocked
              ? `Next refresh available in ${timeRemaining}`
              : "Generate an up-to-date AI analysis of global and Nigerian markets."}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isDisabled}
          aria-label={
            isLoading
              ? "Generating insights…"
              : isLocked
              ? `Locked — available in ${timeRemaining}`
              : "Generate Insights"
          }
          className={[
            "inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDisabled
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : isLocked ? (
            <>
              <Clock className="h-4 w-4" />
              Locked ({timeRemaining})
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Generate Insights
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Generated output panel */}
      <GeneratedInsightPanel insight={insight} />
    </motion.div>
  );
};

export default GenerateInsightsButton;
