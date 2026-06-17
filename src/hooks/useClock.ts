import { useEffect, useState } from "react";
import { pad2 } from "@/lib/utils";

export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  const d = new Date(now);
  return {
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    ts: now,
  };
}
