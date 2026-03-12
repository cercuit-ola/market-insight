// useInsightCooldown.ts
// Manages the 12-hour rate limit for the Generate Insights button.
// Uses localStorage so the cooldown persists across page refreshes.

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "market_brief_last_insight_ts";
const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface CooldownState {
  /** Whether the button is currently locked */
  isLocked: boolean;
  /** Human-readable time remaining, e.g. "9h 42m" — empty string when unlocked */
  timeRemaining: string;
  /** Call this when the user clicks Generate Insights */
  startCooldown: () => void;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function useInsightCooldown(): CooldownState {
  const getStoredTs = (): number | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? parseInt(raw, 10) : null;
    } catch {
      return null;
    }
  };

  const getRemainingMs = (): number => {
    const ts = getStoredTs();
    if (!ts) return 0;
    const elapsed = Date.now() - ts;
    return Math.max(0, COOLDOWN_MS - elapsed);
  };

  const [remainingMs, setRemainingMs] = useState<number>(getRemainingMs);

  // Tick every 60 seconds to update the display
  useEffect(() => {
    if (remainingMs <= 0) return;
    const interval = setInterval(() => {
      const r = getRemainingMs();
      setRemainingMs(r);
      if (r <= 0) clearInterval(interval);
    }, 60_000);
    return () => clearInterval(interval);
  }, [remainingMs > 0]);

  const startCooldown = useCallback(() => {
    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      // localStorage unavailable — cooldown still works in-memory for the session
    }
    setRemainingMs(COOLDOWN_MS);
  }, []);

  return {
    isLocked: remainingMs > 0,
    timeRemaining: formatRemaining(remainingMs),
    startCooldown,
  };
}
