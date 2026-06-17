import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bus,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flag,
  Gauge,
  MapPin,
  Route,
  UserRound,
} from "lucide-react";
import { useTripStore, canDepart, isAbnormalResolved } from "@/store/useTripStore";
import { StatusBar } from "@/components/StatusBar";
import { BigButton } from "@/components/BigButton";
import { InspectionCard } from "@/components/InspectionCard";
import { StatTile } from "@/components/StatTile";
import { SectionLabel, StatusChip } from "@/components/StatusChip";

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-slatey">{icon}</span>
      <span className="w-16 shrink-0 text-xs text-slatey">{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{value}</span>
    </div>
  );
}

export default function PreTripPage() {
  const trip = useTripStore((s) => s.trip);
  const inspections = useTripStore((s) => s.inspections);
  const setInspectionResult = useTripStore((s) => s.setInspectionResult);
  const setInspectionPhoto = useTripStore((s) => s.setInspectionPhoto);
  const setInspectionDesc = useTripStore((s) => s.setInspectionDesc);
  const depart = useTripStore((s) => s.depart);

  const total = inspections.length;
  const completed = inspections.filter((i) => i.result !== "pending").length;
  const normal = inspections.filter((i) => i.result === "normal").length;
  const abnormal = inspections.filter((i) => i.result === "abnormal").length;
  const resolvedAb = inspections.filter(
    (i) => i.result === "abnormal" && isAbnormalResolved(i),
  ).length;
  const pending = total - completed;
  const ready = canDepart(inspections);
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        title="发车前检查"
        subtitle={`${trip.routeName} · ${trip.vehicleNo}`}
        accent="amber"
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[340px_1fr]">
        <aside className="hidden flex-col gap-5 overflow-y-auto scrollbar-thin border-r border-hairline p-5 lg:flex">
          <div>
            <SectionLabel>行程概览</SectionLabel>
            <div className="mt-3 rounded-2xl border border-line bg-panel/60 p-4">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-amber" />
                <span className="font-display text-base font-semibold text-slate-100">
                  {trip.routeName}
                </span>
              </div>
              <div className="mt-2 divide-y divide-hairline">
                <MetaRow icon={<Bus className="h-4 w-4" />} label="车号" value={trip.vehicleNo} />
                <MetaRow icon={<UserRound className="h-4 w-4" />} label="司机" value={trip.driverName} />
                <MetaRow icon={<CalendarDays className="h-4 w-4" />} label="日期" value={trip.date} />
                <MetaRow icon={<MapPin className="h-4 w-4" />} label="站点" value={`${trip.planStationCount} 个计划站点`} />
                <MetaRow icon={<Gauge className="h-4 w-4" />} label="限速" value={`${trip.speedLimit} km/h`} />
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>检查进度</SectionLabel>
            <div className="mt-3 rounded-2xl border border-line bg-panel/60 p-4">
              <div className="flex items-end justify-between">
                <span className="num text-3xl font-semibold text-slate-100">
                  {completed}
                  <span className="text-slatey">/{total}</span>
                </span>
                <span className="num text-sm text-amber">{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-panel-3">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-deep to-amber"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatTile label="正常" value={normal} tone="good" />
                <StatTile label="异常" value={abnormal} tone={abnormal ? "bad" : "default"} />
                <StatTile label="待检" value={pending} tone={pending ? "amber" : "default"} />
              </div>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-amber/20 bg-amber/[0.04] p-4">
            <div className="flex items-center gap-2 text-xs text-amber">
              <Flag className="h-4 w-4" />
              <span className="font-display font-semibold tracking-wide">发车准入</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slatey">
              全部检查项需逐项确认，<span className="text-bad">异常项必须拍照或填写一句描述</span>方可发车。
              {abnormal > 0 && (
                <>
                  当前异常 {abnormal} 项，已处理 {resolvedAb} 项。
                </>
              )}
            </p>
          </div>
        </aside>

        <section className="min-h-0 overflow-y-auto scrollbar-thin p-5">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <SectionLabel>行程 · {trip.routeName}</SectionLabel>
            <StatusChip tone={ready ? "good" : "amber"} pulse={ready}>
              {ready ? "可发车" : `${completed}/${total}`}
            </StatusChip>
          </div>
          <div className="hidden items-center justify-between lg:flex">
            <SectionLabel>车辆检查项（逐项确认）</SectionLabel>
            <StatusChip tone={ready ? "good" : "amber"} pulse={ready}>
              {ready ? "可发车" : `${completed}/${total} 已检查`}
            </StatusChip>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {inspections.map((item, i) => (
              <InspectionCard
                key={item.id}
                item={item}
                index={i}
                onResult={(r) => setInspectionResult(item.id, r)}
                onPhoto={(p) => setInspectionPhoto(item.id, p)}
                onDesc={(t) => setInspectionDesc(item.id, t)}
              />
            ))}
          </div>
        </section>
      </div>

      <footer className="z-20 border-t border-hairline bg-ink/85 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="hidden min-w-0 flex-1 sm:block">
            {ready ? (
              <div className="flex items-center gap-2 text-sm text-good">
                <CheckCircle2 className="h-5 w-5" />
                全部检查通过，异常项已处理，可发车
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slatey">
                <AlertTriangle className="h-5 w-5 text-amber" />
                {pending > 0 ? `还有 ${pending} 项未检查` : `${abnormal - resolvedAb} 项异常未处理`}
                <span className="text-slatey-dim">· 完成后自动解锁发车</span>
              </div>
            )}
          </div>
          <BigButton
            variant="amber"
            disabled={!ready}
            onClick={depart}
            icon={ready ? <Flag className="h-5 w-5" /> : undefined}
            className={ready ? "shadow-glow" : ""}
          >
            进入发车模式
            <ChevronRight className="h-5 w-5" />
          </BigButton>
        </div>
      </footer>
    </div>
  );
}
