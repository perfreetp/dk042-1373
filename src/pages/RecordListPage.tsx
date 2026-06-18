import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookmarkPlus,
  Bus,
  CalendarDays,
  ClipboardList,
  Clock,
  FileCheck2,
  FileEdit,
  Filter,
  MapPin,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { type TripRecord, type InspectionResult, FOLLOW_UP_STATUS_META } from "@/data/trip";
import { cn } from "@/lib/utils";
import { StatusBar } from "@/components/StatusBar";
import { SectionLabel, StatusChip } from "@/components/StatusChip";
import { RecordDetail } from "@/components/RecordDetail";

const resultMeta: Record<InspectionResult, { label: string; tone: "good" | "bad" | "muted" }> = {
  normal: { label: "正常", tone: "good" },
  abnormal: { label: "异常", tone: "bad" },
  pending: { label: "未检", tone: "muted" },
};

const TIME_RANGES = [
  { key: "1d", label: "近 1 天", days: 1 },
  { key: "7d", label: "近 7 天", days: 7 },
  { key: "30d", label: "近 30 天", days: 30 },
  { key: "all", label: "全部", days: Infinity },
] as const;

const ANOMALY_TYPES = [
  { key: "all", label: "全部" },
  { key: "inspection", label: "检查异常" },
  { key: "report", label: "途中报备" },
  { key: "post-incomplete", label: "收车遗漏" },
  { key: "unclosed", label: "未闭环" },
] as const;

type TimeRangeKey = (typeof TIME_RANGES)[number]["key"];
type AnomalyTypeKey = (typeof ANOMALY_TYPES)[number]["key"];

interface FilterPreset {
  id: string;
  name: string;
  timeRange: TimeRangeKey;
  anomalyType: AnomalyTypeKey;
}

const PRESET_KEY = "schoolbus_filter_presets";

function loadPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(PRESET_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function savePresets(presets: FilterPreset[]) {
  try {
    localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

const DEFAULT_PRESETS: FilterPreset[] = [
  { id: "preset-1", name: "近 7 天有异常", timeRange: "7d", anomalyType: "inspection" },
  { id: "preset-2", name: "未闭环报备", timeRange: "7d", anomalyType: "unclosed" },
];

export default function RecordListPage() {
  const recordList = useTripStore((s) => s.recordList);
  const focusedRecordId = useTripStore((s) => s.focusedRecordId);
  const viewMode = useTripStore((s) => s.viewMode);
  const openRecordDetail = useTripStore((s) => s.openRecordDetail);

  const [q, setQ] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("all");
  const [anomalyType, setAnomalyType] = useState<AnomalyTypeKey>("all");
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const existing = loadPresets();
    return existing.length > 0 ? existing : DEFAULT_PRESETS;
  });
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  const focused = useMemo(
    () => (focusedRecordId ? recordList.find((r) => r.tripId === focusedRecordId) ?? null : null),
    [focusedRecordId, recordList],
  );

  const showFilters = viewMode === "supervisor" || viewMode === "list";

  const filtered = useMemo(() => {
    const now = Date.now();
    const tr = TIME_RANGES.find((x) => x.key === timeRange)!;
    const minTs = tr.days === Infinity ? 0 : now - tr.days * 24 * 60 * 60 * 1000;
    const kw = q.trim().toLowerCase();

    return recordList.filter((r) => {
      if (r.createdAt && r.createdAt < minTs) return false;

      if (anomalyType === "inspection") {
        if (r.inspections.filter((i) => i.result === "abnormal").length === 0) return false;
      } else if (anomalyType === "report") {
        if (r.reports.length === 0) return false;
      } else if (anomalyType === "post-incomplete") {
        const postOk =
          r.postTripConfirm.vehicleParked &&
          r.postTripConfirm.keysReturned &&
          r.postTripConfirm.noStudentLeft;
        if (postOk) return false;
      } else if (anomalyType === "unclosed") {
        const hasUnclosedInspection = r.inspections.some(
          (i) => i.result === "abnormal" && i.status !== "closed",
        );
        const hasUnclosedReport = r.reports.some((rp) => rp.status !== "closed");
        if (!hasUnclosedInspection && !hasUnclosedReport) return false;
      }

      if (!kw) return true;
      return [
        r.date,
        r.routeName,
        r.vehicleNo,
        r.driverName,
        r.tripId,
        r.driverHandoverNote ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(kw);
    });
  }, [q, recordList, timeRange, anomalyType]);

  function applyPreset(preset: FilterPreset) {
    setTimeRange(preset.timeRange);
    setAnomalyType(preset.anomalyType);
  }

  function saveCurrentPreset() {
    const name = presetName.trim();
    if (!name) return;
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      timeRange,
      anomalyType,
    };
    setPresets((prev) => [...prev, newPreset]);
    setPresetName("");
    setShowSavePreset(false);
  }

  function deletePreset(id: string) {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }

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
              placeholder={showFilters ? "搜索 日期 / 车号 / 司机 / 线路 / 交接备注" : "搜索 日期 / 车号 / 司机 / 线路"}
              className="h-9 w-full rounded-full border border-line bg-ink/60 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slatey focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/40"
            />
          </div>
        }
      />

      {showFilters ? (
        <>
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-6 py-3">
            <div className="flex items-center gap-1.5 text-[0.7rem] text-slatey">
              <Filter className="h-3 w-3" /> 时间
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TIME_RANGES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTimeRange(t.key)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-display transition",
                    timeRange === t.key
                      ? "border-amber bg-amber/10 text-amber"
                      : "border-line bg-ink/40 text-slatey hover:text-slate-100",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mx-2 h-5 w-px bg-line" />

            <div className="flex items-center gap-1.5 text-[0.7rem] text-slatey">
              <Filter className="h-3 w-3" /> 异常
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ANOMALY_TYPES.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAnomalyType(a.key)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-display transition",
                    anomalyType === a.key
                      ? "border-amber bg-amber/10 text-amber"
                      : "border-line bg-ink/40 text-slatey hover:text-slate-100",
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setShowSavePreset(true);
                  setPresetName("");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/5 px-2.5 py-0.5 text-[0.7rem] text-amber hover:bg-amber/10"
              >
                <BookmarkPlus className="h-3 w-3" /> 保存筛选
              </button>
            </div>
          </div>

          {showSavePreset ? (
            <div className="flex items-center gap-2 border-b border-hairline bg-ink/20 px-6 py-2.5">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="输入筛选预设名称，如「近 7 天未闭环」"
                className="h-8 flex-1 rounded-full border border-line bg-ink/60 px-3 text-xs text-slate-100 placeholder:text-slatey focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveCurrentPreset();
                }}
              />
              <button
                onClick={saveCurrentPreset}
                disabled={!presetName.trim()}
                className="h-8 rounded-full border border-amber bg-amber/10 px-3 text-xs font-display font-semibold text-amber disabled:opacity-50"
              >
                保存
              </button>
              <button
                onClick={() => setShowSavePreset(false)}
                className="h-8 rounded-full border border-line bg-ink/40 px-3 text-xs text-slatey hover:text-slate-100"
              >
                取消
              </button>
            </div>
          ) : null}

          {presets.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-6 py-2.5">
              <span className="text-[0.7rem] text-slatey">常用筛选：</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => {
                  const tr = TIME_RANGES.find((x) => x.key === p.timeRange)!;
                  const at = ANOMALY_TYPES.find((x) => x.key === p.anomalyType)!;
                  const active = timeRange === p.timeRange && anomalyType === p.anomalyType;
                  return (
                    <div
                      key={p.id}
                      className="group inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] transition"
                      style={{
                        borderColor: active ? "#FFB300" : "var(--color-line)",
                        backgroundColor: active ? "rgba(255, 179, 0, 0.1)" : "rgba(0,0,0,0.25)",
                        color: active ? "#FFB300" : "var(--color-slatey)",
                      }}
                    >
                      <button onClick={() => applyPreset(p)} className="pr-1">
                        {p.name}
                        <span className="ml-1 opacity-60">
                          ({tr.label} · {at.label})
                        </span>
                      </button>
                      <button
                        onClick={() => deletePreset(p.id)}
                        className="rounded-full p-0.5 opacity-40 transition hover:opacity-100 hover:text-bad"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

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
  const handoverNote = record.driverHandoverNote?.trim() ?? "";
  const notePreview = handoverNote.length > 32 ? handoverNote.slice(0, 32) + "…" : handoverNote;

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
          {notePreview ? (
            <div
              className="mt-2 flex items-start gap-1.5 rounded-xl border border-hairline bg-ink/30 p-2 text-xs text-slate-200"
              title={handoverNote}
            >
              <FileEdit className="mt-0.5 h-3 w-3 shrink-0 text-amber" />
              <span className="line-clamp-1 min-w-0 flex-1">
                <span className="text-[0.65rem] text-amber">交接：</span>
                {notePreview}
              </span>
            </div>
          ) : null}
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
