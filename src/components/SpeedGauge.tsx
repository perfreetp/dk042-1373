import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SpeedGauge({ speed, limit }: { speed: number; limit: number }) {
  const ratio = Math.max(0.04, Math.min(speed / (limit * 1.5), 1));
  const over = speed > limit;
  const color = over ? "#FF5A5F" : "#FFB300";

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative h-44 w-44 rounded-full",
          over && "animate-pulse-ring",
        )}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${color} ${ratio * 360}deg, #1B2531 ${ratio * 360}deg)`,
            transition: "background 0.6s ease",
          }}
        />
        <div className="absolute inset-[10px] rounded-full bg-ink shadow-inset" />
        <div className="absolute inset-[10px] rounded-full bg-[radial-gradient(80%_60%_at_50%_30%,rgba(255,179,0,0.08),transparent_70%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.round(speed)}
            initial={{ opacity: 0.6, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="num text-5xl font-bold tabular-nums"
            style={{ color }}
          >
            {Math.round(speed)}
          </motion.span>
          <span className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-slatey">km/h</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <div
            className={cn(
              "rounded-full border px-3 py-0.5 text-[0.65rem] font-display tracking-wide backdrop-blur",
              over ? "border-bad/50 bg-bad/15 text-bad" : "border-line bg-panel-2/80 text-slatey",
            )}
          >
            限速 {limit}
          </div>
        </div>
      </div>
      <div className="mt-3">
        {over ? (
          <span className="font-display text-sm font-semibold text-bad">⚠ 超速，请减速</span>
        ) : (
          <span className="font-display text-sm text-good">速度正常</span>
        )}
      </div>
    </div>
  );
}
