import type { StockData } from "@/types/market";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockListProps {
  stocks: StockData[];
  type: "top" | "low";
}

const StockList = ({ stocks, type }: StockListProps) => {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        {type === "top" ? (
          <TrendingUp className="h-4 w-4 text-positive" />
        ) : (
          <TrendingDown className="h-4 w-4 text-destructive" />
        )}
        <h3 className="text-sm font-medium text-foreground">
          {type === "top" ? "Top Performers" : "Bottom Performers"}
        </h3>
      </div>
      <div className="divide-y divide-border/50">
        {stocks.map((stock) => (
          <div
            key={stock.ticker}
            className="flex items-center justify-between py-2.5"
          >
            <div className="min-w-0">
              <span className="text-sm font-medium text-foreground">
                {stock.ticker}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                {stock.name}
              </span>
            </div>
            <div className="flex items-center gap-3 tabular-nums">
              <span className="text-sm text-foreground">
                ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`text-sm font-medium ${
                  stock.change >= 0 ? "text-positive" : "text-destructive"
                }`}
              >
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockList;
