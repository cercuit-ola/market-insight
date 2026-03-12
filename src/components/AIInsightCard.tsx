import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface AIInsightCardProps {
  summary: string;
  generatedAt: string;
}

const AIInsightCard = ({ summary, generatedAt }: AIInsightCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-lg bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          AI Market Insight
        </h2>
      </div>
      <p className="text-sm leading-relaxed text-foreground" style={{ textWrap: "pretty" }}>
        {summary}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Generated {new Date(generatedAt).toLocaleString()}
      </p>
    </motion.div>
  );
};

export default AIInsightCard;
