import { create } from "zustand";
import {
  type Scene,
  type InspectionItem,
  type InspectionResult,
  type ReportReason,
  type ReportRecord,
  type PostTripConfirm,
  type TripMeta,
  type TripRecord,
  createMockTrip,
  createInspections,
  nowHM,
  createTripId,
  createUniqueTripId,
} from "@/data/trip";
import { formatHM, loadRecords, saveRecord } from "@/lib/utils";

export function isAbnormalResolved(item: InspectionItem) {
  return item.result !== "abnormal" || !!item.photo || item.description.trim().length > 0;
}

export function canDepart(inspections: InspectionItem[]) {
  return inspections.every((i) => i.result !== "pending") && inspections.every(isAbnormalResolved);
}

function todayStr() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildSeedRecords(): TripRecord[] {
  const today = todayStr();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();

  const defaultConfirm: PostTripConfirm = {
    vehicleParked: true,
    keysReturned: true,
    noStudentLeft: true,
  };

  const norm = (
    arr: Array<Omit<import("@/data/trip").InspectionSnapshot, "status" | "updatedAt" | "statusHistory">>,
  ) => arr.map((i) => ({ ...i, status: "pending" as const, updatedAt: undefined, statusHistory: [] as import("@/data/trip").StatusHistoryEntry[] }));

  const now = Date.now();

  return [
    {
      tripId: createTripId(today, 2),
      routeName: "2号线 · 实验中学专线",
      vehicleNo: "苏B·7788校",
      driverName: "李秀华",
      date: today,
      startTime: "06:50",
      endTime: "07:42",
      durationMin: 52,
      distanceKm: 14.8,
      status: "completed",
      inspections: norm([
        { name: "安全带", result: "normal", description: "", photo: null },
        { name: "灭火器", result: "normal", description: "", photo: null },
        { name: "车门", result: "normal", description: "", photo: null },
        { name: "摄像头", result: "normal", description: "", photo: null },
        { name: "定位状态", result: "normal", description: "", photo: null },
      ]),
      reports: [],
      postTripConfirm: defaultConfirm,
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      driverHandoverNote: "",
      __schema: 2,
    },
    {
      tripId: createTripId(yesterday, 2),
      routeName: "3号线 · 阳光小学环线",
      vehicleNo: "苏B·1234校",
      driverName: "王建国",
      date: yesterday,
      startTime: "07:08",
      endTime: "08:06",
      durationMin: 58,
      distanceKm: 13.2,
      status: "completed",
      inspections: [
        { name: "安全带", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
        {
          name: "灭火器",
          result: "abnormal",
          description: "压力指针在红区，已上报车队更换",
          photo: null,
          status: "contacted" as const,
          updatedAt: now - 1000 * 60 * 30,
          statusHistory: [
            {
              timestamp: now - 1000 * 60 * 60 * 4,
              fromStatus: null,
              toStatus: "pending",
              note: "系统自动创建",
              operator: "system",
            },
            {
              timestamp: now - 1000 * 60 * 30,
              fromStatus: "pending",
              toStatus: "contacted",
              note: "已联系供应商，明日上午送新灭火器到校",
              operator: "车队主管",
            },
          ],
        },
        { name: "车门", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
        { name: "摄像头", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
        { name: "定位状态", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
      ],
      reports: [
        {
          id: "seedR1",
          reason: "堵车",
          location: "31.4952, 120.3012",
          time: "07:22",
          note: "文三路与古墩路交叉口早高峰拥堵约 8 分钟",
          status: "closed",
          updatedAt: now - 1000 * 60 * 60 * 2,
          statusHistory: [
            {
              timestamp: now - 1000 * 60 * 60 * 6,
              fromStatus: null,
              toStatus: "pending",
              note: "系统自动创建",
              operator: "system",
            },
            {
              timestamp: now - 1000 * 60 * 60 * 2,
              fromStatus: "pending",
              toStatus: "closed",
              note: "已核实，属正常早高峰拥堵，无异常",
              operator: "车队主管",
            },
          ],
        },
      ],
      postTripConfirm: defaultConfirm,
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      driverHandoverNote: "昨日灭火器已通知采购更换，请今日接班司机确认新灭火器是否已安装。",
      __schema: 2,
    },
    {
      tripId: createTripId(yesterday, 3),
      routeName: "1号线 · 科技园通勤",
      vehicleNo: "苏B·5566校",
      driverName: "赵明远",
      date: yesterday,
      startTime: "16:30",
      endTime: "17:25",
      durationMin: 55,
      distanceKm: 15.6,
      status: "completed",
      inspections: [
        { name: "安全带", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
        { name: "灭火器", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
        {
          name: "车门",
          result: "abnormal",
          description: "后车门开启有轻微异响，待维修",
          photo: null,
          status: "pending" as const,
          statusHistory: [
            {
              timestamp: now - 1000 * 60 * 60 * 8,
              fromStatus: null,
              toStatus: "pending",
              note: "系统自动创建",
              operator: "system",
            },
          ],
        },
        { name: "摄像头", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
        { name: "定位状态", result: "normal", description: "", photo: null, status: "pending" as const, statusHistory: [] },
      ],
      reports: [
        {
          id: "seedR2",
          reason: "临时封路",
          location: "31.4821, 120.3155",
          time: "16:55",
          note: "西园三路市政封路，绕行振华路约 5 分钟",
          status: "pending",
          statusHistory: [
            {
              timestamp: now - 1000 * 60 * 60 * 7,
              fromStatus: null,
              toStatus: "pending",
              note: "系统自动创建",
              operator: "system",
            },
          ],
        },
      ],
      postTripConfirm: {
        vehicleParked: true,
        keysReturned: false,
        noStudentLeft: true,
      },
      createdAt: Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 60 * 3,
      driverHandoverNote: "后车门异响已登记报修，下趟请提醒学生下车时注意站稳再起身。",
      __schema: 2,
    },
  ] as TripRecord[];
}

function loadAllTyped(): TripRecord[] {
  try {
    return loadRecords() as TripRecord[];
  } catch {
    return [];
  }
}

function ensureSeeded(): TripRecord[] {
  const existing = loadAllTyped();
  if (existing.length > 0) return existing;
  const seeds = buildSeedRecords();
  seeds.forEach((r) => saveRecord(r));
  return seeds;
}

interface TripState {
  scene: Scene;
  viewMode: "driver" | "supervisor" | "list" | "detail";
  previousViewMode: "driver" | "supervisor" | "list" | "detail";
  focusedRecordId: string | null;
  trip: TripMeta;
  inspections: InspectionItem[];
  reports: ReportRecord[];
  postTrip: PostTripConfirm;
  stationIndex: number;
  offRoute: boolean;
  drivingStartTs: number | null;
  drivingEndTs: number | null;
  distanceKm: number;
  lastRecord: TripRecord | null;
  recordList: TripRecord[];

  setViewMode: (mode: TripState["viewMode"]) => void;
  openRecordDetail: (tripId: string | null) => void;
  refreshRecordList: () => void;

  setInspectionResult: (id: string, result: InspectionResult) => void;
  setInspectionPhoto: (id: string, photo: string | null) => void;
  setInspectionDesc: (id: string, text: string) => void;
  depart: () => void;
  arrive: () => void;
  advanceStation: () => void;
  setOffRoute: (v: boolean) => void;
  addReport: (reason: ReportReason, location: string, note?: string) => void;
  togglePostTrip: (key: keyof PostTripConfirm) => void;
  addDistance: (km: number) => void;
  finishTrip: () => void;
  resetTrip: () => void;
  backToDriverFlow: () => void;
  updateRecord: (tripId: string, patch: Partial<TripRecord>) => void;
}

function computeNextSeq() {
  const list = loadAllTyped();
  const today = todayStr();
  const pattern = /^T(\d{8})-(\d+)/;
  let maxSeq = 0;
  for (const r of list) {
    if (r.date !== today) continue;
    const m = r.tripId.match(pattern);
    if (m && m[2]) {
      const seq = parseInt(m[2], 10);
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }
  return maxSeq + 1;
}

function freshTripData() {
  const seq = computeNextSeq();
  const base = createMockTrip(seq);
  return {
    trip: { ...base, tripId: createUniqueTripId(base.date, seq) },
    inspections: createInspections(),
    reports: [] as ReportRecord[],
    postTrip: {
      vehicleParked: false,
      keysReturned: false,
      noStudentLeft: false,
    } as PostTripConfirm,
    stationIndex: 0,
    offRoute: false,
    drivingStartTs: null as number | null,
    drivingEndTs: null as number | null,
    distanceKm: 0,
  };
}

export const useTripStore = create<TripState>((set, get) => {
  const initialRecords = ensureSeeded();

  return {
    scene: "pre-trip",
    viewMode: "driver",
    previousViewMode: "list",
    focusedRecordId: null,
    ...freshTripData(),
    lastRecord: initialRecords[0] ?? null,
    recordList: initialRecords,

    setViewMode: (mode) => set({ viewMode: mode }),
    openRecordDetail: (tripId) =>
      set((s) =>
        tripId
          ? { focusedRecordId: tripId, previousViewMode: s.viewMode, viewMode: "detail" }
          : { focusedRecordId: null, viewMode: s.previousViewMode },
      ),
    refreshRecordList: () => set({ recordList: loadAllTyped() }),

    setInspectionResult: (id, result) =>
      set((s) => ({
        inspections: s.inspections.map((i) =>
          i.id === id ? { ...i, result, ...(result === "pending" ? { photo: null, description: "" } : {}) } : i,
        ),
      })),

    setInspectionPhoto: (id, photo) =>
      set((s) => ({
        inspections: s.inspections.map((i) => (i.id === id ? { ...i, photo } : i)),
      })),

    setInspectionDesc: (id, text) =>
      set((s) => ({
        inspections: s.inspections.map((i) => (i.id === id ? { ...i, description: text } : i)),
      })),

    depart: () =>
      set(() => ({
        scene: "driving",
        drivingStartTs: Date.now(),
        stationIndex: 0,
      })),

    arrive: () => set({ scene: "post-trip" }),

    advanceStation: () =>
      set((s) => {
        const nextIndex = Math.min(s.stationIndex + 1, s.trip.stations.length);
        return {
          stationIndex: nextIndex,
          offRoute: nextIndex === 2 ? true : s.offRoute,
        };
      }),

    setOffRoute: (v) => set({ offRoute: v }),

    addReport: (reason, location, note = "") =>
      set((s) => ({
        offRoute: false,
        reports: [
          ...s.reports,
          {
            id: `R${Date.now()}`,
            reason,
            location,
            time: nowHM(),
            note,
            status: "pending",
            statusHistory: [],
          },
        ],
      })),

    togglePostTrip: (key) =>
      set((s) => ({
        postTrip: { ...s.postTrip, [key]: !s.postTrip[key] },
      })),

    addDistance: (km) =>
      set((s) => ({ distanceKm: s.distanceKm + km })),

    finishTrip: () => {
      const s = get();
      const startTs = s.drivingStartTs ?? Date.now();
      const endTs = Date.now();
      const record: TripRecord = {
        tripId: s.trip.tripId,
        routeName: s.trip.routeName,
        vehicleNo: s.trip.vehicleNo,
        driverName: s.trip.driverName,
        date: s.trip.date,
        startTime: formatHM(startTs),
        endTime: formatHM(endTs),
        durationMin: Math.max(1, Math.round((endTs - startTs) / 60000)),
        distanceKm: Number(s.distanceKm.toFixed(1)),
        status: "completed",
        inspections: s.inspections.map((i) => ({
          name: i.name,
          result: i.result,
          description: i.description,
          photo: i.photo,
          status: "pending",
          statusHistory: [],
        })),
        reports: s.reports,
        postTripConfirm: s.postTrip,
        createdAt: endTs,
        driverHandoverNote: "",
        __schema: 1,
      };
      saveRecord(record);
      set({
        lastRecord: record,
        drivingEndTs: endTs,
        scene: "completed",
        recordList: loadAllTyped(),
      });
    },

    updateRecord: (tripId, patch) => {
      const list = loadAllTyped();
      const idx = list.findIndex((r) => r.tripId === tripId);
      if (idx < 0) return;
      const merged: TripRecord = { ...list[idx], ...patch } as TripRecord;
      saveRecord(merged);
      const next = loadAllTyped();
      set({
        recordList: next,
        lastRecord:
          useTripStore.getState().lastRecord?.tripId === tripId
            ? (merged as TripRecord)
            : useTripStore.getState().lastRecord,
      });
    },

    resetTrip: () =>
      set(() => ({
        scene: "pre-trip",
        ...freshTripData(),
      })),

    backToDriverFlow: () =>
      set((s) => ({
        viewMode: "driver",
        scene: s.lastRecord ? "completed" : "pre-trip",
        focusedRecordId: null,
      })),
  };
});

