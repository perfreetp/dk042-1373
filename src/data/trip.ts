import {
  ShieldCheck,
  Flame,
  DoorOpen,
  Video,
  MapPin,
  Navigation,
  TrafficCone,
  Construction,
  type LucideIcon,
} from "lucide-react";

export type Scene = "pre-trip" | "driving" | "post-trip" | "completed";

export type InspectionResult = "pending" | "normal" | "abnormal";

export interface InspectionItem {
  id: string;
  name: string;
  hint: string;
  icon: LucideIcon;
  result: InspectionResult;
  photo: string | null;
  description: string;
}

export type ReportReason = "堵车" | "临时封路" | "事故" | "偏离路线";

export type FollowUpStatus = "pending" | "contacted" | "closed";

export interface StatusHistoryEntry {
  timestamp: number;
  fromStatus: FollowUpStatus | null;
  toStatus: FollowUpStatus;
  note: string;
  operator: string;
}

export const FOLLOW_UP_STATUS_META: Record<
  FollowUpStatus,
  { label: string; tone: "amber" | "good" | "bad" }
> = {
  pending: { label: "待跟进", tone: "amber" },
  contacted: { label: "已联系司机", tone: "amber" },
  closed: { label: "已闭环", tone: "good" },
};

export interface ReportRecord {
  id: string;
  reason: ReportReason;
  location: string;
  time: string;
  note: string;
  status: FollowUpStatus;
  updatedAt?: number;
  statusHistory: StatusHistoryEntry[];
}

export interface PostTripConfirm {
  vehicleParked: boolean;
  keysReturned: boolean;
  noStudentLeft: boolean;
}

export interface Station {
  name: string;
  eta: string;
}

export interface TripMeta {
  tripId: string;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  date: string;
  planStationCount: number;
  stations: Station[];
  speedLimit: number;
}

export interface InspectionSnapshot {
  name: string;
  result: InspectionResult;
  description: string;
  photo: string | null;
  status: FollowUpStatus;
  updatedAt?: number;
  statusHistory: StatusHistoryEntry[];
}

export interface TripRecord {
  tripId: string;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  distanceKm: number;
  status: "completed" | "in-progress";
  inspections: InspectionSnapshot[];
  reports: ReportRecord[];
  postTripConfirm: PostTripConfirm;
  createdAt: number;
  driverHandoverNote: string;
  __schema: number;
}

export interface ReportOption {
  reason: ReportReason;
  desc: string;
  icon: LucideIcon;
}

export const REPORT_OPTIONS: ReportOption[] = [
  { reason: "堵车", desc: "路段拥堵，预计延误", icon: TrafficCone },
  { reason: "临时封路", desc: "前方道路临时封闭", icon: Construction },
  { reason: "事故", desc: "遇交通事故需绕行", icon: Flame },
];

export const DEVIATION_OPTION: ReportOption = {
  reason: "偏离路线",
  desc: "车辆已偏离规划线路",
  icon: Navigation,
};

export const INSPECTION_DEFS: Omit<InspectionItem, "result" | "photo" | "description">[] = [
  { id: "seatbelt", name: "安全带", hint: "主副驾安全带可正常卡扣、无破损", icon: ShieldCheck },
  { id: "extinguisher", name: "灭火器", hint: "在位且压力指针位于绿区", icon: Flame },
  { id: "door", name: "车门", hint: "气动门开合顺畅、无卡顿异响", icon: DoorOpen },
  { id: "camera", name: "摄像头", hint: "车载监控四路画面正常", icon: Video },
  { id: "gps", name: "定位状态", hint: "GPS 已锁定、轨迹上报正常", icon: MapPin },
];

export const POST_TRIP_ITEMS: {
  key: keyof PostTripConfirm;
  label: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  { key: "vehicleParked", label: "车辆已停放", desc: "已停靠指定车位并拉紧手刹", icon: DoorOpen },
  { key: "keysReturned", label: "钥匙已交回", desc: "车钥匙已交回车队值班室", icon: ShieldCheck },
  { key: "noStudentLeft", label: "车内无学生滞留", desc: "已巡视全车，确认无学生滞留", icon: Video },
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nowHM() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function createTripId(dateStr?: string, seq = 1, unique = false) {
  const base = (dateStr ?? todayStr()).replace(/-/g, "");
  const seqPart = pad(seq);
  if (!unique) return `T${base}-${seqPart}`;
  const suffix = (crypto?.randomUUID?.() ?? Math.random().toString(16))
    .replace(/-/g, "")
    .slice(0, 6)
    .toLowerCase()
    .padEnd(6, "0");
  return `T${base}-${seqPart}-${suffix}`;
}

export function createUniqueTripId(dateStr?: string, seq = 1) {
  return createTripId(dateStr, seq, true);
}

export function createMockTrip(seq = 1): TripMeta {
  const date = todayStr();
  return {
    tripId: createTripId(date, seq),
    routeName: "3号线 · 阳光小学环线",
    vehicleNo: "苏B·1234校",
    driverName: "王建国",
    date,
    planStationCount: 6,
    speedLimit: 40,
    stations: [
      { name: "翠苑西门", eta: "07:12" },
      { name: "古墩路·文三路口", eta: "07:18" },
      { name: "丰潭路地铁站", eta: "07:24" },
      { name: "阳光小学东门", eta: "07:30" },
      { name: "阳光小学南门", eta: "07:34" },
      { name: "校园终点站", eta: "07:40" },
    ],
  };
}

export function createInspections(): InspectionItem[] {
  return INSPECTION_DEFS.map((d) => ({
    ...d,
    result: "pending" as InspectionResult,
    photo: null,
    description: "",
  }));
}
