import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bus,
  CalendarDays,
  ClipboardList,
  Clock,
  FileCheck2,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { type TripRecord, type InspectionResult } from "@/data/trip";
import { StatusBar } from "@/components/StatusBar";
import { SectionLabel, StatusChip } from "@/components/StatusChip";
import { RecordDetail } from "@/components/RecordDetail";

const resultMeta: Record<InspectionResult, { label: string; tone: "good" | "bad" | "muted" }> = {
  normal: { label: "正常", tone: "good" },
  abnormal: { label: "异常", tone: "bad" },
  pending: { label: "未检", tone: "muted" },
};

export default function RecordListPage() {
  const recordList = useTripStore((s) => s.recordList);
  const focusedRecordId = useTripStore((s) => s.focusedRecordId);
  const viewMode = useTripStore((s) => s.viewMode);
  const openRecordDetail = useTripStore((s) => s.openRecordDetail);

  const [q, setQ] = useState("");

  const focused = useMemo(
    () => (focusedRecordId ? recordList.find((r) => r.tripId === focusedRecordId) ?? null : null),
    [focusedRecordId, recordList],
  );

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return recordList;
    return recordList.filter((r) =>
      [r.date, r.routeName, r.vehicleNo, r.driverName, r.tripId]
        .join(" ")
        .toLowerCase()
        .includes(kw),
    );
  }, [q, recordList]);

  if (viewMode === "detail" && focused) {
    return (
      <div className="flex h-full flex-col">
        <StatusBar
          title={`${focused.routeName} · 详情`}
          subtitle={focused.tripId}
          accent="default"
          left={
            <button
              onClick={() => openRecordDetail(null)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-xs text-slatey hover:text-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              返回列表
            </button>
          }
          right={
            <StatusChip tone={focused.status === "completed" ? "good" : "amber"}>
              {focused.status === "completed" ? "已完成收车" : "执行中"}
            </StatusChip>
          }
        />
        <RecordDetail record={focused} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        title="历史驾驶记录"
        subtitle={`共 ${recordList.length} 趟 · 可按日期/车号/司机/线路检索`}
        accent="default"
        right={
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slatey" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索 日期 / 车号 / 司机 / 线路"
              className="h-9 w-full rounded-full border border-line bg-ink/60 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slatey focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/40"
            />
          </div>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="mx-auto max-w-5xl">
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-slatey">
              <FileCheck2 className="h-10 w-10 opacity-50" />
              <div className="text-sm">没有匹配的记录</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filtered.map((r, idx) => (
                <RecordCard key={r.tripId} record={r} index={idx} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RecordCard({ record, index }: { record: TripRecord; index: number }) {
  const openRecordDetail = useTripStore((s) => s.openRecordDetail);
  const abnormalCount = record.inspections.filter((i) => i.result === "abnormal").length;
  const postIncomplete =
    !record.postTripConfirm.vehicleParked ||
    !record.postTripConfirm.keysReturned ||
    !record.postTripConfirm.noStudentLeft;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => openRecordDetail(record.tripId)}
      className="group rounded-2xl border border-line bg-panel/60 p-4 text-left transition hover:border-amber/40 hover:bg-amber/[0.03]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="chip rounded-md bg-amber/10 px-2 py-0.5 font-display text-[0.7rem] text-amber">
              {record.tripId}
            </span>
            <StatusChip tone={record.status === "completed" ? "good" : "amber"}>
              {record.status === "completed" ? "收车完成" : "执行中"}
            </StatusChip>
            {postIncomplete ? <StatusChip tone="bad">收车有遗漏</StatusChip> : null}
          </div>
          <div className="mt-2 truncate font-display text-base font-semibold text-slate-100 group-hover:text-amber">
            {record.routeName}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-slatey">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> {record.date}
            </span>
            <span className="inline-flex items-center gap-1 num">
              <Clock className="h-3 w-3" />
              {record.startTime} – {record.endTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {record.durationMin} 分钟
            </span>
            <span className="inline-flex items-center gap-1 num">
              <MapPin className="h-3 w-3" /> {record.distanceKm} km
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <MiniStat icon={<Bus className="h-3 w-3" />} label="车号" value={record.vehicleNo} />
        <MiniStat icon={<UserRound className="h-3 w-3" />} label="司机" value={record.driverName} />
        <MiniStat
          icon={<ClipboardList className="h-3 w-3" />}
          label="检查异常"
          value={`${abnormalCount}`}
          tone={abnormalCount ? "bad" : "good"}
        />
        <MiniStat
          icon={<FileCheck2 className="h-3 w-3" />}
          label="途中报备"
          value={`${record.reports.length}`}
          tone={record.reports.length ? "amber" : "good"}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-hairline pt-3">
        <SectionLabel className="!text-[0.65rem] !tracking-wide">检查速览</SectionLabel>
        {record.inspections.map((i) => (
          <StatusChip key={i.name} tone={resultMeta[i.result].tone} className="!py-0.5 !text-[0.65rem]">
            {i.name} · {resultMeta[i.result].label}
          </StatusChip>
        ))}
      </div>
    </motion.button>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "good" | "bad" | "amber";
}) {
  const toneCls =
    tone === "good"
      ? "text-good"
      : tone === "bad"
      ? "text-bad"
      : tone === "amber"
      ? "text-amber"
      : "text-slate-100";
  return (
    <div className="rounded-xl border border-hairline bg-panel-2/40 p-2">
      <div className="flex items-center gap-1 text-[0.65rem] text-slatey">
        {icon}
        {label}
      </div>
      <div className={`mt-0.5 truncate text-xs font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}
