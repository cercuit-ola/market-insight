import { motion } from "framer-motion";
import type { MarketData } from "@/types/market";
import StockList from "./StockList";

interface MarketCardProps {
  data: MarketData;
  index: number;
}

const MarketCard = ({ data, index }: MarketCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        delay: 0.05 * (index + 1),
      }}
      className="rounded-lg bg-card p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {data.market}
        </h2>
        <span
          className={`text-lg font-semibold tabular-nums ${
            data.change >= 0 ? "text-positive" : "text-destructive"
          }`}
        >
          {data.change >= 0 ? "+" : ""}
          {data.change.toFixed(2)}%
        </span>
      </div>

      <div className="space-y-4">
        <StockList stocks={data.top} type="top" />
        <StockList stocks={data.low} type="low" />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Updated {new Date(data.lastUpdated).toLocaleString()}
      </p>
    </motion.div>
  );
};

export default MarketCard;
