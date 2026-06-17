import { motion } from "framer-motion";
import { AlertTriangle, Send, X } from "lucide-react";

export function DeviateBanner({
  onReport,
  onDismiss,
}: {
  onReport: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -90, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex items-center gap-3 border-b border-bad/40 bg-bad/10 px-5 py-3 backdrop-blur"
    >
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bad opacity-70" />
        <span className="relative inline-flex h-3 w-3 items-center justify-center rounded-full bg-bad">
          <AlertTriangle className="h-2.5 w-2.5 text-ink" />
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-semibold text-bad">偏离路线提醒</div>
        <div className="truncate text-xs text-slate-100/80">检测到车辆偏离规划线路，请确认或一键报备</div>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onReport}
        className="flex items-center gap-1.5 rounded-xl bg-amber px-3 py-2 font-display text-sm font-semibold text-ink"
      >
        <Send className="h-4 w-4" />
        一键报备
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onDismiss}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-slatey hover:text-slate-100"
        aria-label="忽略"
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
