import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink text-slate-100 no-tap">
      <div className="pointer-events-none absolute inset-0 cockpit-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_90%_at_50%_-15%,rgba(255,179,0,0.07),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(46,194,126,0.05),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
