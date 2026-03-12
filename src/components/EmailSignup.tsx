import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

const EmailSignup = () => {
  const [email, setEmail] = useState("samuelcenaokediji@gmail.com");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Wire to backend
    setTimeout(() => {
      toast.success("You're subscribed! Daily insights will arrive by 9 AM.");
      setLoading(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
      className="rounded-lg bg-card p-6 shadow-card"
    >
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Get Daily Insights
        </h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Receive AI-powered market analysis in your inbox every morning at 9 AM.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="active:scale-[0.98] transform-gpu">
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </motion.div>
  );
};

export default EmailSignup;
