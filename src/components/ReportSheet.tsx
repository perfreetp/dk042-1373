import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, MapPin, X } from "lucide-react";
import {
  DEVIATION_OPTION,
  REPORT_OPTIONS,
  nowHM,
  type ReportOption,
  type ReportReason,
} from "@/data/trip";
import { useTripStore } from "@/store/useTripStore";
import { getLocation, cn } from "@/lib/utils";

type Phase = "idle" | "loading" | "done";

export function ReportSheet({
  open,
  onClose,
  extra,
}: {
  open: boolean;
  onClose: () => void;
  extra?: ReportReason | null;
}) {
  const addReport = useTripStore((s) => s.addReport);
  const [phase, setPhase] = useState<Phase>("idle");
  const [picked, setPicked] = useState<ReportOption | null>(null);
  const [loc, setLoc] = useState("");

  useEffect(() => {
    if (open) {
      setPhase("idle");
      setPicked(null);
      setLoc("");
    }
  }, [open]);

  const options =
    extra === "偏离路线" ? [DEVIATION_OPTION, ...REPORT_OPTIONS] : REPORT_OPTIONS;

  async function report(opt: ReportOption) {
    setPicked(opt);
    setPhase("loading");
    const location = await getLocation();
    setLoc(location);
    addReport(opt.reason, location);
    setPhase("done");
    window.setTimeout(() => onClose(), 1500);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => phase === "idle" && onClose()}
            className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-3xl border-t border-line bg-panel p-6 pb-8"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-100">一键报备</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slatey">
                  <MapPin className="h-3.5 w-3.5 text-amber" />
                  选择原因，将自动携带当前位置与时间
                </p>
              </div>
              <button
                onClick={() => phase === "idle" && onClose()}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-slatey hover:text-slate-100"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {phase === "done" && picked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-good/40 bg-good/[0.06] p-8 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-good" />
                <div className="font-display text-lg font-semibold text-good">已上报</div>
                <div className="text-sm text-slate-100">
                  {picked.reason} · {nowHM()}
                </div>
                <div className="num text-xs text-slatey">{loc}</div>
              </motion.div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  const active = phase !== "idle" && picked?.reason === opt.reason;
                  return (
                    <motion.button
                      key={opt.reason}
                      whileTap={{ scale: 0.97 }}
                      disabled={phase !== "idle"}
                      onClick={() => report(opt)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border p-4 text-left transition",
                        active
                          ? "border-amber bg-amber/10 shadow-glow"
                          : "border-line bg-panel-2/50 hover:border-amber/50 hover:bg-amber/[0.04]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                          active ? "border-amber bg-amber/15 text-amber" : "border-line bg-ink/40 text-amber",
                        )}
                      >
                        {phase !== "idle" && active ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-base font-semibold text-slate-100">
                          {opt.reason}
                        </span>
                        <span className="block truncate text-xs text-slatey">{opt.desc}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
