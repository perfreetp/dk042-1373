import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  MessageSquareText,
  Send,
  X,
} from "lucide-react";
import {
  DEVIATION_OPTION,
  REPORT_OPTIONS,
  nowHM,
  type ReportOption,
  type ReportReason,
} from "@/data/trip";
import { useTripStore } from "@/store/useTripStore";
import { getLocation, cn } from "@/lib/utils";

type Phase = "idle" | "note" | "done";

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
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase("idle");
      setPicked(null);
      setLoc("");
      setNote("");
      setSubmitting(false);
    }
  }, [open]);

  const options =
    extra === "偏离路线" ? [DEVIATION_OPTION, ...REPORT_OPTIONS] : REPORT_OPTIONS;

  function pickReason(opt: ReportOption) {
    setPicked(opt);
    setNote("");
    setPhase("note");
  }

  async function submit() {
    if (!picked) return;
    setSubmitting(true);
    const location = await getLocation();
    setLoc(location);
    addReport(picked.reason, location, note.trim());
    setSubmitting(false);
    setPhase("done");
    window.setTimeout(() => onClose(), 1600);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && (phase === "idle" || phase === "done") && onClose()}
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
                <h2 className="font-display text-xl font-semibold text-slate-100">
                  {phase === "note" ? "补充备注（可选）" : "一键报备"}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slatey">
                  <MapPin className="h-3.5 w-3.5 text-amber" />
                  {phase === "note"
                    ? "确认提交后将自动携带当前位置与时间"
                    : "选择原因，将自动携带当前位置与时间"}
                </p>
              </div>
              <button
                onClick={() => !submitting && onClose()}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-slatey hover:text-slate-100 disabled:opacity-50"
                disabled={submitting}
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
                {note ? (
                  <div className="max-w-sm rounded-xl border border-good/20 bg-ink/40 px-3 py-2 text-xs text-slate-200">
                    备注：{note}
                  </div>
                ) : null}
              </motion.div>
            ) : phase === "note" && picked ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-amber/40 bg-amber/[0.06] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber/50 bg-amber/15 text-amber">
                    <picked.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold text-slate-100">
                      {picked.reason}
                    </div>
                    <div className="truncate text-xs text-slatey">{picked.desc}</div>
                  </div>
                </div>

                <label className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slatey">
                    <MessageSquareText className="h-3.5 w-3.5 text-amber" />
                    情况备注（补充一句更便于车队追溯，可留空）
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder="如：大概堵了 10 分钟、绕行 XX 路、有轻微刮擦无人员受伤等"
                    className="w-full resize-none rounded-2xl border border-line bg-ink/60 p-3 text-sm text-slate-100 placeholder:text-slatey-dim focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/40"
                  />
                </label>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setPhase("idle")}
                    disabled={submitting}
                    className="rounded-2xl border border-line px-5 py-3 font-display text-sm text-slatey hover:text-slate-100 disabled:opacity-50"
                  >
                    返回
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    disabled={submitting}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 font-display font-semibold no-tap disabled:opacity-70",
                      "bg-amber text-ink border-amber shadow-glow",
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        正在上报…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        确认并上报
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  const active = picked?.reason === opt.reason;
                  return (
                    <motion.button
                      key={opt.reason}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => pickReason(opt)}
                      disabled={submitting}
                      className="flex items-center gap-4 rounded-2xl border border-line bg-panel-2/50 p-4 text-left transition hover:border-amber/50 hover:bg-amber/[0.04] disabled:opacity-60"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-ink/40 text-amber">
                        {submitting && active ? (
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
