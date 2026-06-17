import { FileCheck2, LayoutDashboard, List, RotateCcw } from "lucide-react";
import { useTripStore } from "@/store/useTripStore";
import { StatusBar } from "@/components/StatusBar";
import { BigButton } from "@/components/BigButton";
import { StatusChip } from "@/components/StatusChip";
import { RecordDetail } from "@/components/RecordDetail";

export default function RecordPage() {
  const record = useTripStore((s) => s.lastRecord);
  const resetTrip = useTripStore((s) => s.resetTrip);
  const setViewMode = useTripStore((s) => s.setViewMode);

  if (!record) {
    return (
      <div className="flex h-full items-center justify-center text-slatey">
        <div className="text-center">
          <FileCheck2 className="mx-auto mb-3 h-10 w-10 opacity-50" />
          暂无驾驶记录
          <div className="mt-3">
            <BigButton variant="amber" onClick={() => setViewMode("list")}>
              查看历史记录
            </BigButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <StatusBar
        title="本趟驾驶记录 · 已留痕"
        subtitle={`${record.routeName} · ${record.tripId}`}
        accent="good"
        right={
          <StatusChip tone="good" pulse className="hidden md:inline-flex">
            <FileCheck2 className="h-3 w-3" /> 已生成
          </StatusChip>
        }
      />

      <RecordDetail record={record} />

      <footer className="z-20 border-t border-hairline bg-ink/85 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="flex items-center gap-2 text-sm text-slatey">
              <FileCheck2 className="h-4 w-4 text-good" />
              记录已本地留痕 · 车队主管端可随时查看
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <BigButton
              variant="outline"
              icon={<List className="h-5 w-5" />}
              onClick={() => setViewMode("list")}
            >
              历史记录
            </BigButton>
            <BigButton
              variant="ghost"
              icon={<LayoutDashboard className="h-5 w-5" />}
              onClick={() => setViewMode("supervisor")}
            >
              车队主管视图
            </BigButton>
            <BigButton
              variant="amber"
              onClick={resetTrip}
              icon={<RotateCcw className="h-5 w-5" />}
              className="shadow-glow"
            >
              开始新趟次
            </BigButton>
          </div>
        </div>
      </footer>
    </div>
  );
}
