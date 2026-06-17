import { useEffect, useRef, useState } from "react";

const TICK_MS = 1300;

export function useSimSpeed(limit: number, onTickDistance: (km: number) => void) {
  const [speed, setSpeed] = useState(26);
  const cur = useRef(26);
  const cb = useRef(onTickDistance);
  cb.current = onTickDistance;

  useEffect(() => {
    const id = setInterval(() => {
      cur.current += (Math.random() - 0.42) * 11;
      cur.current = Math.max(10, Math.min(limit + 13, cur.current));
      setSpeed(cur.current);
      cb.current((cur.current * TICK_MS) / 3600000);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [limit]);

  return speed;
}
