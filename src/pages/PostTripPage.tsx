import { motion } from "framer-motion";
import { Check, ChevronRight, ClipboardCheck, FileText } from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { POST_TRIP_ITEMS } from "@/data/trip";
import { StatusBar } from "@/components/StatusBar";
import { BigButton } from "@/components/BigButton";
import { SectionLabel, StatusChip } from "@/components/StatusChip";
import { cn } from "@/lib/utils";

export default function PostTripPage() {
  const trip = useTripStore((s) => s.trip);
  const postTrip = useTripStore((s) => s.postTrip);
  const togglePostTrip = useTripStore((s) => s.togglePostTrip);
  const finishTrip = useTripStore((s) => s.finishTrip);

  const confirmedCount = POST_TRIP_ITEMS.filter((i) => postTrip[i.key]).length;
  const allConfirmed = POST_TRIP_ITEMS.every((i) => postTrip[i.key]);

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        title="收车后确认"
        subtitle={`${trip.routeName} · ${trip.vehicleNo}`}
        accent={allConfirmed ? "good" : "amber"}
        right={
          <StatusChip tone={allConfirmed ? "good" : "amber"} pulse={allConfirmed} className="hidden md:inline-flex">
            {confirmedCount}/{POST_TRIP_ITEMS.length}
          </StatusChip>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <SectionLabel>结束确认</SectionLabel>
          </div>
          <p className="mt-2 text-sm text-slatey">
            逐项确认后生成本趟驾驶记录，供校车公司留痕。
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {POST_TRIP_ITEMS.map((item, i) => {
              const done = postTrip[item.key];
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 240, damping: 24 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => togglePostTrip(item.key)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-5 text-left transition",
                    done
                      ? "border-good/50 bg-good/[0.06] shadow-glow-good"
                      : "border-line bg-panel/60 hover:border-amber/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                      done ? "border-good bg-good/15 text-good" : "border-line bg-panel-2 text-slatey",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg font-semibold text-slate-100">{item.label}</div>
                    <div className="text-xs text-slatey">{item.desc}</div>
                  </div>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border transition",
                      done ? "border-good bg-good text-ink" : "border-line text-transparent",
                    )}
                  >
                    <Check className="h-5 w-5" />
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-panel/50 p-4 text-xs text-slatey">
            <ClipboardCheck className="h-4 w-4 text-amber" />
            确认完成后将生成本趟驾驶记录，包含检查异常、报备明细与行驶时长里程。
          </div>
        </div>
      </main>

      <footer className="z-20 border-t border-hairline bg-ink/85 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="flex items-center gap-2 text-sm text-slatey">
              <FileText className="h-4 w-4 text-amber" />
              {allConfirmed ? "三项已确认，可生成记录" : `还有 ${POST_TRIP_ITEMS.length - confirmedCount} 项未确认`}
            </div>
          </div>
          <BigButton
            variant={allConfirmed ? "good" : "outline"}
            disabled={!allConfirmed}
            onClick={finishTrip}
            icon={<FileText className="h-5 w-5" />}
            className={allConfirmed ? "shadow-glow-good" : ""}
          >
            生成本趟驾驶记录
            <ChevronRight className="h-5 w-5" />
          </BigButton>
        </div>
      </footer>
    </div>
  );
}
