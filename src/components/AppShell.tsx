import type { ReactNode } from "react";
import { RoleSwitch } from "./RoleSwitch";
import { Bus } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink text-slate-100 no-tap">
      <div className="pointer-events-none absolute inset-0 cockpit-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_90%_at_50%_-15%,rgba(255,179,0,0.07),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(46,194,126,0.05),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber/40 bg-amber/10 text-amber">
              <Bus className="h-4 w-4" />
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-xs font-semibold tracking-wide text-slate-100">
                校车安全确认 · 车载终端
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-slatey">
                onboard safety console
              </span>
            </div>
          </div>
          <RoleSwitch />
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
