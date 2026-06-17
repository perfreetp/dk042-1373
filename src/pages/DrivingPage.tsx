import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Flag,
  Navigation,
  Radio,
  Send,
  Timer,
  MapPin,
  Footprints,
  ClipboardList,
} from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { useClock } from "@/hooks/useClock";
import { useSimSpeed } from "@/hooks/useSimSpeed";
import { formatDuration } from "@/lib/utils";
import { StatusBar } from "@/components/StatusBar";
import { BigButton } from "@/components/BigButton";
import { SpeedGauge } from "@/components/SpeedGauge";
import { StatTile } from "@/components/StatTile";
import { DeviateBanner } from "@/components/DeviateBanner";
import { ReportSheet } from "@/components/ReportSheet";
import { SectionLabel, StatusChip } from "@/components/StatusChip";
import type { ReportReason } from "@/data/trip";

export default function DrivingPage() {
  const trip = useTripStore((s) => s.trip);
  const stationIndex = useTripStore((s) => s.stationIndex);
  const offRoute = useTripStore((s) => s.offRoute);
  const reports = useTripStore((s) => s.reports);
  const drivingStartTs = useTripStore((s) => s.drivingStartTs);
  const distanceKm = useTripStore((s) => s.distanceKm);
  const advanceStation = useTripStore((s) => s.advanceStation);
  const setOffRoute = useTripStore((s) => s.setOffRoute);
  const arrive = useTripStore((s) => s.arrive);
  const addDistance = useTripStore((s) => s.addDistance);

  const speed = useSimSpeed(trip.speedLimit, addDistance);
  const { ts } = useClock();
  const duration = formatDuration(ts - (drivingStartTs ?? ts));

  const [reportOpen, setReportOpen] = useState(false);
  const [reportExtra, setReportExtra] = useState<ReportReason | null>(null);

  const totalStations = trip.stations.length;
  const arrived = stationIndex >= totalStations;
  const nextStation = trip.stations[Math.min(stationIndex, totalStations - 1)];

  function openReport(extra: ReportReason | null = null) {
    setReportExtra(extra);
    setReportOpen(true);
  }

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        title="行驶中"
        subtitle={`${trip.routeName} · ${trip.vehicleNo}`}
        accent={offRoute ? "bad" : "amber"}
        right={
          <StatusChip tone={offRoute ? "bad" : "good"} pulse className="hidden md:inline-flex">
            <Radio className="h-3 w-3" />
            {offRoute ? "偏离路线" : "GPS 在线"}
          </StatusChip>
        }
      />

      <AnimatePresence>
        {offRoute && (
          <DeviateBanner onReport={() => openReport("偏离路线")} onDismiss={() => setOffRoute(false)} />
        )}
      </AnimatePresence>

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
        <section className="relative flex flex-col justify-center overflow-hidden p-8">
          <SectionLabel>当前线路</SectionLabel>
          <div className="mt-2 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-amber" />
            <span className="font-display text-xl font-semibold text-slate-100">{trip.routeName}</span>
          </div>

          <div className="mt-8 max-w-xl">
            <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-slatey">
              <MapPin className="h-3.5 w-3.5" />
              {arrived ? "已抵达" : "下一站"}
            </div>
            <motion.div
              key={arrived ? "arrived" : stationIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="mt-2 font-display text-5xl font-bold leading-tight text-balance text-slate-100 lg:text-6xl"
            >
              {arrived ? "校园终点站" : nextStation.name}
            </motion.div>
            <div className="mt-3 flex items-center gap-3">
              {arrived ? (
                <StatusChip tone="good">所有站点已完成</StatusChip>
              ) : (
                <StatusChip tone="amber">预计 {nextStation.eta}</StatusChip>
              )}
              <span className="num text-sm text-slatey">
                第 {Math.min(stationIndex + 1, totalStations)} / {totalStations} 站
              </span>
            </div>
          </div>

          <div className="mt-10">
            {arrived ? (
              <BigButton variant="good" onClick={arrive} icon={<Flag className="h-5 w-5" />} className="shadow-glow-good">
                到达终点 · 结束行程
                <ChevronRight className="h-5 w-5" />
              </BigButton>
            ) : (
              <BigButton variant="outline" onClick={advanceStation} icon={<Footprints className="h-5 w-5" />}>
                到达下一站
                <ChevronRight className="h-5 w-5" />
              </BigButton>
            )}
          </div>
        </section>

        <aside className="flex flex-col items-center gap-6 border-t border-hairline p-6 lg:border-l lg:border-t-0">
          <SpeedGauge speed={speed} limit={trip.speedLimit} />
          <div className="grid w-full grid-cols-2 gap-3">
            <StatTile label="用时" value={duration} icon={<Timer className="h-3.5 w-3.5" />} />
            <StatTile label="里程" value={distanceKm.toFixed(1)} unit="km" icon={<MapPin className="h-3.5 w-3.5" />} />
            <StatTile label="已过站" value={stationIndex} unit={`/${totalStations}`} icon={<Footprints className="h-3.5 w-3.5" />} />
            <StatTile label="报备" value={reports.length} tone={reports.length ? "amber" : "default"} icon={<ClipboardList className="h-3.5 w-3.5" />} />
          </div>
        </aside>
      </main>

      <footer className="flex flex-col gap-3 border-t border-hairline bg-panel/70 px-6 py-4 backdrop-blur sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 text-sm text-slatey">
          <Send className="h-4 w-4 text-amber" />
          遇堵车 / 临时封路 / 事故？一键报备，自动带上当前位置
        </div>
        <BigButton variant="amber" onClick={() => openReport(null)} icon={<Send className="h-5 w-5" />}>
          一键报备
        </BigButton>
      </footer>

      <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} extra={reportExtra} />
    </div>
  );
}
