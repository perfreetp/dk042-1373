import { motion } from "framer-motion";
import {
  Bus,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileEdit,
  MapPin,
  MessageSquareText,
  Route,
  Save,
  Timer,
  UserRound,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  POST_TRIP_ITEMS,
  FOLLOW_UP_STATUS_META,
  type FollowUpStatus,
  type InspectionResult,
  type InspectionSnapshot,
  type ReportRecord,
  type TripRecord,
} from "@/data/trip";
import { useTripStore } from "@/store/useTripStore";
import { cn } from "@/lib/utils";
import { SectionLabel, StatusChip } from "./StatusChip";
import { StatTile } from "./StatTile";

const resultMeta: Record<InspectionResult, { label: string; tone: "good" | "bad" | "muted" }> = {
  normal: { label: "正常", tone: "good" },
  abnormal: { label: "异常", tone: "bad" },
  pending: { label: "未检", tone: "muted" },
};

const STATUS_ORDER: FollowUpStatus[] = ["pending", "contacted", "closed"];

function statusBtnClass(active: boolean, tone: "amber" | "good" | "bad") {
  if (!active) return "border-line bg-ink/40 text-slatey hover:text-slate-100";
  if (tone === "good") return "border-good bg-good/10 text-good";
  return "border-amber bg-amber/10 text-amber";
}

export function RecordDetail({ record }: { record: TripRecord }) {
  const viewMode = useTripStore((s) => s.viewMode);
  const updateRecord = useTripStore((s) => s.updateRecord);

  const abnormalCount = record.inspections.filter((i) => i.result === "abnormal").length;

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [handover, setHandover] = useState(record.driverHandoverNote ?? "");
  const [handoverSaving, setHandoverSaving] = useState(false);

  const isSupervisor = viewMode === "supervisor";

  function saveHandover() {
    setHandoverSaving(true);
    updateRecord(record.tripId, { driverHandoverNote: handover.trim() });
    window.setTimeout(() => setHandoverSaving(false), 400);
  }

  function setInspectionStatus(idx: number, status: FollowUpStatus) {
    const next = record.inspections.map((i, k) =>
      k === idx ? { ...i, status, updatedAt: Date.now() } : i,
    );
    updateRecord(record.tripId, { inspections: next });
  }

  function setReportStatus(idx: number, status: FollowUpStatus) {
    const next = record.reports.map((r, k) =>
      k === idx ? { ...r, status, updatedAt: Date.now() } : r,
    );
    updateRecord(record.tripId, { reports: next });
  }

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 rounded-2xl border border-good/40 bg-good/[0.05] p-5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-good/50 bg-good/15 text-good">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-xl font-semibold text-slate-100">
                驾驶记录 · {record.tripId}
              </div>
              <div className="mt-0.5 text-xs text-slatey">
                {record.date} · {record.startTime} – {record.endTime} · 用时 {record.durationMin} 分钟
              </div>
            </div>
            <StatusChip tone={record.status === "completed" ? "good" : "amber"} pulse>
              {record.status === "completed" ? "已完成收车" : "执行中"}
            </StatusChip>
          </motion.div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              label="行驶时长"
              value={record.durationMin}
              unit="min"
              icon={<Timer className="h-3.5 w-3.5" />}
            />
            <StatTile
              label="行驶里程"
              value={record.distanceKm}
              unit="km"
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
            <StatTile
              label="检查异常"
              value={abnormalCount}
              tone={abnormalCount ? "bad" : "good"}
              icon={<ClipboardList className="h-3.5 w-3.5" />}
            />
            <StatTile
              label="途中报备"
              value={record.reports.length}
              tone={record.reports.length ? "amber" : "default"}
              icon={<Clock className="h-3.5 w-3.5" />}
            />
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
                {POST_TRIP_ITEMS.map((item) => {
                  const ok = record.postTripConfirm[item.key];
                  return (
                    <div
                      key={item.key}
                      className={
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm " +
                        (ok
                          ? "border-good/30 bg-good/[0.04]"
                          : "border-bad/30 bg-bad/[0.04]")
                      }
                    >
                      <CheckCircle2
                        className={
                          "h-4 w-4 " + (ok ? "text-good" : "text-bad opacity-60")
                        }
                      />
                      <span className={"text-slate-100" + (ok ? "" : " line-through decoration-bad/60 decoration-2")}>
                        {item.label}
                      </span>
                      {ok ? null : <StatusChip tone="bad">未确认</StatusChip>}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-line bg-panel/60 p-5">
            <SectionLabel>司机交接备注</SectionLabel>
            <div className="mt-3">
              <textarea
                value={handover}
                onChange={(e) => setHandover(e.target.value)}
                rows={3}
                placeholder="司机可补填本趟特殊情况（如车辆维修提醒、学生异常、车队通知等，主管可查看并搜索"
                className="w-full resize-none rounded-2xl border border-line bg-ink/60 p-3 text-sm text-slate-100 placeholder:text-slatey-dim focus:border-amber/60 focus:outline-none focus:ring-1 focus:ring-amber/40"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-[0.7rem] text-slatey">
                  保存后会自动记入驾驶记录，可按备注关键词搜索
                </div>
                <button
                  onClick={saveHandover}
                  disabled={handoverSaving || handover === (record.driverHandoverNote ?? "")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber bg-amber/10 px-3 py-1.5 text-xs font-display font-semibold text-amber shadow-glow disabled:opacity-50"
                >
                  {handoverSaving ? (
                    <>
                      <Save className="h-3.5 w-3.5 animate-pulse" /> 保存中…
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" /> 保存备注
                    </>
                  )}
                </button>
              </div>
            </div>
            {record.driverHandoverNote ? (
              <div className="mt-3 rounded-xl border border-hairline bg-ink/40 p-3 text-xs text-slate-200">
              <div className="mb-1 flex items-center gap-1 text-[0.7rem] text-amber">
                <FileEdit className="h-3.5 w-3.5" /> 已留痕
              </div>
              {record.driverHandoverNote}
            </div>
          ) : null}
        </section>

          <section className="mt-4 rounded-2xl border border-line bg-panel/60 p-5">
            <SectionLabel>车辆检查明细</SectionLabel>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {record.inspections.map((i, idx) => {
                const meta = resultMeta[i.result];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-hairline bg-panel-2/40 px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{i.name}</span>
                    <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                    {i.result === "abnormal" && isSupervisor ? (
                      <StatusChip tone={FOLLOW_UP_STATUS_META[i.status]?.tone ?? "amber"}>
                        {FOLLOW_UP_STATUS_META[i.status]?.label ?? "待跟进"}
                      </StatusChip>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {abnormalCount > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <SectionLabel>异常追溯（含照片）{isSupervisor ? " · 主管处理状态" : ""}</SectionLabel>
                {record.inspections
                  .filter((i) => i.result === "abnormal")
                  .map((i, idx) => {
                    const srcIdx = record.inspections.indexOf(i);
                    return (
                      <InspectionCard
                        key={idx}
                        inspection={i}
                        onSetStatus={(s) => setInspectionStatus(srcIdx, s)}
                        isSupervisor={isSupervisor}
                        onPreview={(p) => setPreviewPhoto(p)}
                      />
                    );
                  })}
              </div>
            )}
          </section>

          {record.reports.length > 0 ? (
            <section className="mt-4 rounded-2xl border border-line bg-panel/60 p-5">
              <SectionLabel>途中报备 · 时间线{isSupervisor ? " · 主管处理状态" : ""}</SectionLabel>
              <ol className="relative mt-3 ml-2 border-l border-hairline">
                {record.reports.map((r, idx) => (
                  <ReportTimelineItem
                    key={r.id}
                    report={r}
                    isSupervisor={isSupervisor}
                    onSetStatus={(s) => setReportStatus(idx, s)}
                  />
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      </main>

      <AnimatePresence>
        {previewPhoto ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-6 backdrop-blur-md"
          >
            <motion.img
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              src={previewPhoto}
              alt="异常现场"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl border border-amber/30 shadow-glow"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function InspectionCard({
  inspection,
  isSupervisor,
  onSetStatus,
  onPreview,
}: {
  inspection: InspectionSnapshot;
  isSupervisor: boolean;
  onSetStatus: (s: FollowUpStatus) => void;
  onPreview: (url: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-bad/30 bg-bad/[0.04] p-4 sm:flex-row sm:items-center sm:gap-4">
      {inspection.photo ? (
        <button
          onClick={() => onPreview(inspection.photo!)}
          className="group relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-bad/40"
          title="点击查看大图"
        >
          <img src={inspection.photo} alt={`${inspection.name} 异常`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 text-transparent transition group-hover:bg-ink/50 group-hover:text-white">
            <ZoomIn className="h-5 w-5" />
          </div>
        </button>
      ) : (
        <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-panel-2/40 text-xs text-slatey">
          未拍照，仅文字
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-bad">{inspection.name} · 异常</div>
        <div className="mt-1 text-xs text-slate-100">
          {inspection.description || "（未填写描述）"}
        </div>
        {isSupervisor ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {STATUS_ORDER.map((s) => {
              const meta = FOLLOW_UP_STATUS_META[s];
              const active = inspection.status === s;
              return (
                <button
                  key={s}
                  onClick={() => onSetStatus(s)}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[0.7rem] font-display transition",
                    statusBtnClass(active, meta.tone),
                  )}
                >
                  {meta.label}
                </button>
              );
            })}
            {inspection.updatedAt ? (
              <span className="ml-1 text-[0.65rem] text-slatey">
                最后更新 {new Date(inspection.updatedAt).toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReportTimelineItem({
  report,
  isSupervisor,
  onSetStatus,
}: {
  report: ReportRecord;
  isSupervisor: boolean;
  onSetStatus: (s: FollowUpStatus) => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative mb-5 pl-6 last:mb-0"
    >
      <span className="absolute -left-[7px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-amber bg-amber shadow-glow" />
      <div className="rounded-2xl border border-amber/30 bg-amber/[0.05] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 shrink-0 text-amber" />
            <span className="font-display text-base font-semibold text-slate-100">{report.reason}</span>
            <StatusChip tone="amber">{report.time}</StatusChip>
          </div>
          {isSupervisor ? (
            <div className="flex items-center gap-1">
              {STATUS_ORDER.map((s) => {
                const meta = FOLLOW_UP_STATUS_META[s];
                const active = report.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onSetStatus(s)}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[0.7rem] font-display transition",
                      statusBtnClass(active, meta.tone),
                    )}
                  >
                    {meta.label}
                  </button>
                );
              })}
              {report.updatedAt ? (
                <span className="ml-1 text-[0.65rem] text-slatey num">
                  {new Date(report.updatedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slatey">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
          <span className="num break-all">{report.location}</span>
        </div>
        {report.note ? (
          <div className="mt-2 flex items-start gap-1.5 rounded-xl border border-hairline bg-ink/40 p-2.5 text-xs text-slate-200">
            <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
            <span className="flex-1">{report.note}</span>
          </div>
        ) : null}
      </div>
    </motion.li>
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
