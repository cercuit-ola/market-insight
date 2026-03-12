// GeneratedInsightPanel.tsx
// Displays the AI-generated insight output below the Generate button.
// Purely presentational — receives data as props.

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles, LineChart } from "lucide-react";
import type { GeneratedInsight } from "@/services/insightAgent";

interface GeneratedInsightPanelProps {
  insight: GeneratedInsight | null;
}

const GeneratedInsightPanel = ({ insight }: GeneratedInsightPanelProps) => {
  return (
    <AnimatePresence>
      {insight && (
        <motion.div
          key="insight-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="mt-4 space-y-5 border-t border-border pt-4"
        >
          {/* General Insight */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                General Market Insight
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {insight.generalInsight}
            </p>
          </div>

          {/* Top 5 Gainers */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-positive" />
              <h3 className="text-sm font-semibold text-foreground">
                Top 5 Gainers (Global Markets)
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {insight.topGainers.map((stock) => (
                <div key={stock.ticker} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {stock.ticker}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stock.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-positive">
                      {stock.change}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stock.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Promising Stocks */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Top 5 Promising Stocks
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {insight.promisingStocks.map((stock) => (
                <div key={stock.ticker} className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {stock.ticker}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stock.name}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stock.insight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground">
            Insight generated {new Date(insight.generatedAt).toLocaleString()}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GeneratedInsightPanel;
