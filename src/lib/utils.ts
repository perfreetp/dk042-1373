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

export function loadRecords(): unknown[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as unknown[]) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: unknown) {
  try {
    const list = loadRecords();
    list.unshift(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore persistence errors in demo
  }
}
