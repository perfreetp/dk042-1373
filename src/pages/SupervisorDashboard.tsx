import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bus,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileCheck2,
  LayoutGrid,
  Route,
  Users2,
} from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { type TripRecord } from "@/data/trip";
import { StatusBar } from "@/components/StatusBar";
import { SectionLabel, StatusChip } from "@/components/StatusChip";
import { StatTile } from "@/components/StatTile";

function todayStr() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SupervisorDashboard() {
  const recordList = useTripStore((s) => s.recordList);
  const openRecordDetail = useTripStore((s) => s.openRecordDetail);
  const refreshRecordList = useTripStore((s) => s.refreshRecordList);

  const today = todayStr();
  const todayRecords = useMemo(() => recordList.filter((r) => r.date === today), [recordList, today]);

  const completedToday = todayRecords.filter((r) => r.status === "completed");
  const abnormalInspectionCount = todayRecords.reduce(
    (sum, r) => sum + r.inspections.filter((i) => i.result === "abnormal").length,
    0,
  );
  const enRouteReports = todayRecords.reduce((sum, r) => sum + r.reports.length, 0);
  const postIncomplete = todayRecords.filter((r) => {
    const c = r.postTripConfirm;
    return !c.vehicleParked || !c.keysReturned || !c.noStudentLeft;
  });

  const byDriver = useMemo(() => {
    const map = new Map<string, { completed: number; trips: TripRecord[] }>();
    for (const r of todayRecords) {
      const existing = map.get(r.driverName) ?? { completed: 0, trips: [] };
      existing.trips.push(r);
      if (r.status === "completed") existing.completed += 1;
      map.set(r.driverName, existing);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].completed - a[1].completed);
  }, [todayRecords]);

  const byRoute = useMemo(() => {
    const map = new Map<string, { count: number; abnormal: number; reports: number }>();
    for (const r of todayRecords) {
      const e = map.get(r.routeName) ?? { count: 0, abnormal: 0, reports: 0 };
      e.count += 1;
      e.abnormal += r.inspections.filter((i) => i.result === "abnormal").length;
      e.reports += r.reports.length;
      map.set(r.routeName, e);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [todayRecords]);

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        title="车队主管 · 每日执行概览"
        subtitle={`${today} · 覆盖 ${todayRecords.length} 趟次 · 刷新本地留痕数据`}
        accent="default"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={refreshRecordList}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-ink/60 px-3 text-xs text-slatey hover:text-slate-100"
            >
              <Clock3 className="h-3.5 w-3.5" />
              刷新数据
            </button>
            <StatusChip tone="amber" pulse>
              {postIncomplete.length} 项待处理
            </StatusChip>
          </div>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="mx-auto max-w-6xl">
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              label="今日完成趟次"
              value={completedToday.length}
              unit="趟"
              tone="good"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            />
            <StatTile
              label="异常检查项"
              value={abnormalInspectionCount}
              unit="项"
              tone={abnormalInspectionCount ? "bad" : "default"}
              icon={<ClipboardList className="h-3.5 w-3.5" />}
            />
            <StatTile
              label="途中报备"
              value={enRouteReports}
              unit="条"
              tone={enRouteReports ? "amber" : "default"}
              icon={<FileCheck2 className="h-3.5 w-3.5" />}
            />
            <StatTile
              label="未完成收车确认"
              value={postIncomplete.length}
              unit="趟"
              tone={postIncomplete.length ? "bad" : "good"}
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
            />
          </section>

          {postIncomplete.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-bad/40 bg-bad/[0.05] p-4"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-bad" />
                <SectionLabel className="!text-bad">需要跟进的收车确认</SectionLabel>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {postIncomplete.map((r) => {
                  const c = r.postTripConfirm;
                  const missed = [
                    !c.vehicleParked && "车辆已停放",
                    !c.keysReturned && "钥匙已交回",
                    !c.noStudentLeft && "车内无学生滞留",
                  ].filter(Boolean) as string[];
                  return (
                    <div
                      key={r.tripId}
                      className="rounded-xl border border-bad/30 bg-panel/60 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="chip rounded-md bg-amber/10 px-2 py-0.5 font-display text-[0.7rem] text-amber">
                              {r.tripId}
                            </span>
                            <StatusChip tone="bad">{missed.length} 项遗漏</StatusChip>
                          </div>
                          <div className="mt-1.5 truncate text-sm font-semibold text-slate-100">
                            {r.routeName}
                          </div>
                          <div className="mt-0.5 text-[0.7rem] text-slatey">
                            {r.driverName} · {r.vehicleNo} · 收车 {r.endTime}
                          </div>
                        </div>
                        <button
                          onClick={() => openRecordDetail(r.tripId)}
                          className="flex h-9 shrink-0 items-center gap-1 rounded-xl border border-bad/40 bg-bad/10 px-3 text-xs text-bad hover:bg-bad/20"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          查看
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {missed.map((m) => (
                          <span
                            key={m}
                            className="rounded-md border border-bad/30 bg-bad/10 px-2 py-0.5 text-[0.68rem] text-bad"
                          >
                            ✕ {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
            <section className="rounded-2xl border border-line bg-panel/60 p-5 lg:col-span-3">
              <SectionLabel>今日趟次明细</SectionLabel>
              {todayRecords.length === 0 ? (
                <div className="mt-6 flex flex-col items-center gap-2 py-8 text-slatey">
                  <LayoutGrid className="h-8 w-8 opacity-50" />
                  <div className="text-xs">暂无今日数据</div>
                </div>
              ) : (
                <div className="mt-3 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
                  <div className="grid grid-cols-12 bg-panel-2/40 px-3 py-2 text-[0.7rem] uppercase tracking-wider text-slatey">
                    <div className="col-span-2">趟次</div>
                    <div className="col-span-4">线路</div>
                    <div className="col-span-2">司机 / 车号</div>
                    <div className="col-span-1 text-center">异常</div>
                    <div className="col-span-1 text-center">报备</div>
                    <div className="col-span-2 text-right">操作</div>
                  </div>
                  {todayRecords.map((r) => (
                    <div key={r.tripId} className="grid grid-cols-12 items-center gap-2 px-3 py-3 text-xs">
                      <div className="col-span-2">
                        <div className="chip inline-flex rounded-md bg-amber/10 px-2 py-0.5 font-display text-[0.7rem] text-amber">
                          {r.tripId}
                        </div>
                        <div className="mt-1 text-[0.65rem] text-slatey num">
                          {r.startTime} – {r.endTime}
                        </div>
                      </div>
                      <div className="col-span-4 truncate text-slate-100">
                        <div className="truncate">{r.routeName}</div>
                        <div className="mt-0.5 truncate text-[0.65rem] text-slatey">
                          {r.distanceKm} km · {r.durationMin} 分钟
                        </div>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <div className="truncate text-slate-100">{r.driverName}</div>
                        <div className="truncate text-[0.65rem] text-slatey num">{r.vehicleNo}</div>
                      </div>
                      <div className="col-span-1 text-center">
                        <StatusChip
                          tone={
                            r.inspections.filter((i) => i.result === "abnormal").length
                              ? "bad"
                              : "good"
                          }
                        >
                          {r.inspections.filter((i) => i.result === "abnormal").length}
                        </StatusChip>
                      </div>
                      <div className="col-span-1 text-center">
                        <StatusChip tone={r.reports.length ? "amber" : "muted"}>
                          {r.reports.length}
                        </StatusChip>
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => openRecordDetail(r.tripId)}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-ink/60 px-3 text-[0.7rem] text-slatey hover:text-slate-100"
                        >
                          <Eye className="h-3 w-3" />
                          详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4 lg:col-span-2">
              <div className="rounded-2xl border border-line bg-panel/60 p-5">
                <SectionLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <Users2 className="h-3.5 w-3.5 text-amber" />
                    司机执行排行
                  </span>
                </SectionLabel>
                <ul className="mt-3 space-y-2">
                  {byDriver.length === 0 ? (
                    <li className="text-xs text-slatey">暂无数据</li>
                  ) : (
                    byDriver.map(([name, info]) => (
                      <li
                        key={name}
                        className="flex items-center justify-between rounded-xl border border-hairline bg-panel-2/40 px-3 py-2"
                      >
                        <div>
                          <div className="text-sm text-slate-100">{name}</div>
                          <div className="text-[0.68rem] text-slatey">今日执行 {info.trips.length} 趟</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusChip tone="good">{info.completed} 完成</StatusChip>
                          {info.trips.length - info.completed > 0 ? (
                            <StatusChip tone="amber">{info.trips.length - info.completed} 进行</StatusChip>
                          ) : null}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-line bg-panel/60 p-5">
                <SectionLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <Route className="h-3.5 w-3.5 text-amber" />
                    线路运行情况
                  </span>
                </SectionLabel>
                <ul className="mt-3 space-y-2">
                  {byRoute.length === 0 ? (
                    <li className="text-xs text-slatey">暂无数据</li>
                  ) : (
                    byRoute.map(([route, info]) => (
                      <li
                        key={route}
                        className="rounded-xl border border-hairline bg-panel-2/40 px-3 py-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 truncate text-sm text-slate-100">{route}</div>
                          <StatusChip tone="amber">{info.count} 趟</StatusChip>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[0.68rem] text-slatey">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" /> {info.abnormal} 项异常
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Bus className="h-3 w-3" /> {info.reports} 条报备
                          </span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
