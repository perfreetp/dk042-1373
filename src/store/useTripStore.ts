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
} from "@/data/trip";
import { formatHM, saveRecord } from "@/lib/utils";

export function isAbnormalResolved(item: InspectionItem) {
  return item.result !== "abnormal" || !!item.photo || item.description.trim().length > 0;
}

export function canDepart(inspections: InspectionItem[]) {
  return inspections.every((i) => i.result !== "pending") && inspections.every(isAbnormalResolved);
}

interface TripState {
  scene: Scene;
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

  setInspectionResult: (id: string, result: InspectionResult) => void;
  setInspectionPhoto: (id: string, photo: string | null) => void;
  setInspectionDesc: (id: string, text: string) => void;
  depart: () => void;
  arrive: () => void;
  advanceStation: () => void;
  setOffRoute: (v: boolean) => void;
  addReport: (reason: ReportReason, location: string) => void;
  togglePostTrip: (key: keyof PostTripConfirm) => void;
  addDistance: (km: number) => void;
  finishTrip: () => void;
  resetTrip: () => void;
}

function freshTripData() {
  return {
    trip: createMockTrip(),
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
    lastRecord: null as TripRecord | null,
  };
}

export const useTripStore = create<TripState>((set, get) => ({
  scene: "pre-trip",
  ...freshTripData(),

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

  addReport: (reason, location) =>
    set((s) => ({
      offRoute: false,
      reports: [
        ...s.reports,
        {
          id: `R${Date.now()}`,
          reason,
          location,
          time: nowHM(),
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
      })),
      reports: s.reports,
      postTripConfirm: s.postTrip,
    };
    saveRecord(record);
    set({ lastRecord: record, drivingEndTs: endTs, scene: "completed" });
  },

  resetTrip: () =>
    set({
      scene: "pre-trip",
      ...freshTripData(),
    }),
}));
