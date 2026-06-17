import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import type { InspectionItem, InspectionResult } from "@/data/trip";
import { isAbnormalResolved } from "@/store/useTripStore";
import { PhotoCapture } from "./PhotoCapture";
import { cn } from "@/lib/utils";

interface Props {
  item: InspectionItem;
  index: number;
  onResult: (result: InspectionResult) => void;
  onPhoto: (photo: string | null) => void;
  onDesc: (text: string) => void;
}

export function InspectionCard({ item, index, onResult, onPhoto, onDesc }: Props) {
  const Icon = item.icon;
  const state = item.result;
  const resolved = isAbnormalResolved(item);

  const cardTone =
    state === "normal"
      ? "border-good/40 bg-good/[0.04]"
      : state === "abnormal"
        ? "border-bad/40 bg-bad/[0.04]"
        : "border-line bg-panel/60";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: index * 0.04 }}
      className={cn("overflow-hidden rounded-2xl border backdrop-blur-sm", cardTone)}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex flex-col items-center">
          <span className="num text-[0.7rem] text-slatey-dim">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
            state === "normal"
              ? "border-good/40 bg-good/10 text-good"
              : state === "abnormal"
                ? "border-bad/40 bg-bad/10 text-bad"
                : "border-line bg-panel-2 text-slatey",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold tracking-wide text-slate-100">
              {item.name}
            </h3>
            {state === "normal" && (
              <span className="inline-flex items-center gap-1 text-[0.65rem] text-good">
                <Check className="h-3 w-3" /> 正常
              </span>
            )}
            {state === "abnormal" && (
              <span className="inline-flex items-center gap-1 text-[0.65rem] text-bad">
                <AlertTriangle className="h-3 w-3" /> 异常
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-slatey">{item.hint}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ResultButton
            active={state === "normal"}
            tone="good"
            onClick={() => onResult(state === "normal" ? "pending" : "normal")}
          >
            正常
          </ResultButton>
          <ResultButton
            active={state === "abnormal"}
            tone="bad"
            onClick={() => onResult(state === "abnormal" ? "pending" : "abnormal")}
          >
            异常
          </ResultButton>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {state === "abnormal" && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-bad/20 p-4 sm:flex-row">
              <PhotoCapture photo={item.photo} onChange={onPhoto} />
              <div className="flex min-w-0 flex-1 flex-col">
                <textarea
                  value={item.description}
                  onChange={(e) => onDesc(e.target.value)}
                  rows={3}
                  placeholder="一句话描述异常情况（未拍照时必填）"
                  className="w-full resize-none rounded-xl border border-line bg-ink/60 p-3 text-sm text-slate-100 placeholder:text-slatey-dim focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/40"
                />
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  {resolved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-good" />
                      <span className="text-good">已记录，满足发车条件</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 text-bad" />
                      <span className="text-bad">需拍照或填写描述才能发车</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResultButton({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: "good" | "bad";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const toneCls =
    tone === "good"
      ? active
        ? "border-good bg-good text-ink shadow-glow-good"
        : "border-line text-slatey hover:text-good hover:border-good/50"
      : active
        ? "border-bad bg-bad text-ink shadow-glow-bad"
        : "border-line text-slatey hover:text-bad hover:border-bad/50";
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={cn(
        "min-w-[4.5rem] rounded-xl border px-3 py-2 font-display text-sm font-semibold tracking-wide no-tap",
        toneCls,
      )}
    >
      {children}
    </motion.button>
  );
}
