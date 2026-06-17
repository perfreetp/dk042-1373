import { motion } from "framer-motion";
import { BusFront, LayoutDashboard, List } from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { cn } from "@/lib/utils";

export type Mode = "driver" | "supervisor" | "list";

export function RoleSwitch() {
  const viewMode = useTripStore((s) => s.viewMode);
  const setViewMode = useTripStore((s) => s.setViewMode);
  const backToDriverFlow = useTripStore((s) => s.backToDriverFlow);
  const openRecordDetail = useTripStore((s) => s.openRecordDetail);

  const tabs: { id: Mode; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: "driver", label: "司机端", icon: <BusFront className="h-4 w-4" />, hint: "发车 / 行驶 / 收车" },
    { id: "list", label: "历史记录", icon: <List className="h-4 w-4" />, hint: "按趟次留痕可追溯" },
    { id: "supervisor", label: "车队主管", icon: <LayoutDashboard className="h-4 w-4" />, hint: "每日执行概览" },
  ];

  return (
    <div className="rounded-full border border-line bg-panel/80 p-1 backdrop-blur-sm">
      <div className="relative flex">
        {tabs.map((t) => {
          const isActive =
            (t.id === "driver" && viewMode === "driver") ||
            (t.id === "list" && (viewMode === "list" || viewMode === "detail")) ||
            (t.id === "supervisor" && viewMode === "supervisor");

          function handleClick() {
            if (t.id === "driver") {
              if (viewMode === "detail") openRecordDetail(null);
              backToDriverFlow();
            } else {
              if (viewMode === "detail") openRecordDetail(null);
              setViewMode(t.id);
            }
          }

          return (
            <button
              key={t.id}
              onClick={handleClick}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-display transition sm:text-sm",
                isActive ? "text-ink" : "text-slatey hover:text-slate-100",
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              <span className="inline sm:hidden">{t.label.slice(0, 2)}</span>
              {isActive ? (
                <motion.span
                  layoutId="role-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-amber shadow-glow"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
