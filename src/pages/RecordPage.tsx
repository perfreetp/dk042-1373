import { motion } from "framer-motion";
import {
  Bus,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck2,
  MapPin,
  RotateCcw,
  Route,
  Timer,
  UserRound,
} from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { POST_TRIP_ITEMS, type InspectionResult } from "@/data/trip";
import { StatusBar } from "@/components/StatusBar";
import { BigButton } from "@/components/BigButton";
import { StatTile } from "@/components/StatTile";
import { SectionLabel, StatusChip } from "@/components/StatusChip";

const resultMeta: Record<InspectionResult, { label: string; tone: "good" | "bad" | "muted" }> = {
  normal: { label: "正常", tone: "good" },
  abnormal: { label: "异常", tone: "bad" },
  pending: { label: "未检", tone: "muted" },
};

export default function RecordPage() {
  const record = useTripStore((s) => s.lastRecord);
  const resetTrip = useTripStore((s) => s.resetTrip);

  if (!record) {
    return (
      <div className="flex h-full items-center justify-center text-slatey">暂无驾驶记录</div>
    );
  }

  const abnormalCount = record.inspections.filter((i) => i.result === "abnormal").length;

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        title="驾驶记录 · 已留痕"
        subtitle={`${record.routeName} · ${record.tripId}`}
        accent="good"
        right={
          <StatusChip tone="good" pulse className="hidden md:inline-flex">
            <CheckCircle2 className="h-3 w-3" /> 已生成
          </StatusChip>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 rounded-2xl border border-good/40 bg-good/[0.05] p-5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-good/50 bg-good/15 text-good">
              <FileCheck2 className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-xl font-semibold text-slate-100">本趟驾驶记录已生成</div>
              <div className="mt-0.5 text-xs text-slatey">
                {record.date} · {record.startTime} – {record.endTime} · 用时 {record.durationMin} 分钟
              </div>
            </div>
          </motion.div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="行驶时长" value={record.durationMin} unit="min" icon={<Timer className="h-3.5 w-3.5" />} />
            <StatTile label="行驶里程" value={record.distanceKm} unit="km" icon={<MapPin className="h-3.5 w-3.5" />} />
            <StatTile label="检查异常" value={abnormalCount} tone={abnormalCount ? "bad" : "good"} icon={<ClipboardList className="h-3.5 w-3.5" />} />
            <StatTile label="途中报备" value={record.reports.length} tone={record.reports.length ? "amber" : "default"} icon={<Clock className="h-3.5 w-3.5" />} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-panel/60 p-5">
              <SectionLabel>行程信息</SectionLabel>
              <div className="mt-3 divide-y divide-hairline">
                <MetaRow icon={<Route className="h-4 w-4" />} label="线路" value={record.routeName} />
                <MetaRow icon={<Bus className="h-4 w-4" />} label="车号" value={record.vehicleNo} />
                <MetaRow icon={<UserRound className="h-4 w-4" />} label="司机" value={record.driverName} />
                <MetaRow icon={<CalendarDays className="h-4 w-4" />} label="日期" value={record.date} />
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-panel/60 p-5">
              <SectionLabel>收车确认</SectionLabel>
              <div className="mt-3 flex flex-col gap-2">
                {POST_TRIP_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-good" />
                    <span className="text-slate-100">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-line bg-panel/60 p-5">
            <SectionLabel>车辆检查明细</SectionLabel>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {record.inspections.map((i, idx) => {
                const meta = resultMeta[i.result];
                return (
                  <div key={idx} className="flex items-center gap-2 rounded-xl border border-hairline bg-panel-2/40 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{i.name}</span>
                    <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                  </div>
                );
              })}
            </div>
            {abnormalCount > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {record.inspections
                  .filter((i) => i.result === "abnormal" && i.description)
                  .map((i, idx) => (
                    <div key={idx} className="rounded-xl border border-bad/30 bg-bad/[0.05] px-3 py-2 text-xs text-slate-100">
                      <span className="text-bad">{i.name}：</span>
                      {i.description}
                    </div>
                  ))}
              </div>
            )}
          </section>

          {record.reports.length > 0 && (
            <section className="mt-4 rounded-2xl border border-line bg-panel/60 p-5">
              <SectionLabel>途中报备记录</SectionLabel>
              <div className="mt-3 flex flex-col gap-2">
                {record.reports.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border border-amber/30 bg-amber/[0.04] px-3 py-2">
                    <ClipboardList className="h-4 w-4 shrink-0 text-amber" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-100">{r.reason}</div>
                      <div className="num truncate text-[0.65rem] text-slatey">{r.location}</div>
                    </div>
                    <span className="num shrink-0 text-xs text-slatey">{r.time}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="z-20 border-t border-hairline bg-ink/85 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="flex items-center gap-2 text-sm text-slatey">
              <FileCheck2 className="h-4 w-4 text-good" />
              记录已本地留痕，可开始下一趟行程
            </div>
          </div>
          <BigButton variant="amber" onClick={resetTrip} icon={<RotateCcw className="h-5 w-5" />} className="shadow-glow">
            开始新趟次
          </BigButton>
        </div>
      </footer>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-slatey">{icon}</span>
      <span className="w-14 shrink-0 text-xs text-slatey">{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{value}</span>
    </div>
  );
}
