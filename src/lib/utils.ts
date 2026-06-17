import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

type AnyRecord = { tripId?: string; createdAt?: number };

function sortByCreatedAtDesc(list: AnyRecord[]) {
  return [...list].sort((a, b) => {
    const at = typeof a.createdAt === "number" ? a.createdAt : 0;
    const bt = typeof b.createdAt === "number" ? b.createdAt : 0;
    if (bt !== at) return bt - at;
    return (a.tripId ?? "").localeCompare(b.tripId ?? "");
  });
}

export function loadRecords<T extends AnyRecord = AnyRecord>(): T[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    const list = raw ? (JSON.parse(raw) as T[]) : [];
    return sortByCreatedAtDesc(Array.isArray(list) ? list : []) as T[];
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
