import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { InspectionSnapshot, ReportRecord, StatusHistoryEntry } from "@/data/trip";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

export function formatHM(ts: number) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function getLocation(): Promise<string> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve("31.2459, 121.4912 · 模拟");
      return;
    }
    let done = false;
    const finish = (v: string) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    const timer = setTimeout(() => finish("31.2459, 121.4912 · 模拟"), 4000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        finish(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        clearTimeout(timer);
        finish("31.2459, 121.4912 · 模拟");
      },
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 },
    );
  });
}

const RECORDS_KEY = "schoolbus_trip_records";
const SCHEMA_VERSION = 2;

type AnyRecord = { tripId?: string; createdAt?: number; __schema?: number };
type MaybeTripRecord = AnyRecord & {
  inspections?: unknown;
  reports?: unknown;
  driverHandoverNote?: unknown;
};

function hasStatusHistory(v: unknown): v is { statusHistory: unknown } {
  return typeof v === "object" && v !== null && "statusHistory" in v;
}

function sortByCreatedAtDesc(list: AnyRecord[]) {
  return [...list].sort((a, b) => {
    const at = typeof a.createdAt === "number" ? a.createdAt : 0;
    const bt = typeof b.createdAt === "number" ? b.createdAt : 0;
    if (bt !== at) return bt - at;
    return (a.tripId ?? "").localeCompare(b.tripId ?? "");
  });
}

function isInspectionArray(v: unknown): v is InspectionSnapshot[] {
  return Array.isArray(v);
}

function isReportArray(v: unknown): v is ReportRecord[] {
  return Array.isArray(v);
}

function dedupeById<T extends AnyRecord>(list: T[]): T[] {
  const byId = new Map<string, T>();
  for (const r of list) {
    if (!r.tripId) continue;
    const existing = byId.get(r.tripId);
    if (!existing) {
      byId.set(r.tripId, r);
      continue;
    }
    const merged: T = {
      ...existing,
      ...r,
      __schema: SCHEMA_VERSION,
    } as T;
    const m = merged as unknown as MaybeTripRecord;
    const e = existing as unknown as MaybeTripRecord;
    const rr = r as unknown as MaybeTripRecord;
    const eInsp = e.inspections;
    const rInsp = rr.inspections;
    if (isInspectionArray(eInsp) && isInspectionArray(rInsp)) {
      m.inspections = eInsp.map((ei) => {
        const ri = rInsp.find((x) => x.name === ei.name);
        if (!ri) return ei;
        const eiTs = typeof ei.updatedAt === "number" ? ei.updatedAt : 0;
        const riTs = typeof ri.updatedAt === "number" ? ri.updatedAt : 0;
        if (riTs >= eiTs) {
          return { ...ei, ...ri };
        }
        return { ...ri, ...ei };
      });
    }
    const eRpts = e.reports;
    const rRpts = rr.reports;
    if (isReportArray(eRpts) && isReportArray(rRpts)) {
      m.reports = eRpts.map((er) => {
        const rri = rRpts.find((x) => x.id === er.id);
        if (!rri) return er;
        const erTs = typeof er.updatedAt === "number" ? er.updatedAt : 0;
        const rriTs = typeof rri.updatedAt === "number" ? rri.updatedAt : 0;
        if (rriTs >= erTs) {
          return { ...er, ...rri };
        }
        return { ...rri, ...er };
      });
    }
    byId.set(r.tripId, merged);
  }
  return Array.from(byId.values());
}

function migrate<T extends AnyRecord>(raw: T[]): T[] {
  return raw.map((r) => {
    const currentSchema = r.__schema ?? 0;
    if (currentSchema >= SCHEMA_VERSION) return r;
    const out = { ...r, __schema: SCHEMA_VERSION } as T;
    const m = out as unknown as MaybeTripRecord;
    if (isInspectionArray(m.inspections)) {
      m.inspections = m.inspections.map((i) => {
        const base: InspectionSnapshot = {
          status: "pending" as const,
          updatedAt: undefined,
          statusHistory: [] as StatusHistoryEntry[],
          ...i,
        };
        if (!hasStatusHistory(base) || !Array.isArray(base.statusHistory)) {
          base.statusHistory = [];
        }
        return base;
      });
    }
    if (isReportArray(m.reports)) {
      m.reports = m.reports.map((rp) => {
        const base: ReportRecord = {
          status: "pending" as const,
          updatedAt: undefined,
          statusHistory: [] as StatusHistoryEntry[],
          ...rp,
        };
        if (!hasStatusHistory(base) || !Array.isArray(base.statusHistory)) {
          base.statusHistory = [];
        }
        return base;
      });
    }
    if (typeof m.driverHandoverNote !== "string") {
      m.driverHandoverNote = "";
    }
    return out;
  });
}

export function loadRecords<T extends AnyRecord = AnyRecord>(): T[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    let list: T[] = raw ? (JSON.parse(raw) as T[]) : [];
    if (!Array.isArray(list)) list = [];
    list = migrate(list);
    list = dedupeById(list);
    return sortByCreatedAtDesc(list) as T[];
  } catch {
    return [];
  }
}

export function saveRecord<T extends AnyRecord>(record: T) {
  try {
    const list = loadRecords<T>();
    const idx = list.findIndex((r) => r.tripId && record.tripId && r.tripId === record.tripId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record };
    } else {
      list.unshift(record);
    }
    const sorted = sortByCreatedAtDesc(list);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(sorted.slice(0, 50)));
  } catch {
    // ignore persistence errors in demo
  }
}
